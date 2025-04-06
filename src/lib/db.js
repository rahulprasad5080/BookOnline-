import mongoose from "mongoose";
import "dotenv/config";

export const connetDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error, "not conneted");
    process.exit(1);
  }
};
