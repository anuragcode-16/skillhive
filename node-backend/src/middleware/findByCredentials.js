import bcrypt from 'bcrypt';
import dbPromise from '../DB/db.js';

const findByCredentials = async (req, res, next) => {
    const { email, password } = req.body;
    
    try {
        const db = await dbPromise;
        const user = await db.get('SELECT * FROM Users WHERE email = ?', [email]);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error finding user:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};

export default findByCredentials; 