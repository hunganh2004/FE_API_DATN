# Gợi ý sản phẩm trang chủ - API Info

**BASE URL:** `http://localhost:8001`

---

## 1. Lấy gợi ý sản phẩm trang chủ

```
GET /recommendations/homepage?user_id={id}&top_n={n}
```

| Param | Bắt buộc | Mặc định | Mô tả |
|---|---|---|---|
| `user_id` | ✅ | — | ID người dùng |
| `top_n` | ❌ | 10 | Số sản phẩm gợi ý (1–50) |

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

> `rec_type` có thể là `"collaborative"` hoặc `"trending"`.
> `score`: điểm dự đoán tương tác (SVD) hoặc số lượng đã bán (trending).

---

## 2. Train lại model

```
POST /train/collaborative
```

Response:
```json
{
  "model": "collaborative",
  "rmse": 0.842,
  "n_components": 50,
  "n_users": 200,
  "n_products": 100
}
```

> `rmse`: sai số trung bình bình phương — càng thấp càng tốt.
> `n_components`: số chiều latent factor của SVD.

---

## 3. Train tất cả model (bao gồm collaborative)

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
| Train lại model collaborative | Mỗi 6 giờ |

---

## Thuật toán

- **Model chính:** TruncatedSVD — Matrix Factorization (`sklearn.decomposition.TruncatedSVD`)
- **Fallback (cold start):** Item-based Cosine Similarity
- **Nguồn dữ liệu:** `tbl_user_behavior_logs`
- **Điểm tương tác** được tính từ hành vi người dùng:

| Hành vi | Điểm |
|---|---|
| purchase | +5 |
| add_to_cart | +3 |
| wishlist | +2 |
| view | +1 |
| search | +1 |
| remove_from_cart | -1 |

> Bonus thêm tối đa +1 điểm nếu thời gian xem dài (mỗi 30 giây = +0.1).

- **Điều kiện dùng SVD:** user phải có ít nhất 5 sản phẩm đã tương tác
- **Nếu dưới 5:** tự động chuyển sang Item-based Cosine Similarity
- **Nếu chưa train:** fallback về trending (sản phẩm bán chạy nhất)

---

## Ghi chú tích hợp Node.js

| Khi nào | Gọi API |
|---|---|
| User vào trang chủ | `GET /recommendations/homepage?user_id=X` |
| Admin muốn train lại thủ công | `POST /train/collaborative` |

> API **luôn trả về kết quả** — không bao giờ rỗng nếu có đơn hàng `delivered` trong DB (nhờ fallback trending).
