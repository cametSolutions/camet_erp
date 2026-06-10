import mongoose from "mongoose";
import dns from "node:dns";
const connectDB = async () => {

  console.log(process.env.MONGO_URI);
  
  try {
    console.log("hai")
    console.log(process.env.MONGO_URI);
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected ${conn.connection.host}`);
    
  } catch (error) {
    console.log(`Error : ${error.message}`);
    process.exit(1)
  }
};

export default connectDB;
