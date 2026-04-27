# User Flow - Luồng người dùng

Mô tả hành trình của từng đối tượng người dùng khi tương tác với hệ thống.

---

## 1. Khách vãng lai

```mermaid
flowchart TD
    A([Truy cập website]) --> B[Xem trang chủ]
    B --> C{Hành động}
    C --> D[Xem danh mục sản phẩm]
    C --> E[Tìm kiếm sản phẩm]
    C --> F[Đăng ký / Đăng nhập]
    D --> G[Xem chi tiết sản phẩm]
    E --> G
    G --> H{Muốn mua?}
    H -- Có --> F
    H -- Không --> B
```

---

## 2. Người dùng đã đăng ký - Luồng mua hàng

```mermaid
h
```

---

## 3. Người dùng đã đăng ký - Luồng quản lý tài khoản

```mermaid
flowchart TD
    A([Đăng nhập]) --> B{Chọn chức năng}
    B --> C[Cập nhật thông tin cá nhân]
    B --> D[Quản lý địa chỉ giao hàng]
    B --> E[Xem lịch sử đơn hàng]
    B --> F[Xem wishlist]
    B --> G[Đổi mật khẩu]
    E --> H[Xem chi tiết đơn hàng]
    H --> I{Trạng thái đơn}
    I -- Đang chờ --> J[Huỷ đơn hàng]
    I -- Đã giao --> K[Viết đánh giá sản phẩm]
```

---

## 4. Quản trị viên

```mermaid
flowchart TD
    A([Đăng nhập Admin]) --> B[Dashboard tổng quan]
    B --> C{Chọn module}
    C --> D[Quản lý sản phẩm]
    C --> E[Quản lý đơn hàng]
    C --> F[Quản lý người dùng]
    C --> G[Quản lý danh mục]
    C --> H[Thống kê & báo cáo]
    C --> I[Theo dõi hành vi người dùng]
    D --> D1[Thêm / Sửa / Xoá sản phẩm]
    D --> D2[Quản lý biến thể & hình ảnh]
    E --> E1[Xem danh sách đơn hàng]
    E1 --> E2[Cập nhật trạng thái đơn]
    F --> F1[Xem / Khoá tài khoản người dùng]
    H --> H1[Báo cáo doanh thu]
    H --> H2[Sản phẩm bán chạy]
    I --> I1[Xem log hành vi]
    I --> I2[Xem kết quả phân cụm khách hàng]
```
