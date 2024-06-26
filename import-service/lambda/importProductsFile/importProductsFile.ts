import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({ region: "us-east-1" });

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
  };

  const fileName = event.queryStringParameters?.name;

  if (!fileName) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: "File name is required in query string parameters",
      }),
    };
  }

  try {
    const command = new PutObjectCommand({
      Bucket: "dmytro-sychov-import-service-bucket",
      Key: `uploaded/${fileName}`,
      ContentType: "text/csv",
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: signedUrl }),
    };
  } catch (error) {
    console.error("Failed to complete an operation", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Failed to complete an operation",
      }),
    };
  }
};
