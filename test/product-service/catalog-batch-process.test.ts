import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { SQSEvent } from "aws-lambda";
import { mockClient } from "aws-sdk-client-mock";
import { handler } from "../../product-service/lambda/catalogBatchProcess/catalogBatchProcess";

const snsMock = mockClient(SNSClient);
const dynamoDBMock = mockClient(DynamoDBClient);

describe("catalogBatchProcess", () => {
  beforeEach(() => {
    snsMock.reset();
    jest.clearAllMocks();
  });

  it("should process records properly", async () => {
    dynamoDBMock.on(TransactWriteCommand).resolves({});

    const event = {
      Records: [
        {
          body: JSON.stringify({
            id: "1",
            title: "Test Product",
            description: "Test Description",
            price: "100",
            count: 10,
          }),
        },
        {
          body: JSON.stringify({
            id: "2",
            title: "Another Test Product",
            description: "Another Test Description",
            price: "150",
            count: 5,
          }),
        },
      ],
    } as SQSEvent;

    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    await handler(event);

    expect(consoleLogSpy).toHaveBeenCalledWith("2 records processed.");
  });

  it("should fail processing if SNS publishing fails", async () => {
    const error = new Error("Failed to create a product");
    dynamoDBMock.on(TransactWriteCommand).resolves({});
    snsMock.on(PublishCommand).rejects(error);

    const event = {
      Records: [
        {
          body: JSON.stringify({
            id: "1",
            title: "Test Product",
            price: "100",
            count: 10,
          }),
        },
      ],
    } as SQSEvent;

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    await handler(event);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to create a product",
      error
    );
  });
});
