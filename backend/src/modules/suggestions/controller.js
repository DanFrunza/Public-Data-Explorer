
const pool = require('../../db/pool');
const { validateSuggestion } = require('./validation');

function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  // Remove dangerous HTML/script, trim, limit length
  let clean = text.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
  if (clean.length > 1000) clean = clean.slice(0, 1000);
  return clean;
}

async function createSuggestion(req, res) {
  try {
    const userId = req.auth ? req.auth.sub : null;
    let { text } = req.body || {};
    text = sanitizeText(text);
    const errors = validateSuggestion({ text });
    if (Object.keys(errors).length) {
      return res.status(400).json({ errors });
    }
    // Log IP for audit (optional, not stored)
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || null;
    // Insert suggestion
    const sql = `INSERT INTO suggestions (user_id, text) VALUES ($1, $2) RETURNING id, created_at, status`;
    const result = await pool.query(sql, [userId, text]);
    return res.status(201).json({ message: 'Suggestion saved', suggestion: result.rows[0] });
  } catch (err) {
    console.error('createSuggestion error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { createSuggestion };
