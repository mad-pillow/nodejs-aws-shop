import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const PRODUCTS = [
  {
    description: "A crunchy snack for those who carrot all about their health.",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    price: 2,
    title: "Carrot Crunch",
  },
  {
    description: "The king of fruits, ready to rule your taste buds.",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
    price: 3,
    title: "Mango Majesty",
  },
  {
    description: "A banana a day keeps the hunger at bay.",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
    price: 1,
    title: "Banana Bonanza",
  },
  {
    description: "When life gives you lemons, make lemonade.",
    id: "7567ec4b-b10c-48c5-9345-fc73348a80a1",
    price: 4,
    title: "Lemon Laughs",
  },
  {
    description: "Avocados from Mexico, the superfood that guacs.",
    id: "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
    price: 5,
    title: "Avocado Adventure",
  },
  {
    description: "Lettuce entertain you with the best salads ever.",
    id: "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
    price: 2,
    title: "Lettuce Laughs",
  },
];

exports.handler = async function (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const productId = event?.pathParameters?.productId;

  if (!productId) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "There is no product Id passed" }),
    };
  }

  const product = PRODUCTS.find((product) => product.id === productId);

  if (!product) {
    return {
      statusCode: 404,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "There is no product Id passed" }),
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  };
};
