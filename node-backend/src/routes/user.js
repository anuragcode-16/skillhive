import dbPromise from "../DB/db.js";
import { Router } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const userRouter = new Router();

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Add this function to check for common passwords
const isCommonPassword = (password) => {
    const commonPasswords = [
        '12345678', 'password', 'qwerty', '123456789', 
        'password123', 'admin123', '11111111', '00000000'
        // Add more common passwords as needed
    ];
    return commonPasswords.includes(password);
};

// Function to validate password
const validatePassword = (password) => {
    if (!password || password.length < 8) {
        return 'Password must be at least 8 characters long';
    }
    if (!PASSWORD_REGEX.test(password)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    if (isCommonPassword(password)) {
        return 'Password is too common. Please choose a stronger password';
    }
    return null; // null means password is valid
};

// Get all users
userRouter.get('/all', async (req, res) => {
    try {
        const db = await dbPromise;
        const users = await db.all('SELECT * FROM Users');
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err.message);
        res.status(500).send('Error fetching users');
    }
});

// Get single user by ID
userRouter.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    dbPromise.then(async (db) => {
        const user = await db.get('SELECT * FROM Users WHERE EXISTS (SELECT 1 FROM Users WHERE user_id = ?) AND user_id = ?', 
            [userId, userId]);
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).send('User not found');
        }
    }).catch((err) => {
        console.error('Error fetching user:', err.message);
        res.status(500).send('Error fetching user');
    });
});

// Delete all users (be careful with this in production!)
userRouter.delete('/all', (req, res) => {
    dbPromise.then(async (db) => {
        const result = await db.run('DELETE FROM Users WHERE EXISTS (SELECT 1 FROM (SELECT * FROM Users) AS u)');
        res.status(200).json({
            message: 'All users deleted successfully',
            deletedCount: result.changes
        });
    }).catch((err) => {
        console.error('Error deleting users:', err.message);
        res.status(500).send('Error deleting users');
    });
});

// Signup route
userRouter.post('/signup', async (req, res) => {
    const { email, password, username } = req.body;
    
    // Email validation
    if (!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // Password validation
    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(400).json({ error: passwordError });
    }
    
    try {
        const db = await dbPromise;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Check if user already exists
        const existingUser = await db.get('SELECT * FROM Users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Create new user
        const result = await db.run(
            'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );
        
        const userId = result.lastID;
        
        // Generate token
        const token = jwt.sign({ userId, email }, 'your-secret-key-here');
        
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: userId,
                email,
                username
            },
            token
        });
    } catch (err) {
        console.error('Error creating user:', err.message);
        res.status(500).send('Error creating user');
    }
});

// Login route
userRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const db = await dbPromise;
        
        // Find user by email
        const user = await db.get('SELECT * FROM Users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }
        
        // Generate token
        const token = jwt.sign({ userId: user.id, email: user.email }, 'your-secret-key-here');
        
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            },
            token
        });
    } catch (err) {
        console.error('Error logging in:', err.message);
        res.status(500).send('Error logging in');
    }
});

// Optional: Add a logout route to remove a specific token
userRouter.post('/logout', auth, (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    dbPromise.then(async (db) => {
        const result = await db.run(
            `UPDATE Users 
             SET jwt_token = JSON_REMOVE(
                 jwt_token,
                 JSON_UNQUOTE(JSON_SEARCH(jwt_token, 'one', ?))
             )
             WHERE EXISTS (SELECT 1 FROM (SELECT * FROM Users) AS u WHERE user_id = ?)
             AND user_id = ?`,
            [token, req.user.user_id, req.user.user_id]
        );
        if (result.changes === 0) {
            return res.status(404).send('Token not found');
        }
        res.status(200).json({ message: 'Logged out successfully' });
    }).catch((err) => {
        console.error('Error removing token:', err);
        res.status(500).send('Error logging out');
    });
});

// Optional: Add a logout from all devices route
userRouter.post('/logout/all', auth, (req, res) => {
    dbPromise.then(async (db) => {
        const result = await db.run(
            `UPDATE Users 
             SET jwt_token = JSON_ARRAY()
             WHERE EXISTS (SELECT 1 FROM (SELECT * FROM Users) AS u WHERE user_id = ?)
             AND user_id = ?`,
            [req.user.user_id, req.user.user_id]
        );
        if (result.changes === 0) {
            return res.status(404).send('User not found');
        }
        res.status(200).json({ message: 'Logged out from all devices successfully' });
    }).catch((err) => {
        console.error('Error removing all tokens:', err);
        res.status(500).send('Error logging out');
    });
});

// Protected route example
userRouter.get('/profile', auth, async (req, res) => {
    try {
        const db = await dbPromise;
        const user = await db.get('SELECT id, username, email FROM Users WHERE id = ?', [req.user.user_id]);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(200).json(user);
    } catch (err) {
        console.error('Error fetching profile:', err.message);
        res.status(500).send('Error fetching profile');
    }
});

// Google Authentication route
userRouter.post('/google-auth', async (req, res) => {
  try {
    const { id, email, name } = req.body;
    
    if (!id || !email) {
      return res.status(400).json({ error: 'Missing required Google auth data' });
    }
    
    const db = await dbPromise;
    
    // Check if user already exists
    let user = await db.get('SELECT * FROM Users WHERE email = ?', [email]);
    
    if (!user) {
      // Create new user from Google data
      const result = await db.run(
        'INSERT INTO Users (username, email, password, google_id) VALUES (?, ?, ?, ?)',
        [name, email, 'GOOGLE_AUTH_USER', id]
      );
      
      user = {
        id: result.lastID,
        email,
        username: name
      };
    }
    
    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email }, 'your-secret-key-here');
    
    res.status(200).json({
      message: 'Google authentication successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token
    });
  } catch (err) {
    console.error('Error with Google authentication:', err.message);
    res.status(500).send('Error authenticating with Google');
  }
});

export default userRouter;