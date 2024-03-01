import { Router, json } from "express";
import { prismaClient } from "../prisma.js";

const users = Router();

users.post("/register", json(), (req, res) => {});

export default users;
