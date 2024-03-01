import { createHash } from "crypto";

const hashPassword = (password: string) => {
  return createHash("sha256").update(password).digest("hex");
};

export default hashPassword;
