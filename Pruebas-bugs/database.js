/**
 * Establishes a connection to the MongoDB database using the MONGO_URL environment variable.
 * @async
 * @function
 * @returns {Promise<void>} - A Promise that resolves when the connection is established or rejects if there is an error.
 */
import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to the database");
  } catch {
    console.log("Error connecting to the database");
    //esperar 5 segundos para volverlo a intentar
    setTimeout(() => {
      dbConnection();
    }, 5000);

  }
};

export default dbConnection;
