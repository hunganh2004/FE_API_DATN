-- ============================================================
-- Bước 1: Cập nhật is_consumable theo danh mục
-- ============================================================

-- Đặt tất cả về 0 trước
UPDATE tbl_products SET is_consumable = 0;

-- Các danh mục tiêu hao
UPDATE tbl_products SET is_consumable = 1
WHERE fk_category_id IN (
    7,   -- Thức ăn hạt cho chó
    8,   -- Thức ăn hạt cho mèo
    9,   -- Pate cho chó
    10,  -- Pate cho mèo
    11,  -- Snack cho chó
    12,  -- Snack cho mèo
    20,  -- Sữa tắm cho chó
    21,  -- Sữa tắm cho mèo
    22,  -- Cát vệ sinh cho mèo
    23,  -- Vệ sinh cho chó
    28,  -- Thuốc thú y cho chó
    29,  -- Dinh dưỡng bổ sung cho chó
    30   -- Trị ve rận cho chó
);

-- ============================================================
-- Bước 2: Xóa hạn sử dụng cũ (nếu có), reset về NULL
-- ============================================================

UPDATE tbl_products SET expiry_date = NULL;

-- ============================================================
-- Bước 3: Gán hạn sử dụng ngẫu nhiên theo danh mục
-- ============================================================

-- Thức ăn hạt chó/mèo (7, 8) — 60~120 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (60 + FLOOR(RAND() * 61)) DAY)
WHERE fk_category_id IN (7, 8) AND is_consumable = 1;

-- Pate chó/mèo (9, 10) — 14~45 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (14 + FLOOR(RAND() * 32)) DAY)
WHERE fk_category_id IN (9, 10) AND is_consumable = 1;

-- Snack chó/mèo (11, 12) — 20~60 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (20 + FLOOR(RAND() * 41)) DAY)
WHERE fk_category_id IN (11, 12) AND is_consumable = 1;

-- Sữa tắm chó/mèo (20, 21) — 180~365 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (180 + FLOOR(RAND() * 186)) DAY)
WHERE fk_category_id IN (20, 21) AND is_consumable = 1;

-- Cát vệ sinh (22) — 365~730 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (365 + FLOOR(RAND() * 366)) DAY)
WHERE fk_category_id = 22 AND is_consumable = 1;

-- Vệ sinh cho chó (23) — 180~365 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (180 + FLOOR(RAND() * 186)) DAY)
WHERE fk_category_id = 23 AND is_consumable = 1;

-- Thuốc thú y (28), trị ve rận (30) — 180~540 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (180 + FLOOR(RAND() * 361)) DAY)
WHERE fk_category_id IN (28, 30) AND is_consumable = 1;

-- Dinh dưỡng bổ sung (29) — 90~270 ngày
UPDATE tbl_products
SET expiry_date = DATE_ADD(CURDATE(), INTERVAL (90 + FLOOR(RAND() * 181)) DAY)
WHERE fk_category_id = 29 AND is_consumable = 1;
