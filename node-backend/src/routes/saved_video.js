import dbPromise from '../DB/db.js';
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const savedVideoRouter = new Router();

// Get all saved videos for a user
savedVideoRouter.get('/saved-videos/:userId', async (req, res) => {
    try {
        const db = await dbPromise;
        const videos = await db.all('SELECT * FROM SavedVideos WHERE user_id = ?', [req.params.userId]);
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save a video for a user
savedVideoRouter.post('/save-video', async (req, res) => {
    try {
        const { userId, videoUrl, title, thumbnail } = req.body;
        
        const db = await dbPromise;
        const result = await db.run(
            'INSERT INTO SavedVideos (user_id, video_url, title, thumbnail) VALUES (?, ?, ?, ?)',
            [userId, videoUrl, title, thumbnail]
        );
        
        res.status(201).json({ 
            message: 'Video saved successfully',
            id: result.lastID
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a saved video
savedVideoRouter.delete('/saved-video/:id', async (req, res) => {
    try {
        const db = await dbPromise;
        const result = await db.run('DELETE FROM SavedVideos WHERE id = ?', [req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Saved video not found' });
        }
        
        res.json({ message: 'Saved video removed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default savedVideoRouter;