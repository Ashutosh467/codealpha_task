const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('username').isAlphanumeric().isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 alphanumeric characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { username, email, password, display_name } = req.body;

      // Check if user exists
      const stmtCheck = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?');
      const existingUser = stmtCheck.get(username, email);
      if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      const id = uuidv4();
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      const nameToUse = display_name || username;

      const stmtInsert = db.prepare('INSERT INTO users (id, username, email, password_hash, display_name) VALUES (?, ?, ?, ?, ?)');
      stmtInsert.run(id, username, email, password_hash, nameToUse);

      const token = jwt.sign({ id, username }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        token,
        user: { id, username, email, display_name: nameToUse, bio: '', avatar_url: '' }
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').exists().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { email, password } = req.body;

      const stmtCheck = db.prepare('SELECT * FROM users WHERE email = ?');
      const user = stmtCheck.get(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });

      delete user.password_hash;
      res.json({ token, user });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/me', auth, (req, res, next) => {
  try {
    const stmtCheck = db.prepare('SELECT id, username, email, display_name, bio, avatar_url, created_at FROM users WHERE id = ?');
    const user = stmtCheck.get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
