# Sản phẩm liên quan (Association Rules) - API Info

**BASE URL:** `http://localhost:8001`

---

## 1. Lấy sản phẩm thường mua kèm

```
GET /recommendations/product/{product_id}?top_n={n}
```

| Param | Bắt buộc | Mặc định | Mô tả |
|---|---|---|---|
| `product_id` | ✅ | — | ID sản phẩm đang xem |
| `top_n` | ❌ | 5 | Số sản phẩm gợi ý (1–20) |

Response:
```json
{
  "product_id": 1,
  "rec_type": "association",
  "recommendations": [
    { "product_id": 3, "score": 0.65, "confidence": 0.65, "lift": 2.3 },
    { "product_id": 7, "score": 0.41, "confidence": 0.41, "lift": 1.8 }
  ]
}
```

> `confidence`: xác suất mua sản phẩm này khi đã mua sản phẩm gốc.
> `lift`: mức độ liên hệ thực sự — giá trị > 1 là có liên hệ, càng cao càng mạnh.
> `score`: alias của `confidence`, dùng để tương thích với backend.
> Trả về mảng rỗng nếu sản phẩm chưa có rule nào (chưa train hoặc không đủ dữ liệu).

---

## 2. Train lại model

```
POST /train/association
```

Response:
```json
{
  "model": "association",
  "rules_saved": 124
}
```

> `rules_saved`: số luật kết hợp tìm được và lưu vào DB.
> Nếu = 0: không đủ dữ liệu hoặc không tìm được itemset phổ biến.

---

## 3. Train tất cả model (bao gồm association)

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
| Train lại model association | Mỗi ngày lúc 2:00 AM |

---

## Thuật toán

- **Model:** FP-Growth (`mlxtend.frequent_patterns.fpgrowth`)
- **Nguồn dữ liệu:** `tbl_order_items` + `tbl_orders` (chỉ đơn `delivered`)
- **Kết quả lưu tại:** `tbl_association_rules`
- **Ngưỡng lọc:**

| Tham số | Giá trị | Ý nghĩa |
|---|---|---|
| `min_support` | 0.01 | Xuất hiện trong ít nhất 1% đơn hàng |
| `min_confidence` | 0.2 | Xác suất mua kèm ≥ 20% |
| `min_lift` | 1.0 | Chỉ giữ luật có liên hệ thực sự |

- Chỉ giữ luật dạng **1 sản phẩm → 1 sản phẩm** (1 antecedent, 1 consequent)
- Kết quả sắp xếp theo `lift DESC`, sau đó `confidence DESC`

---

## Điều kiện để có kết quả

- Phải gọi `POST /train/association` ít nhất một lần
- Cần ít nhất **10 đơn hàng `delivered`** trong DB
- Sản phẩm phải xuất hiện cùng nhau trong đủ số đơn để vượt `min_support`

---

## Ghi chú tích hợp Node.js

| Khi nào | Gọi API |
|---|---|
| User xem chi tiết sản phẩm | `GET /recommendations/product/{id}` |
| Admin muốn train lại thủ công | `POST /train/association` |
