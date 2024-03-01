import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const violateUniqueConstraint = (err: object) => {
  if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
    return true;
  }
  return false;
};

export default violateUniqueConstraint;
