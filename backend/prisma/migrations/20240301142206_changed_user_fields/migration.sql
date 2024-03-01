/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "hashPassword" TEXT NOT NULL,
    "bio" TEXT,
    "profilePicture" TEXT,
    "searching" BOOLEAN NOT NULL DEFAULT false,
    "longitude" REAL NOT NULL DEFAULT 0,
    "latitude" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("bio", "email", "hashPassword", "id", "latitude", "longitude", "profilePicture", "searching") SELECT "bio", "email", "hashPassword", "id", "latitude", "longitude", "profilePicture", "searching" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
