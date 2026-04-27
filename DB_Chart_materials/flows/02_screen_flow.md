# Screen Flow - Luồng màn hình

Mô tả các trang/màn hình và cách chuyển đổi giữa chúng.

---

## 1. Phân hệ người dùng (Customer)

```mermaid
flowchart TD
    HOME[Trang chủ] --> CATEGORY[Trang danh mục]
    HOME --> SEARCH[Trang kết quả tìm kiếm]
    HOME --> PRODUCT[Trang chi tiết sản phẩm]
    HOME --> LOGIN[Trang đăng nhập]
    HOME --> REGISTER[Trang đăng ký]

    CATEGORY --> PRODUCT
    SEARCH --> PRODUCT

    PRODUCT --> CART[Trang giỏ hàng]
    PRODUCT --> WISHLIST[Trang wishlist]

    LOGIN --> HOME
    REGISTER --> LOGIN

    CART --> CHECKOUT_ADDR[Bước 1: Địa chỉ giao hàng]
    CHECKOUT_ADDR --> CHECKOUT_PAY[Bước 2: Phương thức thanh toán]
    CHECKOUT_PAY --> CHECKOUT_CONFIRM[Bước 3: Xác nhận đơn hàng]
    CHECKOUT_CONFIRM --> ORDER_RESULT[Trang kết quả đặt hàng]
    ORDER_RESULT --> ORDER_DETAIL[Trang chi tiết đơn hàng]

    PROFILE[Trang tài khoản] --> ORDER_HISTORY[Lịch sử đơn hàng]
    PROFILE --> ADDRESS_BOOK[Quản lý địa chỉ]
    PROFILE --> CHANGE_PWD[Đổi mật khẩu]
    ORDER_HISTORY --> ORDER_DETAIL
    ORDER_DETAIL --> REVIEW[Trang viết đánh giá]
```

---

## 2. Phân hệ quản trị (Admin)

```mermaid
flowchart TD
    ADMIN_LOGIN[Trang đăng nhập Admin] --> DASHBOARD[Dashboard]

    DASHBOARD --> PROD_LIST[Danh sách sản phẩm]
    PROD_LIST --> PROD_ADD[Thêm sản phẩm]
    PROD_LIST --> PROD_EDIT[Sửa sản phẩm]

    DASHBOARD --> CAT_LIST[Danh sách danh mục]
    CAT_LIST --> CAT_ADD[Thêm danh mục]
    CAT_LIST --> CAT_EDIT[Sửa danh mục]

    DASHBOARD --> ORDER_LIST[Danh sách đơn hàng]
    ORDER_LIST --> ORDER_DETAIL_ADMIN[Chi tiết đơn hàng]
    ORDER_DETAIL_ADMIN --> ORDER_STATUS[Cập nhật trạng thái]

    DASHBOARD --> USER_LIST[Danh sách người dùng]
    USER_LIST --> USER_DETAIL[Chi tiết người dùng]

    DASHBOARD --> REPORT[Báo cáo & thống kê]
    REPORT --> REVENUE[Doanh thu theo thời gian]
    REPORT --> TOP_PRODUCTS[Sản phẩm bán chạy]
    REPORT --> CUSTOMER_SEGMENT[Phân cụm khách hàng]

    DASHBOARD --> BEHAVIOR[Theo dõi hành vi người dùng]
```

---

## 3. Sơ đồ điều hướng tổng thể

```mermaid
flowchart LR
    subgraph Public["Công khai (chưa đăng nhập)"]
        HOME
        CATEGORY
        PRODUCT
        SEARCH
        LOGIN
        REGISTER
    end

    subgraph Customer["Người dùng đã đăng nhập"]
        CART
        CHECKOUT
        ORDER_HISTORY
        PROFILE
        WISHLIST
    end

    subgraph Admin["Quản trị viên"]
        DASHBOARD
        PROD_MGMT[Quản lý sản phẩm]
        ORDER_MGMT[Quản lý đơn hàng]
        USER_MGMT[Quản lý người dùng]
        REPORT
    end

    Public -->|Đăng nhập| Customer
    Public -->|Đăng nhập Admin| Admin
    Customer -->|Đăng xuất| Public
    Admin -->|Đăng xuất| Public
```
