import { Request, Response, Router } from "express";
import { prismaClient } from "../prisma.js";
import betterJson from "../middleware/betterJson.js";
import { randomUUID } from "crypto";
import notFound from "../helpers/notFound.js";
import { exit } from "process";

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
    } else {
      console.log(e);
      exit(1);
    }
  }

  // meetup should exist
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
    } else {
      console.log(e);
      exit(1);
    }
  }
  // user should exist
  const meetupPreviews = user?.meetups.map((meetup) => {
    return {
      meetupId: meetup.meetupId,
      meetupName: meetup.name,
      meetupMsgPreview: meetup.messages.at(0)?.message ?? "",
      meetupDateLastMsg: meetup.messages.at(0)?.timeStamp ?? Date(),
    };
  });

  res.send({ meetups: meetupPreviews });
});

interface messageParams {
  userId: string;
  meetupId: string;
  message: string;
}

messageRoutes.post(
  "/sendMessage",
  betterJson,
  // for some reason we need type annotations here
  async (req: Request, res: Response) => {
    const info: messageParams = req.body;
    try {
      await prismaClient.message.create({
        data: {
          messageId: randomUUID(),
          message: info.message,
          fromUser: {
            connect: {
              userId: info.userId,
            },
          },
          meetup: {
            connect: {
              meetupId: info.meetupId,
            },
          },
          timeStamp: Date(),
        },
      });
    } catch (e) {
      if (notFound(e as object)) {
        res.status(400).send({ error: "user or meetup does not exist" });
        return;
      } else {
        console.log(e);
        exit(1);
      }
    }

    res.send({});
  },
);

export default messageRoutes;
