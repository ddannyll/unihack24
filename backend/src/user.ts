

type RegistrationData = {
    firstName: string;
    lastName: string;
    password: string;
    email: string;
    bio: string;
    age: string;
    gender: string;
};


function userRegister(data: RegistrationData){

}

async function userLogin(email: string, password: string) {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  
    if (user && user.password === password) {
        return {};
     } else {
        return {'error': "invalid password"}
     }
  }




  