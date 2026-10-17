-- Migration 2026-10-17: Separate coins from points & add email to premium_orders

-- 1. Add coins column to users table if not exists & backfill initial coins from existing points
ALTER TABLE users ADD COLUMN coins INT NOT NULL DEFAULT 0 AFTER points;
UPDATE users SET coins = points WHERE coins = 0 AND points > 0;

-- 2. Add email column to premium_orders table if not exists & backfill email from users table
ALTER TABLE premium_orders ADD COLUMN email VARCHAR(255) NULL AFTER username;
UPDATE premium_orders po 
JOIN users u ON (po.user_id = u.id OR po.username COLLATE utf8mb4_unicode_ci = u.username COLLATE utf8mb4_unicode_ci) 
SET po.email = u.email 
WHERE po.email IS NULL AND u.email IS NOT NULL;
