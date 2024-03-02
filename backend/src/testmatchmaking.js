import { prismaClient } from "./prisma.ts";
import {
    calculateDistance, matchmakingStartSearch,
  matchmakingStopsearch, pairMatchmake,multiMatchmake, matchmakingLoop
} from "./matchmaking.ts";


function randint(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  

/**
 * Generates a random floating-point number between two given floating-point numbers.
 * @param {number} min - The minimum value, inclusive.
 * @param {number} max - The maximum value, inclusive.
 * @returns {number} A random floating-point number between min and max.
 */
function randfloat(min, max )  {
    return Math.random() * (max - min) + min;
  }
  
  // unsw campus bottom left -33.91943486405203, 151.22663446618833
  // unsw campus top right -33.91712331910307, 151.24108375017158



async function addUser(userId, email, gender, lat, long){
  try{
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
  }catch(error){
    
  }
    
}
 

// for(let i = 31; i<100; i++){
//   await addUser(`user${i}`, `user${i}@gmail.com`, "male",randfloat(-33.91943486405203,-33.91712331910307), randfloat( 151.22663446618833, 151.24108375017158))
// }

 

let allRecords = await prismaClient.user.findMany()
let preferences = ["bball", "poker", "gaming", "drinking", "partying", "tennis", "boxing", "studying", "dancing", "knitting", "sewing", "drawing"]
let genders = ["male", "female", "both"]


async function startMatchmaking() {
  while (true) {
    let numActivities = randint(1, 3);
    let activities = [];

    for (let i = 0; i < numActivities; i++) {
      activities.push(preferences[randint(0, preferences.length - 1)]);
    }

    let rec = allRecords[randint(0, allRecords.length - 1)];
    console.log(`Started matchmaking search for ${rec['userId']} for ${activities}`)
    await matchmakingStartSearch(rec['userId'], activities, "both", 1500, randint(2,6));

    // Wait for 1 second before sending the next request
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}


// Start both loops
matchmakingLoop();
startMatchmaking();

// let res = await pairMatchmake();
// console.log(`Pair matchmaking:`)
// console.log(res)
 
// await multiMatchmake()


//node --loader ts-node/esm testmatchmaking.js
