import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// Cache the connection across serverless invocations.
// Without this, every Vercel request opens a new connection and
// eventually crashes with connection-pool / memory errors.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    // Never process.exit() on Vercel — that IS the
    // "Serverless Function has crashed" screen.
    const err = new Error(
      "MONGODB_URI is not set. Add it in Vercel → Project → Settings → Environment Variables."
    );
    if (process.env.VERCEL) {
      throw err;
    }
    console.log("MongoDB error:", err.message);
    process.exit(1);
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      .then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    console.log(
      `\n MongoDB connected !! DB HOST: ${cached.conn.connection.host}`
    );
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.log("MongoDB error", error);
    if (process.env.VERCEL) {
      throw error;
    }
    process.exit(1);
  }
};

export default connectDB;
