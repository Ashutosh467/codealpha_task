const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/:username', auth, (req, res, next) => {
  try {
    const { username } = req.params;
    const { v4: uuidv4 } = require('uuid');
    
    if (username === req.user.username) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    
    const userCheck = db.prepare('SELECT id FROM users WHERE username = ?');
    const targetUser = userCheck.get(username);
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const followCheck = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?');
    const isFollowing = followCheck.get(req.user.id, targetUser.id);
    
    if (isFollowing) {
      // Unfollow
      const stmtDelete = db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?');
      stmtDelete.run(req.user.id, targetUser.id);
      
      // Delete notification
      db.prepare(`
        DELETE FROM notifications 
        WHERE type = 'follow' AND recipient_id = ? AND sender_id = ?
      `).run(targetUser.id, req.user.id);
      
      const countCheck = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?');
      const count = countCheck.get(targetUser.id).count;
      
      res.json({ following: false, followers_count: count });
    } else {
      // Follow
      const stmtInsert = db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)');
      stmtInsert.run(req.user.id, targetUser.id);
      
      // Create notification
      db.prepare(`
        INSERT INTO notifications (id, recipient_id, sender_id, type)
        VALUES (?, ?, ?, 'follow')
      `).run(uuidv4(), targetUser.id, req.user.id);
      
      const countCheck = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?');
      const count = countCheck.get(targetUser.id).count;
      
      res.json({ following: true, followers_count: count });
    }
  } catch (err) {
    next(err);
  }
});

router.get('/:username/followers', auth, (req, res, next) => {
  try {
    const { username } = req.params;
    const userCheck = db.prepare('SELECT id FROM users WHERE username = ?');
    const targetUser = userCheck.get(username);
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const stmt = db.prepare(`
      SELECT u.id, u.username, u.display_name, u.avatar_url, u.bio
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
    `);
    
    const followers = stmt.all(targetUser.id);
    res.json({ followers });
  } catch (err) {
    next(err);
  }
});

router.get('/:username/following', auth, (req, res, next) => {
  try {
    const { username } = req.params;
    const userCheck = db.prepare('SELECT id FROM users WHERE username = ?');
    const targetUser = userCheck.get(username);
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const stmt = db.prepare(`
      SELECT u.id, u.username, u.display_name, u.avatar_url, u.bio
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
    `);
    
    const following = stmt.all(targetUser.id);
    res.json({ following });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
