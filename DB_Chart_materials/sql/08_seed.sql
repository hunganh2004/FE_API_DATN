-- ============================================================
-- MODULE 08: DU LIEU MAU (SEED DATA)
-- Chay sau khi da tao xong tat ca cac bang
-- ============================================================

USE pet_accessory_shop;

-- ============================================================
-- 1. LOAI THU CUNG
-- ============================================================
INSERT INTO tbl_pet_types (name, icon_url) VALUES
('Chó',     '/icons/dog.png'),
('Mèo',     '/icons/cat.png'),
('Cá',      '/icons/fish.png'),
('Chim',    '/icons/bird.png'),
('Hamster', '/icons/hamster.png');

-- ============================================================
-- 2. DANH MUC SAN PHAM
-- ============================================================
-- Danh muc cha
INSERT INTO tbl_categories (fk_parent_id, name, slug, description, sort_order) VALUES
(NULL, 'Thức ăn',           'thuc-an',          'Thức ăn dinh dưỡng cho thú cưng',         1),
(NULL, 'Đồ chơi',           'do-choi',           'Đồ chơi vui nhộn cho thú cưng',           2),
(NULL, 'Phụ kiện',          'phu-kien',          'Phụ kiện thời trang và tiện ích',          3),
(NULL, 'Chăm sóc & Vệ sinh','cham-soc-ve-sinh',  'Sản phẩm chăm sóc sức khoẻ thú cưng',    4),
(NULL, 'Chuồng & Nơi ở',   'chuong-noi-o',      'Chuồng, ổ, nệm cho thú cưng',             5);

-- Danh muc con (parent: Thuc an = 1)
INSERT INTO tbl_categories (fk_parent_id, name, slug, description, sort_order) VALUES
(1, 'Thức ăn cho chó',  'thuc-an-cho-cho',  'Thức ăn khô, ướt, snack cho chó',  1),
(1, 'Thức ăn cho mèo',  'thuc-an-cho-meo',  'Thức ăn khô, ướt, snack cho mèo',  2),
(1, 'Thức ăn cho cá',   'thuc-an-cho-ca',   'Cám, viên nổi cho các loại cá',     3);

-- Danh muc con (parent: Phu kien = 3)
INSERT INTO tbl_categories (fk_parent_id, name, slug, description, sort_order) VALUES
(3, 'Vòng cổ & Dây dắt', 'vong-co-day-dat', 'Vòng cổ, dây dắt, yếm cho thú cưng', 1),
(3, 'Quần áo thú cưng',  'quan-ao-thu-cung', 'Trang phục thời trang cho chó mèo',  2);

-- ============================================================
-- 3. NGUOI DUNG
-- ============================================================
-- Mat khau mau: password123 (da hash bang bcrypt)
INSERT INTO tbl_users (full_name, email, password_hash, phone, role) VALUES
('Admin Hệ thống',  'admin@petshop.vn',   '$2b$10$examplehashADMIN000000000000000000000000000', '0901000001', 'admin'),
('Nguyễn Văn An',   'an.nguyen@gmail.com', '$2b$10$examplehashUSER100000000000000000000000000', '0901000002', 'customer'),
('Trần Thị Bình',   'binh.tran@gmail.com', '$2b$10$examplehashUSER200000000000000000000000000', '0901000003', 'customer'),
('Lê Minh Châu',    'chau.le@gmail.com',   '$2b$10$examplehashUSER300000000000000000000000000', '0901000004', 'customer'),
('Phạm Thị Dung',   'dung.pham@gmail.com', '$2b$10$examplehashUSER400000000000000000000000000', '0901000005', 'customer');

-- Dia chi giao hang
INSERT INTO tbl_user_addresses (fk_user_id, receiver, phone, province, commune, street, is_default) VALUES
(2, 'Nguyễn Văn An',  '0901000002', 'TP. Hồ Chí Minh', 'Phường Bến Nghé',    '12 Nguyễn Huệ',        1),
(2, 'Nguyễn Văn An',  '0901000002', 'TP. Hồ Chí Minh', 'Phường Tân Định',    '45 Hai Bà Trưng',      0),
(3, 'Trần Thị Bình',  '0901000003', 'Hà Nội',           'Phường Hoàn Kiếm',   '88 Hàng Bài',          1),
(4, 'Lê Minh Châu',   '0901000004', 'Đà Nẵng',          'Phường Hải Châu 1',  '23 Trần Phú',          1),
(5, 'Phạm Thị Dung',  '0901000005', 'TP. Hồ Chí Minh', 'Phường 7',           '67 Lý Thường Kiệt',    1);

-- ============================================================
-- 4. SAN PHAM
-- ============================================================
INSERT INTO tbl_products (fk_category_id, name, slug, description, price, sale_price, stock, sku, brand, weight_gram, is_consumable) VALUES
-- Thuc an cho cho (category_id = 6)
(6, 'Royal Canin Medium Adult 10kg',    'royal-canin-medium-adult-10kg',    'Thức ăn hạt cho chó trưởng thành giống vừa',           850000,  NULL,   50, 'RC-MED-10KG',  'Royal Canin',  10000, 1),
(6, 'Pedigree Adult Thịt Bò 3kg',       'pedigree-adult-thit-bo-3kg',       'Thức ăn hạt vị thịt bò cho chó trưởng thành',          180000,  150000, 80, 'PDG-BEEF-3KG', 'Pedigree',     3000,  1),
(6, 'Snack xương gặm Dentastix 7 cái',  'snack-xuong-gam-dentastix-7-cai',  'Bánh thưởng giúp làm sạch răng cho chó',               65000,   55000,  120,'DTS-7PCS',     'Pedigree',     98,    1),

-- Thuc an cho meo (category_id = 7)
(7, 'Royal Canin Indoor Adult 2kg',     'royal-canin-indoor-adult-2kg',     'Thức ăn hạt cho mèo nuôi trong nhà',                   320000,  NULL,   60, 'RC-IND-2KG',   'Royal Canin',  2000,  1),
(7, 'Whiskas Cá Ngừ Sốt 85g x 12 gói', 'whiskas-ca-ngu-sot-85g-12-goi',    'Pate mèo vị cá ngừ sốt, đóng gói tiện lợi',           120000,  99000,  100,'WKS-TUNA-12',  'Whiskas',      1020,  1),
(7, 'Cát vệ sinh Biokat 10L',           'cat-ve-sinh-biokat-10l',            'Cát vệ sinh vón cục, khử mùi hiệu quả',                185000,  NULL,   70, 'BKT-10L',      'Biokat',       4500,  1),

-- Do choi (category_id = 2)
(2, 'Bóng cao su phát tiếng kêu',       'bong-cao-su-phat-tieng-keu',       'Bóng đồ chơi cao su an toàn, phát tiếng kêu vui',      45000,   NULL,   200,'TOY-BALL-01',  NULL,           80,    0),
(2, 'Cần câu lông vũ cho mèo',          'can-cau-long-vu-cho-meo',          'Cần câu đồ chơi kích thích bản năng săn mồi của mèo',  35000,   NULL,   150,'TOY-FEATHER',  NULL,           50,    0),

-- Vong co & Day dat (category_id = 9)
(9, 'Vòng cổ da bò size S',             'vong-co-da-bo-size-s',             'Vòng cổ da thật cao cấp cho chó nhỏ',                  120000,  NULL,   80, 'COL-LEATHER-S','PetStyle',     60,    0),
(9, 'Dây dắt chó có tay cầm 1.5m',      'day-dat-cho-co-tay-cam-1-5m',      'Dây dắt chắc chắn, tay cầm êm, dài 1.5m',             85000,   70000,  90, 'LEASH-1M5',    'PetStyle',     120,   0),

-- Cham soc (category_id = 4)
(4, 'Lược chải lông 2 mặt',             'luoc-chai-long-2-mat',             'Lược chải lông 2 mặt, phù hợp chó mèo lông dài ngắn', 55000,   NULL,   110,'BRUSH-2SIDE',  'PetCare',      90,    0),
(4, 'Sữa tắm cho chó hương lavender',   'sua-tam-cho-cho-huong-lavender',   'Sữa tắm dịu nhẹ, khử mùi, dưỡng lông bóng mượt',     95000,   80000,  75, 'SHMP-LAV-DOG', 'PetCare',      300,   1);

-- ============================================================
-- 5. SAN PHAM - LOAI THU CUNG
-- ============================================================
INSERT INTO tbl_product_pet_types (fk_product_id, fk_pet_type_id) VALUES
(1, 1),(2, 1),(3, 1),           -- thuc an cho cho
(4, 2),(5, 2),(6, 2),           -- thuc an/cat cho meo
(7, 1),(7, 2),                  -- bong cao su: cho va meo
(8, 2),                         -- can cau: meo
(9, 1),(10, 1),                 -- vong co, day dat: cho
(11, 1),(11, 2),                -- luoc: cho va meo
(12, 1);                        -- sua tam: cho

-- ============================================================
-- 6. HINH ANH SAN PHAM
-- ============================================================
INSERT INTO tbl_product_images (fk_product_id, image_url, is_primary, sort_order) VALUES
(1,  '/images/products/royal-canin-medium-1.jpg', 1, 1),
(1,  '/images/products/royal-canin-medium-2.jpg', 0, 2),
(2,  '/images/products/pedigree-beef-1.jpg',      1, 1),
(3,  '/images/products/dentastix-1.jpg',          1, 1),
(4,  '/images/products/royal-canin-indoor-1.jpg', 1, 1),
(5,  '/images/products/whiskas-tuna-1.jpg',       1, 1),
(6,  '/images/products/biokat-10l-1.jpg',         1, 1),
(7,  '/images/products/ball-toy-1.jpg',           1, 1),
(8,  '/images/products/feather-toy-1.jpg',        1, 1),
(9,  '/images/products/leather-collar-s-1.jpg',   1, 1),
(9,  '/images/products/leather-collar-s-2.jpg',   0, 2),
(10, '/images/products/leash-1m5-1.jpg',          1, 1),
(11, '/images/products/brush-2side-1.jpg',        1, 1),
(12, '/images/products/shampoo-lavender-1.jpg',   1, 1);

-- ============================================================
-- 7. BIEN THE SAN PHAM
-- ============================================================
INSERT INTO tbl_product_variants (fk_product_id, name, sku, price, stock) VALUES
-- Vong co da co 3 mau
(9, 'Nâu - Size S',  'COL-LEATHER-S-BROWN', 120000, 30),
(9, 'Đen - Size S',  'COL-LEATHER-S-BLACK', 120000, 25),
(9, 'Đỏ - Size S',   'COL-LEATHER-S-RED',   130000, 20),
-- Day dat co 2 mau
(10, 'Đen',          'LEASH-1M5-BLACK',      85000,  40),
(10, 'Xanh navy',    'LEASH-1M5-NAVY',       85000,  50);

-- ============================================================
-- 8. THONG SO KY THUAT
-- ============================================================
INSERT INTO tbl_product_specs (fk_product_id, spec_name, spec_value, sort_order) VALUES
(1, 'Trọng lượng',      '10kg',                 1),
(1, 'Thành phần chính', 'Thịt gà, gạo, ngô',   2),
(1, 'Protein thô',      'Tối thiểu 25%',        3),
(1, 'Độ tuổi phù hợp',  '1 - 7 tuổi',          4),
(4, 'Trọng lượng',      '2kg',                  1),
(4, 'Thành phần chính', 'Thịt gia cầm, gạo',   2),
(4, 'Protein thô',      'Tối thiểu 31%',        3),
(6, 'Thể tích',         '10 lít',               1),
(6, 'Loại cát',         'Vón cục',              2),
(6, 'Khả năng khử mùi', 'Lên đến 7 ngày',      3),
(9, 'Chất liệu',        'Da bò thật',           1),
(9, 'Kích thước cổ',    '20 - 30cm',            2),
(9, 'Khóa',             'Inox không gỉ',        3),
(12,'Dung tích',        '300ml',                1),
(12,'Thành phần',       'Chiết xuất lavender',  2),
(12,'Hương thơm',       'Lavender tự nhiên',    3);

-- ============================================================
-- 9. MA GIAM GIA
-- ============================================================
INSERT INTO tbl_coupons (code, discount_type, discount_value, min_order, max_uses, starts_at, expires_at) VALUES
('WELCOME10',   'percent', 10,     0,       500,  '2025-01-01', '2025-12-31'),
('SALE50K',     'fixed',   50000,  200000,  200,  '2025-01-01', '2025-06-30'),
('PETLOVER20',  'percent', 20,     300000,  100,  '2025-03-01', '2025-04-30');

-- ============================================================
-- 10. DON HANG MAU
-- ============================================================
INSERT INTO tbl_orders (fk_user_id, receiver, phone, shipping_address, subtotal, discount_amount, shipping_fee, total, payment_method, payment_status, order_status) VALUES
(2, 'Nguyễn Văn An',  '0901000002', '12 Nguyễn Huệ, Phường Bến Nghé, TP. Hồ Chí Minh', 850000, 0,      30000, 880000, 'cod',          'pending', 'delivered'),
(3, 'Trần Thị Bình',  '0901000003', '88 Hàng Bài, Phường Hoàn Kiếm, Hà Nội',            305000, 50000,  30000, 285000, 'momo',         'paid',    'delivered'),
(4, 'Lê Minh Châu',   '0901000004', '23 Trần Phú, Phường Hải Châu 1, Đà Nẵng',          180000, 0,      25000, 205000, 'bank_transfer','paid',    'shipping'),
(2, 'Nguyễn Văn An',  '0901000002', '12 Nguyễn Huệ, Phường Bến Nghé, TP. Hồ Chí Minh', 120000, 0,      25000, 145000, 'cod',          'pending', 'pending'),
(5, 'Phạm Thị Dung',  '0901000005', '67 Lý Thường Kiệt, Phường 7, TP. Hồ Chí Minh',    415000, 83000,  30000, 362000, 'vnpay',        'paid',    'delivered');

-- Chi tiet don hang
INSERT INTO tbl_order_items (fk_order_id, fk_product_id, fk_variant_id, product_name, unit_price, quantity) VALUES
(1, 1,  NULL, 'Royal Canin Medium Adult 10kg',    850000, 1),
(2, 2,  NULL, 'Pedigree Adult Thịt Bò 3kg',       150000, 1),
(2, 3,  NULL, 'Snack xương gặm Dentastix 7 cái',  55000,  1),
(2, 11, NULL, 'Lược chải lông 2 mặt',             55000,  1),
(3, 2,  NULL, 'Pedigree Adult Thịt Bò 3kg',       150000, 1),
(3, 7,  NULL, 'Bóng cao su phát tiếng kêu',       45000,  1),
(4, 9,  1,    'Vòng cổ da bò size S - Nâu',       120000, 1),
(5, 4,  NULL, 'Royal Canin Indoor Adult 2kg',      320000, 1),
(5, 5,  NULL, 'Whiskas Cá Ngừ Sốt 85g x 12 gói',  99000,  1);

-- Lich su trang thai don hang
INSERT INTO tbl_order_status_logs (fk_order_id, status, note, fk_changed_by) VALUES
(1, 'pending',    'Đơn hàng vừa được tạo',                    NULL),
(1, 'confirmed',  'Đã xác nhận đơn hàng',                     1),
(1, 'processing', 'Đang đóng gói',                            1),
(1, 'shipping',   'Đã bàn giao cho GHN',                      1),
(1, 'delivered',  'Giao hàng thành công',                     1),
(2, 'pending',    'Đơn hàng vừa được tạo',                    NULL),
(2, 'confirmed',  'Đã xác nhận, thanh toán MoMo thành công',  1),
(2, 'delivered',  'Giao hàng thành công',                     1),
(3, 'pending',    'Đơn hàng vừa được tạo',                    NULL),
(3, 'confirmed',  'Đã xác nhận đơn hàng',                     1),
(3, 'shipping',   'Đang vận chuyển',                          1),
(4, 'pending',    'Đơn hàng vừa được tạo',                    NULL),
(5, 'pending',    'Đơn hàng vừa được tạo',                    NULL),
(5, 'confirmed',  'Thanh toán VNPay thành công',              1),
(5, 'delivered',  'Giao hàng thành công',                     1);

-- Thanh toan
INSERT INTO tbl_payments (fk_order_id, method, transaction_ref, amount, status, paid_at) VALUES
(1, 'cod',          NULL,               880000, 'pending', NULL),
(2, 'momo',         'MOMO20250301001',  285000, 'success', '2025-03-01 10:15:00'),
(3, 'bank_transfer','BANK20250302001',  205000, 'success', '2025-03-02 09:30:00'),
(4, 'cod',          NULL,               145000, 'pending', NULL),
(5, 'vnpay',        'VNPAY20250303001', 362000, 'success', '2025-03-03 14:20:00');

-- ============================================================
-- 11. DANH GIA SAN PHAM
-- ============================================================
INSERT INTO tbl_reviews (fk_product_id, fk_user_id, fk_parent_id, rating, comment) VALUES
(1, 2, NULL, 5, 'Sản phẩm rất tốt, chó nhà mình rất thích ăn, lông bóng hơn hẳn sau 1 tháng dùng!'),
(2, 3, NULL, 4, 'Giá hợp lý, chó ăn ngon miệng. Giao hàng nhanh.'),
(4, 5, NULL, 5, 'Mèo nhà mình nghiện luôn, không chịu ăn loại khác nữa 😄'),
(9, 2, NULL, 4, 'Chất lượng da tốt, đường may chắc chắn. Màu nâu rất đẹp.');

-- Reply cua admin cho danh gia
INSERT INTO tbl_reviews (fk_product_id, fk_user_id, fk_parent_id, rating, comment) VALUES
(1, 1, 1, NULL, 'Cảm ơn bạn đã tin tưởng sản phẩm! Chúc bé nhà bạn luôn khoẻ mạnh 🐾'),
(4, 1, 3, NULL, 'Cảm ơn bạn đã chia sẻ! Royal Canin Indoor được thiết kế đặc biệt cho mèo nuôi trong nhà nên bé rất thích là đúng rồi ạ 😊');

-- ============================================================
-- 12. WISHLIST
-- ============================================================
INSERT INTO tbl_wishlists (fk_user_id, fk_product_id) VALUES
(2, 4),(2, 8),(2, 12),
(3, 1),(3, 9),
(4, 5),(4, 6),
(5, 1),(5, 11);

-- ============================================================
-- 13. HANH VI NGUOI DUNG (mau cho AI)
-- ============================================================
INSERT INTO tbl_user_behavior_logs (fk_user_id, session_id, fk_product_id, action, duration_sec) VALUES
(2, 'sess-user2-001', 1,  'view',         45),
(2, 'sess-user2-001', 1,  'add_to_cart',  NULL),
(2, 'sess-user2-001', 1,  'purchase',     NULL),
(2, 'sess-user2-002', 4,  'view',         30),
(2, 'sess-user2-002', 8,  'view',         20),
(2, 'sess-user2-002', 12, 'wishlist',     NULL),
(3, 'sess-user3-001', 2,  'view',         25),
(3, 'sess-user3-001', 2,  'add_to_cart',  NULL),
(3, 'sess-user3-001', 3,  'view',         15),
(3, 'sess-user3-001', 11, 'view',         20),
(3, 'sess-user3-001', 2,  'purchase',     NULL),
(4, 'sess-user4-001', 9,  'view',         60),
(4, 'sess-user4-001', 9,  'add_to_cart',  NULL),
(4, 'sess-user4-001', 10, 'view',         35),
(5, 'sess-user5-001', 4,  'view',         40),
(5, 'sess-user5-001', 5,  'view',         30),
(5, 'sess-user5-001', 6,  'view',         25),
(5, 'sess-user5-001', 4,  'purchase',     NULL);

-- Tim kiem mau
INSERT INTO tbl_user_behavior_logs (fk_user_id, session_id, fk_product_id, action, search_query) VALUES
(2, 'sess-user2-003', NULL, 'search', 'thức ăn cho chó'),
(3, 'sess-user3-002', NULL, 'search', 'royal canin'),
(4, 'sess-user4-002', NULL, 'search', 'vòng cổ chó'),
(5, 'sess-user5-002', NULL, 'search', 'thức ăn mèo');

-- ============================================================
-- 14. THONG BAO MAU
-- ============================================================
INSERT INTO tbl_notifications (fk_user_id, type, title, message, is_read, ref_id) VALUES
(2, 'order_update',  'Đơn hàng đã được giao',       'Đơn hàng #1 của bạn đã được giao thành công. Cảm ơn bạn đã mua sắm!', 1, 1),
(3, 'order_update',  'Đơn hàng đã được giao',       'Đơn hàng #2 của bạn đã được giao thành công.',                         0, 2),
(4, 'order_update',  'Đơn hàng đang được giao',     'Đơn hàng #3 của bạn đang trên đường giao đến bạn.',                    0, 3),
(2, 'promotion',     'Flash Sale cuối tuần!',        'Giảm đến 20% toàn bộ thức ăn thú cưng từ thứ 6 đến chủ nhật.',        0, NULL),
(5, 'order_update',  'Đơn hàng đã được giao',       'Đơn hàng #5 của bạn đã được giao thành công.',                         1, 5);

-- ============================================================
-- 15. PHAN CUM KHACH HANG MAU
-- ============================================================
INSERT INTO tbl_customer_segments (name, description) VALUES
('Khách hàng thân thiết',   'Mua hàng thường xuyên, chi tiêu cao, tương tác nhiều'),
('Khách hàng tiềm năng',    'Đã mua 1-2 lần, có tiềm năng quay lại'),
('Khách hàng mới',          'Mới đăng ký, chưa hoặc vừa mua lần đầu'),
('Khách hàng không hoạt động', 'Lâu không mua hàng hoặc tương tác');

INSERT INTO tbl_user_segments (fk_user_id, fk_segment_id) VALUES
(2, 1),
(3, 2),
(4, 2),
(5, 1);
