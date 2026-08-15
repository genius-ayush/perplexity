import type { NextFunction, Request, Response } from "express";
import createSupabase from "./lib/client.js";
import { prisma } from "./lib/prisma.js";
const client = createSupabase() ; 

export async function middleware(req:Request , res : Response , next : NextFunction){    

    const token = req.headers.authorization ; 

    const data = await client.auth.getUser(token) ;      
    
    const userId = data.data.user?.id ; 

    if(userId){

        console.log(data)

        try{

            await prisma.user.create({
                data:{
                    id : data.data.user?.id ,
                    supabaseId : data.data.user?.id! ,  
                    email : data.data.user?.email! , 
                    provider : data.data.user?.app_metadata.provider === 'google' ? "GMAIL" : "GITHUB" , 
                    name : data.data.user?.user_metadata.full_name , 

                }
            })
        }catch(e){
            console.log(e) ; 
        }
        //@ts-ignore
        req.userId = userId ; 
        next() ; 
    }else{
        res.status(403).json({message : "token no found!"}) ; 
    }
} 