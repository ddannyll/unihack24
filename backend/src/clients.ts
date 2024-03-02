import { PrismaClient } from "@prisma/client";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

export const prismaClient = new PrismaClient();

const firebaseApp = initializeApp({
  credential: applicationDefault(),
  databaseURL: "https://unihack24-default-rtdb.firebaseio.com/",
});
// documentation:
// https://firebase.google.com/docs/database/admin/save-data
const firebaseDB = getDatabase(firebaseApp);
export const firebaseDBRef = firebaseDB.ref("server");
