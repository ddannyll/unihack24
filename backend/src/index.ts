import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { prismaClient } from "./prisma.js";
import usersRoutes from "./api/user.js";
import messageRoutes from "./api/message.js";

// import startMatchMaking from "./matchmaking.js";

dotenv.config();

import cors from "cors";
import authenticateToken from "./middleware/auth.js";

const app: Express = express();

app.use(cors());

const port = process.env.PORT || 3000;

// routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
app.use("/user", usersRoutes);
app.use("/message", authenticateToken, messageRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);

  // startMatchmaking().catch((error) => {
  //   console.error(
  //     "Matchmaking process encountered an unrecoverable error:",
  //     error,
  //   );
  // });
});
