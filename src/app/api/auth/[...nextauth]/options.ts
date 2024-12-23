import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs'
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
    providers:[
        Credentials({
            id: "credentials",
            name: "credentials",
            credentials:{
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any>{
                console.log("The credentials are: ",credentials);
                
                await dbConnect()
                try {
                    
                    console.log("email is :",credentials.email);
                    console.log("password is :",credentials.password);

                    const user = await UserModel.findOne({
                        $or:[
                            {email: credentials.email},
                            {username: credentials.username}
                        ]
                    })
                    
                    if(!user){
                        throw new Error("No user found with this email")
                    }

                    if(!user.isVerified){
                        throw new Error("Please verify your account to proceed")
                    }

                    const isPassCorrect = await bcrypt.compare(credentials.password, user.password)
                    if(isPassCorrect){
                        return user
                    }
                    else{
                        throw new Error("Incorrect password")
                    }
                } catch (error:any) {
                    throw new Error(error)
                }
            }
        })
    ],
    callbacks:{
        async jwt({ token, user }) {
            if(user){
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            return token
        },
        async session({ session, token }) {
            if(token){
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            return session
        }
    },
    pages:{
        signIn: '/signIn',
    },
    session:{
        strategy:"jwt"
    },
    secret: process.env.NEXTAUTH_SECRET_KEY
}
