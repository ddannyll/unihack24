import { Request, Response, Router } from "express";
import { prismaClient } from "../prisma.js";
import betterJson from "../middleware/betterJson.js";
import { randomUUID } from "crypto";
import hashPassword from "../helpers/hashPassword.js";
import violateUniqueConstraint from "../helpers/violateUniqueConstraint.js";
import notFound from "../helpers/notFound.js";

const userRoutes = Router();

interface userAuthParams {
  email: string;
  password: string;
  gender: string;
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
      }
    }

    res.send({ userId });
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
    }
  }

  // should never be undefined
  res.send({ userId: user?.userId });
});

export default userRoutes;
