# Sequence Diagram - Biểu đồ tuần tự (UML)

Mô tả thứ tự trao đổi thông điệp giữa các đối tượng khi thực hiện use case.

---

## 1. Đăng ký tài khoản

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant LP as LoginPage
    participant AC as AuthController
    participant AS as AuthService
    participant DB as Database

    U->>LP: Nhập thông tin đăng ký
    LP->>AC: POST /auth/register {name, email, password}
    AC->>AS: register(userData)
    AS->>DB: SELECT * FROM tbl_users WHERE email = ?
    DB-->>AS: null (chưa tồn tại)
    AS->>AS: hashPassword(password)
    AS->>DB: INSERT INTO tbl_users
    DB-->>AS: user_id mới
    AS->>AS: generateToken(user)
    AS-->>AC: {token, user}
    AC-->>LP: 201 Created {token}
    LP-->>U: Chuyển về trang chủ
```

---

## 2. Đăng nhập

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant LP as LoginPage
    participant AC as AuthController
    participant AS as AuthService
    participant DB as Database

    U->>LP: Nhập email + mật khẩu
    LP->>AC: POST /auth/login {email, password}
    AC->>AS: login(email, password)
    AS->>DB: SELECT * FROM tbl_users WHERE email = ?
    DB-->>AS: User record

    alt Tài khoản tồn tại
        AS->>AS: verifyPassword(plain, hash)
        alt Mật khẩu đúng
            AS->>AS: generateToken(user)
            AS-->>AC: {token, user}
            AC-->>LP: 200 OK {token}
            LP-->>U: Đăng nhập thành công
        else Mật khẩu sai
            AS-->>AC: UnauthorizedException
            AC-->>LP: 401 Unauthorized
            LP-->>U: Hiển thị lỗi
        end
    else Không tìm thấy
        AS-->>AC: NotFoundException
        AC-->>LP: 404 Not Found
        LP-->>U: Email không tồn tại
    end
```

---

## 3. Tìm kiếm sản phẩm

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant PLP as ProductListPage
    participant PC as ProductController
    participant PS as ProductService
    participant BS as BehaviorService
    participant DB as Database

    U->>PLP: Nhập từ khoá + chọn bộ lọc
    PLP->>PC: GET /products?q=...&category=...&pet_type=...
    PC->>PS: searchProducts(query, filters)
    PS->>DB: SELECT FROM tbl_products WHERE ...
    DB-->>PS: Danh sách sản phẩm
    PS-->>PC: List<Product>

    PC->>BS: logSearch(userId, query)
    BS->>DB: INSERT INTO tbl_user_behavior_logs
    DB-->>BS: OK

    PC-->>PLP: 200 OK {products, pagination}
    PLP-->>U: Hiển thị kết quả tìm kiếm
```

---

## 4. Xem chi tiết sản phẩm & nhận gợi ý

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant PDP as ProductDetailPage
    participant PC as ProductController
    participant PS as ProductService
    participant BS as BehaviorService
    participant RS as RecommendationService
    participant AI as AIGateway
    participant DB as Database

    U->>PDP: Click vào sản phẩm
    PDP->>PC: GET /products/:id
    PC->>PS: getProductDetail(id)
    PS->>DB: SELECT product + variants + images + reviews
    DB-->>PS: Dữ liệu đầy đủ
    PS-->>PC: Product detail
    PC-->>PDP: 200 OK {product}
    PDP-->>U: Hiển thị chi tiết sản phẩm

    Note over PDP,DB: Ghi log hành vi xem sản phẩm
    PDP->>PC: POST /behavior {action=view, product_id}
    PC->>BS: logView(userId, productId)
    BS->>DB: INSERT INTO tbl_user_behavior_logs

    Note over PDP,AI: Lấy gợi ý sản phẩm
    PDP->>PC: GET /recommendations?product_id=...
    PC->>RS: getRecommendations(userId, productId)
    RS->>DB: SELECT FROM tbl_product_recommendations WHERE generated_at > NOW()-1h
    DB-->>RS: Kết quả

    alt Gợi ý còn mới
        RS-->>PC: List<Product>
    else Gợi ý cũ hoặc chưa có
        RS->>AI: requestRecommendations(userId, productId)
        AI->>DB: Đọc behavior_logs + association_rules
        DB-->>AI: Dữ liệu
        AI-->>RS: List<{product_id, score}>
        RS->>DB: UPSERT tbl_product_recommendations
        RS-->>PC: List<Product>
    end

    PC-->>PDP: 200 OK {recommendations}
    PDP-->>U: Hiển thị "Gợi ý cho bạn"
```

---

## 5. Đặt hàng & Thanh toán

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant CP as CheckoutPage
    participant OC as OrderController
    participant OS as OrderService
    participant CS as CartService
    participant PS as PaymentService
    participant NS as NotificationService
    participant PAY as Cổng thanh toán
    participant DB as Database

    U->>CP: Xác nhận đơn hàng
    CP->>OC: POST /orders {address, payment_method, coupon_code}
    OC->>CS: getCartItems(userId)
    CS->>DB: SELECT FROM tbl_cart_items
    DB-->>CS: Cart items
    CS-->>OC: List<CartItem>

    OC->>OS: createOrder(userId, items, address, coupon, method)
    OS->>DB: Kiểm tra stock từng sản phẩm

    alt Đủ hàng
        OS->>DB: INSERT tbl_orders
        OS->>DB: INSERT tbl_order_items
        OS->>DB: UPDATE stock (trừ số lượng)
        OS->>DB: UPDATE tbl_coupons.used_count (nếu có)
        OS->>DB: INSERT tbl_order_status_logs
        OS-->>OC: Order created

        OC->>CS: clearCart(userId)
        CS->>DB: DELETE FROM tbl_cart_items

        alt Thanh toán online
            OC->>PS: createPaymentSession(order)
            PS->>PAY: Tạo phiên thanh toán
            PAY-->>PS: Payment URL
            PS->>DB: INSERT tbl_payments (status=pending)
            PS-->>OC: {payment_url}
            OC-->>CP: 200 OK {payment_url}
            CP-->>U: Redirect đến cổng thanh toán
            U->>PAY: Thực hiện thanh toán
            PAY->>OC: Webhook callback {ref, status}
            OC->>PS: handleCallback(ref, status)
            PS->>DB: UPDATE tbl_payments
            PS->>DB: UPDATE tbl_orders.payment_status
        else COD
            OC->>PS: createPaymentSession(order)
            PS->>DB: INSERT tbl_payments (status=pending)
            PS-->>OC: OK
            OC-->>CP: 201 Created {order_id}
            CP-->>U: Đặt hàng thành công
        end

        OC->>NS: sendOrderConfirmation(userId, orderId)
        NS->>DB: INSERT tbl_notifications

    else Hết hàng
        OS-->>OC: StockException
        OC-->>CP: 409 Conflict
        CP-->>U: Thông báo sản phẩm hết hàng
    end
```

---

## 6. Admin cập nhật trạng thái đơn hàng

```mermaid
sequenceDiagram
    actor A as Admin
    participant AOP as AdminOrderPage
    participant OC as OrderController
    participant OS as OrderService
    participant NS as NotificationService
    participant DB as Database

    A->>AOP: Chọn đơn hàng, cập nhật trạng thái
    AOP->>OC: PATCH /admin/orders/:id/status {status, note}
    OC->>OS: updateStatus(orderId, status, note, adminId)
    OS->>DB: UPDATE tbl_orders SET order_status = ?
    OS->>DB: INSERT tbl_order_status_logs
    DB-->>OS: OK
    OS-->>OC: Updated order
    OC->>NS: notifyUser(userId, orderId, status)
    NS->>DB: INSERT tbl_notifications
    DB-->>NS: OK
    OC-->>AOP: 200 OK
    AOP-->>A: Cập nhật thành công
```
