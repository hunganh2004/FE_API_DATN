# API Reference — Nhắc mua lại sản phẩm (Repurchase Prediction)

Base URL: `/api/v1`
Auth: `Authorization: Bearer <token>`

---

## GET /recommendations/repurchase — [AUTH]

Lấy danh sách sản phẩm tiêu hao mà user cần mua lại trong thời gian tới, dựa trên mô hình AI dự đoán chu kỳ mua.

**Query Params**
| Param | Kiểu | Mô tả |
|---|---|---|
| `days_ahead` | number | Số ngày tới cần kiểm tra (1–30, mặc định: 7) |

**Response 200**
```json
[
  {
    "product_id": 1,
    "product_name": "Royal Canin Medium Adult 10kg",
    "predicted_date": "2025-03-25",
    "confidence": 0.82,
    "date_source": "ai"
  }
]
```

> `predicted_date`: ngày dự kiến cần mua lại — lấy ngày sớm hơn giữa AI prediction và `expiry_date` của sản phẩm.
> `date_source`: `"ai"` nếu lấy từ AI prediction, `"expiry_date"` nếu hạn sử dụng sản phẩm đến trước.
> `confidence`: độ tin cậy dự đoán, nằm trong khoảng [0.3, 0.95].

> Mỗi lần gọi API này, hệ thống tự động tạo thông báo (`type: "repurchase_reminder"`) và gửi email nhắc nhở cho user nếu chưa từng nhắc sản phẩm đó trước đây.

**Chỉ áp dụng cho:**
- Sản phẩm có `is_consumable = 1`
- User đã mua cùng một sản phẩm ít nhất 2 lần

---

## POST /admin/ai/train/repurchase — [ADMIN]

Train lại thủ công model dự đoán mua lại.

**Response 200**
```json
{
  "model": "repurchase",
  "mae_days": 4.2,
  "r2_score": 0.78,
  "n_samples": 312
}
```

> `mae_days`: sai số trung bình tuyệt đối (ngày) — càng nhỏ càng tốt.
> `r2_score`: hệ số xác định — càng gần 1 càng tốt.
> `n_samples`: số mẫu dùng để huấn luyện.

---

## Lịch tự động (background)

| Tác vụ | Thời gian |
|---|---|
| Train lại model repurchase | Mỗi ngày lúc 2:00 AM |
| Gửi thông báo nhắc mua lại | Mỗi ngày lúc 8:00 AM |

> Ngưỡng mặc định: nhắc trước **3 ngày** so với `predicted_date`.
> Thông báo được insert vào `tbl_notifications` với `type = 'repurchase_reminder'`.
> Mỗi prediction chỉ tạo thông báo **một lần**.

---

## Thuật toán

- **Model:** Random Forest Regressor
- **Target:** số ngày đến lần mua tiếp theo (`days_between`)
- **Features:**
  - `quantity` — số lượng mua trong đơn
  - `weight_gram` — khối lượng sản phẩm
  - `product_id_enc` — product ID đã encode
  - `avg_days_between` — chu kỳ mua lại trung bình thực tế của user với sản phẩm đó

---

## GET /recommendations/homepage — [AUTH]

Gợi ý sản phẩm trang chủ dựa trên collaborative filtering (TruncatedSVD).

**Query Params:** không có

**Response 200**
```json
[
  { "pk_product_id": 15, "name": "...", "price": 150000, "images": [...] },
  { "pk_product_id": 23, "name": "...", "price": 85000,  "images": [...] }
]
```

> Trả về mảng product objects đầy đủ (đã hydrate từ DB), giữ đúng thứ tự score từ AI.
> Fallback về **trending** (xem + mua nhiều nhất 30 ngày) nếu AI offline hoặc không có kết quả.

**Cơ chế fallback theo thứ tự:**
1. AI trả về `rec_type: "collaborative"` → dùng kết quả SVD
2. AI trả về `rec_type: "trending"` (cold start, user < 5 tương tác) → dùng kết quả trending từ AI
3. AI offline / lỗi → Node.js tự tính trending từ `tbl_user_behavior_logs` (30 ngày)
4. Chưa đủ behavior data (< 5 sản phẩm) → sản phẩm mới nhất

**Điểm tương tác (AI tính):**

| Hành vi | Điểm |
|---|---|
| `purchase` | +5 |
| `add_to_cart` | +3 |
| `wishlist` | +2 |
| `view` | +1 |
| `remove_from_cart` | -1 |

---

## POST /admin/ai/train/collaborative — [ADMIN]

Train lại thủ công model collaborative filtering.

**Response 200**
```json
{
  "model": "collaborative",
  "rmse": 0.842,
  "n_components": 50,
  "n_users": 200,
  "n_products": 100
}
```

> `rmse`: sai số — càng thấp càng tốt.
> `n_components`: số chiều latent factor của SVD.

**Lịch tự động:** train lại mỗi 6 giờ.

---

## GET /recommendations/product/:productId — [OPT_AUTH]

Gợi ý sản phẩm thường mua kèm dựa trên association rules (FP-Growth).

**Response 200**
```json
[
  { "pk_product_id": 3, "name": "...", "price": 65000, "images": [...] },
  { "pk_product_id": 7, "name": "...", "price": 45000, "images": [...] }
]
```

> Trả về mảng product objects đầy đủ, sắp xếp theo `lift DESC` rồi `confidence DESC`.
> Trả về trending nếu AI offline hoặc sản phẩm chưa có rule nào.
> Không cần đăng nhập — khách vãng lai cũng nhận được gợi ý.

---

## POST /admin/ai/train/association — [ADMIN]

Train lại thủ công model association rules.

**Response 200**
```json
{
  "model": "association",
  "rules_saved": 124
}
```

> `rules_saved = 0`: không đủ dữ liệu hoặc không tìm được itemset phổ biến.

**Ngưỡng lọc:**

| Tham số | Giá trị | Ý nghĩa |
|---|---|---|
| `min_support` | 0.01 | Xuất hiện trong ≥ 1% đơn hàng |
| `min_confidence` | 0.2 | Xác suất mua kèm ≥ 20% |
| `min_lift` | 1.0 | Chỉ giữ luật có liên hệ thực sự |

**Điều kiện có kết quả:** ít nhất 10 đơn hàng `delivered` trong DB.
**Lịch tự động:** train lại mỗi ngày lúc 2:00 AM.
