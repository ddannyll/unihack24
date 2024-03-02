import { group } from "console";
import { prismaClient } from "./prisma.js";

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

function removeAtIndex(array: any, i: number) {
  // Check if index is within the bounds of the array
  if (i >= 0 && i < array.length) {
    array.splice(i, 1);
  } else {
    console.error("Index out of bounds");
  }
  return array;
}

type Requirement = {
  id: string;
  min: number;
};

function createOptimalGroups(people: Requirement[]) {
  // Sort people by their minimum requirement in ascending order
  people.sort((a, b) => a.min - b.min);

  console.log(people);
  console.log("\n\n");

  const groups = [];
  let currentGroup = [];
  let currentMin = 0;

  //if index is i, we can have i+1 people,[1,1,1,1,1,1]
  for (let i = people.length - 1; i >= 0; ) {
    if (people[i].min > i + 1) {
      //then this person cannot be fit into a group.
      console.log(`cant put ${JSON.stringify(people[i])}`);
      i--;
      continue;
    } else {
      //take people[i].min people.
      groups.push(people.slice(i - people[i].min + 1, i + 1));
      // console.log(people.slice(i-people[i].min+1,i+1))
      i = i - people[i].min;
    }
  }

  return groups.map((group) => group.map((x) => x.id));
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

async function checkCompatibility(userId1: string, userId2: string) {
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

  console.log(`Distance between ${userId1}, ${userId2} = ${dist}`)
  if (dist >maxViableDist 
  ) {
    
    return false;
  }

  return true;
}

async function curateFeed() {}


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
        if ((await checkCompatibility(userIds[i], userIds[j])) == true) {
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


//SCCC but instead of strongly connceted its some x % connected.
function findSCCC(graph: Map<any, Set<any>>): Set<Set<any>> {
  let components: Set<Set<any>> = new Set();

  graph.forEach((_: any, vertex: any) => {
    // Skip if vertex is already part of a component
    if (Array.from(components).some(component => component.has(vertex))) return;

    let visited: Set<any> = new Set();
    let stack: any[] = [vertex];

    //DFS: Find connected vertices
    while (stack.length > 0) {
      let currentVertex: any = stack.pop();
      if (!visited.has(currentVertex)) {
        visited.add(currentVertex);
        let neighbors: Set<any> = graph.get(currentVertex) || new Set();
        neighbors.forEach(neighbor => {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        });
      }
    }
    
    //Should be at least 70% ?? connected
    //ion even know if this works lmfao
    if (visited.size >= graph.size * 0.7) {
      components.add(visited);
    }
  });

  return components;
}

  
//this doens't work this is half made
async function multiMatchmake() {
  let pairings = await pairMatchmake();
  console.log(pairings)
  console.log("      ")

  let groups:Map<string, Set<Set<string>>> = new Map(); 
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
 
    let components = findSCCC(graph);
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
