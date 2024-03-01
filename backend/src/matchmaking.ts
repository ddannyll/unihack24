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
  console.log(activities)
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

  if (userRecord1["gender"] != "both" || userRecord1["gender"] != "both") {
    if (userRecord1["gender"] != userSearch2["preferenceGender"]) {
      return false;
    }

    if (userRecord2["gender"] != userSearch1["preferenceGender"]) {
      return false;
    }
  }

  if (
    calculateDistance(
      userRecord1["latitude"],
      userRecord1["longitude"],
      userRecord2["latitude"],
      userRecord2["longitude"],
    ) >
    Math.max(
      userSearch1["preferenceMaxRadius"],
      userSearch2["preferenceMaxRadius"],
    )
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

  let desiredActivities = getDesiredActivities();

  let sortedActivities: [string, string[]][] =
    Object.entries(desiredActivities);
  sortedActivities.sort((a, b) => b[1].length - a[1].length);
  //sort by descending based on the number of ppl that wnat to do that activity.

  for (let i = sortedActivities.length; i >= 0; i--) {
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

//this doens't work this is half made
async function multiMatchmake() {
  while (true) {
    try {
      let matches: string[][] = [];
      let matchedPeople = new Map(); //keeps track of which people ha vebeen matched already: so we don't match people twice.
      //maps userId to bool

      let desiredActivities = await getDesiredActivities();

      let sortedActivities: [string, string[]][] =
        Object.entries(desiredActivities);
      sortedActivities.sort((a, b) => b[1].length - a[1].length);
      //sort by descending based on the number of ppl that wnat to do that activity.

      for (let i = sortedActivities.length; i >= 0; i--) {
        let currActivity = sortedActivities[i];
        let userIds: string[] = currActivity[1];

        //min attendee requirements.
        let minRequirements: Requirement[] = [];
        for (let id of userIds) {
          let record: any = await prismaClient.mMQueueElement.findFirst({
            where: {
              userId: id,
            },
          });

          if (matchedPeople.get(record["userId"]) == undefined) {
            minRequirements.push({
              id: record["userId"],
              min: Math.min(record["preferenceMinPeople"], 2),
            });
          }
        }

        let optimalGroups: string[][] = createOptimalGroups(minRequirements);

        for (let group of optimalGroups) {
          matches.push(group);
          for (let person of group) {
            matchedPeople.set(person, true);
          }
        }
      }

      //match based on the criteria:
      //activities: have to match the same activities. MUST.
      //preferenceMaxRadius

      // Simulate asynchronous operation with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
    } catch (error) {
      console.error("An error occurred in the matchmaking process:", error);
    }
  }
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
  console.log("hi")
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

export { matchmakingStartSearch, matchmakingStopsearch, pairMatchmake};
