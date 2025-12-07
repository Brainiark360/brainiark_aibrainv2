// /lib/db-optimized.ts
import mongoose, { Model, Mongoose } from "mongoose";

const MONGODB_URI: string = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is missing in .env.local");
}

// Global cache for hot reload
const globalWithMongoose = global as typeof globalThis & {
  mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
};

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

const cached = globalWithMongoose.mongoose;

/**
 * OPTIMIZED DATABASE CONNECTION
 * With connection pooling and better error handling
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // Return cached connection if exists
  if (cached.conn) {
    // Test the connection is still alive
    if (cached.conn.connection.readyState === 1) {
      return cached.conn;
    }
  }

  // Create new connection promise if not exists
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Increased for better concurrency
      minPoolSize: 2, // Keep some connections ready
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("✅ MongoDB Connected (Optimized)");
      
      // Set up event listeners
      mongooseInstance.connection.on("error", (err) =>
        console.error("❌ MongoDB Connection Error:", err)
      );
      
      mongooseInstance.connection.on("disconnected", () =>
        console.log("⚠️ MongoDB Disconnected")
      );
      
      mongooseInstance.connection.on("reconnected", () =>
        console.log("✅ MongoDB Reconnected")
      );
      
      return mongooseInstance;
    }).catch((err) => {
      console.error("❌ MongoDB Connection Failed:", err);
      cached.promise = null; // Reset on error
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Get optimized model with pre-connected database
 */
export async function getModel<T extends Document>(modelName: string): Promise<Model<T>> {
  await connectToDatabase();
  return mongoose.model<T>(modelName);
}

/**
 * Helper for common queries with lean option for performance
 */
export async function findOneOptimized<T>(
  model: Model<T>,
  query: any,
  projection?: any
): Promise<T | null> {
  return model.findOne(query, projection).lean().exec();
}

export async function findOptimized<T>(
  model: Model<T>,
  query: any,
  options?: {
    projection?: any;
    sort?: any;
    limit?: number;
    skip?: number;
  }
): Promise<T[]> {
  let queryBuilder = model.find(query, options?.projection);
  
  if (options?.sort) queryBuilder = queryBuilder.sort(options.sort);
  if (options?.limit) queryBuilder = queryBuilder.limit(options.limit);
  if (options?.skip) queryBuilder = queryBuilder.skip(options.skip);
  
  return queryBuilder.lean().exec();
}

export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}