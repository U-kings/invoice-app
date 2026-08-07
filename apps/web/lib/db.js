import mongoose from "mongoose";
import dns from "node:dns";

// 1. Force Node.js to use public DNS resolvers (Google & Cloudflare) 
// This completely bypasses your local ISP network blockade causing the error.
if (typeof dns.setServers === "function") {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

export const connectDB = async () => {
    try {
        // 2. Check if a connection is already open or currently connecting
        if (mongoose.connection.readyState >= 1) {
            return;
        }

        // 3. Connect safely with a server timeout fallback rule
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Fail fast if it cannot connect instead of hanging
        });
        
        console.log("🚀 Database successfully connected via Mongoose");
    } catch (error) {
        console.error("❌ Mongoose Connection Error:", error.message);
        throw error; // Pass the error up so your auth/login endpoints know the DB failed
    }
};



// import mongoose from "mongoose";

// export const connectDB = async () => {
//     if (mongoose.connections[0].readyState) return;
//     await mongoose.connect(process.env.MONGO_URI);
// };