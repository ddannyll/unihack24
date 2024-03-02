import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { prismaClient, firebaseDBRef } from "./clients.js";
import usersRoutes from "./api/user.js";
import messageRoutes from "./api/message.js";
import cors from "cors";
import authenticateToken from "./middleware/auth.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      userId?: string;
    }
  }
}

dotenv.config();

const app: Express = express();

app.use(cors());

const port = process.env.PORT || 3000;

// routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
app.use("/user", usersRoutes);
app.use("/message", authenticateToken, messageRoutes);

firebaseDBRef.child("users").set({
  user: "Me :)",
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);

  // startMatchmaking().catch((error) => {
  //   console.error(
  //     "Matchmaking process encountered an unrecoverable error:",
  //     error,
  //   );
  // });
});
