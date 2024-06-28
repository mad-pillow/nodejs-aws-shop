import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { Readable } from "stream";
import { handler } from "../../import-service/lambda/importFileParser/importFileParser";

const s3Mock = mockClient(S3Client);

beforeEach(() => {
  s3Mock.reset();
});

describe("importFileParser", () => {
  it("processes event Records correctly", async () => {
    const mockEvent: any = {
      Records: [
        {
          s3: {
            bucket: { name: "test-bucket" },
            object: { key: "test.csv" },
          },
        },
      ],
    };

    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    await handler(mockEvent);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Received event:",
      JSON.stringify(mockEvent, null, 2)
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "🚀 ~ Started processing test.csv"
    );

    consoleLogSpy.mockRestore();
  });

  it("handles errors when S3 getObject fails", async () => {
    s3Mock.on(GetObjectCommand).rejects(new Error("Failed to get object"));

    const mockEvent: any = {
      Records: [
        {
          s3: {
            bucket: { name: "error-bucket" },
            object: { key: "error.csv" },
          },
        },
      ],
    };

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    await handler(mockEvent);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error processing S3 event",
      Error("Failed to get object")
    );

    consoleErrorSpy.mockRestore();
  });

  it.skip("processes CSV records correctly", async () => {
    const mockEvent: any = {
      Records: [
        {
          s3: {
            bucket: { name: "test-bucket" },
            object: { key: "test.csv" },
          },
        },
      ],
    };

    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    const csvData = [
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
    ];

    const csvStream = new Readable({
      objectMode: true,
      read() {
        csvData.forEach((data) => {
          this.push(data);
        });
        this.push(null);
      },
    });

    s3Mock.on(GetObjectCommand).resolves({
      Body: csvStream as any,
    });

    await handler(mockEvent);

    expect(consoleLogSpy).toHaveBeenCalledWith("🚀 ~ CSV Record:", {
      id: "1",
      name: "Alice",
    });
    expect(consoleLogSpy).toHaveBeenCalledWith("🚀 ~ CSV Record:", {
      id: "2",
      name: "Bob",
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "🚀 ~ Finished processing test.csv"
    );

    consoleLogSpy.mockRestore();
  });
});
