import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { prismaClient } from "./prisma.js";
import usersRoutes from "./api/user.js";
import notificationRoutes from "./api/notification.js";
// import startMatchMaking from "./matchmaking.js";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send('Hello');
});

app.use("/user", usersRoutes);
app.use("/notification", notificationRoutes)
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  // startMatchmaking().catch((error) => {
  //   console.error(
  //     "Matchmaking process encountered an unrecoverable error:",
  //     error,
  //   );
  // });
});
