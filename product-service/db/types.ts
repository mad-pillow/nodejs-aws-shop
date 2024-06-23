export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
};

export type Stock = {
  product_id: string;
  count: number;
};

export type SeedDynamoDBProps = {
  tableName: string;
  items: Product[] | Stock[];
};

export type DynamoDBServiceProps = {
  tableName: string;
};
