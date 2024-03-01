import express, { Express, Request, Response, json } from "express";
import dotenv from "dotenv";
import { prismaClient } from "./prisma.js";
import undefinedNullMiddleware from "./middleware/undefinedNull.js";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(undefinedNullMiddleware);

app.get("/", (_: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
