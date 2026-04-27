# System Flow - Luồng hệ thống

Mô tả tương tác giữa các thành phần: Frontend, Backend API, Database, AI Service.

---

## 1. Đăng ký & Đăng nhập

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant FE as Frontend
    participant BE as Backend API
    participant DB as Database

    U->>FE: Nhập email + mật khẩu
    FE->>BE: POST /auth/register hoặc /auth/login
    BE->>DB: Kiểm tra email tồn tại
    DB-->>BE: Kết quả
    alt Đăng ký
        BE->>DB: Lưu user mới (hash password)
        DB-->>BE: OK
        BE-->>FE: 201 Created + JWT token
    else Đăng nhập
        BE->>DB: Lấy user theo email
        DB-->>BE: User record
        BE->>BE: Verify password hash
        BE-->>FE: 200 OK + JWT token
    end
    FE->>FE: Lưu token (localStorage/cookie)
    FE-->>U: Chuyển về trang chủ
```

---

## 2. Tìm kiếm & Lọc sản phẩm

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant FE as Frontend
    participant BE as Backend API
    participant DB as Database
    participant AI as AI Service

    U->>FE: Nhập từ khoá / chọn bộ lọc
    FE->>BE: GET /products?q=...&category=...&pet_type=...&price_min=...
    BE->>DB: Query tbl_products với điều kiện lọc
    DB-->>BE: Danh sách sản phẩm
    BE->>BE: Ghi log hành vi (action=search)
    BE->>DB: INSERT tbl_user_behavior_logs
    BE-->>FE: Danh sách sản phẩm + phân trang
    FE-->>U: Hiển thị kết quả
```

---

## 3. Xem chi tiết sản phẩm & Gợi ý AI

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant FE as Frontend
    participant BE as Backend API
    participant DB as Database
    participant AI as AI Service

    U->>FE: Click vào sản phẩm
    FE->>BE: GET /products/:id
    BE->>DB: Lấy thông tin sản phẩm, ảnh, biến thể, đánh giá
    DB-->>BE: Dữ liệu sản phẩm
    BE->>DB: INSERT tbl_user_behavior_logs (action=view, duration tracking)
    BE-->>FE: Dữ liệu sản phẩm

    FE->>BE: GET /recommendations?user_id=...&product_id=...
    BE->>AI: Request gợi ý (user_id, product_id hiện tại)
    AI->>DB: Đọc tbl_user_behavior_logs, tbl_association_rules
    AI-->>BE: Danh sách product_id gợi ý + score
    BE->>DB: Lưu vào tbl_product_recommendations
    BE->>DB: Lấy thông tin chi tiết các sản phẩm gợi ý
    DB-->>BE: Dữ liệu sản phẩm gợi ý
    BE-->>FE: Danh sách sản phẩm gợi ý
    FE-->>U: Hiển thị sản phẩm + section "Gợi ý cho bạn"
```

---

## 4. Đặt hàng & Thanh toán

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant FE as Frontend
    participant BE as Backend API
    participant DB as Database
    participant PAY as Cổng thanh toán

    U->>FE: Xác nhận đơn hàng
    FE->>BE: POST /orders (cart_items, address, coupon_code, payment_method)
    BE->>DB: Kiểm tra tồn kho từng sản phẩm
    DB-->>BE: Kết quả tồn kho

    alt Đủ hàng
        BE->>DB: Tạo tbl_orders + tbl_order_items
        BE->>DB: Trừ stock trong tbl_products / tbl_product_variants
        BE->>DB: Tăng used_count trong tbl_coupons (nếu có)
        BE->>DB: Xoá tbl_cart_items của user
        BE->>DB: INSERT tbl_order_status_logs (status=pending)

        alt Thanh toán online (momo/vnpay)
            BE->>PAY: Tạo phiên thanh toán
            PAY-->>BE: Payment URL
            BE-->>FE: Redirect URL
            FE->>PAY: Người dùng thanh toán
            PAY->>BE: Webhook callback (success/failed)
            BE->>DB: Cập nhật tbl_payments + tbl_orders.payment_status
        else COD / Chuyển khoản
            BE->>DB: Tạo tbl_payments (status=pending)
            BE-->>FE: 201 Created + order_id
        end

        BE->>DB: INSERT tbl_user_behavior_logs (action=purchase)
        BE-->>FE: Đặt hàng thành công
        FE-->>U: Trang xác nhận đơn hàng
    else Hết hàng
        BE-->>FE: 409 Conflict - sản phẩm hết hàng
        FE-->>U: Thông báo lỗi
    end
```

---

## 5. Cập nhật trạng thái đơn hàng (Admin)

```mermaid
sequenceDiagram
    actor A as Admin
    participant FE as Frontend Admin
    participant BE as Backend API
    participant DB as Database

    A->>FE: Chọn đơn hàng, cập nhật trạng thái
    FE->>BE: PATCH /admin/orders/:id/status
    BE->>DB: Cập nhật tbl_orders.order_status
    BE->>DB: INSERT tbl_order_status_logs
    BE->>DB: INSERT tbl_notifications (gửi thông báo cho user)
    DB-->>BE: OK
    BE-->>FE: 200 OK
    FE-->>A: Cập nhật thành công
```

---

## 6. Hệ thống AI - Thu thập & Huấn luyện

```mermaid
flowchart TD
    A[Người dùng tương tác với website] --> B[Backend ghi tbl_user_behavior_logs]
    B --> C{Đủ dữ liệu?}
    C -- Chưa --> A
    C -- Đủ --> D[AI Service đọc dữ liệu hành vi]

    D --> E[Tiền xử lý dữ liệu]
    E --> F{Chọn mô hình}

    F --> G[Collaborative Filtering\nGợi ý theo hành vi tương tự]
    F --> H[Association Rules Mining\nSản phẩm thường mua kèm]
    F --> I[Clustering\nPhân cụm khách hàng]
    F --> J[Regression\nDự đoán thời điểm mua lại]

    G --> K[Lưu tbl_product_recommendations]
    H --> L[Lưu tbl_association_rules]
    I --> M[Lưu tbl_user_segments]
    J --> N[Lưu tbl_repurchase_predictions]

    K --> O[Backend API phục vụ gợi ý cho Frontend]
    N --> P[Gửi thông báo nhắc mua lại qua tbl_notifications]
```

---

## 7. Luồng gợi ý sản phẩm theo thời gian thực

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant BE as Backend API
    participant DB as Database
    participant AI as AI Service

    Note over FE,AI: Khi người dùng vào trang chủ
    FE->>BE: GET /recommendations/homepage?user_id=...
    BE->>DB: Đọc tbl_product_recommendations (rec_type=collaborative)
    DB-->>BE: Danh sách gợi ý đã lưu
    alt Gợi ý còn mới (< 1 giờ)
        BE-->>FE: Trả về gợi ý từ cache DB
    else Gợi ý cũ hoặc chưa có
        BE->>AI: Request tính lại gợi ý
        AI-->>BE: Danh sách mới
        BE->>DB: Cập nhật tbl_product_recommendations
        BE-->>FE: Trả về gợi ý mới
    end
    FE-->>FE: Hiển thị section "Dành riêng cho bạn"
```
