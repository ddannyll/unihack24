import { Request, Response, Router } from "express";
import betterJson from "../middleware/betterJson.js";
import { prismaClient } from "../clients.js";
import violateUniqueConstraint from "../helpers/violateUniqueConstraint.js";

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
    res.send({});
  } catch (e) {
    if (violateUniqueConstraint(e as object)) {
      return res.status(400).send({ error: "user does not exist" });
    }
  }
});

export default notificationRoutes;
