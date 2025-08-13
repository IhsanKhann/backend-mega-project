// db/index.js (or similar file)
import mongoose from 'mongoose';
import config from "../config/config.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;