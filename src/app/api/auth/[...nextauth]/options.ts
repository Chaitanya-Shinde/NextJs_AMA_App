import { NextAuthOptions, User } from "next-auth";
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
            async authorize(credentials: Record<"email" | "password", string> | undefined): Promise<User> {
                if (!credentials) {
                    throw new Error("Credentials not provided");
                }

        
                await dbConnect()
                try {
                    
                    console.log("email is :",credentials.email);
                    console.log("password is :",credentials.password);

                    const user = await UserModel.findOne({email: credentials.email})
                    
                    if(!user){
                        throw new Error("No user found with this email")
                    }

                    if(!user.isVerified){
                        throw new Error("Please verify your account to proceed")
                    }

                    const isPassCorrect = await bcrypt.compare(credentials.password, user.password)
                    if(isPassCorrect){
                        return {
                            ...user.toObject(),
                            _id: (user._id as string).toString()
                        } as User
                    }
                    else{
                        throw new Error("Incorrect password")
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        throw new Error(error.message);
                    }
                    throw new Error("An unexpected error occurred");
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
