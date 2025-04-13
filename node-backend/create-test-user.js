import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const createTestUser = async () => {
  try {
    await connectDB();
    
    // Define a simple user schema
    const userSchema = new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      provider: String,
    });
    
    // Create User model
    const User = mongoose.model('User', userSchema);
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists');
      await mongoose.connection.close();
      return;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Create test user
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      provider: 'email',
    });
    
    await user.save();
    console.log('Test user created successfully');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser(); 