/*
  Warnings:

  - The primary key for the `Tag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Meetup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new__TagToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TagToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TagToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__TagToUser" ("A", "B") SELECT "A", "B" FROM "_TagToUser";
DROP TABLE "_TagToUser";
ALTER TABLE "new__TagToUser" RENAME TO "_TagToUser";
CREATE UNIQUE INDEX "_TagToUser_AB_unique" ON "_TagToUser"("A", "B");
CREATE INDEX "_TagToUser_B_index" ON "_TagToUser"("B");
CREATE TABLE "new_Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "numberUsed" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Tag" ("id", "name", "numberUsed") SELECT "id", "name", "numberUsed" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
CREATE TABLE "new__MeetupToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_MeetupToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Meetup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MeetupToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__MeetupToUser" ("A", "B") SELECT "A", "B" FROM "_MeetupToUser";
DROP TABLE "_MeetupToUser";
ALTER TABLE "new__MeetupToUser" RENAME TO "_MeetupToUser";
CREATE UNIQUE INDEX "_MeetupToUser_AB_unique" ON "_MeetupToUser"("A", "B");
CREATE INDEX "_MeetupToUser_B_index" ON "_MeetupToUser"("B");
CREATE TABLE "new_Meetup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Meetup" ("id", "name") SELECT "id", "name" FROM "Meetup";
DROP TABLE "Meetup";
ALTER TABLE "new_Meetup" RENAME TO "Meetup";
CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "timeStamp" DATETIME NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "meetupId" TEXT NOT NULL,
    CONSTRAINT "Message_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_meetupId_fkey" FOREIGN KEY ("meetupId") REFERENCES "Meetup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("fromUserId", "id", "meetupId", "message", "timeStamp") SELECT "fromUserId", "id", "meetupId", "message", "timeStamp" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashPassword" TEXT NOT NULL,
    "bio" TEXT,
    "profilePicture" TEXT,
    "searching" BOOLEAN NOT NULL DEFAULT false,
    "longitude" REAL NOT NULL DEFAULT 0,
    "latitude" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("bio", "email", "hashPassword", "id", "latitude", "longitude", "name", "profilePicture", "searching") SELECT "bio", "email", "hashPassword", "id", "latitude", "longitude", "name", "profilePicture", "searching" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
