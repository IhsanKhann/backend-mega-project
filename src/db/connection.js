// db/index.js
import mongoose from 'mongoose';
import config from '../config/config.js'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://IhsanDB:mintfever@cluster0.lj1ezwx.mongodb.net/YTube"
);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;