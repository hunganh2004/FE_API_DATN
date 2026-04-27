# Detailed Class Diagram - Biểu đồ lớp chi tiết

Mô tả đầy đủ attributes, methods, visibility và quan hệ giữa các lớp.
Visibility: + public, - private, # protected

---

## 1. Nhóm Auth & User

```mermaid
classDiagram
    class User {
        -int pk_user_id
        -String full_name
        -String email
        -String password_hash
        -String phone
        -String avatar_url
        -String role
        -Boolean is_active
        -DateTime created_at
        -DateTime updated_at
        +getId() int
        +getEmail() String
        +getRole() String
        +isActive() Boolean
        +toPublicDTO() UserDTO
    }

    class UserAddress {
        -int pk_address_id
        -int fk_user_id
        -String receiver
        -String phone
        -String province
        -String commune
        -String street
        -Boolean is_default
        +getFullAddress() String
        +setDefault() void
    }

    class AuthService {
        -UserRepository userRepo
        -JwtUtil jwtUtil
        +register(RegisterDTO dto) AuthResponseDTO
        +login(String email, String password) AuthResponseDTO
        -hashPassword(String plain) String
        -verifyPassword(String plain, String hash) Boolean
        -generateToken(User user) String
    }

    class UserService {
        -UserRepository userRepo
        -UserAddressRepository addrRepo
        +getProfile(int userId) UserDTO
        +updateProfile(int userId, UpdateDTO dto) UserDTO
        +changePassword(int userId, String oldPwd, String newPwd) void
        +getAddresses(int userId) List~UserAddress~
        +addAddress(int userId, UserAddress addr) UserAddress
        +setDefaultAddress(int userId, int addressId) void
    }

    class UserRepository {
        <<interface>>
        +findById(int id) User
        +findByEmail(String email) User
        +save(User user) User
        +update(User user) User
    }

    AuthService --> UserRepository : uses
    UserService --> UserRepository : uses
    UserService --> UserAddress : manages
    User "1" *-- "0..*" UserAddress : has
```

---

## 2. Nhóm Sản phẩm & Danh mục

```mermaid
classDiagram
    class Category {
        -int pk_category_id
        -int fk_parent_id
        -String name
        -String slug
        -String description
        -String image_url
        -int sort_order
        -Boolean is_active
        +getChildren() List~Category~
        +getFullPath() String
    }

    class PetType {
        -int pk_pet_type_id
        -String name
        -String icon_url
        +getName() String
    }

    class Product {
        -int pk_product_id
        -int fk_category_id
        -String name
        -String slug
        -String description
        -Decimal price
        -Decimal sale_price
        -int stock
        -String sku
        -String brand
        -int weight_gram
        -Boolean is_consumable
        -Boolean is_active
        -DateTime created_at
        +getEffectivePrice() Decimal
        +isInStock() Boolean
        +isOnSale() Boolean
        +getDiscountPercent() int
        +toListDTO() ProductListDTO
        +toDetailDTO() ProductDetailDTO
    }

    class ProductVariant {
        -int pk_variant_id
        -int fk_product_id
        -String name
        -String sku
        -Decimal price
        -Decimal sale_price
        -int stock
        +getEffectivePrice() Decimal
        +isInStock() Boolean
    }

    class ProductImage {
        -int pk_image_id
        -int fk_product_id
        -String image_url
        -Boolean is_primary
        -int sort_order
        +getUrl() String
    }

    class ProductSpec {
        -int pk_spec_id
        -int fk_product_id
        -String spec_name
        -String spec_value
        -int sort_order
        +getValue() String
    }

    class Review {
        -int pk_review_id
        -int fk_product_id
        -int fk_user_id
        -int fk_parent_id
        -int rating
        -String comment
        -DateTime created_at
        +isReply() Boolean
        +getRating() int
        +getSummary() String
    }

    class ProductService {
        -ProductRepository productRepo
        -ReviewRepository reviewRepo
        +searchProducts(String query, FilterDTO filters) PageResult~Product~
        +getProductDetail(int id) ProductDetailDTO
        +getVariants(int productId) List~ProductVariant~
        +getReviews(int productId) List~Review~
        +decreaseStock(int productId, int qty) void
        +checkStock(int productId, int qty) Boolean
    }

    Category "1" *-- "0..*" Product : contains
    Category "0..1" o-- "0..*" Category : parent-child
    Product "1" *-- "0..*" ProductVariant : has
    Product "1" *-- "0..*" ProductImage : has
    Product "1" *-- "0..*" ProductSpec : has
    Product "1" *-- "0..*" Review : receives
    Review "0..1" o-- "0..*" Review : parent-reply
    Product "0..*" --> "0..*" PetType : suitable for
    ProductService --> Product : manages
```

---

## 3. Nhóm Đơn hàng & Thanh toán

```mermaid
classDiagram
    class CartItem {
        -int pk_cart_item_id
        -int fk_user_id
        -int fk_product_id
        -int fk_variant_id
        -int quantity
        -DateTime added_at
        +getSubtotal() Decimal
        +increaseQty(int amount) void
    }

    class Coupon {
        -int pk_coupon_id
        -String code
        -String discount_type
        -Decimal discount_value
        -Decimal min_order
        -int max_uses
        -int used_count
        -DateTime starts_at
        -DateTime expires_at
        -Boolean is_active
        +isValid() Boolean
        +isExpired() Boolean
        +hasUsesLeft() Boolean
        +calculateDiscount(Decimal orderTotal) Decimal
    }

    class Order {
        -int pk_order_id
        -int fk_user_id
        -int fk_coupon_id
        -String receiver
        -String phone
        -String shipping_address
        -Decimal subtotal
        -Decimal discount_amount
        -Decimal shipping_fee
        -Decimal total
        -String payment_method
        -String payment_status
        -String order_status
        -String note
        -DateTime created_at
        +canBeCancelled() Boolean
        +isPaid() Boolean
        +getStatusLabel() String
    }

    class OrderItem {
        -int pk_order_item_id
        -int fk_order_id
        -int fk_product_id
        -int fk_variant_id
        -String product_name
        -Decimal unit_price
        -int quantity
        +getSubtotal() Decimal
    }

    class Payment {
        -int pk_payment_id
        -int fk_order_id
        -String method
        -String transaction_ref
        -Decimal amount
        -String status
        -DateTime paid_at
        +isSuccess() Boolean
        +markAsPaid(String ref) void
    }

    class OrderService {
        -OrderRepository orderRepo
        -ProductService productService
        -CartService cartService
        -CouponRepository couponRepo
        +createOrder(int userId, CreateOrderDTO dto) Order
        +cancelOrder(int orderId, int userId) void
        +getOrderDetail(int orderId) OrderDetailDTO
        +getOrderHistory(int userId) List~Order~
        -validateStock(List items) void
        -calculateTotal(List items, Coupon coupon) Decimal
    }

    class PaymentService {
        -PaymentRepository paymentRepo
        -PaymentGateway gateway
        +createPaymentSession(Order order) String
        +handleCallback(String ref, String status) void
        +updatePaymentStatus(int orderId, String status) void
    }

    class CartService {
        -CartRepository cartRepo
        +getCartItems(int userId) List~CartItem~
        +addItem(int userId, int productId, int variantId, int qty) CartItem
        +updateQuantity(int cartItemId, int qty) CartItem
        +removeItem(int cartItemId) void
        +clearCart(int userId) void
        +getCartTotal(int userId) Decimal
    }

    Order "1" *-- "1..*" OrderItem : contains
    Order "1" *-- "1" Payment : has
    Order "0..*" --> "0..1" Coupon : uses
    OrderService --> Order : manages
    OrderService --> CartService : uses
    PaymentService --> Payment : manages
```

---

## 4. Nhóm AI & Hành vi

```mermaid
classDiagram
    class UserBehaviorLog {
        -bigint pk_log_id
        -int fk_user_id
        -String session_id
        -int fk_product_id
        -String action
        -String search_query
        -int duration_sec
        -DateTime created_at
        +getAction() String
        +getDuration() int
    }

    class ProductRecommendation {
        -bigint pk_rec_id
        -int fk_user_id
        -int fk_product_id
        -float score
        -String rec_type
        -DateTime generated_at
        +isStale(int maxAgeMinutes) Boolean
        +getScore() float
    }

    class AssociationRule {
        -int pk_rule_id
        -int fk_antecedent
        -int fk_consequent
        -float support
        -float confidence
        -float lift
        +isStrong(float minConfidence) Boolean
    }

    class CustomerSegment {
        -int pk_segment_id
        -String name
        -String description
        +getName() String
    }

    class RepurchasePrediction {
        -int pk_pred_id
        -int fk_user_id
        -int fk_product_id
        -Date predicted_date
        -float confidence
        -Boolean notified
        -DateTime created_at
        +isDue() Boolean
        +markNotified() void
    }

    class BehaviorService {
        -BehaviorRepository behaviorRepo
        +logView(int userId, String sessionId, int productId, int duration) void
        +logSearch(int userId, String sessionId, String query) void
        +logAddToCart(int userId, int productId) void
        +logPurchase(int userId, int productId) void
        +getUserBehaviorSummary(int userId) BehaviorSummaryDTO
    }

    class RecommendationService {
        -RecommendationRepository recRepo
        -AIGateway aiGateway
        +getForHomepage(int userId) List~Product~
        +getForProduct(int userId, int productId) List~Product~
        -isStale(int userId) Boolean
        -refresh(int userId) void
        +saveRecommendations(int userId, List recs) void
    }

    class AIGateway {
        -String aiServiceUrl
        -HttpClient httpClient
        +requestCollaborativeFiltering(int userId) List~RecDTO~
        +requestAssociationRules(int productId) List~RecDTO~
        +requestSegmentation(List userData) List~SegmentDTO~
        +requestRepurchasePrediction(int userId, int productId) PredictionDTO
    }

    class NotificationService {
        -NotificationRepository notifRepo
        +sendOrderUpdate(int userId, int orderId, String status) void
        +sendRepurchaseReminder(int userId, int productId, Date date) void
        +sendPromotion(int userId, String message) void
        +markAsRead(int notifId) void
        +getUnread(int userId) List~Notification~
    }

    BehaviorService --> UserBehaviorLog : writes
    RecommendationService --> ProductRecommendation : reads/writes
    RecommendationService --> AIGateway : calls
    AIGateway --> AssociationRule : reads
    NotificationService --> RepurchasePrediction : triggers from
    UserBehaviorLog --> User : belongs to
    ProductRecommendation --> User : for
    ProductRecommendation --> Product : recommends
    RepurchasePrediction --> User : for
    RepurchasePrediction --> Product : about
    User "0..*" --> "0..*" CustomerSegment : assigned to
```
