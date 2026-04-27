-- ============================================================
-- MODULE 04: GIO HANG, MA GIAM GIA, DON HANG, THANH TOAN
-- Tables: tbl_cart_items, tbl_coupons, tbl_orders,
--         tbl_order_items, tbl_order_status_logs, tbl_payments
-- ============================================================

USE pet_accessory_shop;

-- Gio hang
CREATE TABLE tbl_cart_items (
    pk_cart_item_id INT UNSIGNED AUTO_INCREMENT,
    fk_user_id      INT UNSIGNED NOT NULL,
    fk_product_id   INT UNSIGNED NOT NULL,
    fk_variant_id   INT UNSIGNED DEFAULT NULL,
    quantity        INT NOT NULL DEFAULT 1,
    added_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pk_cart_item_id),
    UNIQUE KEY uq_cart (fk_user_id, fk_product_id, fk_variant_id),
    CONSTRAINT fk_cart_user    FOREIGN KEY (fk_user_id)
        REFERENCES tbl_users(pk_user_id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_product FOREIGN KEY (fk_product_id)
        REFERENCES tbl_products(pk_product_id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_variant FOREIGN KEY (fk_variant_id)
        REFERENCES tbl_product_variants(pk_variant_id) ON DELETE SET NULL
);

-- Ma giam gia
CREATE TABLE tbl_coupons (
    pk_coupon_id   INT UNSIGNED AUTO_INCREMENT,
    code           VARCHAR(50) NOT NULL UNIQUE,
    discount_type  ENUM('percent', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order      DECIMAL(12,2) DEFAULT 0,
    max_uses       INT DEFAULT NULL,
    used_count     INT NOT NULL DEFAULT 0,
    starts_at      DATETIME,
    expires_at     DATETIME,
    is_active      TINYINT NOT NULL DEFAULT 1,
    PRIMARY KEY (pk_coupon_id)
);

-- Don hang
CREATE TABLE tbl_orders (
    pk_order_id      INT UNSIGNED AUTO_INCREMENT,
    fk_user_id       INT UNSIGNED NOT NULL,
    fk_coupon_id     INT UNSIGNED DEFAULT NULL,
    receiver         VARCHAR(100) NOT NULL,
    phone            VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    subtotal         DECIMAL(12,2) NOT NULL,
    discount_amount  DECIMAL(12,2) NOT NULL DEFAULT 0,
    shipping_fee     DECIMAL(12,2) NOT NULL DEFAULT 0,
    total            DECIMAL(12,2) NOT NULL,
    payment_method   ENUM('cod', 'bank_transfer', 'momo', 'vnpay') NOT NULL,
    payment_status   ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    order_status     ENUM('pending','confirmed','processing','shipping','delivered','cancelled') NOT NULL DEFAULT 'pending',
    note             TEXT,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (pk_order_id),
    CONSTRAINT fk_ord_user   FOREIGN KEY (fk_user_id)
        REFERENCES tbl_users(pk_user_id),
    CONSTRAINT fk_ord_coupon FOREIGN KEY (fk_coupon_id)
        REFERENCES tbl_coupons(pk_coupon_id) ON DELETE SET NULL
);

-- Chi tiet don hang
CREATE TABLE tbl_order_items (
    pk_order_item_id INT UNSIGNED AUTO_INCREMENT,
    fk_order_id      INT UNSIGNED NOT NULL,
    fk_product_id    INT UNSIGNED NOT NULL,
    fk_variant_id    INT UNSIGNED DEFAULT NULL,
    product_name     VARCHAR(255) NOT NULL,
    unit_price       DECIMAL(12,2) NOT NULL,
    quantity         INT NOT NULL,
    PRIMARY KEY (pk_order_item_id),
    CONSTRAINT fk_oi_order   FOREIGN KEY (fk_order_id)
        REFERENCES tbl_orders(pk_order_id) ON DELETE CASCADE,
    CONSTRAINT fk_oi_product FOREIGN KEY (fk_product_id)
        REFERENCES tbl_products(pk_product_id),
    CONSTRAINT fk_oi_variant FOREIGN KEY (fk_variant_id)
        REFERENCES tbl_product_variants(pk_variant_id) ON DELETE SET NULL
);

-- Lich su trang thai don hang
CREATE TABLE tbl_order_status_logs (
    pk_log_id    INT UNSIGNED AUTO_INCREMENT,
    fk_order_id  INT UNSIGNED NOT NULL,
    status       VARCHAR(50) NOT NULL,
    note         TEXT,
    changed_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fk_changed_by INT UNSIGNED DEFAULT NULL,
    PRIMARY KEY (pk_log_id),
    CONSTRAINT fk_osl_order FOREIGN KEY (fk_order_id)
        REFERENCES tbl_orders(pk_order_id) ON DELETE CASCADE
);

-- Thanh toan
CREATE TABLE tbl_payments (
    pk_payment_id   INT UNSIGNED AUTO_INCREMENT,
    fk_order_id     INT UNSIGNED NOT NULL UNIQUE,
    method          ENUM('cod', 'bank_transfer', 'momo', 'vnpay') NOT NULL,
    transaction_ref VARCHAR(255),
    amount          DECIMAL(12,2) NOT NULL,
    status          ENUM('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    paid_at         DATETIME DEFAULT NULL,
    PRIMARY KEY (pk_payment_id),
    CONSTRAINT fk_pay_order FOREIGN KEY (fk_order_id)
        REFERENCES tbl_orders(pk_order_id) ON DELETE CASCADE
);
