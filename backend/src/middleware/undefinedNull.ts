import { Request, Response, NextFunction } from "express";

const undefinedNullMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body === undefined || req.body === null) {
    res.status(400).send({ error: "invalid body" });
    return;
  }

  next();
};

export default undefinedNullMiddleware;
