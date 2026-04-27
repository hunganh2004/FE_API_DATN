# API Documentation — Pet Accessory Shop

**Base URL:** `http://localhost:3000/api/v1`

---

## Phân quyền

| Ký hiệu | Mô tả |
|---|---|
| `PUBLIC` | Không cần token |
| `AUTH` | Cần Bearer token (user hoặc admin) |
| `ADMIN` | Cần Bearer token với role = admin |
| `OPT_AUTH` | Có hoặc không có token đều được |

**Header xác thực:**
```
Authorization: Bearer <token>
```

---

## Mục lục
- [Auth](#auth)
- [Upload](#upload)
- [User](#user)
- [Categories](#categories)
- [Pet Types](#pet-types)
- [Products](#products)
- [Reviews](#reviews)
- [Cart](#cart)
- [Coupons](#coupons)
- [Orders](#orders)
- [Payments](#payments)
- [Behavior](#behavior)
- [Recommendations](#recommendations)
- [Wishlist](#wishlist)
- [Notifications](#notifications)
- [Admin](#admin)
- [Health Check](#health-check)
- [Dữ liệu mẫu](#dữ-liệu-mẫu-để-test)

---

---

## Upload

Base path: `/api/v1/upload` — Yêu cầu `AUTH`

### `POST /upload` — Upload 1 ảnh
- Content-Type: `multipart/form-data`
- Field: `image` (file)
- Query: `?folder=products` _(tuỳ chọn)_

```
folder: "products" | "categories" | "avatars" | "misc" (mặc định: misc)
```

Response:
```json
{
  "success": true,
  "message": "Tải ảnh lên thành công",
  "data": {
    "url": "http://localhost:3000/uploads/products/1234567890-123456.jpg"
  }
}
```

### `POST /upload/multiple` — Upload nhiều ảnh (tối đa 10)
- Content-Type: `multipart/form-data`
- Field: `images` (multiple files)
- Query: `?folder=products` _(tuỳ chọn)_

Response:
```json
{
  "success": true,
  "message": "Tải ảnh lên thành công",
  "data": {
    "urls": [
      "http://localhost:3000/uploads/products/111-aaa.jpg",
      "http://localhost:3000/uploads/products/222-bbb.jpg"
    ]
  }
}
```

> Giới hạn: tối đa 5MB/file, chấp nhận jpeg, png, webp, gif.  
> URL trả về dùng trực tiếp cho các field `image_url` ở products, categories, avatar...

---

## Auth

Base path: `/api/v1/auth`

### `POST /auth/register` — `PUBLIC`
```json
{
  "full_name": "Nguyễn Văn An",
  "email": "an.nguyen@gmail.com",
  "password": "123456"
}
```

### `POST /auth/login` — `PUBLIC`
```json
{
  "email": "an.nguyen@gmail.com",
  "password": "123456"
}
```
> Admin mẫu: `admin@petshop.vn` | User mẫu: `an.nguyen@gmail.com`

### `GET /auth/me` — `AUTH`

### `POST /auth/change-password` — `AUTH`
```json
{
  "old_password": "123456",
  "new_password": "newpass123"
}
```

---

## User

Base path: `/api/v1/users`

### `GET /users/profile` — `AUTH`

### `PUT /users/profile` — `AUTH`
```json
{
  "full_name": "Tên mới",
  "phone": "0909123456",
  "avatar_url": "/uploads/avatar.jpg"
}
```

### `GET /users/addresses` — `AUTH`

### `POST /users/addresses` — `AUTH`
```json
{
  "receiver": "Nguyễn Văn An",
  "phone": "0901000002",
  "province": "TP. Hồ Chí Minh",
  "commune": "Phường Bến Nghé",
  "street": "12 Nguyễn Huệ",
  "is_default": true
}
```

### `PUT /users/addresses/:id` — `AUTH`
> Body giống POST

### `DELETE /users/addresses/:id` — `AUTH`

### `PATCH /users/addresses/:id/default` — `AUTH`

---

## Categories

Base path: `/api/v1/categories`

### `GET /categories` — `PUBLIC`

### `GET /categories/:id` — `PUBLIC`

### `POST /categories` — `ADMIN`
```json
{
  "name": "Thức ăn",
  "description": "Mô tả danh mục",
  "image_url": "/images/cat.jpg",
  "sort_order": 1,
  "fk_parent_id": null
}
```

### `PUT /categories/:id` — `ADMIN`
> Body giống POST

### `DELETE /categories/:id` — `ADMIN`

---

## Pet Types

Base path: `/api/v1/pet-types`

### `GET /pet-types` — `PUBLIC`

### `POST /pet-types` — `ADMIN`
```json
{
  "name": "Chó",
  "icon_url": "/icons/dog.png"
}
```

### `PUT /pet-types/:id` — `ADMIN`
> Body giống POST

### `DELETE /pet-types/:id` — `ADMIN`

---

## Products

Base path: `/api/v1/products`

### `GET /products` — `OPT_AUTH`

Query params:

| Param | Mô tả |
|---|---|
| `q` | Tìm kiếm theo tên |
| `category_id` | Lọc theo danh mục |
| `pet_type_id` | Lọc theo loại thú |
| `min_price` | Giá tối thiểu |
| `max_price` | Giá tối đa |
| `is_consumable` | `1` = sản phẩm tiêu hao |
| `page` / `limit` | Phân trang (mặc định: 1 / 12) |

### `GET /products/:id` — `OPT_AUTH`

### `POST /products` — `ADMIN`
```json
{
  "fk_category_id": 6,
  "name": "Tên sản phẩm",
  "description": "Mô tả",
  "price": 150000,
  "sale_price": 120000,
  "stock": 50,
  "sku": "SKU-001",
  "brand": "Royal Canin",
  "weight_gram": 1000,
  "is_consumable": true,
  "pet_type_ids": [1, 2]
}
```

### `PUT /products/:id` — `ADMIN`
> Body giống POST

### `DELETE /products/:id` — `ADMIN`

### Variants

| Method | Path | Quyền |
|---|---|---|
| `GET` | `/products/:id/variants` | `PUBLIC` |
| `POST` | `/products/:id/variants` | `ADMIN` |
| `PUT` | `/products/:id/variants/:variantId` | `ADMIN` |
| `DELETE` | `/products/:id/variants/:variantId` | `ADMIN` |

Body POST/PUT variant:
```json
{
  "name": "Màu đen - Size S",
  "sku": "SKU-001-BLK-S",
  "price": 120000,
  "sale_price": null,
  "stock": 30
}
```

### Images

| Method | Path | Quyền |
|---|---|---|
| `POST` | `/products/:id/images` | `ADMIN` |
| `DELETE` | `/products/:id/images/:imageId` | `ADMIN` |

Body POST image:
```json
{
  "image_url": "/images/products/product-1.jpg",
  "is_primary": true,
  "sort_order": 1
}
```

---

## Reviews

Base path: `/api/v1/reviews`

### `GET /reviews/product/:productId` — `PUBLIC`

### `POST /reviews/product/:productId` — `AUTH`
```json
{
  "rating": 5,
  "comment": "Sản phẩm rất tốt!",
  "fk_parent_id": null
}
```
> `fk_parent_id`: truyền id review gốc nếu muốn reply, để `null` nếu là đánh giá mới

### `DELETE /reviews/:id` — `AUTH`

---

## Cart

Base path: `/api/v1/cart`

### `GET /cart` — `AUTH`

### `POST /cart` — `AUTH`
```json
{
  "product_id": 1,
  "variant_id": null,
  "quantity": 2
}
```

### `PUT /cart/:itemId` — `AUTH`
```json
{
  "quantity": 3
}
```

### `DELETE /cart/:itemId` — `AUTH`

### `DELETE /cart` — `AUTH`
> Xoá toàn bộ giỏ hàng

---

## Coupons

Base path: `/api/v1/coupons`

### `POST /coupons/validate` — `AUTH`
```json
{
  "code": "WELCOME10",
  "order_total": 500000
}
```

### `GET /coupons` — `ADMIN`

### `POST /coupons` — `ADMIN`
```json
{
  "code": "SUMMER30",
  "discount_type": "percent",
  "discount_value": 30,
  "min_order": 200000,
  "max_uses": 100,
  "starts_at": "2025-06-01T00:00:00",
  "expires_at": "2025-08-31T23:59:59"
}
```
> `discount_type`: `"percent"` | `"fixed"`

### `PUT /coupons/:id` — `ADMIN`
> Body giống POST

### `DELETE /coupons/:id` — `ADMIN`

**Mã mẫu từ seed:**

| Code | Loại | Giá trị | Điều kiện |
|---|---|---|---|
| `WELCOME10` | percent | -10% | Không giới hạn |
| `SALE50K` | fixed | -50.000đ | Đơn >= 200.000đ |
| `PETLOVER20` | percent | -20% | Đơn >= 300.000đ |

---

## Orders

Base path: `/api/v1/orders`

### `GET /orders` — `AUTH`
> Query: `?page=1&limit=10&status=pending`

### `GET /orders/:id` — `AUTH`

### `POST /orders` — `AUTH`
```json
{
  "receiver": "Nguyễn Văn An",
  "phone": "0901000002",
  "shipping_address": "12 Nguyễn Huệ, Phường Bến Nghé, TP. HCM",
  "payment_method": "cod",
  "coupon_code": "WELCOME10",
  "note": "Giao giờ hành chính"
}
```
> `payment_method`: `"cod"` | `"bank_transfer"` | `"momo"` | `"vnpay"`  
> `coupon_code`: tuỳ chọn

### `PATCH /orders/:id/cancel` — `AUTH`

---

## Payments

Base path: `/api/v1/payments`

### `POST /payments/callback/momo` — `PUBLIC`
> Webhook nhận callback từ MoMo

### `POST /payments/callback/vnpay` — `PUBLIC`
> Webhook nhận callback từ VNPay

---

## Behavior

Base path: `/api/v1/behavior`

### `POST /behavior` — `OPT_AUTH`
```json
{
  "session_id": "sess-abc-123",
  "product_id": 1,
  "action": "view",
  "search_query": null,
  "duration_sec": 45
}
```

| Field | Ghi chú |
|---|---|
| `action` | `"view"` \| `"search"` \| `"add_to_cart"` \| `"remove_from_cart"` \| `"purchase"` \| `"wishlist"` |
| `product_id` | `null` nếu `action = "search"` |
| `search_query` | Chỉ dùng khi `action = "search"` |
| `duration_sec` | Chỉ dùng khi `action = "view"` |

---

## Recommendations

Base path: `/api/v1/recommendations`

### `GET /recommendations/homepage` — `AUTH`
> Gợi ý sản phẩm cho trang chủ theo collaborative filtering. Fallback về sản phẩm mới nhất nếu AI Service offline.

### `GET /recommendations/product/:productId` — `OPT_AUTH`
> Gợi ý sản phẩm mua kèm dựa trên association rules khi xem chi tiết sản phẩm.

### `GET /recommendations/repurchase` — `AUTH`
> Nhắc mua lại sản phẩm tiêu hao sắp hết. Tự động tạo notification nếu chưa có.

Query params:

| Param | Mô tả |
|---|---|
| `days_ahead` | Số ngày tới cần kiểm tra (mặc định: 7) |

Response:
```json
[
  {
    "product_id": 1,
    "product_name": "Royal Canin Medium Adult 10kg",
    "predicted_date": "2025-03-25",
    "confidence": 0.75
  }
]
```

---

## Wishlist

Base path: `/api/v1/wishlist`

### `GET /wishlist` — `AUTH`

### `POST /wishlist/:productId` — `AUTH`
> Thêm sản phẩm vào wishlist

### `DELETE /wishlist/:productId` — `AUTH`
> Xoá sản phẩm khỏi wishlist

---

## Notifications

Base path: `/api/v1/notifications`

### `GET /notifications` — `AUTH`
> Query: `?page=1&limit=20`

### `PATCH /notifications/:id/read` — `AUTH`

### `PATCH /notifications/read-all` — `AUTH`

---

## Admin

Base path: `/api/v1/admin` — Tất cả đều yêu cầu `ADMIN`

### Đơn hàng

| Method | Path | Query / Body |
|---|---|---|
| `GET` | `/admin/orders` | `?page=1&limit=20&status=pending&search=keyword` |
| `GET` | `/admin/orders/:id` | — |
| `PATCH` | `/admin/orders/:id/status` | Body bên dưới |

Body cập nhật trạng thái:
```json
{
  "status": "confirmed",
  "note": "Đã xác nhận đơn hàng"
}
```
> `status`: `"pending"` | `"confirmed"` | `"processing"` | `"shipping"` | `"delivered"` | `"cancelled"`

### Người dùng

| Method | Path | Query |
|---|---|---|
| `GET` | `/admin/users` | `?page=1&limit=20&search=email_or_name` |
| `GET` | `/admin/users/:id` | — |
| `PATCH` | `/admin/users/:id/toggle-active` | Khoá / mở khoá tài khoản |

### Thống kê

| Method | Path | Query |
|---|---|---|
| `GET` | `/admin/stats/revenue` | `?from=2025-01-01&to=2025-12-31&group_by=day` |
| `GET` | `/admin/stats/top-products` | `?limit=10&from=2025-01-01&to=2025-12-31` |
| `GET` | `/admin/stats/customer-segments` | — |
| `GET` | `/admin/stats/behavior` | — |

> `group_by`: `"day"` | `"month"` | `"year"`

### AI

| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/admin/ai/health` | Kiểm tra trạng thái AI Service |
| `POST` | `/admin/ai/train/all` | Train tất cả mô hình (background) |
| `POST` | `/admin/ai/train/:model` | Train từng mô hình riêng |

> `:model`: `"association"` | `"collaborative"` | `"clustering"` | `"repurchase"`

Response `GET /admin/ai/health`:
```json
{ "data": { "ai_service": "online" } }
```

Response `POST /admin/ai/train/all`:
```json
{ "message": "Đã bắt đầu huấn luyện tất cả mô hình" }
```

Response `POST /admin/ai/train/collaborative` (ví dụ):
```json
{ "model": "collaborative", "rmse": 0.842, "n_components": 50, "n_users": 200, "n_products": 100 }
```

### Thông báo

| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/admin/notifications` | Lấy tất cả thông báo (có filter, phân trang) |
| `POST` | `/admin/notifications` | Gửi thông báo đến user hoặc broadcast |
| `DELETE` | `/admin/notifications/:id` | Xoá thông báo |

Query `GET /admin/notifications`:

| Param | Mô tả |
|---|---|
| `type` | Lọc theo loại: `order_update` \| `repurchase_reminder` \| `promotion` \| `system` |
| `user_id` | Lọc theo user |
| `is_read` | `0` = chưa đọc, `1` = đã đọc |
| `page` / `limit` | Phân trang (mặc định: 1 / 20) |

Body `POST /admin/notifications`:
```json
{
  "user_id": 2,
  "type": "promotion",
  "title": "Khuyến mãi tháng 6",
  "message": "Giảm 20% toàn bộ sản phẩm thức ăn!",
  "ref_id": null
}
```
> `user_id`: bỏ trống để broadcast đến tất cả customer đang active

---

## Health Check

### `GET /health` — `PUBLIC`
```json
{ "status": "ok", "timestamp": "2025-03-19T..." }
```

---

## Dữ liệu mẫu để test

### Tài khoản

| Role | Email | Ghi chú |
|---|---|---|
| Admin | `admin@petshop.vn` | — |
| User | `an.nguyen@gmail.com` | user_id=2, có đơn hàng & wishlist |
| User | `binh.tran@gmail.com` | user_id=3 |
| User | `chau.le@gmail.com` | user_id=4 |
| User | `dung.pham@gmail.com` | user_id=5 |

> Mật khẩu trong seed là hash placeholder — cần chạy seed thực tế với mật khẩu thật.

### Products

| ID | Tên | Loại thú | Tiêu hao | Variants |
|---|---|---|---|---|
| 1 | Royal Canin Medium Adult 10kg | Chó | ✅ | — |
| 2 | Pedigree Adult Thịt Bò 3kg | Chó | ✅ | — |
| 3 | Snack Dentastix 7 cái | Chó | ✅ | — |
| 4 | Royal Canin Indoor Adult 2kg | Mèo | ✅ | — |
| 5 | Whiskas Cá Ngừ 85g x12 | Mèo | ✅ | — |
| 6 | Cát vệ sinh Biokat 10L | Mèo | ✅ | — |
| 7 | Bóng cao su phát tiếng kêu | Chó + Mèo | — | — |
| 8 | Cần câu lông vũ cho mèo | Mèo | — | — |
| 9 | Vòng cổ da bò size S | Chó | — | 3 variants |
| 10 | Dây dắt chó 1.5m | Chó | — | 2 variants |
| 11 | Lược chải lông 2 mặt | Chó + Mèo | — | — |
| 12 | Sữa tắm lavender | Chó | ✅ | — |

### Categories

| ID | Tên | Loại |
|---|---|---|
| 1 | Thức ăn | Cha |
| 2 | Đồ chơi | Cha |
| 3 | Phụ kiện | Cha |
| 4 | Chăm sóc & Vệ sinh | Cha |
| 5 | Chuồng & Nơi ở | Cha |
| 6 | Thức ăn cho chó | Con của 1 |
| 7 | Thức ăn cho mèo | Con của 1 |
| 8 | Thức ăn cho cá | Con của 1 |
| 9 | Vòng cổ & Dây dắt | Con của 3 |
| 10 | Quần áo thú cưng | Con của 3 |

### Pet Types

| ID | Tên |
|---|---|
| 1 | Chó |
| 2 | Mèo |
| 3 | Cá |
| 4 | Chim |
| 5 | Hamster |

### Orders

| ID | Trạng thái | Thanh toán | User |
|---|---|---|---|
| 1 | delivered | cod | user 2 |
| 2 | delivered | momo | user 3 |
| 3 | shipping | bank_transfer | user 4 |
| 4 | pending | cod | user 2 |
| 5 | delivered | vnpay | user 5 |

### Coupons

| Code | Loại | Giá trị | Điều kiện |
|---|---|---|---|
| `WELCOME10` | percent | -10% | Không giới hạn |
| `SALE50K` | fixed | -50.000đ | Đơn >= 200.000đ |
| `PETLOVER20` | percent | -20% | Đơn >= 300.000đ |
