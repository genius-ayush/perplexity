import type { NextFunction, Request, Response } from "express";
import createSupabase from "./lib/client.js";
const client = createSupabase() ; 

export function middleware(req:Request , res : Response , next : NextFunction){

    const token = req.headers.authorization ; 

    client.auth.getUser

} 