import mongoose from "mongoose";
import dotenv from "dotenv";

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('MongoDB connected sucessfully');
    }
    catch (error){
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};