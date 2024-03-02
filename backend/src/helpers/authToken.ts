import jwt from "jsonwebtoken";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "secret";
export function generateAccessToken(username: string) {
  return jwt.sign({ username }, TOKEN_SECRET, { expiresIn: "1800s" });
}
