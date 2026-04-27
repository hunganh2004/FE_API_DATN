-- ============================================================
-- MODULE 02: DANH MUC & LOAI THU CUNG
-- Tables: tbl_categories, tbl_pet_types
-- ============================================================

USE pet_accessory_shop;

CREATE TABLE tbl_categories (
    pk_category_id INT UNSIGNED AUTO_INCREMENT,
    fk_parent_id   INT UNSIGNED DEFAULT NULL,
    name           VARCHAR(100) NOT NULL,
    slug           VARCHAR(120) NOT NULL UNIQUE,
    description    TEXT,
    image_url      VARCHAR(500),
    sort_order     INT NOT NULL DEFAULT 0,
    is_active      TINYINT NOT NULL DEFAULT 1,
    PRIMARY KEY (pk_category_id),
    CONSTRAINT fk_cat_parent FOREIGN KEY (fk_parent_id)
        REFERENCES tbl_categories(pk_category_id) ON DELETE SET NULL
);

CREATE TABLE tbl_pet_types (
    pk_pet_type_id INT UNSIGNED AUTO_INCREMENT,
    name           VARCHAR(50) NOT NULL UNIQUE,
    icon_url       VARCHAR(500),
    PRIMARY KEY (pk_pet_type_id)
);
