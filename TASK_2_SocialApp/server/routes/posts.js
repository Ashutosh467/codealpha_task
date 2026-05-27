const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .webp format allowed!'), false);
    }
  }
});

// GET /api/posts/feed (protected)
router.get('/feed', auth, (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const offset = page * limit;

    const stmt = db.prepare(`
      SELECT 
        p.*, 
        u.username AS author_username, 
        u.display_name, 
        u.avatar_url,
        EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) AS is_liked,
        EXISTS(SELECT 1 FROM post_saves ps WHERE ps.post_id = p.id AND ps.user_id = ?) AS is_saved
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id IN (
        SELECT following_id FROM follows WHERE follower_id = ?
      ) OR p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `);
    
    const posts = stmt.all(req.user.id, req.user.id, req.user.id, req.user.id, limit, offset).map(post => ({
      ...post,
      is_liked: !!post.is_liked,
      is_saved: !!post.is_saved
    }));
    
    res.json({ posts });
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/explore (protected)
router.get('/explore', auth, (req, res, next) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        p.*, 
        u.username AS author_username, 
        u.display_name, 
        u.avatar_url,
        EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) AS is_liked,
        EXISTS(SELECT 1 FROM post_saves ps WHERE ps.post_id = p.id AND ps.user_id = ?) AS is_saved
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id != ?
      ORDER BY p.likes_count DESC, p.created_at DESC
      LIMIT 30
    `);
    
    const posts = stmt.all(req.user.id, req.user.id, req.user.id).map(post => ({
      ...post,
      is_liked: !!post.is_liked,
      is_saved: !!post.is_saved
    }));
    
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/user/:username (protected)
router.get('/user/:username', auth, (req, res, next) => {
  try {
    const { username } = req.params;
    const userStmt = db.prepare('SELECT id FROM users WHERE username = ?');
    const user = userStmt.get(username);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const stmt = db.prepare(`
      SELECT 
        p.*, 
        u.username AS author_username, 
        u.display_name, 
        u.avatar_url,
        EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) AS is_liked,
        EXISTS(SELECT 1 FROM post_saves ps WHERE ps.post_id = p.id AND ps.user_id = ?) AS is_saved
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `);
    
    const posts = stmt.all(req.user.id, req.user.id, user.id).map(post => ({
      ...post,
      is_liked: !!post.is_liked,
      is_saved: !!post.is_saved
    }));
    
    res.json({ posts });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts (create post)
router.post('/', auth, upload.single('image'), (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const id = uuidv4();
    let image_url = '';
    
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }
    
    const stmtInsert = db.prepare('INSERT INTO posts (id, user_id, content, image_url) VALUES (?, ?, ?, ?)');
    stmtInsert.run(id, req.user.id, content, image_url);

    // Mentions Trigger
    const mentionRegex = /@(\w+)/g;
    let match;
    const mentionedUsernames = new Set();
    while ((match = mentionRegex.exec(content)) !== null) {
      mentionedUsernames.add(match[1]);
    }

    const checkUser = db.prepare('SELECT id FROM users WHERE username = ?');
    const insertNotif = db.prepare(`
      INSERT INTO notifications (id, recipient_id, sender_id, type, post_id)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const username of mentionedUsernames) {
      const targetUser = checkUser.get(username);
      if (targetUser && targetUser.id !== req.user.id) {
        insertNotif.run(uuidv4(), targetUser.id, req.user.id, 'mention', id);
      }
    }
    
    const stmtCheck = db.prepare(`
      SELECT p.*, u.username AS author_username, u.display_name, u.avatar_url, 0 AS is_liked 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.id = ?
    `);
    const post = stmtCheck.get(id);
    post.is_liked = false;
    post.is_saved = false;
    
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
});

// PUT /api/posts/:id (edit caption)
router.put('/:id', auth, (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const stmtCheck = db.prepare('SELECT user_id FROM posts WHERE id = ?');
    const post = stmtCheck.get(id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to edit this post' });
    }
    
    db.prepare('UPDATE posts SET content = ? WHERE id = ?').run(content, id);
    
    const getPost = db.prepare(`
      SELECT p.*, u.username AS author_username, u.display_name, u.avatar_url
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `);
    const updatedPost = getPost.get(id);
    
    res.json({ post: updatedPost });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/posts/:id (delete post)
router.delete('/:id', auth, (req, res, next) => {
  try {
    const { id } = req.params;
    
    const stmtCheck = db.prepare('SELECT user_id FROM posts WHERE id = ?');
    const post = stmtCheck.get(id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }
    
    const stmtDelete = db.prepare('DELETE FROM posts WHERE id = ?');
    stmtDelete.run(id);
    
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:id/like (like / unlike toggle)
router.post('/:id/like', auth, (req, res, next) => {
  try {
    const { id } = req.params;
    
    const stmtCheck = db.prepare('SELECT id, user_id, likes_count FROM posts WHERE id = ?');
    const post = stmtCheck.get(id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const likeCheck = db.prepare('SELECT 1 FROM post_likes WHERE user_id = ? AND post_id = ?');
    const isLiked = likeCheck.get(req.user.id, id);
    
    if (isLiked) {
      // Unlike
      const stmtUnlike = db.prepare('DELETE FROM post_likes WHERE user_id = ? AND post_id = ?');
      stmtUnlike.run(req.user.id, id);
      
      const updateLikes = db.prepare('UPDATE posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?');
      updateLikes.run(id);
      
      // Delete notification
      db.prepare(`
        DELETE FROM notifications 
        WHERE type = 'like' AND recipient_id = ? AND sender_id = ? AND post_id = ?
      `).run(post.user_id, req.user.id, id);
      
      const newCount = Math.max(0, post.likes_count - 1);
      res.json({ liked: false, likes_count: newCount });
    } else {
      // Like
      const stmtLike = db.prepare('INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)');
      stmtLike.run(req.user.id, id);
      
      const updateLikes = db.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?');
      updateLikes.run(id);
      
      // Create notification
      if (post.user_id !== req.user.id) {
        db.prepare(`
          INSERT INTO notifications (id, recipient_id, sender_id, type, post_id)
          VALUES (?, ?, ?, ?, ?)
        `).run(uuidv4(), post.user_id, req.user.id, 'like', id);
      }
      
      const newCount = post.likes_count + 1;
      res.json({ liked: true, likes_count: newCount });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/posts/:id/save (save / unsave toggle)
router.post('/:id/save', auth, (req, res, next) => {
  try {
    const { id } = req.params;
    
    const stmtCheck = db.prepare('SELECT id, saves_count FROM posts WHERE id = ?');
    const post = stmtCheck.get(id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const saveCheck = db.prepare('SELECT 1 FROM post_saves WHERE user_id = ? AND post_id = ?');
    const isSaved = saveCheck.get(req.user.id, id);
    
    if (isSaved) {
      // Unsave
      db.prepare('DELETE FROM post_saves WHERE user_id = ? AND post_id = ?').run(req.user.id, id);
      db.prepare('UPDATE posts SET saves_count = MAX(0, saves_count - 1) WHERE id = ?').run(id);
      
      const newCount = Math.max(0, (post.saves_count || 0) - 1);
      res.json({ saved: false, saves_count: newCount });
    } else {
      // Save
      db.prepare('INSERT INTO post_saves (user_id, post_id) VALUES (?, ?)').run(req.user.id, id);
      db.prepare('UPDATE posts SET saves_count = (saves_count + 1) WHERE id = ?').run(id);
      
      const newCount = (post.saves_count || 0) + 1;
      res.json({ saved: true, saves_count: newCount });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
