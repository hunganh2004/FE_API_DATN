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
