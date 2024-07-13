import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { S3Event } from "aws-lambda";
import * as crypto from "crypto";
import csvParser from "csv-parser";
import { Readable } from "stream";
import { ImportedProduct } from "../../../types";

const s3Client = new S3Client({ region: "us-east-1" });
const sqsClient = new SQSClient({ region: "us-east-1" });

export const handler = async (event: S3Event): Promise<void> => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const catalogItemsQueueUrl =
    process.env.CATALOG_ITEMS_QUEUE_URL ||
    "https://sqs.us-east-1.amazonaws.com/350262618260/CatalogItemsQueue";

  for (const record of event.Records) {
    const bucketName = record.s3.bucket.name;
    const objectKey = record.s3.object.key;

    try {
      console.log(`🚀 ~ Started processing ${objectKey}`);

      const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });

      const copyObjectCommand = new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${objectKey}`,
        Key: objectKey.replace("uploaded", "parsed"),
      });

      const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });

      const response = await s3Client.send(getObjectCommand);

      const stream = response.Body as Readable;

      await new Promise((resolve) => {
        const products: ImportedProduct[] = [];

        stream
          .pipe(csvParser())
          .on("data", (data) => {
            data.id = crypto.randomUUID();

            products.push(data);
          })
          .on("end", async () => {
            const sendMessageBatchCommand = new SendMessageBatchCommand({
              QueueUrl: catalogItemsQueueUrl,
              Entries: products.map((product) => ({
                Id: product.id,
                MessageBody: JSON.stringify(product),
              })),
            });

            await sqsClient.send(sendMessageBatchCommand);

            console.log(`🚀 ~ Finished processing ${objectKey}`);

            resolve(true);
          });
      });

      await s3Client.send(copyObjectCommand);
      console.log(`🚀 ~ Copied ${objectKey}`);

      await s3Client.send(deleteObjectCommand);
      console.log(`🚀 ~ Deleted ${objectKey}`);
    } catch (error) {
      console.error("Error processing S3 event", error);
    }
  }
};
