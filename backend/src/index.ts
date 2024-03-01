import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { prismaClient } from "./prisma.js";
import usersRoutes from "./api/user.js";
import messageRoutes from "./api/message.js";

// import startMatchMaking from "./matchmaking.js";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
app.use("/user", usersRoutes);
app.use("/message", messageRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);

  // startMatchmaking().catch((error) => {
  //   console.error(
  //     "Matchmaking process encountered an unrecoverable error:",
  //     error,
  //   );
  // });
});
