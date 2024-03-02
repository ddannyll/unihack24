import { Tag } from "@prisma/client";
import { prismaClient } from "../clients.js";
import { Expo, ExpoPushMessage } from "expo-server-sdk";

// Send a notification to every user
export const notification = async (tag: Tag, userIds: string[]) => {
  const expo = new Expo();
  const messages = [];
  for (const userId of userIds) {
    try {
      const user = await prismaClient.user.findFirstOrThrow({
        where: {
          userId: userId,
          NOT: {
            notificationToken: "",
          },
        },
      });
      if (!Expo.isExpoPushToken(user.notificationToken)) {
        throw new Error(
          `Push token ${user.notificationToken} is not a valid Expo push token`,
        );
      }
      messages.push(user.notificationToken);
    } catch {
      console.log("User not found");
    }
  }

  const send: ExpoPushMessage = {
    to: messages,
    sound: "default",
    body: "This is a test notification",
    data: { withSome: "data" },
  };

  try {
    await expo.sendPushNotificationsAsync([send]);
  } catch {
    console.log("error");
  }
};
