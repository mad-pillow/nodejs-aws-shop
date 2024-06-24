import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";
import csvParser from "csv-parser";
import { Readable } from "stream";

const s3Client = new S3Client({ region: "us-east-1" });

exports.handler = async function (event: S3Event): Promise<void> {
  console.log("Received event:", JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucketName = record.s3.bucket.name;
    console.log("🚀 ~ bucketName:", bucketName);
    const objectKey = record.s3.object.key;
    console.log("🚀 ~ objectKey:", objectKey);

    try {
      const getObjectParams = {
        Bucket: bucketName,
        Key: objectKey,
      };

      const command = new GetObjectCommand(getObjectParams);
      const response = await s3Client.send(command);

      const stream = response.Body as Readable;
      stream
        .pipe(csvParser())
        .on("data", (data) => {
          console.log("CSV Record:", data);
        })
        .on("end", () => {
          console.log(`Finished processing ${objectKey}`);
        });
    } catch (error) {
      console.error("Error processing S3 event", error);
    }
  }
};
