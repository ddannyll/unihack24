import { Request, Response, Router } from "express";
import betterJson from "../middleware/betterJson.js";
import { prismaClient } from "../clients.js";
import notFound from "../helpers/notFound.js";
import { exit } from "process";

const notificationRoutes = Router();
notificationRoutes.put("/", betterJson, async (req: Request, res: Response) => {
  const { userId, notificationToken } = req.body;
  try {
    await prismaClient.user.update({
      where: {
        userId: userId,
      },
      data: {
        notificationToken: notificationToken,
      },
    });
  } catch (e) {
    if (notFound(e as object)) {
      res.status(400).send({ error: "user does not exist" });
      return;
    } else {
      console.error(e);
      exit(1);
    }
  }
  res.send({});
});

export default notificationRoutes;
