import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  googleAuth,
  getLoginHistory 
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.get('/login-history', protect, getLoginHistory);

export default router; 