# 📋 BẢN ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS) — DỰ ÁN BREWLITE
## Software Requirements Specification — Cashless Coffee Ordering System

---

> **Cơ sở đào tạo:** Trường Đại học Sài Gòn — Khoa Công nghệ Thông tin  
> **Môn học:** Công nghệ Phần mềm (Software Engineering)  
> **Dự án:** BrewLite — Hệ thống đặt đồ uống không dùng tiền mặt  
> **Phiên bản tài liệu:** v1.0  
> **Phương pháp luận:** Agile Scrum (10 Tasks — 3 Sprints)

---

## 1. GIỚI THIỆU TỔNG QUAN & PHẠM VI HỆ THỐNG (INTRODUCTION & SCOPE)

### 1.1. Mục đích tài liệu (Document Purpose)
Tài liệu này là **Bản đặc tả yêu cầu phần mềm (Software Requirements Specification - SRS)** chính thức của hệ thống **BrewLite — Cashless Coffee Ordering System**. Tài liệu xác định chi tiết các yêu cầu chức năng, phi chức năng, cấu trúc dữ liệu, giao diện lập trình (API), và các quy tắc nghiệp vụ ràng buộc nhằm:
* Làm cơ sở kỹ thuật thống nhất giữa Product Owner (PO), Giảng viên nghiệm thu và Đội ngũ phát triển (Development Team).
* Định nghĩa bộ tiêu chí chấp nhận (Acceptance Criteria - AC) làm căn cứ kiểm thử và nghiệm thu sản phẩm tăng dần (Increment) qua từng Sprint.

### 1.2. Phạm vi sản phẩm (Product Scope)
* **Trong phạm vi (In-Scope - MVP):**
  * Khách hàng xem danh mục đồ uống, tùy biến kích cỡ (Size S/M/L) và topping.
  * Quản lý giỏ hàng phía Client, đồng bộ trạng thái đơn hàng.
  * Đăng ký, đăng nhập tài khoản khách hàng bảo mật bằng JWT.
  * Tạo đơn hàng và thanh toán trực tuyến không dùng tiền mặt (giả lập MoMo/VNPay).
  * Tra cứu mã nhận đồ uống và lịch sử đơn hàng cá nhân.
  * Cỗ máy trạng thái đơn hàng (Order State Machine), xử lý thanh toán Idempotent, và kiểm soát tồn kho đồng thời (Concurrency Control).
* **Ngoài phạm vi MVP (Out-of-Scope / Giai đoạn sau):**
  * Giao diện quản lý pha chế thời gian thực của Barista tại quầy (tích hợp WebSocket).
  * Cổng kết nối thanh toán thật với ngân hàng thương mại.

### 1.3. Bảng thuật ngữ & Từ viết tắt (Definitions, Acronyms & Abbreviations)

| Thuật ngữ / Viết tắt | Tên đầy đủ | Định nghĩa trong dự án BrewLite |
| :--- | :--- | :--- |
| **SRS** | Software Requirements Specification | Bản tài liệu đặc tả toàn bộ yêu cầu phần mềm của hệ thống. |
| **MVP** | Minimum Viable Product | Sản phẩm khả dụng tối thiểu, đáp ứng trọn vẹn luồng từ chọn món đến thanh toán. |
| **AC** | Acceptance Criteria | Tiêu chí chấp nhận để xác định một User Story đã hoàn thành đạt chuẩn. |
| **DoD** | Definition of Done | Định nghĩa hoàn thành chung cho mọi Task trong quy trình Scrum. |
| **DTO** | Data Transfer Object | Đối tượng định nghĩa cấu trúc dữ liệu gửi qua lại giữa Client và Server. |
| **State Machine** | Finite State Machine | Cỗ máy hữu hạn trạng thái kiểm soát vòng đời đơn hàng (`PENDING` $\rightarrow$ `PAID` $\rightarrow$ `READY`...). |
| **Idempotency** | Tính lũy thừa / Bất biến lặp | Cơ chế đảm bảo một request thanh toán nếu bị gửi lặp lại nhiều lần chỉ được xử lý trừ tiền duy nhất 1 lần. |
| **Optimistic Locking** | Khóa lạc quan | Cơ chế kiểm soát đồng thời dùng trường `version` để ngăn chặn việc bán vượt số lượng tồn kho (`stock`) khi nhiều khách cùng đặt một lúc. |
| **JWT** | JSON Web Token | Chuỗi mã hóa không trạng thái dùng để xác thực và phân quyền người dùng. |

---

## 2. CÁC TÁC NHÂN HỆ THỐNG (ACTORS / STAKEHOLDERS)

| Tác nhân (Actor) | Phân loại | Mô tả vai trò |
| :--- | :--- | :--- |
| **Khách hàng (Customer)** | Tác nhân chính (Primary Actor) | Người dùng truy cập ứng dụng web, xem thực đơn đồ uống, chọn size/topping, quản lý giỏ hàng và tiến hành thanh toán trực tuyến không tiền mặt. |
| **Nhân viên quầy (Barista)** | Tác nhân phụ (Secondary Actor) | Tiếp nhận danh sách đơn hàng đã thanh toán (`PAID`), tiến hành pha chế và chuyển trạng thái đơn sang sẵn sàng giao (`READY`). *(Ngoại vi MVP)* |
| **Cổng thanh toán (Mock Gateway)** | Tác nhân hệ thống (System Actor) | Dịch vụ giả lập xử lý giao dịch trừ tiền trực tuyến (Ví điện tử / Thẻ ngân hàng), phản hồi trạng thái `SUCCESS` hoặc `FAILED`. |
| **Quản trị viên / PO** | Tác nhân quản lý | Quản lý danh mục sản phẩm, theo dõi doanh thu và nghiệm thu các Sprint. |

---

## 3. ĐẶC TẢ CHI TIẾT 10 HẠNG MỤC CÔNG VIỆC (PRODUCT BACKLOG)

Dưới đây là đặc tả chi tiết của 10 Task theo chuẩn Agile Scrum, kèm **Tiêu chí chấp nhận (Acceptance Criteria - AC)** theo chuẩn `Given - When - Then`:

### 📌 Task 1: Khởi tạo dự án & Cấu trúc Monorepo
* **User Story:** Là một lập trình viên, tôi muốn khởi tạo cấu trúc Monorepo thống nhất gồm Frontend và Backend, để toàn đội ngũ có thể phát triển và kiểm thử đồng bộ.
* **Tiêu chí chấp nhận (AC):**
  * `AC1.1`: Thư mục gốc chứa 2 thư mục con độc lập: `frontend/` (Next.js) và `backend/` (NestJS).
  * `AC1.2`: File `.gitignore` loại trừ hoàn toàn `node_modules`, build artifacts (`.next`, `dist`), và file cấu hình môi trường `.env`.
  * `AC1.3`: Chạy lệnh `npm run dev` từ thư mục gốc khởi động thành công cả 2 dịch vụ, backend trả về `"Hello World!"` tại `http://localhost:3001`.

---

### 📌 Task 2: API Danh sách Sản phẩm (`GET /products`) & Prisma ORM
* **User Story:** Là một khách hàng, tôi muốn xem danh sách các món đồ uống trên hệ thống, để tôi có thể lựa chọn món yêu thích.
* **Tiêu chí chấp nhận (AC):**
  * `AC2.1`: Endpoint `GET /products` trả về mã trạng thái `200 OK` kèm danh sách JSON chứa các trường: `id`, `name`, `description`, `price`, `imageUrl`, `category`, `sizes`, `toppings`.
  * `AC2.2`: Cho phép lọc theo danh mục (`GET /products?category=coffee`).
  * `AC2.3`: CSDL được nạp sẵn dữ liệu mẫu thực tế (Cà phê sữa, Americano, Bạc xỉu, Trà đào, Đá xay,...).

---

### 📌 Task 3: Giao diện Trang Menu (Frontend)
* **User Story:** Là một khách hàng, tôi muốn thấy giao diện Menu trực quan, rõ ràng trên điện thoại và máy tính, để tôi tìm kiếm đồ uống nhanh chóng.
* **Tiêu chí chấp nhận (AC):**
  * `AC3.1`: Hiển thị Header gồm: Logo BrewLite, Thanh tìm kiếm, và Nút Giỏ hàng có Badge hiển thị số lượng món.
  * `AC3.2`: Thanh điều hướng danh mục dạng Tabs (Tất cả, Cà phê, Trà, Đá xay, Bánh ngọt).
  * `AC3.3`: Lưới đồ uống hiển thị thẻ Card có hình ảnh sắc nét, tên, giá tiền định dạng VND (ví dụ: `35.000đ`) và nút `+ Thêm`.
  * `AC3.4`: Xử lý đầy đủ trạng thái Đang tải (Skeleton Loading) và trạng thái Không tìm thấy món (Empty State).

---

### 📌 Task 4: Chi tiết Sản phẩm & Tùy biến Size, Topping
* **User Story:** Là một khách hàng, tôi muốn chọn kích cỡ ly và thêm topping tùy thích, để đồ uống đúng theo khẩu vị của mình.
* **Tiêu chí chấp nhận (AC):**
  * `AC4.1`: Khi nhấn vào sản phẩm trên menu, hiển thị Modal / Màn hình chi tiết.
  * `AC4.2`: Tùy chọn Size (Radio button): Nhỏ (S: +0đ), Vừa (M: +5.000đ), Lớn (L: +10.000đ).
  * `AC4.3`: Tùy chọn Topping (Checkbox đa chọn): Trân châu trắng (+5.000đ), Kem Cheese (+10.000đ), Thạch sương sáo (+5.000đ).
  * `AC4.4`: Tổng đơn giá tạm tính trên nút *"Thêm vào giỏ hàng"* phải tự động nhảy theo thời gian thực khi khách chọn/bỏ chọn size và topping.

---

### 📌 Task 5: Giỏ hàng (Cart) & State Management (Zustand)
* **User Story:** Là một khách hàng, tôi muốn giỏ hàng tự động lưu trữ các món đã chọn, để tôi có thể chỉnh sửa số lượng hoặc kiểm tra tổng tiền trước khi đặt.
* **Tiêu chí chấp nhận (AC):**
  * `AC5.1`: Thêm món cùng size và cùng danh sách topping sẽ tăng số lượng (`quantity`), không sinh dòng trùng lặp vô lý.
  * `AC5.2`: Cho phép tăng (`+`), giảm (`-`), hoặc xóa hẳn món khỏi giỏ hàng. Nếu giảm về `0`, tự động xóa món.
  * `AC5.3`: Tự động tính: Tạm tính, Phí dịch vụ (nếu có), Giảm giá voucher, và Tổng tiền cuối cùng.
  * `AC5.4`: Dữ liệu giỏ hàng được đồng bộ vào `localStorage` của trình duyệt, không bị mất khi F5 trang.

---

### 📌 Task 6: API Tạo Đơn Hàng (`POST /orders`)
* **User Story:** Là hệ thống, tôi cần tiếp nhận và thẩm định đơn hàng gửi lên từ giỏ hàng của khách, để khởi tạo đơn hàng hợp lệ ở trạng thái chờ thanh toán.
* **Tiêu chí chấp nhận (AC):**
  * `AC6.1`: Endpoint `POST /orders` yêu cầu Payload chuẩn DTO: `items` (productId, size, toppings, quantity), `note`, `customerName`, `customerPhone`.
  * `AC6.2`: Sử dụng `ValidationPipe` kiểm tra kiểu dữ liệu; nếu payload thiếu hoặc sai kiểu, trả về `400 Bad Request`.
  * `AC6.3`: Tính toán lại tổng tiền từ CSDL (Server-side calculation) để chống hack sửa giá từ phía Client.
  * `AC6.4`: Khởi tạo bản ghi `Order` với trạng thái ban đầu là `PENDING` và trả về mã đơn hàng `orderId` cùng mã hiển thị (ví dụ: `#1042`).

---

### 📌 Task 7: Đăng ký & Đăng nhập Người dùng (JWT Auth)
* **User Story:** Là một khách hàng thành viên, tôi muốn đăng nhập tài khoản an toàn, để lưu lại lịch sử mua sắm và tích điểm thưởng.
* **Tiêu chí chấp nhận (AC):**
  * `AC7.1`: `POST /auth/register`: Đăng ký tài khoản với email hợp lệ, mật khẩu tối thiểu 6 ký tự. Mật khẩu phải được băm bằng thuật toán `bcrypt` trước khi lưu vào CSDL.
  * `AC7.2`: `POST /auth/login`: Xác thực thông tin, nếu đúng trả về chuỗi `accessToken` (JWT).
  * `AC7.3`: Sử dụng NestJS `AuthGuard('jwt')` bảo vệ các endpoint nhạy cảm (như xem lịch sử đơn `GET /orders/me`).

---

### 📌 Task 8: Thanh toán Không Tiền Mặt (Mock Payment Gateway)
* **User Story:** Là một khách hàng, tôi muốn thanh toán đơn hàng qua Ví điện tử hoặc Thẻ ngân hàng, để không phải sử dụng tiền mặt.
* **Tiêu chí chấp nhận (AC):**
  * `AC8.1`: Cho phép khách hàng chọn phương thức: `E_WALLET` (MoMo / ZaloPay) hoặc `BANK_CARD`.
  * `AC8.2`: Gọi `POST /payments` gửi kèm `orderId` và phương thức thanh toán.
  * `AC8.3`: **Kịch bản thành công:** Trạng thái đơn chuyển sang `PAID`, giỏ hàng được dọn sạch, chuyển hướng sang trang Xác nhận đơn hàng.
  * `AC8.4`: **Kịch bản thất bại:** Trạng thái đơn chuyển sang `PAYMENT_FAILED`, giữ nguyên giỏ hàng để khách hàng có thể chọn lại phương thức thanh toán.

---

### 📌 Task 9: Màn hình Xác Nhận, Lịch Sử Đơn & Dockerize
* **User Story:** Là một khách hàng, tôi muốn nhìn thấy mã nhận đồ uống và tra cứu lịch sử mua hàng, để dễ dàng đối chiếu tại quầy.
* **Tiêu chí chấp nhận (AC):**
  * `AC9.1`: Màn hình xác nhận hiển thị: Mã đơn `#1042`, Trạng thái `PAID`, Danh sách món tóm tắt, và Hướng dẫn: *"Mời bạn đến quầy nhận nước sau 5-7 phút"*.
  * `AC9.2`: Trang Lịch sử đơn (`GET /orders/me`) hiển thị danh sách các đơn đã đặt, ngày giờ đặt và tổng tiền.
  * `AC9.3`: Toàn bộ dự án có thể chạy trơn tru qua `docker-compose.yml` gồm cả Frontend, Backend và PostgreSQL.

---

### 📌 Task 10: Nghiệp Vụ Chuyên Sâu & Kiểm Thử Tự Động (Backend Core)
* **User Story:** Là kỹ sư phần mềm, tôi muốn hệ thống có các cơ chế kiểm soát trạng thái, chống trừ tiền trùng và kiểm soát tranh chấp dữ liệu, để đảm bảo tính toàn vẹn thông tin.
* **Tiêu chí chấp nhận (AC):**
  * `AC10.1 (State Machine)`: Chỉ cho phép chuyển trạng thái theo đúng đồ thị:
    * `PENDING` $\rightarrow$ `PAID` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED`
    * `PENDING` $\rightarrow$ `PAYMENT_FAILED` $\rightarrow$ `PAID` (thử lại)
    * `PENDING` / `PAID` $\rightarrow$ `CANCELLED`
    * Mọi chuyển tiếp sai (ví dụ: `PENDING` nhảy cóc sang `COMPLETED`) bị hàm `assertTransition` chặn đứng và trả về lỗi `400 Bad Request`.
  * `AC10.2 (Idempotent Payment)`: Hỗ trợ Header `Idempotency-Key`. Gửi 2 request thanh toán cùng 1 Key chỉ trừ tiền và xử lý đúng 1 lần.
  * `AC10.3 (Concurrency Control)`: Sử dụng cơ chế Optimistic Locking (trường `version`) và Transaction CSDL để ngăn chặn bán âm tồn kho khi nhiều khách đặt cùng thời điểm.
  * `AC10.4 (Loyalty Points)`: Tự động cộng điểm thưởng cho khách hàng thành viên khi đơn đạt trạng thái `PAID` (ví dụ: mỗi 10.000đ được 1 điểm).
  * `AC10.5 (Automated Test)`: Viết bộ kiểm thử Unit/Integration Test tự động chứng minh đạt cả 4 tiêu chí trên.

---

## 4. ĐẶC TẢ CƠ SỞ DỮ LIỆU (DATABASE SPECIFICATION)

### 4.1. Bảng `Product` (Sản phẩm đồ uống)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `String` | Primary Key, CUID / UUID | Định danh duy nhất của sản phẩm |
| `name` | `String` | Not Null | Tên đồ uống (Cà phê sữa, Americano,...) |
| `description`| `String` | Nullable | Mô tả hương vị món |
| `price` | `Decimal(10,2)`| Not Null | Giá gốc (kích cỡ S) |
| `imageUrl` | `String` | Not Null | Đường dẫn ảnh minh họa |
| `categoryId` | `String` | Foreign Key (`Category.id`) | Nhóm danh mục |
| `stock` | `Int` | Default: 100 | Số lượng tồn kho phục vụ trong ngày |
| `version` | `Int` | Default: 1 | Số hiệu phiên bản dùng cho Optimistic Locking |

### 4.2. Bảng `Order` (Đơn hàng)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `String` | Primary Key, CUID | Định danh duy nhất |
| `orderCode` | `String` | Unique, Not Null | Mã hiển thị thân thiện (ví dụ: `#1042`) |
| `userId` | `String` | Nullable, FK (`User.id`) | Khách hàng thành viên (null nếu khách vãng lai) |
| `status` | `Enum` | PENDING, PAID, PREPARING, READY, COMPLETED, CANCELLED, PAYMENT_FAILED | Trạng thái cỗ máy đơn hàng |
| `total` | `Decimal(10,2)`| Not Null | Tổng tiền phải thanh toán |
| `createdAt` | `DateTime` | Default: `now()` | Thời điểm tạo đơn |

### 4.3. Bảng `OrderItem` (Chi tiết món trong đơn)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `String` | Primary Key | Định danh dòng chi tiết |
| `orderId` | `String` | Foreign Key (`Order.id`) | Thuộc đơn hàng nào |
| `productId` | `String` | Foreign Key (`Product.id`)| Sản phẩm nào |
| `size` | `String` | S / M / L | Kích cỡ ly đã chọn |
| `toppings` | `Json` | Array string | Danh sách topping chọn kèm |
| `quantity` | `Int` | Not Null, `>= 1` | Số lượng ly |
| `lineTotal` | `Decimal(10,2)`| Not Null | Tổng tiền dòng = `(giá gốc + size + toppings) * quantity` |

### 4.4. Bảng `Payment` (Giao dịch thanh toán)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `id` | `String` | Primary Key | Định danh giao dịch |
| `orderId` | `String` | Foreign Key (`Order.id`) | Đơn hàng được thanh toán |
| `idempotencyKey`| `String`| Unique, Not Null | Khóa chống trùng lặp thanh toán |
| `amount` | `Decimal(10,2)`| Not Null | Số tiền thực trả |
| `method` | `String` | MOMO / VNPAY / CARD | Phương thức thanh toán |
| `status` | `String` | SUCCESS / FAILED | Kết quả giao dịch |

---

## 5. ĐẶC TẢ GIAO DIỆN LẬP TRÌNH ỨNG DỤNG (API SPECIFICATION)

| Phương thức | Đường dẫn (Endpoint) | Quyền truy cập | Mô tả chức năng | Mã trạng thái trả về |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/products` | Public | Lấy danh sách menu đồ uống | `200 OK` |
| `GET` | `/products/:id` | Public | Lấy chi tiết 1 sản phẩm kèm sizes, toppings | `200 OK`, `404 Not Found` |
| `POST`| `/auth/register` | Public | Đăng ký tài khoản người dùng mới | `201 Created`, `400 Bad Request` |
| `POST`| `/auth/login` | Public | Đăng nhập và nhận chuỗi JWT Token | `200 OK`, `401 Unauthorized` |
| `POST`| `/orders` | Public / User | Tạo đơn hàng mới từ giỏ hàng (PENDING) | `201 Created`, `400 Bad Request` |
| `POST`| `/payments` | Public / User | Thực hiện thanh toán cho đơn hàng (Idempotent) | `200 OK`, `400`, `409 Conflict` |
| `GET` | `/orders/me` | Bearer JWT | Lấy lịch sử đơn hàng của tài khoản đang đăng nhập | `200 OK`, `401 Unauthorized` |
| `PATCH`| `/orders/:id/status`| Admin / Barista | Cập nhật trạng thái đơn (State Machine kiểm tra) | `200 OK`, `400 Bad Request` |

---

## 6. QUY TẮC NGHIỆP VỤ CỐT LÕI (BUSINESS RULES - BR)

* **BR-01 (Toàn vẹn giá):** Giá tiền hiển thị ở Client chỉ mang tính chất tham khảo. Khi nhận request `POST /orders`, Backend **bắt buộc** phải truy vấn đơn giá gốc từ CSDL, cộng giá size và topping tương ứng để tính toán lại tổng tiền nhằm chống gian lận dữ liệu.
* **BR-02 (Ràng buộc chuyển trạng thái đơn hàng):**
  * Không bao giờ được phép chuyển trực tiếp từ `PENDING` sang `READY` hoặc `COMPLETED`.
  * Đơn hàng đã ở trạng thái `COMPLETED` hoặc `CANCELLED` là trạng thái kết thúc (Terminal State), không được phép chỉnh sửa nữa.
* **BR-03 (Chống trùng lặp thanh toán - Idempotency):**
  * Client gửi `Idempotency-Key` (UUIDv4) trong HTTP Header.
  * Nếu hệ thống phát hiện `Idempotency-Key` đã tồn tại và đã xử lý thành công, trả về ngay kết quả đã lưu mà không trừ tiền lần hai.
* **BR-04 (Kiểm soát tồn kho tranh chấp):**
  * Sử dụng Optimistic Concurrency Control với mệnh đề `WHERE id = :id AND version = :version AND stock >= :qty`.
  * Nếu số lượng bản ghi bị tác động bằng `0`, ném ngoại lệ `409 Conflict` và yêu cầu người dùng thử lại.

---
*Bản đặc tả này được dùng làm căn cứ kỹ thuật chính thức cho toàn bộ quá trình lập trình, kiểm thử và nghiệm thu đồ án BrewLite.*
