import { APIGatewayTokenAuthorizerEvent, Context } from "aws-lambda";
import * as dotenv from "dotenv";

dotenv.config();

export const handler = async (event: APIGatewayTokenAuthorizerEvent) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  try {
    if (!event.authorizationToken) {
      throw new Error("Unauthorized");
    }

    const token = event.authorizationToken.split(" ")[1];

    const buff = Buffer.from(token, "base64");
    const [login, password] = buff.toString("ascii").split(":");

    const expectedPassword = process.env[login];

    if (!expectedPassword || expectedPassword !== password) {
      throw new Error("Forbidden");
    }

    return generatePolicy(token, "Allow", event.methodArn);
  } catch (error) {
    console.error("Failed to complete an operation with:", error);

    switch ((error as Error).message) {
      case "Forbidden":
        return generatePolicy("None", "Deny", event.methodArn, 403);
      case "Unauthorized":
        return generatePolicy("None", "Deny", event.methodArn, 401);
      default:
        return generatePolicy("None", "Deny", event.methodArn, 500);
    }
  }
};

function generatePolicy(
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string,
  statusCode: number = 200
) {
  const authResponse: any = {};

  authResponse.principalId = principalId;

  if (effect && resource) {
    const policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    };

    authResponse.policyDocument = policyDocument;
  }

  const context = {
    statusCode,
  };

  authResponse.context = context;

  return authResponse;
}
