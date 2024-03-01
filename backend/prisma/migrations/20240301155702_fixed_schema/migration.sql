/*
  Warnings:

  - The primary key for the `Meetup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Meetup` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Message` table. All the data in the column will be lost.
  - The primary key for the `Tag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Tag` table. All the data in the column will be lost.
  - Added the required column `meetupId` to the `Meetup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `messageId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tagId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "MMQueueElement" (
    "MMQueueElementId" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "preferenceGender" TEXT NOT NULL,
    "preferenceMaxRadius" REAL NOT NULL,
    "preferenceMinPeople" INTEGER NOT NULL,
    CONSTRAINT "MMQueueElement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Activity" (
    "activityId" TEXT NOT NULL PRIMARY KEY,
    "queueElementId" TEXT NOT NULL,
    "activityName" TEXT NOT NULL,
    CONSTRAINT "Activity_queueElementId_fkey" FOREIGN KEY ("queueElementId") REFERENCES "MMQueueElement" ("MMQueueElementId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_MeetupToMessage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_MeetupToMessage_A_fkey" FOREIGN KEY ("A") REFERENCES "Meetup" ("meetupId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MeetupToMessage_B_fkey" FOREIGN KEY ("B") REFERENCES "Message" ("messageId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meetup" (
    "meetupId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Meetup" ("name") SELECT "name" FROM "Meetup";
DROP TABLE "Meetup";
ALTER TABLE "new_Meetup" RENAME TO "Meetup";
CREATE TABLE "new_User" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "hashPassword" TEXT NOT NULL,
    "bio" TEXT,
    "profilePicture" TEXT,
    "searching" BOOLEAN NOT NULL DEFAULT false,
    "longitude" REAL NOT NULL DEFAULT 0,
    "latitude" REAL NOT NULL DEFAULT 0,
    "gender" TEXT NOT NULL
);
INSERT INTO "new_User" ("bio", "email", "hashPassword", "latitude", "longitude", "profilePicture", "searching") SELECT "bio", "email", "hashPassword", "latitude", "longitude", "profilePicture", "searching" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_Message" (
    "messageId" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "timeStamp" DATETIME NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "meetupId" TEXT NOT NULL,
    CONSTRAINT "Message_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("fromUserId", "meetupId", "message", "timeStamp") SELECT "fromUserId", "meetupId", "message", "timeStamp" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE TABLE "new__MeetupToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_MeetupToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Meetup" ("meetupId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MeetupToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__MeetupToUser" ("A", "B") SELECT "A", "B" FROM "_MeetupToUser";
DROP TABLE "_MeetupToUser";
ALTER TABLE "new__MeetupToUser" RENAME TO "_MeetupToUser";
CREATE UNIQUE INDEX "_MeetupToUser_AB_unique" ON "_MeetupToUser"("A", "B");
CREATE INDEX "_MeetupToUser_B_index" ON "_MeetupToUser"("B");
CREATE TABLE "new_Tag" (
    "tagId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "numberUsed" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Tag" ("name", "numberUsed") SELECT "name", "numberUsed" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
CREATE TABLE "new__TagToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TagToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag" ("tagId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TagToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__TagToUser" ("A", "B") SELECT "A", "B" FROM "_TagToUser";
DROP TABLE "_TagToUser";
ALTER TABLE "new__TagToUser" RENAME TO "_TagToUser";
CREATE UNIQUE INDEX "_TagToUser_AB_unique" ON "_TagToUser"("A", "B");
CREATE INDEX "_TagToUser_B_index" ON "_TagToUser"("B");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_MeetupToMessage_AB_unique" ON "_MeetupToMessage"("A", "B");

-- CreateIndex
CREATE INDEX "_MeetupToMessage_B_index" ON "_MeetupToMessage"("B");
