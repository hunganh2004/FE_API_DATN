-- ============================================================
-- MODULE 07: VIEWS THONG KE (ho tro admin)
-- ============================================================

USE pet_accessory_shop;

-- Thong ke san pham: so luong ban, diem danh gia trung binh
CREATE VIEW v_product_stats AS
SELECT
    p.pk_product_id,
    p.name,
    p.price,
    p.stock,
    COALESCE(SUM(oi.quantity), 0)       AS total_sold,
    COALESCE(AVG(r.rating), 0)          AS avg_rating,
    COUNT(DISTINCT r.pk_review_id)      AS review_count
FROM tbl_products p
LEFT JOIN tbl_order_items oi ON oi.fk_product_id = p.pk_product_id
LEFT JOIN tbl_orders o       ON o.pk_order_id = oi.fk_order_id
                             AND o.order_status = 'delivered'
LEFT JOIN tbl_reviews r      ON r.fk_product_id = p.pk_product_id
GROUP BY p.pk_product_id;

-- Thong ke khach hang: tong don hang, tong chi tieu, lan mua cuoi
CREATE VIEW v_user_purchase_summary AS
SELECT
    u.pk_user_id,
    u.full_name,
    u.email,
    COUNT(DISTINCT o.pk_order_id)       AS total_orders,
    COALESCE(SUM(o.total), 0)           AS total_spent,
    MAX(o.created_at)                   AS last_order_at
FROM tbl_users u
LEFT JOIN tbl_orders o ON o.fk_user_id = u.pk_user_id
                       AND o.order_status != 'cancelled'
GROUP BY u.pk_user_id;

-- Doanh thu theo ngay/thang/nam
CREATE VIEW v_revenue_by_date AS
SELECT
    DATE(o.created_at)              AS order_date,
    MONTH(o.created_at)             AS order_month,
    YEAR(o.created_at)              AS order_year,
    COUNT(DISTINCT o.pk_order_id)   AS total_orders,
    SUM(o.total)                    AS revenue
FROM tbl_orders o
WHERE o.order_status = 'delivered'
GROUP BY DATE(o.created_at), MONTH(o.created_at), YEAR(o.created_at);

-- Top san pham ban chay theo danh muc
CREATE VIEW v_top_products_by_category AS
SELECT
    c.pk_category_id,
    c.name                          AS category_name,
    p.pk_product_id,
    p.name                          AS product_name,
    COALESCE(SUM(oi.quantity), 0)   AS total_sold,
    COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_revenue
FROM tbl_categories c
JOIN tbl_products p     ON p.fk_category_id = c.pk_category_id
LEFT JOIN tbl_order_items oi ON oi.fk_product_id = p.pk_product_id
LEFT JOIN tbl_orders o       ON o.pk_order_id = oi.fk_order_id
                             AND o.order_status = 'delivered'
GROUP BY c.pk_category_id, p.pk_product_id
ORDER BY c.pk_category_id, total_sold DESC;
