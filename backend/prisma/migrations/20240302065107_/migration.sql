/*
  Warnings:

  - You are about to drop the `_TagToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `name` on the `Meetup` table. All the data in the column will be lost.
  - You are about to drop the column `numberUsed` on the `Tag` table. All the data in the column will be lost.
  - Added the required column `meetupName` to the `Meetup` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_TagToUser_B_index";

-- DropIndex
DROP INDEX "_TagToUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_TagToUser";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meetup" (
    "meetupId" TEXT NOT NULL PRIMARY KEY,
    "meetupName" TEXT NOT NULL
);
INSERT INTO "new_Meetup" ("meetupId") SELECT "meetupId" FROM "Meetup";
DROP TABLE "Meetup";
ALTER TABLE "new_Meetup" RENAME TO "Meetup";
CREATE TABLE "new_Tag" (
    "tagId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "numSearching" INTEGER NOT NULL DEFAULT 0,
    "userUserId" TEXT,
    CONSTRAINT "Tag_userUserId_fkey" FOREIGN KEY ("userUserId") REFERENCES "User" ("userId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tag" ("name", "tagId") SELECT "name", "tagId" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
