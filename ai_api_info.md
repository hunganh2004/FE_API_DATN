# AI Service - API Contract

**BASE URL:** `http://localhost:8001`

---

## RECOMMENDATIONS

### Gợi ý sản phẩm trang chủ
```
GET /recommendations/homepage?user_id={id}&top_n={n}
```
- `user_id` (bắt buộc): ID người dùng
- `top_n` (tuỳ chọn, mặc định 10): số sản phẩm gợi ý

Response:
```json
{
  "user_id": 2,
  "rec_type": "collaborative",
  "recommendations": [
    { "product_id": 15, "score": 3.82 },
    { "product_id": 23, "score": 2.91 }
  ]
}
```
> `rec_type` có thể là `"collaborative"` hoặc `"trending"` (fallback khi chưa train hoặc user mới)

---

### Sản phẩm mua kèm (Association Rules)
```
GET /recommendations/product/{product_id}?top_n={n}
```
- `product_id` (bắt buộc): ID sản phẩm đang xem
- `top_n` (tuỳ chọn, mặc định 5): số sản phẩm gợi ý mua kèm

Response:
```json
{
  "product_id": 1,
  "rec_type": "association",
  "recommendations": [
    { "product_id": 3, "confidence": 0.65, "lift": 2.3 },
    { "product_id": 7, "confidence": 0.41, "lift": 1.8 }
  ]
}
```
> `confidence`: xác suất mua sản phẩm này khi đã mua sản phẩm gốc
> `lift`: mức độ liên hệ thực sự (> 1 là có liên hệ)

---

### Nhắc mua lại sản phẩm tiêu hao
```
GET /recommendations/repurchase?user_id={id}&days_ahead={n}
```
- `user_id` (bắt buộc): ID người dùng
- `days_ahead` (tuỳ chọn, mặc định 7): số ngày tới cần kiểm tra

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
      "confidence": 0.75
    }
  ]
}
```
> Dùng để gửi thông báo nhắc user mua lại sản phẩm tiêu hao (thức ăn, cát vệ sinh...)

---

## SEGMENTS

### Lấy phân cụm của một user
```
GET /segments/user/{user_id}
```
Response:
```json
{
  "user_id": 2,
  "segment_id": 4,
  "segment_name": "Khách hàng VIP"
}
```
> Trả về `"segment": null` nếu user chưa được phân cụm

---

### Danh sách tất cả phân cụm
```
GET /segments/all
```
Response:
```json
[
  { "segment_id": 1, "name": "Khách hàng VIP", "description": "...", "user_count": 42 },
  { "segment_id": 2, "name": "Khách hàng trung thành", "description": "...", "user_count": 87 },
  { "segment_id": 3, "name": "Khách hàng tiềm năng", "description": "...", "user_count": 56 },
  { "segment_id": 4, "name": "Khách hàng không hoạt động", "description": "...", "user_count": 15 }
]
```

---

## TRAINING

### Train tất cả mô hình (chạy background)
```
POST /train/all
```
Response:
```json
{ "message": "Đã bắt đầu huấn luyện tất cả mô hình trong background" }
```

---

### Train từng mô hình riêng

```
POST /train/association
```
```json
{ "model": "association", "rules_saved": 124 }
```

```
POST /train/collaborative
```
```json
{ "model": "collaborative", "rmse": 0.842, "n_components": 50, "n_users": 200, "n_products": 100 }
```

```
POST /train/clustering
```
```json
{
  "model": "clustering",
  "n_clusters": 4,
  "silhouette_score": 0.612,
  "segment_distribution": { "0": 45, "1": 82, "2": 38, "3": 35 },
  "segment_names": {
    "0": "Khách hàng VIP",
    "1": "Khách hàng trung thành",
    "2": "Khách hàng tiềm năng",
    "3": "Khách hàng không hoạt động"
  }
}
```

```
POST /train/repurchase
```
```json
{ "model": "repurchase", "mae_days": 4.2, "r2_score": 0.78, "n_samples": 312 }
```

---

## HEALTH CHECK

```
GET /health
```
```json
{ "status": "ok", "service": "ai_service" }
```

---

## Lịch train tự động (Scheduler)

| Mô hình | Tần suất |
|---|---|
| Collaborative Filtering | Mỗi 6 giờ |
| Association Rules | Mỗi ngày lúc 2:00 AM |
| Clustering | Mỗi ngày lúc 2:00 AM |
| Repurchase Prediction | Mỗi ngày lúc 2:00 AM |

---

## Ghi chú tích hợp Node.js

| Khi nào | Gọi API |
|---|---|
| User vào trang chủ | `GET /recommendations/homepage?user_id=X` |
| User xem chi tiết sản phẩm | `GET /recommendations/product/{id}` |
| Hiển thị thông báo nhắc mua lại | `GET /recommendations/repurchase?user_id=X` |
| Admin xem báo cáo phân cụm | `GET /segments/all` |
| Kiểm tra health trước khi gọi | `GET /health` |
