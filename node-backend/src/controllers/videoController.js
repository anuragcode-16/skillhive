import SavedVideo from '../models/savedVideoModel.js';

// @desc    Get all saved videos for a user
// @route   GET /api/videos
// @access  Private
export const getSavedVideos = async (req, res) => {
  try {
    const videos = await SavedVideo.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error('Error fetching saved videos:', error);
    res.status(500).json({ message: 'Failed to fetch saved videos', error: error.message });
  }
};

// @desc    Save a new video
// @route   POST /api/videos
// @access  Private
export const saveVideo = async (req, res) => {
  try {
    const { videoUrl, title, thumbnail, description } = req.body;

    if (!videoUrl || !title) {
      return res.status(400).json({ message: 'Video URL and title are required' });
    }

    // Check if video already exists for this user
    const existingVideo = await SavedVideo.findOne({ 
      user: req.user.id, 
      videoUrl: videoUrl 
    });

    if (existingVideo) {
      return res.status(400).json({ message: 'Video already saved' });
    }

    const video = await SavedVideo.create({
      user: req.user.id,
      videoUrl,
      title,
      thumbnail: thumbnail || '',
      description: description || '',
    });

    if (video) {
      res.status(201).json({
        message: 'Video saved successfully',
        video,
      });
    } else {
      res.status(400).json({ message: 'Invalid video data' });
    }
  } catch (error) {
    console.error('Error saving video:', error);
    res.status(500).json({ message: 'Failed to save video', error: error.message });
  }
};

// @desc    Delete a saved video
// @route   DELETE /api/videos/:id
// @access  Private
export const deleteVideo = async (req, res) => {
  try {
    const video = await SavedVideo.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if video belongs to user
    if (video.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this video' });
    }

    await video.deleteOne();
    res.json({ message: 'Video removed successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Failed to delete video', error: error.message });
  }
};

// @desc    Mark video as watched
// @route   PUT /api/videos/:id/watched
// @access  Private
export const markVideoWatched = async (req, res) => {
  try {
    const video = await SavedVideo.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if video belongs to user
    if (video.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this video' });
    }

    video.isWatched = true;
    video.watchedAt = new Date();
    
    const updatedVideo = await video.save();
    res.json(updatedVideo);
  } catch (error) {
    console.error('Error marking video as watched:', error);
    res.status(500).json({ message: 'Failed to update video', error: error.message });
  }
}; 