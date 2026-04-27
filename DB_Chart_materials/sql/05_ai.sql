-- ============================================================
-- MODULE 05: AI - HANH VI, GOI Y, PHAN CUM, DU DOAN
-- Tables: tbl_user_behavior_logs, tbl_product_recommendations,
--         tbl_association_rules, tbl_customer_segments,
--         tbl_user_segments, tbl_repurchase_predictions
-- ============================================================

USE pet_accessory_shop;

-- Hanh vi nguoi dung (thu thap du lieu cho AI)
CREATE TABLE tbl_user_behavior_logs (
    pk_log_id    BIGINT UNSIGNED AUTO_INCREMENT,
    fk_user_id   INT UNSIGNED DEFAULT NULL,
    session_id   VARCHAR(100) NOT NULL,
    fk_product_id INT UNSIGNED DEFAULT NULL,
    action       ENUM('view','search','add_to_cart','remove_from_cart','purchase','wishlist') NOT NULL,
    search_query VARCHAR(255) DEFAULT NULL,
    duration_sec INT DEFAULT NULL,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pk_log_id),
    INDEX idx_ubl_user    (fk_user_id),
    INDEX idx_ubl_product (fk_product_id),
    INDEX idx_ubl_action  (action),
    INDEX idx_ubl_created (created_at),
    CONSTRAINT fk_ubl_user    FOREIGN KEY (fk_user_id)
        REFERENCES tbl_users(pk_user_id) ON DELETE SET NULL,
    CONSTRAINT fk_ubl_product FOREIGN KEY (fk_product_id)
        REFERENCES tbl_products(pk_product_id) ON DELETE SET NULL
);

-- Ket qua goi y san pham tu AI service
CREATE TABLE tbl_product_recommendations (
    pk_rec_id    BIGINT UNSIGNED AUTO_INCREMENT,
    fk_user_id   INT UNSIGNED NOT NULL,
    fk_product_id INT UNSIGNED NOT NULL,
    score        FLOAT NOT NULL DEFAULT 0,
    rec_type     ENUM('collaborative','content_based','association','trending') NOT NULL,
    generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pk_rec_id),
    INDEX idx_rec_user (fk_user_id, rec_type),
    CONSTRAINT fk_rec_user    FOREIGN KEY (fk_user_id)
        REFERENCES tbl_users(pk_user_id) ON DELETE CASCADE,
    CONSTRAINT fk_rec_product FOREIGN KEY (fk_product_id)
        REFERENCES tbl_products(pk_product_id) ON DELETE CASCADE
);

-- Luat ket hop san pham (Association Rules Mining)
CREATE TABLE tbl_association_rules (
    pk_rule_id   INT UNSIGNED AUTO_INCREMENT,
    fk_antecedent INT UNSIGNED NOT NULL,
    fk_consequent INT UNSIGNED NOT NULL,
    support      FLOAT NOT NULL,
    confidence   FLOAT NOT NULL,
    lift         FLOAT NOT NULL,
    updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (pk_rule_id),
    CONSTRAINT fk_ar_antecedent FOREIGN KEY (fk_antecedent)
        REFERENCES tbl_products(pk_product_id) ON DELETE CASCADE,
    CONSTRAINT fk_ar_consequent FOREIGN KEY (fk_consequent)
        REFERENCES tbl_products(pk_product_id) ON DELETE CASCADE
);

-- Phan cum khach hang (Clustering)
CREATE TABLE tbl_customer_segments (
    pk_segment_id INT UNSIGNED AUTO_INCREMENT,
    name          VARCHAR(100) NOT NULL,
    description   TEXT,
    PRIMARY KEY (pk_segment_id)
);

CREATE TABLE tbl_user_segments (
    fk_user_id    INT UNSIGNED NOT NULL,
    fk_segment_id INT UNSIGNED NOT NULL,
    assigned_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (fk_user_id, fk_segment_id),
    CONSTRAINT fk_us_user    FOREIGN KEY (fk_user_id)
        REFERENCES tbl_users(pk_user_id) ON DELETE CASCADE,
    CONSTRAINT fk_us_segment FOREIGN KEY (fk_segment_id)
        REFERENCES tbl_customer_segments(pk_segment_id) ON DELETE CASCADE
);

-- Du doan thoi diem mua lai san pham tieu hao (Regression)
CREATE TABLE tbl_repurchase_predictions (
    pk_pred_id     INT UNSIGNED AUTO_INCREMENT,
    fk_user_id     INT UNSIGNED NOT NULL,
    fk_product_id  INT UNSIGNED NOT NULL,
    predicted_date DATE NOT NULL,
    confidence     FLOAT NOT NULL,
    notified       TINYINT NOT NULL DEFAULT 0,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pk_pred_id),
    CONSTRAINT fk_rp_user    FOREIGN KEY (fk_user_id)
        REFERENCES tbl_users(pk_user_id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_product FOREIGN KEY (fk_product_id)
        REFERENCES tbl_products(pk_product_id) ON DELETE CASCADE
);
