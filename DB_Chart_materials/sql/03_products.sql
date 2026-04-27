-- ============================================================
-- MODULE 03: SAN PHAM
-- Tables: tbl_products, tbl_product_pet_types,
--         tbl_product_images, tbl_product_variants, tbl_reviews
-- ============================================================

USE pet_accessory_shop;

CREATE TABLE tbl_products (
    pk_product_id  INT UNSIGNED AUTO_INCREMENT,
    fk_category_id INT UNSIGNED NOT NULL,
    name           VARCHAR(255) NOT NULL,
    slug           VARCHAR(280) NOT NULL UNIQUE,
    description    TEXT,
    price          DECIMAL(12,2) NOT NULL,
    sale_price     DECIMAL(12,2) DEFAULT NULL,
    stock          INT NOT NULL DEFAULT 0,
    sku            VARCHAR(100) UNIQUE,
    brand          VARCHAR(100),
    weight_gram    INT DEFAULT NULL,
    is_consumable  TINYINT NOT NULL DEFAULT 0,
    is_active      TINYINT NOT NULL DEFAULT 1,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (pk_product_id),
    CONSTRAINT fk_prod_category FOREIGN KEY (fk_category_id)
        REFERENCES tbl_categories(pk_category_id)
);

-- San pham phu hop voi loai thu cung nao
CREATE TABLE tbl_product_pet_types (
    fk_product_id  INT UNSIGNED NOT NULL,
    fk_pet_type_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (fk_product_id, fk_pet_type_id),
    CONSTRAINT fk_ppt_product  FOREIGN KEY (fk_product_id)
        REFERENCES tbl_products(pk_product_id) ON DELETE CASCADE,
    CONSTRAINT fk_ppt_pet_type FOREIGN KEY (fk_pet_type_id)
        REFERENCES tbl_pet_types(pk_pet_type_id) ON DELETE CASCADE
);

-- Hinh anh san pham
CREATE TABLE tbl_product_images (
    pk_image_id   INT UNSIGNED AUTO_INCREMENT,
    fk_product_id INT UNSIGNED NOT NULL,
    image_url     VARCHAR(500) NOT NULL,
    is_primary    TINYINT NOT NULL DEFAULT 0,
    sort_order    INT NOT NULL DEFAULT 0,
    PRIMARY KEY (pk_image_id),
    CONSTRAINT fk_img_product FOREIGN KEY (fk_product_id)
        REFERENCES tbl_products(pk_product_id) ON DELETE CASCADE
);

-- Bien the san pham (mau sac, kich thuoc...)
CREATE TABLE tbl_product_variants (
    pk_variant_id INT UNSIGNED AUTO_INCREMENT,
    fk_product_id INT UNSIGNED NOT NULL,
    name          VARCHAR(100) NOT NULL,
    sku           VARCHAR(100) UNIQUE,
    price         DECIMAL(12,2) NOT NULL,
    sale_price    DECIMAL(12,2) DEFAULT NULL,
    stock         INT NOT NULL DEFAULT 0,
    PRIMARY KEY (pk_variant_id),
    CONSTRAINT fk_var_product FOREIGN KEY (fk_product_id)
        REFERENCES tbl_products(pk_product_id) ON DELETE CASCADE
);

-- Thong so ky thuat san pham (key-value)
CREATE TABLE tbl_product_specs (
    pk_spec_id    INT UNSIGNED AUTO_INCREMENT,
    fk_product_id INT UNSIGNED NOT NULL,
    spec_name     VARCHAR(100) NOT NULL,
    spec_value    VARCHAR(255) NOT NULL,
    sort_order    INT NOT NULL DEFAULT 0,
    PRIMARY KEY (pk_spec_id),
    CONSTRAINT fk_spec_product FOREIGN KEY (fk_product_id)
        REFERENCES tbl_products(pk_product_id) ON DELETE CASCADE
);

-- Danh gia san pham
CREATE TABLE tbl_reviews (
    pk_review_id  INT UNSIGNED AUTO_INCREMENT,
    fk_product_id INT UNSIGNED NOT NULL,
    fk_user_id    INT UNSIGNED NOT NULL,
    fk_parent_id  INT UNSIGNED DEFAULT NULL,           -- NULL = danh gia goc, co gia tri = reply
    rating        TINYINT DEFAULT NULL CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
    comment       TEXT,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pk_review_id),
    CONSTRAINT fk_rev_product FOREIGN KEY (fk_product_id)
        REFERENCES tbl_products(pk_product_id) ON DELETE CASCADE,
    CONSTRAINT fk_rev_user FOREIGN KEY (fk_user_id)
        REFERENCES tbl_users(pk_user_id) ON DELETE CASCADE,
    CONSTRAINT fk_rev_parent FOREIGN KEY (fk_parent_id)
        REFERENCES tbl_reviews(pk_review_id) ON DELETE CASCADE
);
