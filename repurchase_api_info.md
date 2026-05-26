# Repurchase Prediction - API Info

**BASE URL:** `http://localhost:8001`

---

## 1. Lấy danh sách nhắc mua lại

```
GET /recommendations/repurchase?user_id={id}&days_ahead={n}
```

| Param | Bắt buộc | Mặc định | Mô tả |
|---|---|---|---|
| `user_id` | ✅ | — | ID người dùng |
| `days_ahead` | ❌ | 7 | Số ngày tới cần kiểm tra (1–30) |

Response:
```json
{
  "user_id": 2,
  "days_ahead": 7,
  "reminders": [
    {
      "product_id": 1,
      "product_name": "Royal Canin Medium Adult 10kg",
      "predicted_date": "2025-03-25",
      "confidence": 0.82
    }
  ]
}
```

> `confidence`: độ tin cậy của dự đoán, tính từ R² của model Random Forest, nằm trong khoảng [0.3, 0.95].
> `reminders` trả về mảng rỗng nếu không có sản phẩm nào cần mua lại trong khoảng thời gian đó.

---

## 2. Train lại model

```
POST /train/repurchase
```

Response:
```json
{
  "model": "repurchase",
  "mae_days": 4.2,
  "r2_score": 0.78,
  "n_samples": 312
}
```

> `mae_days`: sai số trung bình tuyệt đối (ngày).
> `r2_score`: hệ số xác định, càng gần 1 càng tốt.
> `n_samples`: số mẫu dùng để huấn luyện.

---

## 3. Train tất cả model (bao gồm repurchase)

```
POST /train/all
```

Response:
```json
{ "message": "Đã bắt đầu huấn luyện tất cả mô hình trong background" }
```

---

## Lịch tự động

| Tác vụ | Thời gian |
|---|---|
| Train lại model repurchase | Mỗi ngày lúc 2:00 AM |
| Gửi thông báo nhắc mua lại | Mỗi ngày lúc 8:00 AM |

> Thông báo được insert vào `tbl_notifications` với `type = 'repurchase_reminder'`.
> Mỗi prediction chỉ tạo thông báo **một lần** (cột `notified = 1` sau khi đã gửi).
> Ngưỡng mặc định: nhắc trước **3 ngày** so với `predicted_date`.

---

## Thuật toán

- **Model:** Random Forest Regressor (`sklearn.ensemble.RandomForestRegressor`)
- **Target:** số ngày đến lần mua tiếp theo (`days_between`)
- **Features:**
  - `quantity` — số lượng mua trong đơn
  - `weight_gram` — khối lượng sản phẩm
  - `product_id_enc` — product ID đã encode
  - `avg_days_between` — chu kỳ mua lại trung bình thực tế của user với sản phẩm đó
- **Chỉ áp dụng** cho sản phẩm có `is_consumable = 1`
- **Điều kiện train:** user phải có ít nhất 2 lần mua cùng một sản phẩm

---

## Ghi chú tích hợp Node.js

| Khi nào | Gọi API |
|---|---|
| Hiển thị thông báo nhắc mua lại cho user | `GET /recommendations/repurchase?user_id=X` |
| Admin muốn train lại thủ công | `POST /train/repurchase` |
