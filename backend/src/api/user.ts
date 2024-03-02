import { Request, Response, Router } from "express";
import { prismaClient } from "../prisma.js";
import betterJson from "../middleware/betterJson.js";
import { randomUUID } from "crypto";
import hashPassword from "../helpers/hashPassword.js";
import violateUniqueConstraint from "../helpers/violateUniqueConstraint.js";
import notFound from "../helpers/notFound.js";
import { exit } from "process";
import { generateAccessToken } from "../helpers/authToken.js";
import authenticateToken from "../middleware/auth.js";

const userRoutes = Router();

interface userRegisterParams {
  email: string;
  password: string;
  gender: "male" | "female";
}

userRoutes.post(
  "/register",
  betterJson,
  async (req: Request, res: Response) => {
    const info: userRegisterParams = req.body;

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

interface userLoginParams {
  email: string;
  password: string;
}

userRoutes.post("/login", betterJson, async (req: Request, res: Response) => {
  const info: userLoginParams = req.body;

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

interface userProfileUpdateParams {
  userId: string;
  email?: string;
  bio?: string;
  profilePicture?: string;
  searching?: boolean;
  gender?: "male" | "female";
}

userRoutes.put(
  "/",
  authenticateToken,
  betterJson,
  async (req: Request, res: Response) => {
    const info: userProfileUpdateParams = req.body;
    let prev_details;
    try {
      prev_details = await prismaClient.user.findFirstOrThrow({
        where: {
          userId: info.userId,
        },
      });
    } catch (e) {
      if (notFound(e as object)) {
        res
          .status(400)
          .send({ error: "user does not exist with given userId" });
        return;
      } else {
        console.error(e);
        exit(1);
      }
    }

    // prev details should not be null at this point
    // user also exists at this point, so no need for catch
    await prismaClient.user.update({
      where: {
        userId: info.userId,
      },
      data: {
        email: info.email ?? prev_details?.email,
        bio: info.bio ?? prev_details?.bio,
        profilePicture: info.profilePicture ?? prev_details?.profilePicture,
        searching: info.searching ?? prev_details?.searching,
        gender: info.gender ?? prev_details?.gender,
      },
    });

    res.send({});
  },
);

interface userLocationParams {
  longitude: number;
  latitude: number;
}

userRoutes.put(
  "/location",
  authenticateToken,
  betterJson,
  async (req: Request, res: Response) => {
    const info: userLocationParams = req.body;
    console.debug("update");
    try {
      await prismaClient.user.update({
        where: {
          userId: req.userId,
        },
        data: {
          longitude: info.longitude,
          latitude: info.latitude,
        },
      });
    } catch (e) {
      if (notFound(e as object)) {
        res.status(400).send({ error: "user does not exist with given id" });
        return;
      } else {
        console.error(e);
        exit(1);
      }
    }

    res.send({});
  },
);

userRoutes.get(
  "/me",
  authenticateToken,
  async (req: Request, res: Response) => {
    const userId = req.userId;

    let user;
    try {
      user = await prismaClient.user.findFirstOrThrow({
        where: {
          userId,
        },
      });
    } catch (e) {
      if (notFound(e as object)) {
        res
          .status(400)
          .send({ error: "user does not exist with given userId" });
        return;
      } else {
        console.error(e);
        return;
      }
    }

    res.send({
      email: user?.email,
      bio: user?.bio ?? "",
      profilePicture: user?.profilePicture ?? "",
      searching: user?.searching,
      gender: user?.gender,
    });
  },
);

userRoutes.get("/:userId", async (req: Request, res: Response) => {
  const userId = req.params.userId;

  let user;
  try {
    user = await prismaClient.user.findFirstOrThrow({
      where: {
        userId,
      },
    });
  } catch (e) {
    if (notFound(e as object)) {
      res.status(400).send({ error: "user does not exist with given userId" });
      return;
    } else {
      console.error(e);
      return;
    }
  }

  res.send({
    email: user?.email,
    bio: user?.bio ?? "",
    profilePicture: user?.profilePicture ?? "",
    searching: user?.searching,
    gender: user?.gender,
  });
});

export default userRoutes;
