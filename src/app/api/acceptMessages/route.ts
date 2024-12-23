import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {User} from 'next-auth'

export async function POST(request:Request) {
    await dbConnect()
    const session = await getServerSession(authOptions)

    const user: User = session?.user as User

    if(!session || !session.user){
        return Response.json({
                success: false,
                message: "Not authenticated"
            },{status: 401}
        )
    }
    const userId = user._id
    const {acceptMessages} = await request.json()

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, {isAcceptingMessages: acceptMessages}, {new:true})
        if(!updatedUser){
            return Response.json({
                    success: false,
                    message: "Failed to update user status"
                },{status: 401}
            )
        }
        return Response.json({
                success: true,
                message: "Successfully updated user status",
                updatedUser
            },{status: 200}
        )
    } catch (error) {
        console.log("Failed to update user status", error);
        
        return Response.json({
                success: false,
                message: "Failed to update user status"
            },{status: 500}
        )    
    }
    
    
}

export async function GET(){
    await dbConnect()
    const session = await getServerSession(authOptions)

    const user: User = session?.user as User

    if(!session || !session.user){
        return Response.json({
                success: false,
                message: "Not authenticated"
            },{status: 401}
        )
    }
    const userId = user._id

    try {
        const foundUser = await UserModel.findById(userId)
        if(!foundUser){
            return Response.json({
                    success: false,
                    message: "User not found"
                },{status: 404}
            )
        }
        return Response.json({
                success: true,
                message: "Found user",
                isAcceptingMessages: foundUser.isAcceptingMessages,
                foundUser
            },{status: 200}
        )
    } catch (error) {
        console.log("Failed to get user message acceptance status", error);
        
        return Response.json({
                success: false,
                message: "Failed to get user message acceptance status"
            },{status: 500}
        ) 
    }
}

