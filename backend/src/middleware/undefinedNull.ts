import { Request, Response, NextFunction } from "express";
import { prismaClient } from "../prisma.js";

const undefinedNullMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body === undefined || req.body === null) {
    res.status(400).send("Invalid Body");
    return;
  }

  next();
};

export default undefinedNullMiddleware;
