# Kịch Bản Trình Bày & Bảo Vệ Đồ Án — BrewLite

**Đề tài:** BrewLite — Hệ thống đặt và thanh toán đồ uống không dùng tiền mặt (*Cashless Coffee Ordering System*)  
**Phạm vi:** Assignment 1 (10 Tasks Scrum) & Assignment 2 (5 Tasks: Requirements → Deployment)  
**Kho mã nguồn:** [https://github.com/nphat-code/swe-project](https://github.com/nphat-code/swe-project)  
**Live Production:** [https://3.26.221.207.sslip.io](https://3.26.221.207.sslip.io)  
**Thời lượng gợi ý:** 6 – 8 phút (trình bày tổng quan + demo trực tiếp)

---

## Phần 1: Giới thiệu bài toán & Yêu cầu (1 phút)

> **Lời thoại gợi ý:**  
> *"Em xin phép trình bày tổng quan đồ án BrewLite — hệ thống đặt và thanh toán đồ uống không dùng tiền mặt theo mô hình Click & Collect (đặt trước trên web/PWA, thanh toán trực tuyến và nhận nước nhanh tại quầy)."*

**Nội dung cần nêu:**
- **Mục tiêu:** Giảm thời gian xếp hàng, loại bỏ sai sót ghi chú size/topping và xử lý 100% thanh toán không tiền mặt.
- **Assignment 1:** Hoàn thiện **10 User Stories (`US-01` → `US-10`)** kèm Acceptance Criteria (`docs/requirements/user-stories.md`) và tổ chức Product Backlog qua 3 Sprint.
- **Assignment 2 (Task 1):** Hoàn thiện bộ tài liệu khai thác yêu cầu gồm Bối cảnh & 6 nhóm Stakeholder (`docs/requirements/context-and-scope.md`), Ma trận FR/NFR (`docs/requirements/system-requirements-matrix.md`) và Đặc tả Use Case trọng tâm (`docs/requirements/core-use-case-specification.md`).

---

## Phần 2: Mô hình hóa UML & Kiến trúc hệ thống (1.5 phút)

> **Lời thoại gợi ý:**  
> *"Từ bộ yêu cầu trên, nhóm em đã mô hình hóa đầy đủ 4 sơ đồ UML và thiết kế kiến trúc Modular Monolith tách rõ Frontend, Backend và Database."*

**Nội dung cần nêu:**
1. **Mô hình hóa UML (Task 2):**
   - **Use Case Diagram:** Bao quát các tác nhân Khách hàng, Barista/Staff, Quản lý, Cổng thanh toán.
   - **Activity Diagram (`docs/diagrams/activity/`):** Có Swimlane, Fork/Join cho luồng đặt hàng & thanh toán.
   - **Sequence Diagram (`docs/diagrams/sequence/`):** 5 lifelines, có `alt/opt/loop` và cơ chế Idempotent Payment.
   - **Class Diagram (`docs/diagrams/class/`):** 7 lớp Domain chính, Multiplicity và Enum trạng thái.
2. **Kiến trúc & Công nghệ (Task 3 — `docs/architecture/architecture-description.md`):**
   - **Frontend:** Next.js 19 (App Router, TypeScript, TailwindCSS v4, Zustand, hỗ trợ PWA qua `/manifest.webmanifest`).
   - **Backend:** NestJS REST API (Swagger tại `/api`, Passport JWT, `class-validator`).
   - **Database:** PostgreSQL 16 + Prisma ORM (`User`, `Category`, `Product`, `SizeOption`, `Topping`, `Order`, `OrderItem`, `Payment`, `Voucher`).

---

## Phần 3: Tính năng & Nghiệp vụ cốt lõi đã lập trình (1.5 phút)

> **Lời thoại gợi ý:**  
> *"Về phần lập trình, hệ thống đã đáp ứng đầy đủ 5 màn hình MVP, 7 API cốt lõi của Assignment 1 và tích hợp thanh toán PayOS VietQR thật."*

**Các điểm nhấn kỹ thuật nên nói:**
1. **Đầy đủ luồng MVP & mở rộng:** Duyệt menu, lọc danh mục, tìm kiếm, tùy biến Size/Topping, giỏ hàng bền vững (`localStorage`), áp dụng Voucher (`BREWLITEFIRST`, `COFFEELOVER`), tích điểm Loyalty và xem lịch sử đơn hàng.
2. **Thanh toán thực tế qua PayOS VietQR (`backend/src/payments/payos.service.ts`):**
   - Giao diện Checkout sử dụng **Chuyển khoản VietQR (PayOS)** (`POST /api/payments/payos`) sinh mã QR ngân hàng thật.
   - Tự động xác nhận đơn chuyển sang `PAID` qua Webhook bảo mật chữ ký HMAC-SHA256 (`POST /api/payments/payos-webhook`) kết hợp đồng bộ trạng thái (`GET /api/payments/payos/sync/:orderId`).
3. **An toàn dữ liệu & Giao dịch:**
   - **Server-side calculation:** Backend tự tính lại toàn bộ tiền món, topping, voucher từ CSDL.
   - **Idempotency-Key:** Chống tạo/trừ tiền trùng lặp khi mạng chập chờn hoặc bấm lặp.
   - **Order State Machine (`assertTransition`) & Optimistic Locking (`version`):** Ngăn nhảy cóc trạng thái đơn (`PENDING → PAID → PREPARING → READY → COMPLETED`) và tránh bán âm tồn kho khi nhiều người đặt cùng lúc.

---

## Phần 4: Quy trình Scrum, Kiểm thử & Triển khai Production (1 phút)

> **Lời thoại gợi ý:**  
> *"Toàn bộ dự án được quản lý theo Scrum, có ma trận truy vết, bộ kiểm thử tự động và CI/CD deploy trực tiếp lên AWS EC2."*

**Số liệu thực tế để trích dẫn:**
- **Scrum & Truy vết:** Có Branching Strategy, Definition of Done (DoD), Sprint 1 & Sprint 2 Backlog, Burndown Chart, Review & Retrospective (`docs/sprint/`) và Ma trận truy vết `FR/US → Use Case → UML → Code → Test` (`docs/traceability-matrix.md`).
- **Kiểm thử tự động:**
  - **Backend:** 17 test suites / 89 unit tests (riêng Task 10 AS1 đạt 4/4 suites, 23/23 tests) + bộ HTTP E2E tests (`test:e2e`).
  - **Frontend:** 14 test suites / 52 tests + `eslint` (0 lỗi/0 cảnh báo), `tsc --noEmit` và `next build` đều pass.
- **DevOps & Cloud:**
  - Chạy local 3 services (`postgres`, `backend`, `frontend`) bằng 1 lệnh `docker compose up --build -d`.
  - GitHub Actions CI/CD (`.github/workflows/cd.yml`) tự động test, build Docker và deploy lên **AWS EC2 (`ap-southeast-2`, Ubuntu 26.04 LTS)** chạy qua **Nginx + HTTPS Let's Encrypt**, khóa cổng `5432` của PostgreSQL khỏi truy cập bên ngoài.

---

## Phần 5: Kịch bản Demo Live trên trình duyệt (2 – 3 phút)

Mở sẵn các tab sau trước khi quay/trình bày:
1. **Tab 1 — Trang chủ Production (`https://3.26.221.207.sslip.io`):**
   - Lọc danh mục, tìm kiếm món → chọn 1 món → chọn Size & Topping → thêm vào giỏ hàng.
   - Mở Giỏ hàng → bấm **Tiến hành thanh toán** → đăng nhập bằng nút điền nhanh tài khoản Demo (`customer@brewlite.vn`) hoặc tài khoản khách hàng.
   - Ở cửa sổ Checkout: áp thử mã voucher gợi ý (`BREWLITEFIRST`), nhập ghi chú cho Barista → bấm **Tạo mã QR thanh toán**.
   - Hiển thị mã QR VietQR thật của PayOS → quét mã thanh toán (hoặc cho xem thông tin tài khoản, nội dung chuyển khoản và cơ chế tự động kiểm tra trạng thái mỗi 3 giây) → đơn xác nhận thành công, hiện mã nhận nước và cộng điểm thưởng Loyalty.
   - Mở **Lịch sử đơn hàng** để kiểm tra đơn vừa đặt.
2. **Tab 2 — Swagger API (`https://3.26.221.207.sslip.io/api`):**
   - Lướt nhanh danh sách endpoint REST API (`Auth`, `Products`, `Vouchers`, `Orders`, `Payments`).
3. **Tab 3 — Healthcheck (`https://3.26.221.207.sslip.io/health`):**
   - Chỉ ra `status: "ok"` và `database: { status: "up" }`.
4. **Tab 4 — GitHub Actions (`https://github.com/nphat-code/swe-project/actions`):**
   - Cho thấy pipeline CI/CD chạy tự động và trạng thái xanh.

---

## Phần 6: Trả lời nhanh câu hỏi vấn đáp thường gặp (Q&A)

1. **Hệ thống có làm quản lý nguyên liệu hay màn hình pha chế KDS cho Barista không?**  
   - *Trả lời:* Dạ không thuộc phạm vi MVP. Theo tài liệu phạm vi (`docs/requirements/context-and-scope.md`), đề tài tập trung vào luồng cốt lõi **Click & Collect & Thanh toán không tiền mặt** cho khách hàng (đủ 5 màn hình MVP và 7 APIs của Assignment 1, kèm tồn kho theo sản phẩm + Optimistic Locking và Order State Machine). Phần **quản lý kho nguyên liệu định lượng** và **màn hình KDS realtime cho Barista** được định nghĩa rõ trong **Future Scope** cho giai đoạn mở rộng tiếp theo.
2. **Vì sao Backend vẫn có `POST /api/payments` trong khi giao diện chỉ dùng PayOS VietQR?**  
   - *Trả lời:* Giao diện người dùng chỉ dùng **PayOS VietQR thật** để đảm bảo trải nghiệm thanh toán thực tế không mock. Backend vẫn giữ `POST /api/payments` để các bài kiểm thử tự động (Unit Test & E2E Test trong CI/CD) chạy ổn định, không phụ thuộc mạng ngoài hay phát sinh giao dịch ngân hàng thật khi chạy pipeline.
3. **Làm sao đảm bảo khách bấm thanh toán 2 lần không bị trừ tiền/tạo đơn trùng?**  
   - *Trả lời:* Frontend sinh `Idempotency-Key` (UUIDv4) cho mỗi phiên thanh toán; Backend kiểm tra khóa này trong bảng `Payment` để trả về kết quả cũ nếu trùng lặp, kết hợp `assertTransition` và `Prisma.$transaction` đảm bảo tính nhất quán dữ liệu.
