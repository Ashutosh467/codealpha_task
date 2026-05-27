const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications (protected)
router.get('/', auth, (req, res, next) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        n.id, n.recipient_id, n.sender_id, n.type, n.post_id, n.comment_id, n.is_read, n.created_at,
        u.username AS sender_username, u.display_name AS sender_display_name, u.avatar_url AS sender_avatar_url,
        p.image_url AS post_image_url,
        c.content AS comment_content
      FROM notifications n
      JOIN users u ON n.sender_id = u.id
      LEFT JOIN posts p ON n.post_id = p.id
      LEFT JOIN comments c ON n.comment_id = c.id
      WHERE n.recipient_id = ?
      ORDER BY n.created_at DESC
      LIMIT 50
    `);
    
    const notifications = stmt.all(req.user.id).map(notif => ({
      ...notif,
      is_read: !!notif.is_read
    }));
    
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE recipient_id = ? AND is_read = 0');
    const unread_count = countStmt.get(req.user.id).count;
    
    res.json({ notifications, unread_count });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/read-all (protected)
router.post('/read-all', auth, (req, res, next) => {
  try {
    const stmt = db.prepare('UPDATE notifications SET is_read = 1 WHERE recipient_id = ? AND is_read = 0');
    const result = stmt.run(req.user.id);
    res.json({ updated: result.changes });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/read/:id (protected)
router.post('/read/:id', auth, (req, res, next) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND recipient_id = ?');
    const result = stmt.run(id, req.user.id);
    res.json({ updated: result.changes > 0 });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notifications/:id (protected)
router.delete('/:id', auth, (req, res, next) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM notifications WHERE id = ? AND recipient_id = ?');
    const result = stmt.run(id, req.user.id);
    res.json({ deleted: result.changes > 0 });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
