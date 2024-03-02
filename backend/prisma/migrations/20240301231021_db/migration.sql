/*
  Warnings:

  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `activities` to the `MMQueueElement` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Activity";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MMQueueElement" (
    "MMQueueElementId" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "activities" TEXT NOT NULL,
    "preferenceGender" TEXT NOT NULL,
    "preferenceMaxRadius" REAL NOT NULL,
    "preferenceMinPeople" INTEGER NOT NULL,
    CONSTRAINT "MMQueueElement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MMQueueElement" ("MMQueueElementId", "preferenceGender", "preferenceMaxRadius", "preferenceMinPeople", "userId") SELECT "MMQueueElementId", "preferenceGender", "preferenceMaxRadius", "preferenceMinPeople", "userId" FROM "MMQueueElement";
DROP TABLE "MMQueueElement";
ALTER TABLE "new_MMQueueElement" RENAME TO "MMQueueElement";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
