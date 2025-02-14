import mongoose from "mongoose";
import { User } from "@/app/models/User";
import { connectDB } from "@/app/lib/mongodb";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export async function POST(request){
    await connectDB();
    try{
        const {email, password} = await request.json()

        if (!email || !password){
            return new Response(
                JSON.stringify({error: "Email and password are required"}), 
                {status: 400},
            )
        }
    
        const normalized_email = email.toLowerCase()
    
        const existingUser = await User.findOne({email: normalized_email})
    
        if (!existingUser){
            return new Response(
                JSON.stringify({error: "Invalid Credentials"}),
                {status: 401}
            );
        }
    
        const isPasswordValid = await bcrypt.compare(password, existingUser.password)
        if(!isPasswordValid){
            return new Response(
                JSON.stringify({error: "Invalid Password"}),
                {status: 401}
            );
        }
    
        const payload = {
            id: existingUser._id,
            email: existingUser.email
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1h"});

        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '7d'})

        return new Response(JSON.stringify({token, refreshToken}), {status: 200})
    } catch(error){
        console.log("Login error:", error)
        return new Response(
            JSON.stringify({error: "Internal server Error"}),
            {status: 500},
        )
    }
}