-- ============================================================
-- MODULE 06: WISHLIST & THONG BAO
-- Tables: tbl_wishlists, tbl_notifications
-- ============================================================

USE pet_accessory_shop;

-- Danh sach yeu thich
CREATE TABLE tbl_wishlists (
    pk_wishlist_id INT UNSIGNED AUTO_INCREMENT,
    fk_user_id     INT UNSIGNED NOT NULL,
    fk_product_id  INT UNSIGNED NOT NULL,
    added_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pk_wishlist_id),
    UNIQUE KEY uq_wishlist (fk_user_id, fk_product_id),
    CONSTRAINT fk_wl_user    FOREIGN KEY (fk_user_id)
        REFERENCES tbl_users(pk_user_id) ON DELETE CASCADE,
    CONSTRAINT fk_wl_product FOREIGN KEY (fk_product_id)
        REFERENCES tbl_products(pk_product_id) ON DELETE CASCADE
);

-- Thong bao nguoi dung
CREATE TABLE tbl_notifications (
    pk_notif_id  INT UNSIGNED AUTO_INCREMENT,
    fk_user_id   INT UNSIGNED NOT NULL,
    type         ENUM('order_update','repurchase_reminder','promotion','system') NOT NULL,
    title        VARCHAR(255) NOT NULL,
    message      TEXT NOT NULL,
    is_read      TINYINT NOT NULL DEFAULT 0,
    ref_id       INT UNSIGNED DEFAULT NULL,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pk_notif_id),
    CONSTRAINT fk_notif_user FOREIGN KEY (fk_user_id)
        REFERENCES tbl_users(pk_user_id) ON DELETE CASCADE
);
