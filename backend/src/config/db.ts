import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/echoscan";
    const conn = await mongoose.connect(connStr);
    console.log(`[MongoDB] Connected to host: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    // Non-fatal error log so the server can attempt reconnection or run degraded if DB is optional during setup
  }
};
