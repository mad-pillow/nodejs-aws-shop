import { APIGatewayTokenAuthorizerEvent, Context } from "aws-lambda";
import * as dotenv from "dotenv";

dotenv.config();

export const handler = async (event: APIGatewayTokenAuthorizerEvent) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  if (!event.authorizationToken) {
    throw new Error("Unauthorized");
  }

  const token = event.authorizationToken.split(" ")[1];

  try {
    const buff = Buffer.from(token, "base64");
    const [login, password] = buff.toString("ascii").split(":");

    const expectedPassword = process.env[login];

    if (!expectedPassword || expectedPassword !== password) {
      throw new Error("Forbidden");
    }

    return generatePolicy(token, "Allow", event.methodArn);
  } catch (error) {
    console.error("Failed to complete an operation", error);

    return generatePolicy(token, "Deny", event.methodArn);
  }
};

function generatePolicy(
  principalId: string,
  effect: "Allow" | "Deny",
  resource: string
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

  return authResponse;
}
