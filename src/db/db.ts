// src/lib/mongoose.ts
import mongoose, { Mongoose } from "mongoose";

/**
 * GLOBAL TYPE (for hot reload safety)
 */
declare global {
  // eslint-disable-next-line no-var
  var __mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  } | undefined;
}

const MONGODB_URI: string = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is missing in .env.local");
}

// Initialize global cache if missing
if (!global.__mongoose) {
  global.__mongoose = { conn: null, promise: null };
}

const cached = global.__mongoose;

/**
 * CONNECT FUNCTION
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // 1. Return cached connection if exists
  if (cached.conn) {
    return cached.conn;
  }

  // 2. Otherwise create a connection promise
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("✅ MongoDB Connected");

      mongooseInstance.connection.on("error", (err) =>
        console.error("❌ MongoDB Error:", err)
      );

      mongooseInstance.connection.on("disconnected", () =>
        console.log("⚠️ MongoDB Disconnected")
      );

      return mongooseInstance;
    });
  }

  // 3. Wait for connection
  cached.conn = await cached.promise;

  return cached.conn;
}

/**
 * Disconnect for testing
 */
export async function disconnectToDatabase(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log("🔌 MongoDB Disconnected");
  }
}

/**
 * Connection Status
 */
export function getConnectionStatus() {
  const state = mongoose.connection.readyState;
  return state === 1
    ? "connected"
    : state === 2
    ? "connecting"
    : state === 3
    ? "disconnecting"
    : "disconnected";
}

export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Optional automatic connection wrapper
 */
export async function withDB<T>(operation: () => Promise<T>): Promise<T> {
  await connectToDatabase();
  return operation();
}

export { mongoose };
