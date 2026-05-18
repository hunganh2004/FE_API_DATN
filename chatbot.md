# Hướng dẫn tích hợp Chatbot (Frontend)

## Tổng quan

Chatbot hoạt động theo mô hình **stateless** — backend không lưu lịch sử hội thoại. Frontend tự giữ `history` trong state, gửi kèm mỗi request. Đóng tab/reload là mất hội thoại (đúng theo thiết kế).

- Endpoint: `POST /api/v1/chat`
- Auth: **tùy chọn** — có token thì chatbot biết đơn hàng của user, không có token thì chỉ trả lời câu hỏi chung.

---

## Request / Response

### Request Body
```json
{
  "message": "Đơn hàng của tôi đang ở đâu?",
  "history": [
    { "role": "user", "content": "Xin chào" },
    { "role": "assistant", "content": "Chào bạn, tôi có thể giúp gì cho bạn?" }
  ]
}
```

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `message` | string | ✅ | Tin nhắn hiện tại của user |
| `history` | array | ❌ | Lịch sử hội thoại, mảng rỗng `[]` nếu chưa có |

### Response
```json
{
  "success": true,
  "data": {
    "reply": "Đơn hàng #42 của bạn hiện đang ở trạng thái đang giao hàng...",
    "products": [
      {
        "pk_product_id": 1,
        "name": "Royal Canin Medium Adult 10kg",
        "price": 350000,
        "sale_price": 299000,
        "stock": 15,
        "image_url": "/uploads/products/1/abc.png"
      }
    ]
  }
}
```

> `products` là mảng sản phẩm liên quan được retrieve từ DB (khi user hỏi về sản phẩm hoặc wishlist). Mảng rỗng `[]` nếu không có sản phẩm liên quan. FE kiểm tra `products.length > 0` để quyết định có render thẻ sản phẩm hay không.

### Lỗi
```json
{ "success": false, "message": "Dịch vụ chat tạm thời không khả dụng" }
```

---

## Cách quản lý history

Mỗi lượt chat, sau khi nhận được reply, push cả 2 vào mảng history:

```js
// Sau khi gửi message và nhận reply
setHistory(prev => [
  ...prev,
  { role: 'user', content: message },
  { role: 'assistant', content: reply },
]);
```

Backend tự giới hạn 10 tin nhắn gần nhất để tránh vượt token limit, nên frontend không cần tự cắt.

---

## Ví dụ React (hook đơn giản)

```jsx
import { useState } from 'react';
import axios from 'axios';

export default function Chatbot() {
  const [messages, setMessages] = useState([]); // hiển thị trên UI
  const [history, setHistory]   = useState([]); // gửi lên backend
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || loading) return;

    // Hiển thị tin nhắn user ngay lập tức
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token'); // nếu đã login
      const { data } = await axios.post(
        '/api/v1/chat',
        { message, history },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      const reply = data.data.reply;
      const products = data.data.products || [];

      // Cập nhật UI và history
      setMessages(prev => [...prev, { role: 'assistant', content: reply, products }]);
      setHistory(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: reply },
      ]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <p>{msg.content}</p>
            {/* Render thẻ sản phẩm nếu có */}
            {msg.role === 'assistant' && msg.products?.length > 0 && (
              <div className="product-cards">
                {msg.products.map(p => (
                  <div key={p.pk_product_id} className="product-card">
                    {p.image_url && <img src={p.image_url} alt={p.name} />}
                    <p className="product-name">{p.name}</p>
                    <p className="product-price">
                      {p.sale_price
                        ? <><s>{p.price.toLocaleString('vi-VN')}đ</s> {p.sale_price.toLocaleString('vi-VN')}đ</>
                        : `${p.price.toLocaleString('vi-VN')}đ`
                      }
                    </p>
                    <p className="product-stock">{p.stock > 0 ? `Còn ${p.stock} sản phẩm` : 'Hết hàng'}</p>
                    <a href={`/products/${p.pk_product_id}`}>Xem chi tiết</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="message assistant">Đang trả lời...</div>}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Nhập câu hỏi..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>Gửi</button>
      </div>
    </div>
  );
}
```

---

## Những gì chatbot có thể trả lời

| Chủ đề | Cần login? | Ví dụ câu hỏi |
|---|---|---|
| Trạng thái đơn hàng | ✅ | "Đơn hàng của tôi đang ở đâu?" |
| Thông tin sản phẩm | ❌ | "Sản phẩm Royal Canin còn hàng không?" |
| Sản phẩm yêu thích | ✅ | "Sản phẩm tôi đang quan tâm còn hàng không?" |
| Đánh giá sản phẩm | ❌ | "Sản phẩm X có tốt không?" |

> Chatbot **không** trả lời các câu hỏi về chính sách đổi trả, vận chuyển, bảo hành vì không có dữ liệu nguồn. Nếu user hỏi những chủ đề này, chatbot sẽ đề nghị liên hệ hỗ trợ trực tiếp.

---

## Lưu ý

- `history` chỉ tồn tại trong session hiện tại, **không lưu vào DB**, mất khi đóng tab.
- Nếu user chưa đăng nhập, chatbot vẫn hoạt động nhưng không truy xuất được thông tin đơn hàng cá nhân.
- Nên hiển thị trạng thái loading khi đang chờ reply để tránh user gửi nhiều lần.
