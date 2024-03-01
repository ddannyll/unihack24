import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";



import { userRegister } from 'user.ts';

dotenv.config();

const prisma = new PrismaClient();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});


app.post("/user/register", (req: Request, res: Response) => {
  userRegister(req)
  res.send("THis should register a user")
});


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

////// 



