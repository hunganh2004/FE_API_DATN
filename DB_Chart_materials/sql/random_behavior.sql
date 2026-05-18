USE pet_accessory_shop_v2;

-- Tạo stored procedure để generate behavior logs
DROP PROCEDURE IF EXISTS generate_behavior_logs;

DELIMITER $$

CREATE PROCEDURE generate_behavior_logs()
BEGIN
  DECLARE v_user_id INT;
  DECLARE v_product_id INT;
  DECLARE v_action VARCHAR(20);
  DECLARE v_records INT;
  DECLARE v_i INT;
  DECLARE v_max_product_id INT;
  DECLARE v_rand FLOAT;
  DECLARE done INT DEFAULT 0;

  DECLARE cur CURSOR FOR SELECT pk_user_id FROM tbl_users WHERE role = 'customer';
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  SELECT MAX(pk_product_id) INTO v_max_product_id FROM tbl_products WHERE is_active = 1;

  OPEN cur;
  user_loop: LOOP
    FETCH cur INTO v_user_id;
    IF done THEN LEAVE user_loop; END IF;

    -- Mỗi user 30-80 records
    SET v_records = FLOOR(30 + RAND() * 51);
    SET v_i = 0;

    WHILE v_i < v_records DO
      -- Random product_id hợp lệ
      SET v_product_id = (
        SELECT pk_product_id FROM tbl_products
        WHERE is_active = 1
        ORDER BY RAND()
        LIMIT 1
      );

      -- Phân bổ action có trọng số
      SET v_rand = RAND();
      IF v_rand < 0.50 THEN
        SET v_action = 'view';
      ELSEIF v_rand < 0.70 THEN
        SET v_action = 'add_to_cart';
      ELSEIF v_rand < 0.82 THEN
        SET v_action = 'wishlist';
      ELSEIF v_rand < 0.91 THEN
        SET v_action = 'purchase';
      ELSEIF v_rand < 0.96 THEN
        SET v_action = 'remove_from_cart';
      ELSE
        SET v_action = 'search';
      END IF;

      INSERT INTO tbl_user_behavior_logs (
        fk_user_id,
        session_id,
        fk_product_id,
        action,
        search_query,
        duration_sec,
        created_at
      ) VALUES (
        v_user_id,
        CONCAT('sess_seed_', v_user_id, '_', v_i),
        CASE WHEN v_action = 'search' THEN NULL ELSE v_product_id END,
        v_action,
        CASE WHEN v_action = 'search' THEN ELT(FLOOR(1 + RAND() * 5), 'thức ăn chó', 'cát vệ sinh', 'đồ chơi mèo', 'vòng cổ', 'sữa tắm') ELSE NULL END,
        CASE WHEN v_action = 'view' THEN FLOOR(10 + RAND() * 120) ELSE NULL END,
        DATE_ADD('2025-01-01', INTERVAL FLOOR(RAND() * DATEDIFF(NOW(), '2025-01-01')) DAY)
      );

      SET v_i = v_i + 1;
    END WHILE;

  END LOOP;
  CLOSE cur;
END$$

DELIMITER ;

-- Chạy
CALL generate_behavior_logs();

-- Dọn dẹp
DROP PROCEDURE IF EXISTS generate_behavior_logs;

-- Kiểm tra kết quả
SELECT action, COUNT(*) as count FROM tbl_user_behavior_logs GROUP BY action;