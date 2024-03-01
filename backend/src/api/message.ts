import { Request, Response, Router, query } from "express";
import { prismaClient } from "../prisma.js";
import betterJson from "../middleware/betterJson.js";
import { randomUUID } from "crypto";
import hashPassword from "../helpers/hashPassword.js";
import violateUniqueConstraint from "../helpers/violateUniqueConstraint.js";
import notFound from "../helpers/notFound.js";
import { timeStamp } from "console";

const messageRoutes = Router();

messageRoutes.get("/loadmessages/:userId", async (req, res) => {
  const userId = req.params.userId;
  const meetupId = req.query.meetupId as string;

  let meetup;
  try {
    meetup = await prismaClient.meetup.findFirst({
      where: {
        meetupId: meetupId,
        users: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        messages: {
          orderBy: {
            timeStamp: "desc",
          },
        },
      },
    });
  } catch (e) {
    if (notFound(e as object)) {
      res
        .status(400)
        .send({ error: "user or meetup does not exist with given ids" });
      return;
    }
  }
  const messages = meetup?.messages.map((message) => {
    return {
      senderId: message.fromUserId,
      message: message.message,
      timeStamp: message.timeStamp,
    };
  });
  res.send({ messages });
});

messageRoutes.get("/messageList/:userId", async (req, res) => {
  const userId = req.params.userId;

  let user;
  try {
    user = await prismaClient.user.findFirst({
      where: {
        userId,
      },
      include: {
        meetups: {
          include: {
            messages: {
              orderBy: {
                timeStamp: "desc",
              },
            },
          },
        },
      },
    });
  } catch (e) {
    if (notFound(e as object)) {
      res.status(400).send({ error: "user with id does not exist" });
      return;
    }
  }
  // user should exist
  let meetupPreviews = user?.meetups;
});
