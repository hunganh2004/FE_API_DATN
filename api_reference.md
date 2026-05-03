# API Reference

Base URL: `/api/v1`
Auth: `Authorization: Bearer <token>`
JWT expiry: `7d` (không có refresh token)

---

## Ưu tiên 1 — Nền tảng

### POST /auth/register
Đăng ký tài khoản mới.

**Request Body**
```json
{
  "full_name": "Nguyen Van A",
  "email": "user@example.com",
  "password": "123456",
  "phone": "0901234567"
}
```
**Response 201**
```json
{
  "token": "<jwt>",
  "user": { "id": 1, "full_name": "Nguyen Van A", "email": "user@example.com", "phone": "0901234567", "avatar_url": null, "role": "customer" }
}
```

---

### POST /auth/login
**Request Body**
```json
{ "email": "user@example.com", "password": "123456" }
```
**Response 200**
```json
{
  "token": "<jwt>",
  "user": { "id": 1, "full_name": "Nguyen Van A", "email": "user@example.com", "role": "customer" }
}
```

---

### GET /auth/me — [AUTH]
Lấy thông tin user đang đăng nhập.

**Response 200**
```json
{ "id": 1, "full_name": "Nguyen Van A", "email": "user@example.com", "role": "customer" }
```

---

### POST /auth/change-password — [AUTH]
**Request Body**
```json
{ "old_password": "123456", "new_password": "newpass123" }
```
**Response 200** `{ "message": "Đổi mật khẩu thành công" }`

---

### POST /auth/forgot-password
Gửi email đặt lại mật khẩu. Luôn trả 200 dù email có tồn tại hay không.

**Request Body**
```json
{ "email": "user@example.com" }
```
**Response 200** `{ "message": "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu" }`

---

### POST /auth/reset-password
Đặt lại mật khẩu bằng token nhận qua email. Token có hiệu lực 15 phút.

**Request Body**
```json
{ "token": "<reset_token>", "new_password": "newpass123" }
```
**Response 200** `{ "message": "Đặt lại mật khẩu thành công" }`

**Response 400** nếu token không hợp lệ hoặc hết hạn.

---

### GET /products
Danh sách sản phẩm, hỗ trợ lọc và phân trang.

**Query Params**
| Param | Kiểu | Mô tả |
|---|---|---|
| `q` | string | Tìm theo tên |
| `category_id` | number | Lọc theo danh mục |
| `pet_type_id` | number | Lọc theo loại thú cưng |
| `price_min` | number | Giá tối thiểu |
| `price_max` | number | Giá tối đa |
| `stock_min` | number | Tồn kho tối thiểu |
| `stock_max` | number | Tồn kho tối đa |
| `in_stock` | boolean | `true` = còn hàng (stock > 0), `false` = hết hàng |
| `sort` | string | Field sắp xếp (mặc định: `created_at`) |
| `order` | string | `ASC` hoặc `DESC` (mặc định: `DESC`) |
| `page` | number | Trang (mặc định: 1) |
| `limit` | number | Số item/trang (mặc định: 20) |

**Response 200**
```json
{
  "data": [
    {
      "pk_product_id": 1, "name": "Thức ăn cho chó", "slug": "thuc-an-cho-cho",
      "price": 150000, "sale_price": 120000, "stock": 50,
      "category": { "pk_category_id": 2, "name": "Thức ăn", "slug": "thuc-an" },
      "images": [{ "image_url": "/uploads/products/...", "is_primary": 1 }]
    }
  ],
  "pagination": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 }
}
```

---

### GET /products/:id
Chi tiết sản phẩm kèm variants, ảnh, specs, reviews.

**Response 200**
```json
{
  "pk_product_id": 1, "name": "Thức ăn cho chó", "description": "...",
  "price": 150000, "sale_price": 120000, "stock": 50,
  "category": { "pk_category_id": 2, "name": "Thức ăn" },
  "petTypes": [{ "pk_pet_type_id": 1, "name": "Chó" }],
  "variants": [{ "pk_variant_id": 1, "name": "1kg", "price": 150000, "stock": 30 }],
  "images": [{ "pk_image_id": 1, "image_url": "...", "is_primary": 1 }],
  "specs": [{ "spec_key": "Trọng lượng", "spec_value": "1kg" }],
  "reviews": [{ "pk_review_id": 1, "rating": 5, "comment": "Tốt", "user": { "full_name": "Nguyen Van A" } }]
}
```

---

### POST /products — [ADMIN]
Tạo sản phẩm mới.

**Request Body**
```json
{
  "name": "Thức ăn cho chó",
  "description": "Mô tả sản phẩm",
  "price": 150000,
  "sale_price": 120000,
  "stock": 50,
  "fk_category_id": 2,
  "pet_type_ids": [1, 2]
}
```
**Response 201** — object sản phẩm vừa tạo.

---

### PUT /products/:id — [ADMIN]
Cập nhật sản phẩm. Body tương tự POST, tất cả field đều optional.

**Response 200** — object sản phẩm sau khi cập nhật.

---

### DELETE /products/:id — [ADMIN]
Soft delete (đánh dấu `is_active = 0`).

**Response 200** `{ "message": "Xoá sản phẩm thành công" }`

---

### GET /products/:id/variants
**Response 200** — mảng variants của sản phẩm.

---

### POST /products/:id/variants — [ADMIN]
**Request Body**
```json
{ "name": "1kg", "price": 150000, "sale_price": 120000, "stock": 30, "sku": "DOG-1KG" }
```
**Response 201** — object variant vừa tạo.

---

### PUT /products/:id/variants/:variantId — [ADMIN]
Cập nhật variant. Body tương tự POST.

---

### DELETE /products/:id/variants/:variantId — [ADMIN]
**Response 200** `{ "message": "Xoá biến thể thành công" }`

---

### POST /products/:id/images — [ADMIN]
**Request Body**
```json
{ "image_url": "/uploads/products/...", "is_primary": 0 }
```
**Response 201** — object image vừa tạo.

---

### PATCH /products/:id/images/:imageId/primary — [ADMIN]
Đặt ảnh này làm ảnh chính. Tự động bỏ `is_primary` của các ảnh còn lại.

**Response 200** `{ "message": "Đã đặt ảnh chính thành công" }`

---

### DELETE /products/:id/images/:imageId — [ADMIN]
Xóa record trong DB và xóa luôn file vật lý khỏi server.

**Response 200** `{ "message": "Xoá hình ảnh thành công" }`

---

### GET /categories
Danh sách danh mục dạng cây cha–con.

**Response 200**
```json
[
  {
    "pk_category_id": 1, "name": "Thức ăn", "slug": "thuc-an", "image_url": "...", "sort_order": 1,
    "children": [{ "pk_category_id": 3, "name": "Thức ăn khô", "slug": "thuc-an-kho" }]
  }
]
```

---

### GET /categories/:id
**Response 200** — object danh mục kèm `children`.

---

### POST /categories — [ADMIN]
**Request Body**
```json
{ "name": "Thức ăn", "fk_parent_id": null, "description": "...", "image_url": "...", "sort_order": 1 }
```
**Response 201** — object danh mục vừa tạo.

---

### PUT /categories/:id — [ADMIN]
**Request Body** (tất cả optional)
```json
{ "name": "Tên mới", "description": "...", "image_url": "...", "sort_order": 2, "is_active": 1 }
```
**Response 200** — object danh mục sau khi cập nhật.

---

### DELETE /categories/:id — [ADMIN]
Không thể xóa nếu còn sản phẩm thuộc danh mục.

**Response 200** `{ "message": "Xoá danh mục thành công" }`

---

### GET /pet-types
**Response 200** — mảng tất cả loại thú cưng.

---

### POST /pet-types — [ADMIN]
**Request Body** `{ "name": "Chó", "icon_url": "..." }`
**Response 201** — object vừa tạo.

---

### PUT /pet-types/:id — [ADMIN]
**Response 200** — object sau khi cập nhật.

---

### DELETE /pet-types/:id — [ADMIN]
**Response 200** `{ "message": "Xoá thành công" }`

---

## Ưu tiên 2 — Nghiệp vụ chính

### GET /users/profile — [AUTH]
**Response 200**
```json
{ "id": 1, "full_name": "Nguyen Van A", "email": "user@example.com", "phone": "0901234567", "avatar_url": null, "role": "customer", "created_at": "..." }
```

---

### PUT /users/profile — [AUTH]
**Request Body** (tất cả optional)
```json
{ "full_name": "Tên mới", "phone": "0909999999", "avatar_url": "/uploads/avatars/..." }
```
Nếu `avatar_url` thay đổi, file avatar cũ sẽ bị xóa khỏi server.

**Response 200** `{ "message": "Cập nhật thông tin thành công" }`

---

### GET /users/addresses — [AUTH]
**Response 200** — mảng địa chỉ của user.

---

### POST /users/addresses — [AUTH]
**Request Body**
```json
{ "receiver": "Nguyen Van A", "phone": "0901234567", "province": "TP.HCM", "commune": "Phường 1", "street": "123 Đường ABC", "is_default": true }
```
**Response 201** — object địa chỉ vừa tạo.

---

### PUT /users/addresses/:id — [AUTH]
Body tương tự POST (không có `is_default`).

---

### DELETE /users/addresses/:id — [AUTH]
**Response 200** `{ "message": "Xoá địa chỉ thành công" }`

---

### PATCH /users/addresses/:id/default — [AUTH]
**Response 200** `{ "message": "Đặt địa chỉ mặc định thành công" }`

---

### GET /cart — [AUTH]
**Response 200**
```json
[
  {
    "pk_cart_item_id": 1, "quantity": 2,
    "product": { "pk_product_id": 1, "name": "Thức ăn cho chó", "price": 150000, "images": [...] },
    "variant": { "pk_variant_id": 1, "name": "1kg", "price": 150000 }
  }
]
```

---

### POST /cart — [AUTH]
**Request Body**
```json
{ "product_id": 1, "variant_id": 1, "quantity": 2 }
```
`variant_id` là optional. **Response 200/201** — object cart item.

---

### PUT /cart/:itemId — [AUTH]
**Request Body** `{ "quantity": 3 }` — nếu `quantity <= 0` thì tự động xóa item.

---

### DELETE /cart/:itemId — [AUTH]
**Response 200** `{ "message": "Đã xoá sản phẩm khỏi giỏ hàng" }`

---

### DELETE /cart — [AUTH]
Xóa toàn bộ giỏ hàng.

**Response 200** `{ "message": "Đã xoá toàn bộ giỏ hàng" }`

---

### POST /orders — [AUTH]
Tạo đơn hàng từ toàn bộ giỏ hàng hiện tại.

**Request Body**
```json
{
  "receiver": "Nguyen Van A",
  "phone": "0901234567",
  "shipping_address": "123 Đường ABC, Quận 1, TP.HCM",
  "payment_method": "cod",
  "coupon_code": "SALE10",
  "note": "Giao giờ hành chính"
}
```
`payment_method`: `cod` | `momo` | `vnpay`

**Response 201**
```json
{ "order_id": 42, "total": 280000 }
```

---

### GET /orders — [AUTH]
Danh sách đơn hàng của user hiện tại.

**Query Params**
| Param | Kiểu | Mô tả |
|---|---|---|
| `status` | string | `pending` \| `confirmed` \| `shipping` \| `delivered` \| `cancelled` |
| `page` | number | Trang (mặc định: 1) |
| `limit` | number | Số item/trang (mặc định: 10) |

**Response 200**
```json
{
  "data": [
    { "pk_order_id": 42, "order_status": "pending", "payment_status": "unpaid", "total": 280000, "created_at": "...", "items": [...] }
  ],
  "pagination": { "total": 5, "page": 1, "limit": 10, "totalPages": 1 }
}
```

---

### GET /orders/:id — [AUTH]
Chi tiết đơn hàng kèm items, payment, status logs, coupon.

---

### PATCH /orders/:id/cancel — [AUTH]
Chỉ hủy được khi status là `pending` hoặc `confirmed`. Tự động hoàn lại tồn kho.

**Response 200** `{ "message": "Huỷ đơn hàng thành công" }`

---

### GET /admin/orders — [ADMIN]
Danh sách tất cả đơn hàng.

**Query Params**
| Param | Kiểu | Mô tả |
|---|---|---|
| `status` | string | Lọc theo trạng thái đơn |
| `payment_status` | string | `unpaid` \| `paid` |
| `page` | number | Trang |
| `limit` | number | Số item/trang (mặc định: 20) |

**Response 200**
```json
{
  "data": [
    {
      "pk_order_id": 42, "order_status": "pending", "total": 280000,
      "user": { "pk_user_id": 1, "full_name": "Nguyen Van A", "email": "user@example.com", "phone": "0901234567" },
      "items": [...]
    }
  ],
  "pagination": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 }
}
```

---

### GET /admin/orders/:id — [ADMIN]
Chi tiết đơn hàng kèm user, items, payment, status logs.

---

### PATCH /admin/orders/:id/status — [ADMIN]
**Request Body**
```json
{ "status": "confirmed", "note": "Đã xác nhận đơn" }
```
`status`: `pending` | `confirmed` | `shipping` | `delivered` | `cancelled`

**Response 200** `{ "message": "Cập nhật trạng thái thành công" }`

---

### GET /admin/users — [ADMIN]
**Query Params**
| Param | Kiểu | Mô tả |
|---|---|---|
| `q` | string | Tìm theo tên hoặc email |
| `page` | number | Trang |
| `limit` | number | Số item/trang (mặc định: 20) |

**Response 200**
```json
{
  "data": [
    { "pk_user_id": 1, "full_name": "Nguyen Van A", "email": "user@example.com", "phone": "0901234567", "is_active": 1, "created_at": "..." }
  ],
  "pagination": { "total": 50, "page": 1, "limit": 20, "totalPages": 3 }
}
```

---

### GET /admin/users/:id — [ADMIN]
**Response 200**
```json
{
  "user": { "pk_user_id": 1, "full_name": "Nguyen Van A", "email": "...", "is_active": 1 },
  "recent_orders": [...]
}
```

---

### PATCH /admin/users/:id/toggle-active — [ADMIN]
**Response 200** `{ "message": "Đã khoá tài khoản" }` hoặc `"Đã mở khoá tài khoản"`

---

### GET /admin/payments — [ADMIN]
Danh sách tất cả giao dịch thanh toán.

**Query Params**
| Param | Kiểu | Mô tả |
|---|---|---|
| `status` | string | `pending` \| `success` \| `failed` \| `refunded` |
| `method` | string | `cod` \| `bank_transfer` \| `momo` \| `vnpay` |
| `page` | number | Trang |
| `limit` | number | Số item/trang (mặc định: 20) |

**Response 200**
```json
{
  "data": [
    {
      "pk_payment_id": 1, "method": "momo", "amount": 280000, "status": "success",
      "transaction_ref": "MOMO123456", "paid_at": "2026-04-21T10:00:00Z",
      "order": { "pk_order_id": 42, "user": { "full_name": "Nguyen Van A", "email": "..." } }
    }
  ],
  "pagination": { "total": 200, "page": 1, "limit": 20, "totalPages": 10 }
}
```

---

### POST /payments/callback/momo
Callback từ MoMo (server-to-server).

**Request Body**
```json
{ "orderId": 42, "resultCode": 0, "transId": "MOMO123456" }
```
`resultCode`: `0` = thành công. **Response 200** `{ "message": "OK" }`

---

### POST /payments/callback/vnpay
Callback từ VNPay (query string redirect).

**Query Params**: `vnp_TxnRef` (order ID), `vnp_ResponseCode` (`00` = thành công), `vnp_TransactionNo`

Redirect về `/payment/success` hoặc `/payment/failed`.

---

## Ưu tiên 3 — Tính năng bổ trợ

### GET /coupons — [ADMIN]
**Response 200**
```json
[
  {
    "pk_coupon_id": 1, "code": "SALE10", "discount_type": "percent", "discount_value": 10,
    "min_order": 100000, "max_uses": 100, "used_count": 5,
    "starts_at": "2026-01-01T00:00:00Z", "expires_at": "2026-12-31T23:59:59Z", "is_active": 1
  }
]
```

---

### POST /coupons — [ADMIN]
**Request Body**
```json
{
  "code": "SALE10", "discount_type": "percent", "discount_value": 10,
  "min_order": 100000, "max_uses": 100,
  "starts_at": "2026-01-01T00:00:00Z", "expires_at": "2026-12-31T23:59:59Z"
}
```
`discount_type`: `percent` | `fixed`. **Response 201** — object coupon vừa tạo.

---

### PUT /coupons/:id — [ADMIN]
Cập nhật coupon. Body tương tự POST, tất cả field optional.

**Response 200** — object coupon sau khi cập nhật.

---

### DELETE /coupons/:id — [ADMIN]
**Response 200** `{ "message": "Xoá mã giảm giá thành công" }`

---

### POST /coupons/validate — [AUTH]
Kiểm tra mã giảm giá hợp lệ.

**Request Body**
```json
{ "code": "SALE10", "order_total": 200000 }
```
**Response 200**
```json
{ "coupon_id": 1, "discount_amount": 20000 }
```

---

### GET /reviews/product/:productId
Danh sách đánh giá theo sản phẩm.

**Query Params**: `page` (mặc định: 1), `limit` (mặc định: 10)

**Response 200**
```json
{
  "data": [
    {
      "pk_review_id": 1, "rating": 5, "comment": "Sản phẩm rất tốt", "created_at": "...",
      "user": { "pk_user_id": 1, "full_name": "Nguyen Van A", "avatar_url": null },
      "replies": []
    }
  ],
  "pagination": { "total": 20, "page": 1, "limit": 10, "totalPages": 2 }
}
```

---

### POST /reviews/product/:productId — [AUTH]
Tạo đánh giá hoặc reply. Chỉ user đã mua và nhận sản phẩm (`order_status: delivered`) mới được tạo review gốc. Reply thì không cần điều kiện này.

**Request Body**
```json
{ "rating": 5, "comment": "Sản phẩm rất tốt", "fk_parent_id": null }
```
`fk_parent_id`: để `null` nếu là review gốc, truyền ID review cha nếu là reply (rating sẽ bị bỏ qua).

**Response 403** nếu chưa mua sản phẩm.

**Response 201** — object review vừa tạo.

---

### DELETE /reviews/:id — [AUTH]
User chỉ xóa được review của mình. Admin xóa được tất cả.
Nếu xóa review gốc thì toàn bộ replies cũng bị xóa theo. Xóa reply thì chỉ xóa reply đó.

**Response 200** `{ "message": "Xoá đánh giá thành công" }`

---

### GET /admin/reviews — [ADMIN]
Danh sách tất cả reviews để kiểm duyệt.

**Query Params**
| Param | Kiểu | Mô tả |
|---|---|---|
| `product_id` | number | Lọc theo sản phẩm |
| `rating` | number | Lọc theo số sao (1–5) |
| `replied` | boolean | `false` = chỉ lấy review chưa có reply |
| `page` | number | Trang |
| `limit` | number | Số item/trang (mặc định: 20) |

**Response 200**
```json
{
  "data": [
    {
      "pk_review_id": 1, "rating": 1, "comment": "...", "created_at": "...",
      "user": { "pk_user_id": 2, "full_name": "Nguyen Van B", "email": "b@example.com" },
      "product": { "pk_product_id": 1, "name": "Thức ăn cho chó" },
      "replies": []
    }
  ],
  "pagination": { "total": 50, "page": 1, "limit": 20, "totalPages": 3 }
}
```

---

### DELETE /admin/reviews/:id — [ADMIN]
Xóa review vi phạm.

**Response 200** `{ "message": "Xoá đánh giá thành công" }`

---

### POST /admin/reviews/:id/reply — [ADMIN]
Phản hồi review từ phía admin/shop.

**Request Body**
```json
{ "comment": "Cảm ơn bạn đã phản hồi, chúng tôi sẽ cải thiện sản phẩm." }
```
**Response 201** — object reply vừa tạo.

---

### GET /notifications — [AUTH]
Danh sách thông báo của user (tối đa 50, mới nhất trước).

**Response 200**
```json
[
  {
    "pk_notif_id": 1, "type": "order_update", "title": "Đặt hàng thành công",
    "message": "Đơn hàng #42 đã được tạo thành công.", "is_read": 0, "ref_id": 42, "created_at": "..."
  }
]
```
`type`: `order_update` | `repurchase_reminder` | `promotion` | `system`

---

### GET /notifications/unread-count — [AUTH]
Lấy số lượng thông báo chưa đọc (dùng để hiển thị badge).

**Response 200**
```json
{ "unread_count": 3 }
```

---

### PATCH /notifications/:id/read — [AUTH]
**Response 200** `{ "message": "Đã đánh dấu đã đọc" }`

---

### PATCH /notifications/read-all — [AUTH]
**Response 200** `{ "message": "Đã đánh dấu tất cả là đã đọc" }`

---

### DELETE /notifications/:id — [AUTH]
Xóa một thông báo. User chỉ xóa được thông báo của mình.

**Response 200** `{ "message": "Đã xoá thông báo" }`

---

### GET /admin/notifications — [ADMIN]
Danh sách tất cả thông báo, hỗ trợ lọc và phân trang.

**Query Params**
| Param | Kiểu | Mô tả |
|---|---|---|
| `user_id` | number | Lọc theo user |
| `type` | string | `order_update` \| `repurchase_reminder` \| `promotion` \| `system` |
| `is_read` | boolean | `true` = đã đọc, `false` = chưa đọc |
| `page` | number | Trang (mặc định: 1) |
| `limit` | number | Số item/trang (mặc định: 20) |

**Response 200**
```json
{
  "data": [
    {
      "pk_notif_id": 1, "type": "order_update", "title": "Đặt hàng thành công",
      "message": "Đơn hàng #42 đã được tạo thành công.", "is_read": 0, "ref_id": 42, "created_at": "...",
      "user": { "pk_user_id": 1, "full_name": "Nguyen Van A", "email": "user@example.com" }
    }
  ],
  "pagination": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 }
}
```

---

### DELETE /admin/notifications/:id — [ADMIN]
Xóa một thông báo bất kỳ (không giới hạn theo user).

**Response 200** `{ "message": "Xoá thông báo thành công" }`

---

### POST /admin/notifications — [ADMIN]
Tạo thông báo broadcast gửi đến tất cả user hoặc một user cụ thể.

**Request Body**
```json
{
  "user_id": null,
  "type": "promotion",
  "title": "Khuyến mãi tháng 5",
  "message": "Giảm 20% toàn bộ sản phẩm từ 01/05 đến 31/05.",
  "ref_id": null
}
```
`user_id`: để `null` để gửi cho tất cả user. Truyền ID cụ thể để gửi cho 1 user.
`type`: `promotion` | `system`

**Response 201** `{ "message": "Đã gửi thông báo thành công" }`

---

### GET /wishlist — [AUTH]
**Response 200** — mảng sản phẩm trong wishlist kèm ảnh chính.

---

### POST /wishlist/:productId — [AUTH]
**Response 200/201** `{ "message": "Đã thêm vào danh sách yêu thích" }`

---

### DELETE /wishlist/:productId — [AUTH]
**Response 200** `{ "message": "Đã xoá khỏi danh sách yêu thích" }`

---

### POST /behavior
Ghi log hành vi người dùng. Auth tùy chọn.

**Request Body**
```json
{
  "session_id": "sess_abc123",
  "product_id": 1,
  "action": "view_product",
  "search_query": null,
  "duration_sec": 30
}
```
`action`: `view_product` | `add_to_cart` | `search` | ...

**Response 200** `{ "message": "Ghi log thành công" }`

---

### POST /upload — [AUTH]
Upload 1 file. Chấp nhận: `jpeg`, `png`, `webp`, `gif`. Tối đa 5MB.

**Query Params**: `folder` — `products` | `categories` | `avatars` | `misc` (mặc định: `misc`). Hỗ trợ subfolder dạng `products/1`.

**Request**: `multipart/form-data`, field name **`image`**

**Response 200** `{ "url": "/uploads/misc/..." }`

---

### POST /upload/multiple — [AUTH]
Upload nhiều file (tối đa 10). Chấp nhận: `jpeg`, `png`, `webp`, `gif`. Tối đa 5MB/file.

**Query Params**: `folder` — tương tự POST /upload.

**Request**: `multipart/form-data`, field name **`images`**

**Response 200** `{ "urls": ["/uploads/misc/...", ...] }`

---

### GET /admin/stats/revenue — [ADMIN]
Doanh thu theo năm hoặc theo tuần cụ thể trong năm.

**Query Params**
| Param | Kiểu | Mô tả |
|---|---|---|
| `year` | number | Năm (mặc định: năm hiện tại) |
| `week` | number | Số tuần trong năm (1–53). Nếu truyền thì trả về từng ngày trong tuần đó |

**Response 200**
```json
[
  { "order_date": "2026-04-21", "order_month": 4, "order_year": 2026, "total_orders": 12, "revenue": 3600000 }
]
```

---

### GET /admin/stats/top-products — [ADMIN]
Top 20 sản phẩm bán chạy nhất, hỗ trợ lọc theo khoảng thời gian.

**Query Params**
| Param | Kiểu | Mô tả |
|---|---|---|
| `period` | string | `all` (mặc định) \| `year` \| `month` \| `week` |
| `year` | number | Năm (dùng với `period=year/month/week`, mặc định: năm hiện tại) |
| `month` | number | Tháng 1–12 (dùng với `period=month`) |
| `week` | number | Số tuần 1–53 (dùng với `period=week`) |

**Response 200**
```json
[
  { "pk_product_id": 1, "name": "Thức ăn cho chó", "price": 150000, "total_sold": 200, "revenue": 24000000, "avg_rating": 4.5 }
]
```

---

### GET /admin/stats/behavior — [ADMIN]
Thống kê hành vi người dùng theo loại action, hỗ trợ lọc theo thời gian.

**Query Params**
| Param | Kiểu | Mô tả |
|---|---|---|
| `period` | string | `all` (mặc định) \| `year` \| `month` \| `week` |
| `year` | number | Năm (mặc định: năm hiện tại) |
| `month` | number | Tháng 1–12 (dùng với `period=month`) |
| `week` | number | Số tuần 1–53 (dùng với `period=week`) |

`action`: `view` | `search` | `add_to_cart` | `remove_from_cart` | `purchase` | `wishlist`

**Response 200**
```json
[
  { "action": "view", "count": 1500 },
  { "action": "add_to_cart", "count": 320 }
]
```

---

## Ưu tiên 4 — AI (phụ thuộc vào dữ liệu thực)

> Tất cả endpoint AI đều có fallback: nếu AI Service offline, hệ thống tự động trả về dữ liệu dự phòng từ DB.

---

### GET /recommendations/homepage — [AUTH]
Gợi ý sản phẩm trang chủ qua collaborative filtering.
Fallback: 10 sản phẩm mới nhất.

**Response 200** — mảng sản phẩm kèm ảnh chính.

---

### GET /recommendations/product/:productId
Gợi ý sản phẩm mua kèm qua association rules. Auth tùy chọn.
Fallback: 10 sản phẩm mới nhất.

**Response 200** — mảng sản phẩm kèm ảnh chính.

---

### GET /recommendations/repurchase — [AUTH]
Dự đoán sản phẩm tiêu hao cần mua lại. Tự động tạo notification nếu chưa có.
Fallback: `[]`

**Query Params**: `days_ahead` — số ngày dự báo trước (mặc định: 7)

**Response 200**
```json
[
  { "product_id": 3, "product_name": "Thức ăn hạt cho mèo", "predicted_date": "2026-04-28", "confidence": 0.87 }
]
```

---

### GET /admin/stats/customer-segments — [ADMIN]
Phân cụm khách hàng (K-Means). Ưu tiên lấy từ AI Service realtime, fallback về DB.

**Response 200**
```json
[
  { "segment_name": "VIP", "user_count": 45, "avg_order_value": 850000, "description": "Khách hàng chi tiêu cao, mua thường xuyên" }
]
```

---

### GET /admin/ai/health — [ADMIN]
**Response 200** `{ "ai_service": "online" }` hoặc `"offline"`

---

### POST /admin/ai/train/all — [ADMIN]
Kích hoạt huấn luyện lại toàn bộ mô hình AI.

**Response 200** `{ "message": "Đã bắt đầu huấn luyện tất cả mô hình" }`

---

### POST /admin/ai/train/:model — [ADMIN]
Huấn luyện một mô hình cụ thể.

**Path Param** — `model`: `association` | `collaborative` | `clustering` | `repurchase`

**Response 200** `{ "message": "Đã huấn luyện mô hình association" }`
