import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { handler } from "../../import-service/lambda/importProductsFile/importProductsFile";

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn(),
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn(),
}));

describe("importProductsFile handler", () => {
  beforeEach(() => {
    (getSignedUrl as jest.Mock).mockClear();
  });

  it("returns 400 if file name is missing", async () => {
    const event = { queryStringParameters: {} } as any;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toBe(
      "File name is required in query string parameters"
    );
  });

  it("returns signed URL for valid file name", async () => {
    (getSignedUrl as jest.Mock).mockResolvedValue("mockSignedUrl");

    const event = { queryStringParameters: { name: "test.csv" } } as any;
    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).url).toBe("mockSignedUrl");
  });

  it("returns 500 on error", async () => {
    (getSignedUrl as jest.Mock).mockRejectedValue(new Error("Test Error"));

    const event = { queryStringParameters: { name: "test.csv" } } as any;
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toBe(
      "Failed to complete an operation"
    );
  });
});
