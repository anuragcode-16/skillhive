import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/signup
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists. Please sign in instead.' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      provider: 'email',
    });

    if (user) {
      // Record IP and user agent for signup
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];
      await user.addLoginRecord(ipAddress, userAgent);

      // Send response with token
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error in user registration:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!user || !isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Record login info
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await user.addLoginRecord(ipAddress, userAgent);

    // Send response with token
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        picture: user.picture || '',
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Error in user login:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (user) {
      res.json({
        id: user._id,
        username: user.username,
        email: user.email,
        picture: user.picture || '',
        provider: user.provider,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
};

// @desc    Google OAuth authentication
// @route   POST /api/users/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { email, username, googleId, picture } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ message: 'Email and googleId are required' });
    }

    // Check if user exists by email
    let user = await User.findOne({ email });

    if (user) {
      // If user exists but doesn't have Google connected, update their profile
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = 'google';
        if (picture) user.picture = picture;
        await user.save();
      }
    } else {
      // Create a new user with Google data
      user = await User.create({
        username: username || email.split('@')[0],
        email,
        password: Math.random().toString(36).slice(-8), // Random password (not used for Google login)
        googleId,
        provider: 'google',
        picture: picture || '',
      });
    }

    // Record login
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await user.addLoginRecord(ipAddress, userAgent);

    // Return user data and token
    res.status(200).json({
      message: 'Google authentication successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        picture: user.picture || '',
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Error in Google authentication:', error);
    res.status(500).json({ message: 'Server error during Google authentication', error: error.message });
  }
};

// @desc    Get login history
// @route   GET /api/users/login-history
// @access  Private
export const getLoginHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('loginHistory');
    
    if (user) {
      res.json(user.loginHistory);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching login history:', error);
    res.status(500).json({ message: 'Server error fetching login history', error: error.message });
  }
}; 