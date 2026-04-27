-- ============================================================
-- MODULE 01: NGUOI DUNG
-- Tables: tbl_users, tbl_user_addresses
-- ============================================================

USE pet_accessory_shop;

CREATE TABLE tbl_users (
    pk_user_id    INT UNSIGNED AUTO_INCREMENT,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone         VARCHAR(20),
    avatar_url    VARCHAR(500),
    role          ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    is_active     TINYINT NOT NULL DEFAULT 1,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (pk_user_id)
);

CREATE TABLE tbl_user_addresses (
    pk_address_id INT UNSIGNED AUTO_INCREMENT,
    fk_user_id    INT UNSIGNED NOT NULL,
    receiver      VARCHAR(100) NOT NULL,            -- Tên người nhận
    phone         VARCHAR(20) NOT NULL,
    province      VARCHAR(100) NOT NULL,            -- Tỉnh/Thành phố
    commune       VARCHAR(100) NOT NULL,            -- Xã/Phường
    street        VARCHAR(255) NOT NULL,            -- số nhà, tên đường, ... (phần chi tiết)
    is_default    TINYINT NOT NULL DEFAULT 0,    -- địa chỉ mặc định
    PRIMARY KEY (pk_address_id),
    CONSTRAINT fk_addr_user FOREIGN KEY (fk_user_id)
        REFERENCES tbl_users(pk_user_id) ON DELETE CASCADE
);
