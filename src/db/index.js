import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
    );
    console.log(
      `MongoDB connection successful. Connected to host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error; // Propagate the error to the caller
  }
};

const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed successfully.");
  } catch (error) {
    console.error("Error while closing MongoDB connection", error);
    throw error; // Propagate the error to the caller
  }
};

export { connectDB, closeDB };
