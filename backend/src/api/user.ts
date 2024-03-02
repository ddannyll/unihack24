import { Request, Response, Router } from "express";
import { prismaClient } from "../prisma.js";
import betterJson from "../middleware/betterJson.js";
import { randomUUID } from "crypto";
import hashPassword from "../helpers/hashPassword.js";
import violateUniqueConstraint from "../helpers/violateUniqueConstraint.js";
import notFound from "../helpers/notFound.js";
import { exit } from "process";
import { generateAccessToken } from "../helpers/authToken.js";

const userRoutes = Router();

interface userAuthParams {
  email: string;
  password: string;
  gender: "male" | "female" | "other";
}

userRoutes.post(
  "/register",
  betterJson,
  async (req: Request, res: Response) => {
    const info: userAuthParams = req.body;

    const userId = randomUUID();
    try {
      await prismaClient.user.create({
        data: {
          userId,
          email: info.email,
          hashPassword: hashPassword(info.password),
          gender: info.gender,
        },
      });
    } catch (e) {
      if (violateUniqueConstraint(e as object)) {
        res.status(400).send({ error: "user with that email already exists" });
        return;
      } else {
        console.error(e);
        exit(1);
      }
    }

    // create a token
    const token = generateAccessToken(userId);
    res.send({ userId, token });
  },
);

userRoutes.post("/login", betterJson, async (req: Request, res: Response) => {
  const info: userAuthParams = req.body;

  let user;
  try {
    user = await prismaClient.user.findFirstOrThrow({
      where: {
        email: info.email,
        hashPassword: hashPassword(info.password),
      },
    });
  } catch (e) {
    if (notFound(e as object)) {
      res.status(400).send({ error: "user does not exist with those details" });
      return;
    } else {
      console.error(e);
      exit(1);
    }
  }

  const userId = user?.userId;

  // create a token
  const token = generateAccessToken(userId);
  res.send({ userId: userId, token });
});

export default userRoutes;
