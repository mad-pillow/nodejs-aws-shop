import * as AWS from "aws-sdk";

const documentClient = new AWS.DynamoDB.DocumentClient({ region: "us-east-1" });

async function clearDynamoDBTable(tableName: string) {
  const scanParams = {
    TableName: tableName,
  };

  try {
    const scanResult = await documentClient.scan(scanParams).promise();
    const items = scanResult.Items;

    if (!items || items.length === 0) {
      console.log(`Table [${tableName}] is already empty.`);
      return;
    }

    const deleteRequests = items.map((item) => ({
      DeleteRequest: {
        Key: { id: item.id },
      },
    }));

    for (let i = 0; i < deleteRequests.length; i += 25) {
      const batch = deleteRequests.slice(i, i + 25);
      const batchParams = {
        RequestItems: {
          [tableName]: batch,
        },
      };

      await documentClient.batchWrite(batchParams).promise();
    }

    console.log(`Table [${tableName}] cleared.`);
  } catch (error) {
    console.error(`Error clearing table ${tableName}:`, error);
  }
}

clearDynamoDBTable("products");
clearDynamoDBTable("stocks");
