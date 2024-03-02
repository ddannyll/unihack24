/*
  Warnings:

  - You are about to drop the column `meetupId` on the `Message` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "messageId" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "timeStamp" DATETIME NOT NULL,
    "fromUserId" TEXT NOT NULL,
    CONSTRAINT "Message_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("fromUserId", "message", "messageId", "timeStamp") SELECT "fromUserId", "message", "messageId", "timeStamp" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
