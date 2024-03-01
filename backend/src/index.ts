import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { prismaClient } from "./prisma.js";
import usersRoutes from "./api/user.js";



import { userRegister, userLogin } from 'user.ts';

import {startMatchmaking} from 'matchmaking.ts'

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  console.log(req.query);
  res.send("Hello World!");
});

<<<<<<< HEAD

app.post("/user/register", (req: Request, res: Response) => {
  const response = userRegister(req)
  res.json(response);
});



app.post("/user/login", (req: Request, res: Response) => {
  const response = userLogin(req)
  if('error' in response){
    return res.json(response);
  }

  res.json(response);
});



app.post("/matchmaking/startsearch", (req: Request, res: Response) => {
  
});
 
=======
app.use("/user", usersRoutes);

>>>>>>> e3e4dcec8115027ac9dfdab910ad0efc24a555de
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);

  startMatchmaking().catch(error => {
    console.error('Matchmaking process encountered an unrecoverable error:', error);
  });
});
////// 



