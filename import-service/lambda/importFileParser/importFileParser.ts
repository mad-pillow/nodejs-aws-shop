import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";
import csvParser from "csv-parser";
import { Readable } from "stream";

const s3Client = new S3Client({ region: "us-east-1" });

export const handler = async (event: S3Event): Promise<void> => {
  console.log("Received event:", JSON.stringify(event, null, 2));

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

      stream
        .pipe(csvParser())
        .on("data", (data) => {
          console.log("🚀 ~ CSV Record:", data);
        })
        .on("end", () => {
          console.log(`🚀 ~ Finished processing ${objectKey}`);
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
