import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI environment variable is not set");

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | undefined;
  // eslint-disable-next-line no-var
  var _mongoosePromise: Promise<typeof mongoose> | undefined;
}

export async function connectToDatabase() {
  if (global._mongooseConn) return global._mongooseConn;

  if (!global._mongoosePromise) {
    global._mongoosePromise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
  }

  try {
    global._mongooseConn = await global._mongoosePromise;
  } catch (err) {
    // Reset the cached promise so the next call retries the connection
    global._mongoosePromise = undefined;
    throw err;
  }

  return global._mongooseConn;
}
