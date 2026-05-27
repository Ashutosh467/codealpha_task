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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .webp format allowed!'), false);
    }
  }
});

// POST /api/stories (protected)
router.post('/', auth, upload.single('image'), (req, res, next) => {
  try {
    const { caption } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required for story' });
    }
    const id = uuidv4();
    const image_url = `/uploads/${req.file.filename}`;
    
    const stmt = db.prepare(`
      INSERT INTO stories (id, user_id, image_url, caption)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, req.user.id, image_url, caption || '');
    
    const getStory = db.prepare(`
      SELECT s.*, u.username as author_username, u.display_name, u.avatar_url
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `);
    const story = getStory.get(id);
    res.status(201).json({ story });
  } catch (err) {
    next(err);
  }
});

// GET /api/stories/feed (protected)
router.get('/feed', auth, (req, res, next) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        s.id, s.user_id, s.image_url, s.caption, s.views_count, s.created_at, s.expires_at,
        u.username, u.display_name, u.avatar_url,
        EXISTS(
          SELECT 1 FROM story_views sv 
          WHERE sv.story_id = s.id AND sv.viewer_id = ?
        ) as viewed
      FROM stories s
      JOIN users u ON s.user_id = u.id
      WHERE (s.user_id IN (
        SELECT following_id FROM follows WHERE follower_id = ?
      ) OR s.user_id = ?)
      AND s.expires_at > datetime('now')
      ORDER BY s.created_at ASC
    `);
    
    const activeStories = stmt.all(req.user.id, req.user.id, req.user.id);
    
    const groupsMap = {};
    for (const row of activeStories) {
      if (!groupsMap[row.user_id]) {
        groupsMap[row.user_id] = {
          user: {
            id: row.user_id,
            username: row.username,
            display_name: row.display_name,
            avatar_url: row.avatar_url
          },
          stories: [],
          has_unviewed: false
        };
      }
      
      const storyObj = {
        id: row.id,
        user_id: row.user_id,
        image_url: row.image_url,
        caption: row.caption,
        views_count: row.views_count,
        created_at: row.created_at,
        expires_at: row.expires_at,
        viewed: !!row.viewed
      };
      
      groupsMap[row.user_id].stories.push(storyObj);
      if (!row.viewed) {
        groupsMap[row.user_id].has_unviewed = true;
      }
    }
    
    const groups = Object.values(groupsMap);
    groups.sort((a, b) => {
      if (a.user.id === req.user.id) return -1;
      if (b.user.id === req.user.id) return 1;
      if (a.has_unviewed && !b.has_unviewed) return -1;
      if (!a.has_unviewed && b.has_unviewed) return 1;
      return 0;
    });
    
    res.json(groups);
  } catch (err) {
    next(err);
  }
});

// GET /api/stories/user/:username (protected)
router.get('/user/:username', auth, (req, res, next) => {
  try {
    const { username } = req.params;
    const userStmt = db.prepare('SELECT id, username, display_name, avatar_url FROM users WHERE username = ?');
    const targetUser = userStmt.get(username);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const stmt = db.prepare(`
      SELECT s.*,
        EXISTS(
          SELECT 1 FROM story_views sv 
          WHERE sv.story_id = s.id AND sv.viewer_id = ?
        ) as viewed
      FROM stories s
      WHERE s.user_id = ? AND s.expires_at > datetime('now')
      ORDER BY s.created_at ASC
    `);
    
    const stories = stmt.all(req.user.id, targetUser.id).map(s => ({
      ...s,
      viewed: !!s.viewed
    }));
    
    res.json({
      user: targetUser,
      stories
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/stories/:id/view (protected)
router.post('/:id/view', auth, (req, res, next) => {
  try {
    const { id } = req.params;
    const insertView = db.prepare(`
      INSERT OR IGNORE INTO story_views (story_id, viewer_id)
      VALUES (?, ?)
    `);
    const info = insertView.run(id, req.user.id);
    
    if (info.changes > 0) {
      db.prepare(`
        UPDATE stories SET views_count = views_count + 1 WHERE id = ?
      `).run(id);
    }
    
    const getCount = db.prepare('SELECT views_count FROM stories WHERE id = ?');
    const story = getCount.get(id);
    
    res.json({ views_count: story ? story.views_count : 0 });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/stories/:id (protected)
router.delete('/:id', auth, (req, res, next) => {
  try {
    const { id } = req.params;
    const getStory = db.prepare('SELECT user_id FROM stories WHERE id = ?');
    const story = getStory.get(id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    if (story.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this story' });
    }
    
    db.prepare('DELETE FROM stories WHERE id = ?').run(id);
    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
