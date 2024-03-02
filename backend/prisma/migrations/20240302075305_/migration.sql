-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "hashPassword" TEXT NOT NULL,
    "bio" TEXT,
    "profilePicture" TEXT,
    "searching" BOOLEAN NOT NULL DEFAULT false,
    "longitude" REAL NOT NULL DEFAULT 0,
    "latitude" REAL NOT NULL DEFAULT 0,
    "gender" TEXT NOT NULL,
    "notificationToken" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_User" ("bio", "email", "gender", "hashPassword", "latitude", "longitude", "profilePicture", "searching", "userId") SELECT "bio", "email", "gender", "hashPassword", "latitude", "longitude", "profilePicture", "searching", "userId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
