import { group } from "console";
import { prismaClient } from "./prisma.js";
import { stringify } from "querystring";

async function getDesiredActivities() { 
  let activities: { [key: string]: string[] } = {};

  let allRecords = await prismaClient.mMQueueElement.findMany();
   

  for (let record of allRecords) {
    for (let activity of record["activities"].split(",")) {
      if (!(activity in activities)) {
        activities[activity] = [record["userId"]];
      } else {
        activities[activity].push(record["userId"]);
      }
    }
  }
  
  return activities;
}
  
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) { 
  // Radius of the Earth in km
  const R = 6371;

  // Convert degrees to radians
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  // Convert latitudes to radians
  const lat1InRad = lat1 * (Math.PI / 180);
  const lat2InRad = lat2 * (Math.PI / 180);

  // Apply Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) *
      Math.sin(dLon / 2) *
      Math.cos(lat1InRad) *
      Math.cos(lat2InRad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Convert distance from km to meters
  return distance * 1000;
}

async function checkCompatibility(userId1: string, userId2: string, existingPairings:string[][]) {
  //check if userId1 == userId2
    //or if the pair already exists. 
    if(userId1 == userId2){
    return false;
  }
  if(existingPairings!=undefined){
    for(let pairing of existingPairings){
      if(pairing[0] == userId1 && pairing[1] == userId2){
        return false;
      }else if (pairing[0] == userId2 && pairing[1] == userId1){
        return false;
      }
    }
  }
  
  

  
  let userRecord1 = await prismaClient.user.findFirst({
    where: {
      userId: userId1,
    },
  });

  let userRecord2 = await prismaClient.user.findFirst({
    where: {
      userId: userId2,
    },
  });

  let userSearch1 = await prismaClient.mMQueueElement.findFirst({
    where: {
      userId: userId1,
    },
  });

  let userSearch2 = await prismaClient.mMQueueElement.findFirst({
    where: {
      userId: userId2,
    },
  });

  if (userRecord1 == null || userRecord2 == null) {
    console.error("User record not found");
    return false;
  }

  if (userSearch1 == null || userSearch2 == null) {
    console.error("User search not found");
    return false;
  }

 


  if (userSearch1["preferenceGender"] != "both" || userSearch2["preferenceGender"] != "both") {
    if (userRecord1["gender"] != userSearch2["preferenceGender"]) {
      console.log("userRecord1[gender] =/= userSearch2[preferenceGender]")
      return false;
    }

    if (userRecord2["gender"] != userSearch1["preferenceGender"]) {
      console.log("userRecord2[gender] =/= userSearch1[preferenceGender]")
      return false;
    }
  } 

  let dist = calculateDistance(
    userRecord1["latitude"],
    userRecord1["longitude"],
    userRecord2["latitude"],
    userRecord2["longitude"],
  )

  let maxViableDist = Math.max(
    userSearch1["preferenceMaxRadius"],
    userSearch2["preferenceMaxRadius"],
  )

  // console.log(`Distance between ${userId1}, ${userId2} = ${dist}`)
  if (dist >maxViableDist 
  ) {
    
    return false;
  }

  return true;
}
 
  
//this should work.
async function pairMatchmake() {
  //these are valid pairings
  //string, string[]
  //activity, pairs of ids
  let validPairings: { [key: string]: string[][] } = {};

  let desiredActivities = await getDesiredActivities();
  
  let sortedActivities: [string, string[]][] =Object.entries(desiredActivities);
  
  sortedActivities.sort((a, b) => b[1].length - a[1].length);
  
  //sort by descending based on the number of ppl that wnat to do that activity.

  for (let i = sortedActivities.length-1; i >= 0; i--) {
    let currActivity = sortedActivities[i]; 
    let userIds: string[] = currActivity[1];

     for (let i = 0; i < userIds.length; i++) {
      for (let j = i + 1; j < userIds.length; j++) {
        if ((await checkCompatibility(userIds[i], userIds[j], validPairings[currActivity[0]])) == true) {
          if (currActivity[0] in validPairings) {
            validPairings[currActivity[0]].push([userIds[i], userIds[j]]);
          } else {
            validPairings[currActivity[0]] = [[userIds[i], userIds[j]]];
          }

        } 
      }
    }
  }

  return validPairings;
  //looks like
  //{'basketball': [["123", "533"], ["4141", "333"]]}...
}
 

function newVertexConnectedness(graph: Map<any, Set<any>>, group: string[], newVertex: string) {
  let numEdges = 0;
  let edgesFromNewvertex = graph.get(newVertex);
  
  if (edgesFromNewvertex === undefined) {
    return 0;
  } 
 
  for (let e of edgesFromNewvertex) {
    if (group.includes(e)) {
      numEdges++;
    }
  } 
  return numEdges / group.length; 
}

//SCCC but instead of strongly connceted its some x % connected.
  //no idea whta to name this function
function findXCCC(graph: Map<any, Set<any>>): string[][] {
   let potentialGroupings:string[][] = []

  graph.forEach((_: any, vertex: any) => {
    for(let i = 0; i<potentialGroupings.length; i++){
      if(newVertexConnectedness(graph, potentialGroupings[i], vertex) > 0.7){
        potentialGroupings[i].push(vertex)
      }
    } 
    potentialGroupings.push([vertex])

  });

  //sorted descending by length.  
  potentialGroupings.sort((a, b) => b.length - a.length);

  //now that we have them sorted, we can trim them into final groups so there are no duplicates
  //take the biggest ones.


  let used : Set<string>= new Set();

  let finalGroupings: string[][] =  []

  for(let group of potentialGroupings){
    if(group.length == 1){
      break;
    }

    let duplicatesExist = false;
    for(let user of group){
      if(used.has(user)){
        duplicatesExist = true;
        break;
      }
    }

    if(!duplicatesExist){
      finalGroupings.push(group);
      for(let user of group){
        used.add(user);
      }
    }
  
  }


  return finalGroupings;
}

//this works
async function multiMatchmake() {
  let pairings = await pairMatchmake();
  console.log(pairings)
  console.log("      ")

  let groups:Map<string, string[][]> = new Map(); 
  /*
Set(1) { Set(1) { 'user6' } }
Set(1) { Set(2) { 'user1', 'user4' } }
Set(1) { Set(3) { 'user2', 'user4', 'user3' } }
  */
  for(let i = 0; i<Object.keys(pairings).length; i++){
    let currentActivity = Object.keys(pairings)[i];
    let pairs = pairings[currentActivity]
    
    
    let currentUsers:Set<string> = new Set();
    let graph = new Map();

    // Assuming 'pairs' is defined and is an array of user pairs
    for (const pair of pairs) {
      if (pair) {
        currentUsers.add(pair[0]);
        currentUsers.add(pair[1]);

        // Initialize the adjacency list for each user if not already done
        if (!graph.has(pair[0])) {
          graph.set(pair[0], new Set());
        }
        if (!graph.has(pair[1])) {
          graph.set(pair[1], new Set());
        }

        // Add the connection in both directions
        graph.get(pair[0]).add(pair[1]);
        graph.get(pair[1]).add(pair[0]);
      }
    }
    
    let components = findXCCC(graph);
     groups.set(currentActivity, components)
  }


  //now we have the groups.
  /*
  Map(3) {
  'drinking' => Set(1) { Set(2) { 'user5', 'user6' } },
  'dancing' => Set(1) { Set(2) { 'user4', 'user6' } },
  'knitting' => Set(1) { Set(3) { 'user2', 'user6', 'user3' } }
}

*/
  return groups




}

//Adds a user & their preferences to the matchmaking queue 
async function matchmakingStartSearch(
  userId: string,
  activities: string[],
  preferenceGender: "male" | "female" | "other",
  preferenceMaxRadius: number,
  preferenceMinPeople: number,
) {
  // Call the function to stop any existing search. Ensure it's properly implemented.
  await matchmakingStopsearch(userId);

  let activitiesString = activities.join(",");

  // Add to the MMQueue
  const result = await prismaClient.mMQueueElement.create({
    data: {
      userId: userId,
      activities: activitiesString,
      preferenceGender: preferenceGender, // Assuming "other" is handled in your schema or converted accordingly
      preferenceMaxRadius: preferenceMaxRadius,
      preferenceMinPeople: preferenceMinPeople,
    },
  });
  
  return result; // Return the result which includes the added matchmaking preferences
}

 

//Cancel's a user's search for matchmaking.
async function matchmakingStopsearch(userId: string) {
  await prismaClient.mMQueueElement.deleteMany({
    where: {
      userId: userId,
    },
  });
}

export { calculateDistance,multiMatchmake, matchmakingStartSearch, matchmakingStopsearch, pairMatchmake};
