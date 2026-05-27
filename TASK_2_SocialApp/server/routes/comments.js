const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:postId', auth, (req, res, next) => {
  try {
    const { postId } = req.params;
    
    const stmt = db.prepare(`
      SELECT 
        c.*, 
        u.username AS author_username, 
        u.display_name, 
        u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `);
    
    const comments = stmt.all(postId);
    res.json({ comments });
  } catch (err) {
    next(err);
  }
});

router.post('/:postId', auth, (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    const postCheck = db.prepare('SELECT id, user_id FROM posts WHERE id = ?');
    const post = postCheck.get(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const id = uuidv4();
    const stmtInsert = db.prepare('INSERT INTO comments (id, post_id, user_id, content) VALUES (?, ?, ?, ?)');
    stmtInsert.run(id, postId, req.user.id, content);
    
    const stmtUpdateCount = db.prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?');
    stmtUpdateCount.run(postId);
    
    const stmtGet = db.prepare(`
      SELECT 
        c.*, 
        u.username AS author_username, 
        u.display_name, 
        u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `);
    const comment = stmtGet.get(id);

    // 1. Comment notification
    if (post.user_id !== req.user.id) {
      db.prepare(`
        INSERT INTO notifications (id, recipient_id, sender_id, type, post_id, comment_id)
        VALUES (?, ?, ?, 'comment', ?, ?)
      `).run(uuidv4(), post.user_id, req.user.id, postId, id);
    }

    // 2. Mention notifications
    const mentionRegex = /@(\w+)/g;
    let match;
    const mentionedUsernames = new Set();
    while ((match = mentionRegex.exec(content)) !== null) {
      mentionedUsernames.add(match[1]);
    }

    const checkUser = db.prepare('SELECT id FROM users WHERE username = ?');
    const insertMentionNotif = db.prepare(`
      INSERT INTO notifications (id, recipient_id, sender_id, type, post_id, comment_id)
      VALUES (?, ?, ?, 'mention', ?, ?)
    `);

    for (const username of mentionedUsernames) {
      const targetUser = checkUser.get(username);
      // Don't notify if user mentioned themselves, or if they already got a comment notification (wait, a mention is a higher priority notification, or both are fine)
      if (targetUser && targetUser.id !== req.user.id) {
        insertMentionNotif.run(uuidv4(), targetUser.id, req.user.id, postId, id);
      }
    }
    
    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', auth, (req, res, next) => {
  try {
    const { id } = req.params;
    
    const stmtCheck = db.prepare('SELECT user_id, post_id FROM comments WHERE id = ?');
    const comment = stmtCheck.get(id);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }
    
    const stmtDelete = db.prepare('DELETE FROM comments WHERE id = ?');
    stmtDelete.run(id);
    
    const stmtUpdateCount = db.prepare('UPDATE posts SET comments_count = comments_count - 1 WHERE id = ?');
    stmtUpdateCount.run(comment.post_id);
    
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
