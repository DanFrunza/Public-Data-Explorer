-- Migration: Create suggestions table for user feedback
CREATE TABLE suggestions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(16) DEFAULT 'new'
);
-- Index for faster admin queries
CREATE INDEX idx_suggestions_created_at ON suggestions(created_at DESC);