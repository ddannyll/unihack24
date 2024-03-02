import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err, userId) => {
    console.log(err);
    if (err) return res.sendStatus(403);

    //   Use req.user to access the user object in the route
    //   request is extended with this field in myRequest
    req.userId = userId as string;
    next();
  });
}

export default authenticateToken;
