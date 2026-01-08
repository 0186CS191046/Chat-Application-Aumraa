import jwt from "jsonwebtoken";
import config from "../config/index.js";

export const auth = async(req,res,next) =>{
    const authHeaders = req.headers.authorization;

    if(!authHeaders){
        return res.status(400).json({message:"Missing Headers"})
    }
    const token = authHeaders&& authHeaders.split(" ")[1]
     if(!token){
        return res.status(400).json({message:"Missing required fields!"})
    }
    try {
        const decoded = await jwt.verify(token,config.jwt_secret_key); 
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({message:"Invalid token"})
    }
}