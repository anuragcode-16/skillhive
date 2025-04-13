import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Create a database connection
const dbPromise = open({
    filename: './skillhive.db',
    driver: sqlite3.Database
});

// Initialize the database
async function initializeDb() {
    try {
        const db = await dbPromise;
        
        // Create Users table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                google_id TEXT UNIQUE,
                picture TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create SavedVideos table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS SavedVideos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                video_url TEXT NOT NULL,
                title TEXT NOT NULL,
                thumbnail TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users (id)
            )
        `);
        
        // Create Scores table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS Scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                video_id TEXT NOT NULL,
                score INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES Users (id)
            )
        `);
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error.message);
    }
}

// Initialize the database
initializeDb();

export default dbPromise;