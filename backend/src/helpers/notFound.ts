import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const notFound = (e: object) => {
  if (e instanceof PrismaClientKnownRequestError && e.code === "P2025") {
    return true;
  }
  return false;
};

export default notFound;
