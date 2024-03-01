import prismaClient from 'prisma.ts'


async function getDesiredActivities(){
  let activities:{ [key: string]: string[] } = {};

  let allRecords = await prismaClient.mMQueueElement.findMany();

  for(let record of allRecords){
    for(let activity of record['activities']){
      if(!(activity in activities)){
        activities[activity] = [record['userId']]     
      }else{
        activities[activity].push(record['userId'])
      }
    }
  }

  return activities;
  



} 

function removeAtIndex(array:any, i:number) {
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

  console.log(people)
  console.log('\n\n')

  const groups = [];
  let currentGroup = [];
  let currentMin = 0;

  //if index is i, we can have i+1 people,[1,1,1,1,1,1]
  for(let i=people.length -1; i>=0;){
    if(people[i].min > i+1){
      //then this person cannot be fit into a group.
      console.log(`cant put ${JSON.stringify(people[i])}`)
      i--;
      continue;
    }else{
      //take people[i].min people.
      groups.push(people.slice(i-people[i].min+1,i+1))
      // console.log(people.slice(i-people[i].min+1,i+1))
      i = i - people[i].min;
    }                   
  }
 
 
  return groups.map(group=>group.map(x=>x.id))
}



function checkCompatibility(userId1:any, userId2:any) : Boolean {
  let userRecord1  = await prismaClient.user.findUnique({
    where:{
      userId: userId1
    }
  });

  let userRecord2  = await prismaClient.user.findUnique({
    where:{
      userId: userId2
    }
  });


  let userSearch1  = await prismaClient.mMQueueElement.findUnique({
    where:{
      userId: userId1
    }
  });

  let userSearch2  = await prismaClient.mMQueueElement.findUnique({
    where:{
      userId: userId2
    }
  });

  if(userRecord1['gender'] == )


}


async function galeShapely(){
  //this is only for one on one.
 
  let desiredActivities = getDesiredActivities();
   
  let sortedActivities:  [string, string[]][] = Object.entries(desiredActivities);
        sortedActivities.sort((a, b) => b[1].length - a[1].length);
        //sort by descending based on the number of ppl that wnat to do that activity.

  for(let i = sortedActivities.length; i>=0; i--){
    let currActivity = sortedActivities[i];
    let userIds : string[] = currActivity[1];

    let validPairings = []

    for(let id of userIds){
      let userRecord  = await prismaClient.findUnique({
        where:{
          userId: id
        }
      });
    }

    for(let i = 0; i< userIds.length; i++){
      for(let j = i+1; j<userIds.length; j++){
        

        if()



      }
    }
    

    
    

  }

}

async function matchmake() {
    while (true) {
      try {
        let matches: string[][] = []
        let matchedPeople = new Map(); //keeps track of which people ha vebeen matched already: so we don't match people twice.
          //maps userId to bool

        let desiredActivities = await getDesiredActivities();
        
        let sortedActivities:  [string, string[]][] = Object.entries(desiredActivities);
        sortedActivities.sort((a, b) => b[1].length - a[1].length);
        //sort by descending based on the number of ppl that wnat to do that activity.

        for(let i = sortedActivities.length; i>=0; i--){
          let currActivity = sortedActivities[i];
          let userIds: string[] = currActivity[1];

          //min attendee requirements.
          let minRequirements: Requirement[] = []
          for(let id of userIds){
            let record = await prismaClient.mMQueueElement.findUnique({
              where: {
                    userId: id
                }
            });   
            
            if(matchedPeople.get(record['userId']) == undefined){
              minRequirements.push({id: record['userId'], min: Math.min(record['preferenceMinPeople'], 2)})
            }
          }


          let optimalGroups: string[][] = createOptimalGroups(minRequirements);

          for (let group of optimalGroups){
            matches.push(group)
            for(let person of group){
              matchedPeople.set(person, true);
            }
          } 



        }

        
        //match based on the criteria:
        //activities: have to match the same activities. MUST.
        //preferenceMaxRadius

      

                
        // Simulate asynchronous operation with a delay
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

      } catch (error) {
        console.error('An error occurred in the matchmaking process:', error);
      }
    }
}
 

//Adds a user & their preferences to the matchmaking queue
async function matchmakingStartSearch(
    userId: string,
    activities: string[],
    preferenceGender: 'male' | 'female' | 'both',
    preferenceMaxRadius: number,
    preferenceMinPeople: number
  ) {
    
    //Delete any that might be in there (precaution)
    matchmakingStopsearch(userId)

        

    // Add to the MMQueue
    await prismaClient.mMQueueElement.create({
      data: {
        userId,
        activities,
        preferenceGender,
        preferenceMaxRadius,
        preferenceMinPeople,
      },
    });
     
    return {};
}
  

//Cancel's a user's search for matchmaking.
async function matchmakingStopsearch(userId: string){
    await prismaClient.mMQueueElement.deleteMany({
        where: {
          userId: userId,
        },
    });
}

 

export {matchmake}