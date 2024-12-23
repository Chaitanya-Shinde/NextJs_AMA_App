import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void>{
    if(connection.isConnected){
        console.log("Already conected to database");
        return
    }

    try {
        
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {})
        connection.isConnected = db.connections[0].readyState
        //console.log(connection);
        
        console.log("DB connected successfully");
        
    } catch (error) {
        console.log("DB connection failed", error);
        
        process.exit()
    }
}

export default dbConnect;