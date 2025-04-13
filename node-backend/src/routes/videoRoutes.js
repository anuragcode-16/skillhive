import express from 'express';
import { 
  getSavedVideos, 
  saveVideo, 
  deleteVideo, 
  markVideoWatched 
} from '../controllers/videoController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected with JWT auth
router.use(protect);

// Route: /api/videos
router.route('/')
  .get(getSavedVideos)
  .post(saveVideo);

// Route: /api/videos/:id
router.route('/:id')
  .delete(deleteVideo);

// Route: /api/videos/:id/watched
router.route('/:id/watched')
  .put(markVideoWatched);

export default router; 