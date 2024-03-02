/*
  Warnings:

  - The primary key for the `Tag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `tagId` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `userUserId` on the `Tag` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tag" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "numSearching" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Tag" ("name", "numSearching") SELECT "name", "numSearching" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
