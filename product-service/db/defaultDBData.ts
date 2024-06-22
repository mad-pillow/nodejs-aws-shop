import { Product, Stock } from "./types";

/**
 * - products constains the list of products that will be inserted into the DynamoDB table
 */
export const products: Product[] = [
  {
    description:
      "A pocket-sized guide to teaching your cat the art of origami.",
    id: "d1bff857-f6ff-48f2-8fc8-d47fcd3e34cb",
    price: 8,
    title: "Origami for Cats",
  },
  {
    description: "A rubber duck that doubles as a secret message decoder.",
    id: "af4b9141-84c0-41e5-b54e-0b70edb4d4cf",
    price: 5,
    title: "Spy Duck",
  },
  {
    description:
      "A gourmet jellybean flavored like your favorite existential dread.",
    id: "c7fa9df2-5fd4-4b5c-80bb-6d8f93b9b97a",
    price: 3,
    title: "Existential Jellybeans",
  },
  {
    description:
      "A 5.6-inch screen designed exclusively for frog entertainment.",
    id: "e5c7e6b1-3745-4b36-85db-45f0e5724c50",
    price: 45,
    title: "Frog TV",
  },
  {
    description:
      "A pillow that plays whale sounds to help you sleep underwater.",
    id: "4f93d837-cf4b-498a-97e1-c8fda5c6c2ec",
    price: 22,
    title: "Underwater Sleep Pillow",
  },
  {
    description: "A magical tea that changes color based on your mood.",
    id: "fa9a5c35-7c6a-40b6-b84d-0a29e4c95871",
    price: 10,
    title: "Mood Tea",
  },
  {
    description:
      "A guide to intergalactic diplomacy for the discerning space hamster.",
    id: "f42c4997-e593-4647-8c10-dcaea79520ff",
    price: 15,
    title: "Space Hamster Diplomacy",
  },
  {
    description:
      "An umbrella that predicts the weather based on your shoe size.",
    id: "949d914b-d6e1-4dbe-a0c6-cb1e0d05b7a1",
    price: 18,
    title: "Shoe Size Weather Umbrella",
  },
  {
    description:
      "A scented candle that smells like a freshly baked binary code.",
    id: "b6d4e72a-f8d8-4b5c-8141-ec768a6f4b68",
    price: 12,
    title: "Binary Scented Candle",
  },
];

/**
 * - stocks constains the list of stocks that will be inserted into the DynamoDB table
 * - the stock count is the number of items available for each product
 * - product_id is the id of the product
 */
export const stocks: Stock[] = [
  {
    count: 20,
    id: "b0b5c9d9-7b1f-4e3f-8b3d-3a0c1b3f4c1e",
    product_id: "d1bff857-f6ff-48f2-8fc8-d47fcd3e34cb",
  },
  {
    count: 15,
    id: "b0b5c9d9-7b1f-4e3f-8b3d-3a0c1b3f4c1f",
    product_id: "af4b9141-84c0-41e5-b54e-0b70edb4d4cf",
  },
  {
    count: 10,
    id: "b0b5c9d9-7b1f-4e3f-8b3d-3a0c1b3f4c20",
    product_id: "c7fa9df2-5fd4-4b5c-80bb-6d8f93b9b97a",
  },
  {
    count: 5,
    id: "b0b5c9d9-7b1f-4e3f-8b3d-3a0c1b3f4c21",
    product_id: "e5c7e6b1-3745-4b36-85db-45f0e5724c50",
  },
  {
    count: 8,
    id: "b0b5c9d9-7b1f-4e3f-8b3d-3a0c1b3f4c22",
    product_id: "4f93d837-cf4b-498a-97e1-c8fda5c6c2ec",
  },
  {
    count: 12,
    id: "b0b5c9d9-7b1f-4e3f-8b3d-3a0c1b3f4c23",
    product_id: "fa9a5c35-7c6a-40b6-b84d-0a29e4c95871",
  },
  {
    count: 3,
    id: "b0b5c9d9-7b1f-4e3f-8b3d-3a0c1b3f4c24",
    product_id: "f42c4997-e593-4647-8c10-dcaea79520ff",
  },
  {
    count: 7,
    id: "b0b5c9d9-7b1f-4e3f-8b3d-3a0c1b3f4c25",
    product_id: "949d914b-d6e1-4dbe-a0c6-cb1e0d05b7a1",
  },
  {
    count: 6,
    id: "b0b5c9d9-7b1f-4e3f-8b3d-3a0c1b3f4c26",
    product_id: "b6d4e72a-f8d8-4b5c-8141-ec768a6f4b68",
  },
];
