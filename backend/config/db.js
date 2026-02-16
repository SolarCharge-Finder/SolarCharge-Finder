import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      process.stderr.write('MONGODB_URI is not defined in environment variables\n');
      return;
    }
    
    const conn = await mongoose.connect(mongoUri);
    process.stdout.write('MongoDB Connected\n');
    return conn;
  } catch (error) {
    process.stderr.write(`MongoDB connection error: ${error.message}\n`);
    return;
  }
};

export default connectDB;
