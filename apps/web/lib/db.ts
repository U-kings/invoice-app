import mongoose from "mongoose";
import dns from "node:dns";

// 1. Force Node.js to use public DNS resolvers
if (typeof dns.setServers === "function") {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

/**
 * Connects to the MongoDB database using Mongoose.
 * @returns {Promise<void>} Resolves when the connection is established or already active.
 */
export const connectDB = async (): Promise<void> => {
  try {
    // 2. Check if a connection is already open or currently connecting
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    // 3. Fallback and strict type-check for the environment variable
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing from your environment variables.");
    }

    // 4. Connect safely with explicit option types
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Fail fast (5s) instead of hanging
    });

    console.log("🚀 Database successfully connected via Mongoose");
  } catch (error: unknown) {
    // 5. Type guard the catch-block 'unknown' error type safely
    if (error instanceof Error) {
      console.error("❌ Mongoose Connection Error:", error.message);
    } else {
      console.error("❌ Mongoose Connection Error: An unknown error occurred", error);
    }
    throw error; 
  }
};
