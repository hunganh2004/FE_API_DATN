# API Reference — Cập nhật mới nhất

Base URL: `/api/v1`
Auth: `Authorization: Bearer <token>`

---

## Cập nhật: Filter theo ngày cho API đơn hàng

### GET /orders — [AUTH]
Danh sách đơn hàng của user hiện tại.

**Query Params**
| Param | Kiểu | Mô tả |
|---|---|---|
| `status` | string | `pending` \| `confirmed` \| `shipping` \| `delivered` \| `cancelled` |
| `date_from` | string (ISO 8601) | Lọc đơn hàng từ ngày (VD: `2025-01-01`) |
| `date_to` | string (ISO 8601) | Lọc đơn hàng đến ngày (VD: `2025-12-31`) |
| `page` | number | Trang (mặc định: 1) |
| `limit` | number | Số item/trang (mặc định: 10) |

> `date_to` tính đến cuối ngày (23:59:59). Có thể dùng một mình hoặc kết hợp cả hai.

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

### GET /admin/orders — [ADMIN]
Danh sách tất cả đơn hàng.

**Query Params**
| Param | Kiểu | Mô tả |
|---|---|---|
| `status` | string | Lọc theo trạng thái đơn |
| `payment_status` | string | `unpaid` \| `paid` |
| `date_from` | string (ISO 8601) | Lọc đơn hàng từ ngày (VD: `2025-01-01`) |
| `date_to` | string (ISO 8601) | Lọc đơn hàng đến ngày (VD: `2025-12-31`) |
| `page` | number | Trang |
| `limit` | number | Số item/trang (mặc định: 20) |

> `date_to` tính đến cuối ngày (23:59:59). Có thể dùng một mình hoặc kết hợp cả hai.

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

## Cập nhật: Báo cáo doanh thu theo năm

### GET /admin/stats/revenue — [ADMIN]
Thống kê doanh thu. Thêm `period=year` để xem tổng quan 12 tháng.

**Query Params**
| Param | Kiểu | Mô tả |
|---|---|---|
| `period` | string | `month` (mặc định) \| `week` \| `year` \| `all` |
| `year` | number | Năm cần xem (mặc định: năm hiện tại) |
| `month` | number | Tháng cần xem — dùng khi `period=month` |
| `week` | number | Số tuần trong năm — dùng khi `period=week` |

**Các mode:**
- `period=month` + `month=3` + `year=2025` → từng ngày trong tháng 3/2025
- `period=week` + `week=10` + `year=2025` → từng ngày trong tuần 10/2025
- `period=year` + `year=2025` → 12 tháng của năm 2025 (gộp theo tháng)
- `period=all` → tổng doanh thu toàn thời gian, gộp theo từng năm

**Response 200 — period=all**
```json
[
  { "year": 2024, "total_orders": 320, "revenue": 95000000 },
  { "year": 2025, "total_orders": 410, "revenue": 124000000 }
]
```

**Response 200 — period=year**
```json
[
  { "month": 1, "year": 2025, "total_orders": 42, "revenue": 12500000 },
  { "month": 2, "year": 2025, "total_orders": 38, "revenue": 10800000 },
  ...
]
```

**Response 200 — period=month hoặc period=week**
```json
[
  { "order_date": "2025-03-01", "order_month": 3, "order_year": 2025, "total_orders": 5, "revenue": 1500000 },
  ...
]
```

---

## Cập nhật: Hạn sử dụng sản phẩm tiêu hao

### Field mới trong Product

| Field | Kiểu | Mô tả |
|---|---|---|
| `expiry_date` | string (YYYY-MM-DD) \| null | Hạn sử dụng, chỉ áp dụng cho sản phẩm tiêu hao |
| `days_until_expiry` | number \| null | Số ngày còn lại đến hạn (tính realtime, không lưu DB) |
| `expiring_soon` | boolean | `true` nếu còn ≤ 30 ngày đến hạn |

> Sản phẩm đã hết hạn (`expiry_date < hôm nay`) sẽ **không xuất hiện** trong `GET /products` và `GET /products/:id`.

**Ví dụ response product:**
```json
{
  "pk_product_id": 1,
  "name": "Royal Canin Medium Adult 10kg",
  "is_consumable": 1,
  "expiry_date": "2025-08-01",
  "days_until_expiry": 25,
  "expiring_soon": true
}
```

---

### POST /products — [ADMIN]
### PUT /products/:id — [ADMIN]

Thêm field `expiry_date` vào body khi tạo/cập nhật sản phẩm tiêu hao:

```json
{
  "name": "Royal Canin Medium Adult 10kg",
  "is_consumable": true,
  "expiry_date": "2026-12-31"
}
```

> `expiry_date` không bắt buộc. Để `null` hoặc bỏ qua nếu sản phẩm không có hạn sử dụng.

---

### GET /admin/products/expiring — [ADMIN]

Lấy danh sách sản phẩm tiêu hao sắp hết hạn.

**Query Params**

| Param | Kiểu | Mô tả |
|---|---|---|
| `days` | number | Ngưỡng cảnh báo (mặc định: 30) |

**Response 200**
```json
[
  {
    "pk_product_id": 1,
    "name": "Royal Canin Medium Adult 10kg",
    "expiry_date": "2025-08-01",
    "days_until_expiry": 25,
    "stock": 50
  }
]
```

> Kết quả sắp xếp theo `expiry_date` tăng dần (sắp hết hạn nhất lên đầu).

---

## Cập nhật: Filter và sort theo hạn sử dụng

### GET /products — [OPT_AUTH]

Thêm 2 query param mới:

| Param | Kiểu | Mô tả |
|---|---|---|
| `is_consumable` | `0` \| `1` | Lọc sản phẩm tiêu hao (`1`) hoặc không tiêu hao (`0`) |
| `sort` | string | Thêm giá trị `expiry_date` vào các tùy chọn sort hiện có |

**Tất cả giá trị `sort` hiện hỗ trợ:**
`created_at` \| `price` \| `stock` \| `name` \| `avg_rating` \| `expiry_date`

**Ví dụ:**
```
GET /products?is_consumable=1                          — chỉ sản phẩm tiêu hao
GET /products?is_consumable=1&sort=expiry_date&order=ASC  — tiêu hao, hạn gần nhất lên đầu
GET /products?is_consumable=1&sort=expiry_date&order=DESC — tiêu hao, hạn xa nhất lên đầu
```

> Sản phẩm không có `expiry_date` (`null`) luôn xuống cuối khi `sort=expiry_date&order=ASC`.

---

## Thanh toán online — VNPay

### POST /payments/vnpay/create — [AUTH]

Tạo URL thanh toán VNPay. Gọi sau khi đã tạo đơn hàng với `payment_method: "vnpay"`.

**Request Body**
```json
{
  "order_id": 42
}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "pay_url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=..."
  }
}
```

> Redirect user đến `pay_url` để thực hiện thanh toán trên trang VNPay.
> API này dùng được cho cả lần thanh toán đầu tiên lẫn thanh toán lại khi thất bại (`payment_status: "failed"`).

**Lỗi có thể gặp**
| Status | Mô tả |
|---|---|
| 400 | Thiếu `order_id` / đơn đã thanh toán / đơn không dùng phương thức vnpay |
| 404 | Đơn hàng không tồn tại hoặc không thuộc về user |

---

### GET /payments/vnpay/callback — [PUBLIC]

VNPay tự động redirect user về endpoint này sau khi thanh toán. **FE không cần gọi trực tiếp.**

Server sẽ verify chữ ký, cập nhật trạng thái đơn hàng, rồi redirect tiếp về FE:

- Thành công → `{FRONTEND_URL}/payment/success?order_id=42`
- Thất bại → `{FRONTEND_URL}/payment/failed?order_id=42&code=<vnp_ResponseCode>`
- Chữ ký không hợp lệ → `{FRONTEND_URL}/payment/failed?reason=invalid_signature`

> FE cần tạo 2 trang `/payment/success` và `/payment/failed` để hiển thị kết quả cho user.

---

### GET /payments/vnpay/ipn — [PUBLIC]

Server-to-server notification từ VNPay. **FE không cần quan tâm endpoint này.**

Dùng để đảm bảo payment được xác nhận ngay cả khi user đóng browser trước khi callback về. Chỉ cần cấu hình trên VNPay merchant portal khi lên production.

---

### Flow tích hợp FE

```
1. User chọn "Thanh toán VNPay" → FE gọi POST /orders với payment_method: "vnpay"
2. Nhận order_id → FE gọi POST /payments/vnpay/create
3. Nhận pay_url → window.location.href = pay_url (redirect sang VNPay)
4. User thanh toán xong → VNPay redirect về /payment/success hoặc /payment/failed
5. FE đọc query param order_id và hiển thị kết quả
```

**Thẻ test sandbox (chỉ dùng khi test):**
| Field | Giá trị |
|---|---|
| Ngân hàng | NCB |
| Số thẻ | `9704198526191432198` |
| Tên chủ thẻ | `NGUYEN VAN A` |
| Ngày phát hành | `07/15` |
| OTP | `123456` |

---

## Thanh toán — Admin

### GET /admin/payments — [ADMIN]

Danh sách tất cả giao dịch thanh toán.

**Query Params**
| Param | Kiểu | Mô tả |
|---|---|---|
| `status` | string | `pending` \| `success` \| `failed` \| `refunded` |
| `method` | string | `cod` \| `bank_transfer` \| `momo` \| `vnpay` |
| `page` | number | Trang (mặc định: 1) |
| `limit` | number | Số item/trang (mặc định: 20) |

**Response 200**
```json
{
  "data": [
    {
      "pk_payment_id": 1,
      "method": "vnpay",
      "amount": "280000.00",
      "status": "success",
      "transaction_ref": "14123456",
      "paid_at": "2025-05-23T10:00:00.000Z",
      "order": {
        "pk_order_id": 42,
        "user": { "pk_user_id": 1, "full_name": "Nguyen Van A", "email": "user@example.com" }
      }
    }
  ],
  "pagination": { "total": 50, "page": 1, "limit": 20, "totalPages": 3 }
}
```

---

### GET /admin/payments/:id — [ADMIN]

Chi tiết một giao dịch thanh toán kèm thông tin đơn hàng và user.

**Response 200**
```json
{
  "pk_payment_id": 1,
  "method": "vnpay",
  "amount": "280000.00",
  "status": "success",
  "transaction_ref": "14123456",
  "paid_at": "2025-05-23T10:00:00.000Z",
  "order": {
    "pk_order_id": 42,
    "total": "280000.00",
    "user": { "pk_user_id": 1, "full_name": "Nguyen Van A", "email": "user@example.com", "phone": "0901234567" },
    "items": [...]
  }
}
```

---

### PATCH /admin/payments/:id/refund — [ADMIN]

Đánh dấu giao dịch là đã hoàn tiền. Gửi thông báo cho user.

> Lưu ý: Đây là cập nhật trạng thái trong DB, không tự động gọi API hoàn tiền VNPay. Việc hoàn tiền thực tế cần thực hiện thủ công trên cổng VNPay merchant.

**Điều kiện:**
- Payment phải có `status: "success"`
- Không áp dụng cho `method: "cod"`

**Response 200**
```json
{ "success": true, "message": "Đã cập nhật trạng thái hoàn tiền" }
```

**Lỗi có thể gặp**
| Status | Mô tả |
|---|---|
| 400 | Giao dịch chưa thành công hoặc là COD |
| 404 | Không tìm thấy giao dịch |

---

## Cập nhật: Quản lý khách hàng (Admin)

### GET /admin/users — [ADMIN]

Tìm kiếm khách hàng. Đã mở rộng thêm tìm theo số điện thoại.

**Query Params**
| Param | Kiểu | Mô tả |
|---|---|---|
| `q` | string | Tìm theo tên, email hoặc số điện thoại |
| `page` | number | Trang (mặc định: 1) |
| `limit` | number | Số item/trang (mặc định: 20) |

---

### GET /admin/users/:id — [ADMIN]

Thông tin chi tiết khách hàng kèm thống kê và sản phẩm hay mua nhất.

**Response 200**
```json
{
  "user": {
    "pk_user_id": 1,
    "full_name": "Nguyen Van A",
    "email": "user@example.com",
    "phone": "0901234567",
    "avatar_url": null,
    "is_active": 1,
    "created_at": "2025-01-01T00:00:00.000Z",
    "addresses": [...],
    "segments": [{ "pk_segment_id": 1, "name": "VIP" }]
  },
  "stats": {
    "total_orders": 12,
    "total_spent": "3600000.00",
    "cancelled_orders": 1,
    "last_order_at": "2025-05-20T10:00:00.000Z"
  },
  "top_products": [
    { "pk_product_id": 5, "name": "Royal Canin Medium Adult", "total_bought": 4 }
  ]
}
```

---

### GET /admin/users/:id/orders — [ADMIN]

Lịch sử đơn hàng của một khách hàng, có phân trang và filter.

**Query Params**
| Param | Kiểu | Mô tả |
|---|---|---|
| `status` | string | Lọc theo `order_status` |
| `payment_status` | string | `pending` \| `paid` \| `failed` \| `refunded` |
| `page` | number | Trang (mặc định: 1) |
| `limit` | number | Số item/trang (mặc định: 10) |

**Response 200**
```json
{
  "data": [
    {
      "pk_order_id": 42,
      "order_status": "delivered",
      "payment_status": "paid",
      "total": "280000.00",
      "created_at": "2025-05-20T10:00:00.000Z",
      "items": [...],
      "payment": { "method": "vnpay", "status": "success", "transaction_ref": "14123456" }
    }
  ],
  "pagination": { "total": 12, "page": 1, "limit": 10, "totalPages": 2 }
}
```

