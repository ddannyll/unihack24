import { prismaClient } from "./prisma.ts";
import {
  matchmakingStartSearch,
  matchmakingStopsearch, pairMatchmake
} from "./matchmaking.ts";


async function addUser(userId, email, gender, lat, long){
    await prismaClient.user.create({
        data: {
          userId,
          email: email,
          longitude: lat,
        latitude: long, 
          gender: gender,
          hashPassword: "test"
        },
      });
  
}
 
 
let allRecords = await prismaClient.user.findMany()

for (let rec of allRecords){
    matchmakingStartSearch(rec['userId'], ["bball", "poker", "gaming"], "both", 0,0)
}



let allMM = await prismaClient.mMQueueElement.findMany()

for (let rec of allMM){
    console.log(rec)
}

console.log(pairMatchmake())




//node --loader ts-node/esm testmatchmaking.js
