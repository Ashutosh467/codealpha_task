const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .webp format allowed!'), false);
    }
  }
});

router.get('/search', auth, (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    const stmt = db.prepare(`
      SELECT 
        id, username, display_name, avatar_url,
        EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = users.id) AS is_following
      FROM users
      WHERE username LIKE ? OR display_name LIKE ?
      LIMIT 10
    `);
    const searchTerm = `%${q}%`;
    const users = stmt.all(req.user.id, searchTerm, searchTerm).map(u => ({
      ...u,
      is_following: !!u.is_following
    }));
    
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.get('/suggestions', auth, (req, res, next) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        u.id, u.username, u.display_name, u.avatar_url,
        (
          SELECT COUNT(*) FROM follows f1 
          JOIN follows f2 ON f1.following_id = f2.following_id 
          WHERE f1.follower_id = ? AND f2.follower_id = u.id
        ) AS mutual_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS follower_count
      FROM users u
      WHERE u.id != ? 
      AND NOT EXISTS (
        SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id
      )
      ORDER BY follower_count DESC
      LIMIT 5
    `);
    
    const suggestions = stmt.all(req.user.id, req.user.id, req.user.id);
    res.json(suggestions);
  } catch (err) {
    next(err);
  }
});

router.get('/:username/saved', auth, (req, res, next) => {
  try {
    const { username } = req.params;
    if (username !== req.user.username) {
      return res.status(403).json({ error: 'Unauthorized to view saved posts' });
    }
    
    const stmt = db.prepare(`
      SELECT 
        p.*, 
        u.username AS author_username, 
        u.display_name, 
        u.avatar_url,
        EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) AS is_liked,
        1 AS is_saved
      FROM posts p
      JOIN post_saves ps ON p.id = ps.post_id
      JOIN users u ON p.user_id = u.id
      WHERE ps.user_id = ?
      ORDER BY ps.created_at DESC
    `);
    
    const posts = stmt.all(req.user.id, req.user.id).map(post => ({
      ...post,
      is_liked: !!post.is_liked,
      is_saved: true
    }));
    
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

router.get('/:username', auth, (req, res, next) => {
  try {
    const { username } = req.params;
    
    const stmtCheck = db.prepare('SELECT id, username, display_name, bio, avatar_url, created_at FROM users WHERE username = ?');
    const user = stmtCheck.get(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get follower count
    const followersStmt = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?');
    const followers = followersStmt.get(user.id).count;

    // Get following count
    const followingStmt = db.prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?');
    const following = followingStmt.get(user.id).count;

    // Get post count
    const postCountStmt = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?');
    const post_count = postCountStmt.get(user.id).count;

    // Check if current user is following
    const isFollowingStmt = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?');
    const is_following = !!isFollowingStmt.get(req.user.id, user.id);

    res.json({
      ...user,
      follower_count: followers,
      following_count: following,
      post_count,
      is_following
    });
  } catch (err) {
    next(err);
  }
});

router.put('/profile', auth, (req, res, next) => {
  try {
    const { display_name, bio } = req.body;
    
    const stmtUpdate = db.prepare('UPDATE users SET display_name = ?, bio = ? WHERE id = ?');
    stmtUpdate.run(display_name || '', bio || '', req.user.id);

    const stmtCheck = db.prepare('SELECT id, username, email, display_name, bio, avatar_url, created_at FROM users WHERE id = ?');
    const user = stmtCheck.get(req.user.id);
    
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

router.post('/avatar', auth, upload.single('avatar'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a file' });
    }
    
    const avatar_url = `/uploads/${req.file.filename}`;
    
    const stmtUpdate = db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?');
    stmtUpdate.run(avatar_url, req.user.id);

    const stmtCheck = db.prepare('SELECT id, username, email, display_name, bio, avatar_url, created_at FROM users WHERE id = ?');
    const user = stmtCheck.get(req.user.id);
    
    res.json({ user });
  } catch (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

module.exports = router;
