# 📝 USER STORIES & ACCEPTANCE CRITERIA (ASSIGNMENT 1)
## Dự án: BrewLite — Ứng dụng đặt cà phê không dùng tiền mặt

> **Căn cứ đề bài:** Mục 4.3 & Mục 8 ([`docs/DE_BAI_ASSIGNMENT_1_GOC.md`](../DE_BAI_ASSIGNMENT_1_GOC.md))  
> **Quy chuẩn viết:** *"Là một `<vai trò>`, tôi muốn `<hành động>`, để `<giá trị>`"* kèm Tiêu chí chấp nhận (Acceptance Criteria) có thể kiểm chứng.

---

## 1. BẢNG TỔNG HỢP 10 USER STORIES THEO PRODUCT BACKLOG

| Mã US | Task AS1 | Mã FR | Vai trò | User Story (Mục tiêu & Giá trị) | Trạng thái |
| :---: | :---: | :---: | :--- | :--- | :---: |
| **US-01** | Task 1 | Nền tảng | Lập trình viên | Là một **lập trình viên**, tôi muốn khởi tạo Monorepo (`frontend/`, `backend/`, `docs/`), cấu hình Git, `.env.example` và `README.md`, để cả hệ thống có nền tảng thống nhất dễ chạy và kiểm thử. | 🟢 Done |
| **US-02** | Task 2 | `FR-01` | Khách hàng | Là một **khách hàng**, tôi muốn hệ thống có API `GET /products` lấy thực đơn từ PostgreSQL kèm danh mục và topping, để luôn xem được món đang phục vụ và giá chính xác. | 🟢 Done |
| **US-03** | Task 3 | `FR-01` | Khách hàng | Là một **khách hàng**, tôi muốn xem danh sách đồ uống theo Tabs danh mục, tìm kiếm nhanh và thấy trạng thái tải/rỗng/lỗi rõ ràng trên điện thoại, để chọn nước nhanh mà không cần đứng chờ đọc bảng ở quầy. | 🟢 Done |
| **US-04** | Task 4 | `FR-02` | Khách hàng | Là một **khách hàng**, tôi muốn mở chi tiết món để chọn kích cỡ (S/M/L), thêm nhiều topping, nhập ghi chú cho Barista và thấy giá tổng cập nhật tức thì, để đặt đúng ly nước theo sở thích cá nhân. | 🟢 Done |
| **US-05** | Task 5 | `FR-03` | Khách hàng | Là một **khách hàng**, tôi muốn thêm/tăng/giảm/xóa món trong giỏ hàng và lưu tự động ở trình duyệt, để không bị mất đơn khi tải lại trang hoặc đăng nhập. | 🟢 Done |
| **US-06** | Task 6 | `FR-05` | Khách hàng | Là một **khách hàng**, tôi muốn hệ thống tạo đơn hàng trạng thái `PENDING` bằng giá gốc tính lại trên Server, để đảm bảo tính minh bạch và chống gian lận đơn giá. | 🟢 Done |
| **US-07** | Task 7 | `FR-04` | Khách thành viên | Là một **khách hàng**, tôi muốn đăng ký và đăng nhập bảo mật bằng JWT, để bảo vệ thông tin cá nhân, đơn hàng và điểm thưởng của riêng tôi. | 🟢 Done |
| **US-08** | Task 8 | `FR-06` | Khách hàng | Là một **khách hàng**, tôi muốn thanh toán không dùng tiền mặt (Ví/Thẻ mô phỏng hoặc VietQR PayOS thật) và giữ nguyên giỏ hàng nếu giao dịch lỗi, để thanh toán nhanh chóng không cần mang tiền mặt. | 🟢 Done |
| **US-09** | Task 9 | `FR-10` | Khách hàng | Là một **khách hàng**, tôi muốn thấy màn hình xác nhận kèm mã nhận nước `#xxxxxx` sau khi trả tiền và xem lại lịch sử đơn hàng cá nhân (`GET /orders/me`), để theo dõi tiến độ pha chế tại quầy. | 🟢 Done |
| **US-10** | Task 10 | `FR-07`, `FR-08`, `FR-09`, `FR-11` | Khách thành viên | Là một **khách thành viên**, tôi muốn đơn hàng của mình được chuyển trạng thái đúng quy trình, không bị trừ tiền 2 lần (`Idempotency-Key`), không bị đặt vượt tồn kho (`Optimistic Lock`), được áp Voucher và cộng điểm thưởng khi `PAID`, để giao dịch luôn an toàn và chính xác. | 🟢 Done |

---

## 2. CHI TIẾT TIÊU CHÍ CHẤP NHẬN (ACCEPTANCE CRITERIA) CHO TỪNG USER STORY

### US-01 — Khởi tạo dự án và cấu trúc (Task 1)
- **Story:** Là một *lập trình viên*, tôi muốn khởi tạo Monorepo gồm `frontend/` (Next.js) và `backend/` (NestJS), để phát triển và kiểm thử đồng bộ trên một kho mã nguồn.
- **Acceptance Criteria:**
  - Có đầy đủ `frontend/`, `backend/`, `docs/`, `.env.example`, `.gitignore`, `README.md`.
  - Lệnh `npm run dev` khởi chạy được đồng thời Frontend (`:3000`) và Backend (`:3001`).

### US-02 — API danh sách sản phẩm (Task 2)
- **Story:** Là một *khách hàng*, tôi muốn Backend cung cấp API `GET /products`, `GET /products/:id`, `GET /products/categories` và `GET /products/toppings`, để ứng dụng hiển thị thực đơn chính xác từ PostgreSQL.
- **Acceptance Criteria:**
  - Trả về HTTP `200 OK` gồm 12 món thuộc 4 danh mục thực tế và 6 loại topping từ script `prisma/seed.ts`.
  - Trả về HTTP `404 Not Found` khi truy vấn ID sản phẩm không tồn tại.

### US-03 — Trang Menu Mobile-First (Task 3)
- **Story:** Là một *khách hàng*, tôi muốn duyệt thực đơn theo danh mục, tìm kiếm theo tên và xem giá định dạng VND (`35.000₫`), để chọn món thuận tiện trên điện thoại.
- **Acceptance Criteria:**
  - Hiển thị Skeleton Loading khi đang tải, Empty State khi không tìm thấy món, và Error State có nút Thử lại khi mất kết nối API.

### US-04 — Chi tiết và tùy chọn sản phẩm (Task 4)
- **Story:** Là một *khách hàng*, tôi muốn chọn Size (`S`/`M`/`L`), đa Topping và ghi chú cho Barista, để tùy biến ly đồ uống đúng gu và biết chính xác tổng tiền trước khi thêm giỏ.
- **Acceptance Criteria:**
  - Tổng giá trên nút *"Thêm vào giỏ"* cập nhật realtime khi đổi Size, tick Topping hoặc tăng giảm số lượng.
  - Hỗ trợ phím `Escape` và thuộc tính truy cập ARIA.

### US-05 — Quản lý giỏ hàng (Task 5)
- **Story:** Là một *khách hàng*, tôi muốn xem giỏ hàng, chỉnh số lượng, xóa món, áp mã giảm giá và giữ nguyên giỏ sau khi F5, để dễ dàng điều chỉnh đơn trước khi thanh toán.
- **Acceptance Criteria:**
  - Badge số lượng trên Header đồng bộ tức thì với `useCartStore` (Zustand) và lưu vào `localStorage`.
  - Gộp chung số lượng khi thêm món giống hệt nhau về sản phẩm, size và topping.

### US-06 — API tạo đơn hàng (Task 6)
- **Story:** Là một *khách hàng*, tôi muốn gửi giỏ hàng lên `POST /orders` để tạo đơn trạng thái `PENDING` với giá tính lại trên Server, để không bị sai lệch tổng tiền.
- **Acceptance Criteria:**
  - DTO được kiểm tra bằng `class-validator` (`ValidationPipe`).
  - Backend truy vấn CSDL tự tính `totalAmount`, `discountAmount`, `finalAmount`, bỏ qua giá từ Client.

### US-07 — Đăng ký / Đăng nhập JWT (Task 7)
- **Story:** Là một *khách hàng*, tôi muốn đăng ký và đăng nhập bằng email/mật khẩu, để được cấp JWT bảo vệ toàn bộ thao tác đặt đơn và thanh toán.
- **Acceptance Criteria:**
  - Mật khẩu băm bằng `bcrypt` (salt rounds $\ge 10$); `POST /auth/login` trả `accessToken`.
  - Request không có JWT hợp lệ gọi `/orders` hoặc `/payments` bị chặn với `401 Unauthorized`.

### US-08 — Thanh toán không dùng tiền mặt (Task 8)
- **Story:** Là một *khách hàng*, tôi muốn chọn Ví điện tử, Thẻ ngân hàng (mô phỏng) hoặc chuyển khoản VietQR (PayOS thật), để hoàn tất thanh toán không tiền mặt.
- **Acceptance Criteria:**
  - Khi thanh toán thành công, đơn chuyển sang `PAID` và dọn sạch giỏ hàng.
  - Khi thanh toán thất bại, đơn chuyển `PAYMENT_FAILED`, **giỏ hàng được giữ nguyên** và có nút thử lại.

### US-09 — Xác nhận, Lịch sử đơn & Bàn giao (Task 9)
- **Story:** Là một *khách hàng*, tôi muốn xem mã đơn `#xxxxxx` sau khi thanh toán và tra cứu lại toàn bộ đơn cũ ở `GET /orders/me`, để đến quầy nhận đúng ly nước của mình.
- **Acceptance Criteria:**
  - Hệ thống khởi chạy trọn bộ 3 services (`postgres`, `backend`, `frontend`) bằng `docker compose up --build -d` và chạy live trên AWS EC2 HTTPS (`https://3.26.221.207.sslip.io`).

### US-10 — Nghiệp vụ Backend nâng cao (Task 10)
- **Story:** Là một *khách thành viên*, tôi muốn toàn bộ giao dịch của mình tuân thủ State Machine (`assertTransition`), chống lặp (`Idempotency-Key`), chống đặt vượt tồn kho (`Product.version`), áp Voucher và tích điểm Loyalty, để luôn đặt món an toàn dưới tải cao.
- **Acceptance Criteria:**
  - Có unit/integration test chứng minh đầy đủ 3 tiêu chí `(a)`, `(b)`, `(c)` và test HTTP E2E qua Supertest.

