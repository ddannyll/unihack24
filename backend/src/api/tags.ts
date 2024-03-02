import { Request, Response, Router } from "express";
import { prismaClient } from "../clients.js";
import betterJson from "../middleware/betterJson.js";
// import { randomUUID } from "crypto";
 

///routes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes below
///routes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes below
///routes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes below
///routes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes below
///routes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes belowroutes below
const tagRoutes = Router();
 

tagRoutes.get('/tags/searchtags', async (req: Request, res: Response) => {
    try {
        const partialName: string = req.query.partialName as string;
        const maxAmount: number = parseInt(req.query.maxAmount as string) || 10; // Default if not provided

        const tagMatches = await searchTags(partialName, maxAmount);
        res.json(tagMatches);
    } catch (error:any) {
        console.error("Error searching tags:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

tagRoutes.get('/tags/userselectedtags', async (req: Request, res: Response) => {
    try {
        const userId: string = req.query.userId as string;

        const tagMatches = await getSelectedTags(userId);
        res.json(tagMatches);
    } catch (error:any) {
        console.error("Error getting selected tags:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

tagRoutes.post('/tags/deselecttag', async (req: Request, res: Response) => {
    try {
        const userId: string = req.body.userId;
        const tagName: string = req.body.tagName;

        await deselectTag(userId, tagName);
        res.json({});
    } catch (error:any) {
        console.error("Error deselecting tag:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

tagRoutes.post('/tags/selecttag', async (req: Request, res: Response) => {
    try {
        const userId: string = req.body.userId;
        const tagName: string = req.body.tagName;

        await selectTag(userId, tagName);
        res.json({});
    } catch (error:any) {
        console.error("Error selecting tag:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

//select (add) tagName from user userId 
//tagName should be FULL NAME of tag
async function selectTag(userId: string, tagName: string) {

    // Step 1: Query the user by userId
    const user = await prismaClient.user.findUnique({
        where: {
            userId: userId
        }
    });

    if (!user) {
        throw new Error(`User with ID ${userId} not found`);
    }

    // Step 2: Query the tag by tagName
    const tag = await prismaClient.tag.findUnique({
        where: {
            name: tagName
        }
    });

    if (!tag) {
        throw new Error(`Tag with name ${tagName} not found`);
    }

    // Step 3: Associate tag with the user
    await prismaClient.user.update({
        where: {
            userId: userId
        },
        data: {
            selectedTags: {
                connect: {
                    name: tagName
                }
            }
        }
    });
}



//deselect tagName from user userId 
//tagName should be FULL NAME of tag
async function deselectTag(userId: string, tagName: string) {
     
    const user = await prismaClient.user.findUnique({
        where: {
            userId: userId
        }
    });

    if (!user) {
        throw new Error(`User with ID ${userId} not found`);
    }

        
    const tag = await prismaClient.tag.findUnique({
        where: {
            name: tagName
        }
    });

    if (!tag) {
        throw new Error(`Tag with name ${tagName} not found`);
    }

        
    await prismaClient.user.update({
        where: {
            userId: userId
        },
        data: {
            selectedTags: {
                disconnect: {
                    name: tagName
                }
            }
        }
    });
 
}


async function getSelectedTags(userId: string){
    let tagMatches = await prismaClient.tag.findMany({
        where:{
            userUserId: userId
        }
    })
 
    tagMatches.map(x=>({'name': x['name'], 'numSearching': x['numSearching']}))
    return tagMatches;
}

async function searchTags(partialName: string, maxAmount: number) {
    let tagMatches = await prismaClient.tag.findMany({
        where: {
            name: {
                contains: partialName
            }
        },
        orderBy: {
            numSearching: 'desc'
        },
        take: maxAmount // Limit the number of results
    });
 
    console.log(tagMatches)
    tagMatches.map(x=>({'name': x['name'], 'numSearching': x['numSearching']}))
    return tagMatches;
}


 