import { NextFunction, Request, Response, json } from "express";

// this goes after the 'json' middleware of express
const checkEmpty = (req: Request, res: Response, next: NextFunction) => {
  if (Object.values(req.body).length === 0) {
    res.status(415).send("not a json");
    return;
  }
  next();
};

const betterJson = [json(), checkEmpty];
export default betterJson;
