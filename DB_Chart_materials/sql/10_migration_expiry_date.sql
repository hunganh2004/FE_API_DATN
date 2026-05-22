-- ============================================================
-- MIGRATION: Thêm cột expiry_date vào tbl_products
-- Chạy một lần duy nhất
-- ============================================================

ALTER TABLE tbl_products
ADD COLUMN expiry_date DATE DEFAULT NULL AFTER is_consumable;

-- ============================================================
-- Gán hạn sử dụng theo danh mục (fk_category_id)
-- Chỉ áp dụng cho sản phẩm tiêu hao (is_consumable = 1)
-- Dùng RAND() để tạo sự đa dạng trong từng nhóm
-- ============================================================

-- Thức ăn hạt cho chó (cat 7) — hạn 60~120 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (60 + FLOOR(RAND() * 61)) DAY)
WHERE fk_category_id = 7 AND is_consumable = 1;

-- Thức ăn hạt cho mèo (cat 8) — hạn 60~120 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (60 + FLOOR(RAND() * 61)) DAY)
WHERE fk_category_id = 8 AND is_consumable = 1;

-- Pate cho chó (cat 9) — hạn 14~45 ngày (dễ hỏng hơn)
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (14 + FLOOR(RAND() * 32)) DAY)
WHERE fk_category_id = 9 AND is_consumable = 1;

-- Pate cho mèo (cat 10) — hạn 14~45 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (14 + FLOOR(RAND() * 32)) DAY)
WHERE fk_category_id = 10 AND is_consumable = 1;

-- Snack cho chó (cat 11) — hạn 20~60 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (20 + FLOOR(RAND() * 41)) DAY)
WHERE fk_category_id = 11 AND is_consumable = 1;

-- Snack cho mèo (cat 12) — hạn 20~60 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (20 + FLOOR(RAND() * 41)) DAY)
WHERE fk_category_id = 12 AND is_consumable = 1;

-- Sữa tắm cho chó (cat 20) — hạn 180~365 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (180 + FLOOR(RAND() * 186)) DAY)
WHERE fk_category_id = 20 AND is_consumable = 1;

-- Sữa tắm cho mèo (cat 21) — hạn 180~365 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (180 + FLOOR(RAND() * 186)) DAY)
WHERE fk_category_id = 21 AND is_consumable = 1;

-- Cát vệ sinh cho mèo (cat 22) — hạn 365~730 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (365 + FLOOR(RAND() * 366)) DAY)
WHERE fk_category_id = 22 AND is_consumable = 1;

-- Vệ sinh cho chó (cat 23) — hạn 180~365 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (180 + FLOOR(RAND() * 186)) DAY)
WHERE fk_category_id = 23 AND is_consumable = 1;

-- Thuốc thú y cho chó (cat 28) — hạn 180~540 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (180 + FLOOR(RAND() * 361)) DAY)
WHERE fk_category_id = 28 AND is_consumable = 1;

-- Dinh dưỡng bổ sung cho chó (cat 29) — hạn 90~270 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (90 + FLOOR(RAND() * 181)) DAY)
WHERE fk_category_id = 29 AND is_consumable = 1;

-- Trị ve rận cho chó (cat 30) — hạn 180~365 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (180 + FLOOR(RAND() * 186)) DAY)
WHERE fk_category_id = 30 AND is_consumable = 1;

-- Các danh mục không tiêu hao (đồ chơi, phụ kiện, vật dụng...) giữ NULL — không cần UPDATE
