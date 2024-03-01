 
function createOptimalGroups(people) {
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


const people = [
  { id: "1", min: 2 },
  { id: "2", min: 2 },
  { id: "3", min: 3 },
  { id: "4", min: 3 },
  { id: "5", min: 2 },
  { id: "6", min: 2 },
  { id: "7", min: 4 },
  { id: "8", min: 2 },
  { id: "9", min: 7 },
  { id: "10", min: 2 },
  { id: "11", min: 2 },
  { id: "12", min: 2 },
];

console.log(createOptimalGroups(people));
