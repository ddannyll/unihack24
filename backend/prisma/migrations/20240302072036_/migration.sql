-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tag" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "numSearching" INTEGER NOT NULL DEFAULT 0,
    "userUserId" TEXT,
    CONSTRAINT "Tag_userUserId_fkey" FOREIGN KEY ("userUserId") REFERENCES "User" ("userId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tag" ("name", "numSearching") SELECT "name", "numSearching" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
