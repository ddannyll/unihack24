import jwt from "jsonwebtoken";

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.TOKEN_SECRET as string,
    (err: any, user: any) => {
      console.log(err);
      if (err) return res.sendStatus(403);

      //   Use req.user to access the user object in the route
      req.user = user;
      next();
    },
  );
}

export default authenticateToken;
