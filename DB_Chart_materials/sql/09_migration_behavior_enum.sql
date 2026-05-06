-- Migration: thêm remove_wishlist vào ENUM action của tbl_user_behavior_logs
ALTER TABLE tbl_user_behavior_logs
  MODIFY COLUMN action ENUM('view','search','add_to_cart','remove_from_cart','purchase','wishlist','remove_wishlist') NOT NULL;
