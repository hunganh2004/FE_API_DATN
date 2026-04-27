# VOPC - View Of Participating Classes

Mô tả các lớp tham gia vào từng use case theo mô hình BCE:
- **Boundary**: lớp giao tiếp với actor (UI, API Controller)
- **Control**: lớp xử lý logic nghiệp vụ (Service)
- **Entity**: lớp dữ liệu (Model/Entity)

---

## 1. Use Case: Đăng ký / Đăng nhập

```mermaid
classDiagram
    class LoginPage {
        <<Boundary>>
        +showLoginForm()
        +showRegisterForm()
        +displayError(message)
        +redirectAfterLogin()
    }

    class AuthController {
        <<Boundary>>
        +POST_login()
        +POST_register()
    }

    class AuthService {
        <<Control>>
        +login(email, password) JWT
        +register(userData) User
        +hashPassword(password) String
        +verifyPassword(plain, hash) Boolean
        +generateToken(user) String
    }

    class User {
        <<Entity>>
        +pk_user_id
        +email
        +password_hash
        +role
    }

    LoginPage --> AuthController : gửi yêu cầu
    AuthController --> AuthService : gọi
    AuthService --> User : đọc / ghi
```

---

## 2. Use Case: Tìm kiếm & Xem sản phẩm

```mermaid
classDiagram
    class ProductListPage {
        <<Boundary>>
        +displayProducts(list)
        +displayFilters()
        +displaySearchBar()
    }

    class ProductDetailPage {
        <<Boundary>>
        +displayProductInfo(product)
        +displayVariants(variants)
        +displayReviews(reviews)
        +displayRecommendations(list)
    }

    class ProductController {
        <<Boundary>>
        +GET_products(filters)
        +GET_productById(id)
    }

    class ProductService {
        <<Control>>
        +searchProducts(query, filters) List
        +getProductDetail(id) Product
        +getVariants(productId) List
        +getReviews(productId) List
    }

    class BehaviorService {
        <<Control>>
        +logView(userId, productId, duration)
        +logSearch(userId, query)
    }

    class RecommendationService {
        <<Control>>
        +getRecommendations(userId, productId) List
        +refreshIfStale(userId) void
    }

    class Product {
        <<Entity>>
        +pk_product_id
        +name
        +price
        +stock
    }

    class UserBehaviorLog {
        <<Entity>>
        +action
        +created_at
    }

    class ProductRecommendation {
        <<Entity>>
        +score
        +rec_type
        +generated_at
    }

    ProductListPage --> ProductController : gửi yêu cầu
    ProductDetailPage --> ProductController : gửi yêu cầu
    ProductController --> ProductService : gọi
    ProductController --> BehaviorService : ghi log
    ProductController --> RecommendationService : lấy gợi ý
    ProductService --> Product : đọc
    BehaviorService --> UserBehaviorLog : ghi
    RecommendationService --> ProductRecommendation : đọc / ghi
```

---

## 3. Use Case: Đặt hàng & Thanh toán

```mermaid
classDiagram
    class CheckoutPage {
        <<Boundary>>
        +displayCartSummary()
        +displayAddressForm()
        +displayPaymentOptions()
        +displayOrderConfirmation()
        +redirectToPaymentGateway(url)
    }

    class OrderController {
        <<Boundary>>
        +POST_createOrder()
        +POST_cancelOrder()
        +GET_orderDetail(id)
    }

    class PaymentWebhookController {
        <<Boundary>>
        +POST_paymentCallback()
    }

    class OrderService {
        <<Control>>
        +createOrder(userId, cartItems, address, couponCode, paymentMethod) Order
        +validateStock(items) Boolean
        +applyDiscount(order, coupon) Decimal
        +cancelOrder(orderId) void
    }

    class PaymentService {
        <<Control>>
        +createPaymentSession(order) String
        +handleCallback(ref, status) void
        +updatePaymentStatus(orderId, status) void
    }

    class CartService {
        <<Control>>
        +getCartItems(userId) List
        +clearCart(userId) void
    }

    class NotificationService {
        <<Control>>
        +sendOrderConfirmation(userId, orderId) void
    }

    class Order {
        <<Entity>>
        +pk_order_id
        +order_status
        +payment_status
        +total
    }

    class OrderItem {
        <<Entity>>
        +quantity
        +unit_price
    }

    class Payment {
        <<Entity>>
        +transaction_ref
        +status
        +paid_at
    }

    class CartItem {
        <<Entity>>
        +quantity
    }

    class Coupon {
        <<Entity>>
        +discount_type
        +discount_value
    }

    CheckoutPage --> OrderController : gửi yêu cầu
    PaymentWebhookController --> PaymentService : xử lý callback
    OrderController --> OrderService : gọi
    OrderController --> CartService : xoá giỏ hàng
    OrderController --> NotificationService : gửi thông báo
    OrderService --> Order : tạo
    OrderService --> OrderItem : tạo
    OrderService --> Coupon : kiểm tra & cập nhật
    PaymentService --> Payment : tạo / cập nhật
    CartService --> CartItem : đọc / xoá
```

---

## 4. Use Case: Gợi ý sản phẩm AI

```mermaid
classDiagram
    class HomePage {
        <<Boundary>>
        +displayRecommendedProducts(list)
    }

    class RecommendationController {
        <<Boundary>>
        +GET_recommendations(userId, context)
    }

    class AIGateway {
        <<Boundary>>
        +requestRecommendations(userId, productId) List
    }

    class RecommendationService {
        <<Control>>
        +getForUser(userId, context) List
        +isStale(userId) Boolean
        +saveRecommendations(userId, list) void
    }

    class BehaviorService {
        <<Control>>
        +getUserBehaviorSummary(userId) Object
    }

    class ProductRecommendation {
        <<Entity>>
        +score
        +rec_type
        +generated_at
    }

    class UserBehaviorLog {
        <<Entity>>
        +action
        +created_at
    }

    class AssociationRule {
        <<Entity>>
        +support
        +confidence
        +lift
    }

    HomePage --> RecommendationController : yêu cầu gợi ý
    RecommendationController --> RecommendationService : gọi
    RecommendationService --> AIGateway : gọi AI nếu cần
    RecommendationService --> ProductRecommendation : đọc / ghi
    BehaviorService --> UserBehaviorLog : đọc
    AIGateway --> AssociationRule : đọc luật kết hợp
```
