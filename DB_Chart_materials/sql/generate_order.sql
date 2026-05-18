USE pet_accessory_shop_v2;

DROP PROCEDURE IF EXISTS generate_orders;
DELIMITER $$

CREATE PROCEDURE generate_orders()
BEGIN
  DECLARE v_user_id       INT;
  DECLARE v_order_id      INT;
  DECLARE v_product_id    INT;
  DECLARE v_product_name  VARCHAR(255);
  DECLARE v_unit_price    DECIMAL(12,2);
  DECLARE v_quantity      INT;
  DECLARE v_subtotal      DECIMAL(12,2);
  DECLARE v_total         DECIMAL(12,2);
  DECLARE v_shipping_fee  DECIMAL(12,2);
  DECLARE v_order_date    DATETIME;
  DECLARE v_status        VARCHAR(20);
  DECLARE v_num_items     INT;
  DECLARE v_i             INT;
  DECLARE v_j             INT;
  DECLARE v_orders_per_user INT;
  DECLARE done            INT DEFAULT 0;

  DECLARE cur CURSOR FOR
    SELECT pk_user_id FROM tbl_users WHERE pk_user_id BETWEEN 2 AND 101;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  user_loop: LOOP
    FETCH cur INTO v_user_id;
    IF done THEN LEAVE user_loop; END IF;

    -- Mỗi user tạo 5-20 đơn hàng
    SET v_orders_per_user = FLOOR(5 + RAND() * 16);
    SET v_i = 0;

    WHILE v_i < v_orders_per_user DO

      -- Ngày đặt hàng ngẫu nhiên từ 2025-01-01 đến nay
      SET v_order_date = DATE_ADD('2025-01-01',
        INTERVAL FLOOR(RAND() * DATEDIFF(NOW(), '2025-01-01')) DAY);

      -- Trạng thái đơn hàng theo xác suất
      SET @r = RAND();
      IF @r < 0.60 THEN
        SET v_status = 'delivered';
      ELSEIF @r < 0.75 THEN
        SET v_status = 'shipping';
      ELSEIF @r < 0.85 THEN
        SET v_status = 'processing';
      ELSEIF @r < 0.93 THEN
        SET v_status = 'confirmed';
      ELSE
        SET v_status = 'cancelled';
      END IF;

      -- Tạo đơn hàng (subtotal/total tạm = 0, cập nhật sau)
      INSERT INTO tbl_orders (
        fk_user_id, receiver, phone, shipping_address,
        subtotal, discount_amount, shipping_fee, total,
        payment_method, payment_status, order_status,
        created_at, updated_at
      ) VALUES (
        v_user_id,
        CONCAT('Khách hàng ', v_user_id),
        CONCAT('090', LPAD(v_user_id, 7, '0')),
        CONCAT(FLOOR(1 + RAND() * 200), ' Đường số ', FLOOR(1 + RAND() * 50), ', TP. Hồ Chí Minh'),
        0, 0, 30000, 30000,
        'cod',
        IF(v_status = 'delivered', 'paid', 'pending'),
        v_status,
        v_order_date,
        v_order_date
      );

      SET v_order_id = LAST_INSERT_ID();
      SET v_subtotal = 0;

      -- Số sản phẩm trong đơn: 2-5
      SET v_num_items = FLOOR(2 + RAND() * 4);
      SET v_j = 0;

      WHILE v_j < v_num_items DO
        -- Chọn sản phẩm ngẫu nhiên trong khoảng 1084-1902
        SELECT pk_product_id, name,
               COALESCE(sale_price, price)
        INTO v_product_id, v_product_name, v_unit_price
        FROM tbl_products
        WHERE pk_product_id BETWEEN 1084 AND 1902
          AND is_active = 1
          AND pk_product_id NOT IN (
            SELECT fk_product_id FROM tbl_order_items WHERE fk_order_id = v_order_id
          )
        ORDER BY RAND()
        LIMIT 1;

        IF v_product_id IS NOT NULL THEN
          SET v_quantity = FLOOR(1 + RAND() * 3);

          INSERT INTO tbl_order_items (
            fk_order_id, fk_product_id, fk_variant_id,
            product_name, unit_price, quantity
          ) VALUES (
            v_order_id, v_product_id, NULL,
            v_product_name, v_unit_price, v_quantity
          );

          SET v_subtotal = v_subtotal + (v_unit_price * v_quantity);
        END IF;

        SET v_j = v_j + 1;
      END WHILE;

      -- Cập nhật subtotal và total
      SET v_shipping_fee = 30000;
      SET v_total = v_subtotal + v_shipping_fee;
      UPDATE tbl_orders
      SET subtotal = v_subtotal, total = v_total
      WHERE pk_order_id = v_order_id;

      -- Tạo payment record
      INSERT INTO tbl_payments (
        fk_order_id, method, amount, status, paid_at
      ) VALUES (
        v_order_id, 'cod', v_total,
        IF(v_status = 'delivered', 'success', 'pending'),
        IF(v_status = 'delivered', v_order_date, NULL)
      );

      -- Tạo order status log
      INSERT INTO tbl_order_status_logs (fk_order_id, status, note, changed_at)
      VALUES (v_order_id, v_status, 'Seed data', v_order_date);

      SET v_i = v_i + 1;
    END WHILE;

  END LOOP;
  CLOSE cur;
END$$

DELIMITER ;

-- ── Chạy tạo đơn hàng ────────────────────────────────────────
CALL generate_orders();
DROP PROCEDURE IF EXISTS generate_orders;


-- ── Tạo đánh giá cho đơn hàng delivered ─────────────────────
DROP PROCEDURE IF EXISTS generate_reviews;
DELIMITER $$

CREATE PROCEDURE generate_reviews()
BEGIN
  DECLARE v_order_id    INT;
  DECLARE v_user_id     INT;
  DECLARE v_product_id  INT;
  DECLARE v_rating      INT;
  DECLARE done          INT DEFAULT 0;

  -- Lấy các order_item từ đơn delivered, xác suất 70% sẽ có review
  DECLARE cur CURSOR FOR
    SELECT oi.fk_order_id, o.fk_user_id, oi.fk_product_id
    FROM tbl_order_items oi
    JOIN tbl_orders o ON o.pk_order_id = oi.fk_order_id
    WHERE o.order_status = 'delivered'
      AND o.fk_user_id BETWEEN 2 AND 101
      AND RAND() < 0.70  -- 70% sản phẩm được đánh giá
      AND NOT EXISTS (
        SELECT 1 FROM tbl_reviews r
        WHERE r.fk_product_id = oi.fk_product_id
          AND r.fk_user_id = o.fk_user_id
          AND r.fk_parent_id IS NULL
      );

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  review_loop: LOOP
    FETCH cur INTO v_order_id, v_user_id, v_product_id;
    IF done THEN LEAVE review_loop; END IF;

    -- Rating có trọng số: 5 sao nhiều nhất
    SET @r = RAND();
    IF @r < 0.45 THEN SET v_rating = 5;
    ELSEIF @r < 0.70 THEN SET v_rating = 4;
    ELSEIF @r < 0.85 THEN SET v_rating = 3;
    ELSEIF @r < 0.95 THEN SET v_rating = 2;
    ELSE SET v_rating = 1;
    END IF;

    INSERT INTO tbl_reviews (
      fk_product_id, fk_user_id, fk_parent_id, rating, comment, created_at
    ) VALUES (
      v_product_id, v_user_id, NULL, v_rating,
      ELT(FLOOR(1 + RAND() * 8),
        'Sản phẩm rất tốt, dùng rất hài lòng!',
        'Chất lượng ổn, giao hàng nhanh.',
        'Thú cưng nhà mình rất thích.',
        'Đóng gói cẩn thận, sản phẩm đúng mô tả.',
        'Mua lần 2 rồi, vẫn rất ưng.',
        'Giá hợp lý, chất lượng tốt.',
        'Sẽ ủng hộ shop dài dài.',
        'Tạm ổn, không có gì đặc biệt.'
      ),
      DATE_ADD((SELECT created_at FROM tbl_orders WHERE pk_order_id = v_order_id),
               INTERVAL FLOOR(1 + RAND() * 7) DAY)
    );

  END LOOP;
  CLOSE cur;
END$$

DELIMITER ;

CALL generate_reviews();
DROP PROCEDURE IF EXISTS generate_reviews;


-- ── Kiểm tra kết quả ─────────────────────────────────────────
SELECT 'Orders' AS tbl, COUNT(*) AS total FROM tbl_orders WHERE fk_user_id BETWEEN 2 AND 101
UNION ALL
SELECT 'Order Items', COUNT(*) FROM tbl_order_items oi
  JOIN tbl_orders o ON o.pk_order_id = oi.fk_order_id WHERE o.fk_user_id BETWEEN 2 AND 101
UNION ALL
SELECT 'Reviews', COUNT(*) FROM tbl_reviews WHERE fk_user_id BETWEEN 2 AND 101 AND fk_parent_id IS NULL;
