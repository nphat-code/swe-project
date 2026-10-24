# 📊 MA TRẬN TRUY VẾT YÊU CẦU (TRACEABILITY MATRIX)
## Dự án: BrewLite — Cashless Coffee Ordering System
### Căn cứ Mục 8.1 — Assignment 2 (Software Engineering)

---

> Ma trận truy vết đảm bảo tính liên kết xuyên suốt (Traceability) giữa:  
> **Yêu cầu nghiệp vụ (FR/NFR)** $\iff$ **Sơ đồ mô hình hóa (UML Diagrams)** $\iff$ **Hiện thực mã nguồn (Code / API / UI)** $\iff$ **Kịch bản kiểm thử (Test Cases)**.  
> *Lưu ý quy định:* Nếu task trước chưa có tạo phẩm bắt buộc, task sau không được tính điểm phần truy vết.

---

## 1. MA TRẬN TRUY VẾT YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

| Mã yêu cầu | Tên yêu cầu chức năng | Use Case liên quan | Thiết kế / Sơ đồ tương ứng | Code / API Hiện thực | Mã Kiểm thử (Test ID) | Trạng thái |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **FR-01** | **Duyệt menu & Lọc danh mục** | `UC01` (Xem thực đơn) | - Sơ đồ Use Case tổng quát<br/>- `activity-flow.puml`<br/>- `class-domain.mmd` (`Product`, `Category`) | - `GET /products`<br/>- `GET /products/categories`<br/>- `CategoryFilter.tsx`, `ProductCard.tsx` | `API-T01`<br/>`UI-T01` | 🟢 Hoàn tất Task 1 & 2.1 |
| **FR-02** | **Tùy biến Size & Topping** | `UC03` (Tùy biến món)<br/>`UC03.1`, `UC03.2`, `UC03.3` | - `activity-flow.puml`<br/>- `class-domain.mmd` (`SizeOption`, `Topping`) | - `GET /products/:id`<br/>- `ProductDetailModal.tsx` | `UI-T02` | 🟢 Hoàn tất Task 1 & 2.1 |
| **FR-03** | **Quản lý Giỏ hàng Client** | `UC04` (Quản lý giỏ hàng) | - `use-case-checkout.mmd`<br/>- `activity-flow.puml`<br/>- `class-domain.mmd` (`OrderItem`) | - `useCartStore.ts` (Zustand)<br/>- `CartDrawer.tsx` | `UNIT-CART01` | 🟢 Hoàn tất Task 1 & 2.1 |
| **FR-04** | **Xác thực người dùng (JWT)** | `UC05` (Đăng ký / Đăng nhập) | - `sequence-checkout.mmd`<br/>- `class-domain.mmd` (`User`, `Role`) | - `POST /auth/register`<br/>- `POST /auth/login`<br/>- `JwtAuthGuard`, `AuthService` | `API-AUTH01` | 🟢 Hoàn tất Task 1 |
| **FR-05** | **Khởi tạo đơn hàng (Server Calc & JWT)** | `UC06` (Đặt hàng - Checkout) | - `use-case-checkout.mmd`<br/>- `sequence-checkout.mmd`<br/>- `class-domain.mmd` (`Order`, `User`) | - `POST /orders`<br/>- `OrdersController.create`<br/>- `OrdersService.createOrder`<br/>- `OrderSuccessModal.tsx` | `INT-ORD01` | 🟢 Hoàn tất Task 1 |
| **FR-06** | **Thanh toán trực tuyến Idempotent** | `UC07` (Thanh toán trực tuyến) | - `use-case-checkout.mmd`<br/>- `sequence-checkout.mmd`<br/>- `class-domain.mmd` (`Payment`) | - `POST /payments`<br/>- `PaymentsService.process`<br/>- `IdempotencyInterceptor` | `INT-PAY01`<br/>`UNIT-IDEMP01` | 🟢 Hoàn tất Task 1 |
| **FR-07** | **Cỗ máy trạng thái đơn (State Machine)** | `UC11` (Cập nhật trạng thái) | - `sequence-checkout.mmd`<br/>- `class-domain.mmd` (`OrderStatus`) | - `OrdersService.assertTransition`<br/>- `OrdersService.updateStatus` | `UNIT-STATE01` | 🟢 Hoàn tất Task 1 |
| **FR-08** | **Kiểm soát tồn kho đồng thời** | `UC14` (Quản lý tồn kho) | - `sequence-checkout.mmd`<br/>- `class-domain.mmd` (`Product.version`) | - Prisma Transaction (`$transaction`)<br/>- Optimistic Locking query | `UNIT-CONCUR01` | 🟢 Hoàn tất Task 1 |
| **FR-09** | **Tích lũy điểm thưởng thành viên** | `UC08` (Tích lũy điểm thưởng) | - `use-case-checkout.mmd`<br/>- `class-domain.mmd` (`LoyaltyTransaction`) | - `LoyaltyService.awardPoints` | `UNIT-LOYAL01` | 🟢 Hoàn tất Task 1 |
| **FR-10** | **Xem lịch sử đơn hàng** | `UC09` (Xem lịch sử đơn hàng) | - `activity-flow.puml`<br/>- `class-domain.mmd` (`Order`) | - `GET /orders/me`<br/>- `app/orders/page.tsx` | `E2E-FLOW01` | 🟢 Hoàn tất Task 1 & 2.1 |
| **FR-11** | **Áp dụng mã Voucher giảm giá** | `UC06.1` (Áp dụng Voucher) | - `use-case-checkout.mmd`<br/>- `class-domain.mmd` (`Promotion`) | - `POST /vouchers/apply`<br/>- `VoucherService.validate` | `INT-VOUCH01` | 🟢 Hoàn tất Task 1 |
| **FR-12** | **Quầy tiếp nhận pha chế Barista** | `UC10`, `UC11`, `UC12` | - `activity-flow.puml` | - `app/barista/page.tsx` *(Mở rộng)* | `UI-BARISTA01` | 🟢 Hoàn tất Task 1 & 2.1 |

---

## 2. MA TRẬN TRUY VẾT YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

| Mã NFR | Nhóm chất lượng | Tiêu chuẩn kiểm chứng | Thiết kế / Giải pháp kiến trúc | Thành phần Code / Hạ tầng | Mã Kiểm thử (Test ID) |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **NFR-01** | **Hiệu năng (Performance)** | Thời gian phản hồi API $\le 500\text{ms}$ (p95); FCP $\le 1.8\text{s}$ | Next.js SSR/PWA + Prisma Connection Pooling | `main.ts`, Neon Serverless PG | `PERF-01` |
| **NFR-02** | **Bảo mật (Security)** | Mật khẩu băm `bcrypt` (salt $\ge 10$), Token JWT, HTTPS/TLS, Header `Idempotency-Key` | Passport-JWT Guard, SSL/TLS, Idempotency Interceptor | `auth.service.ts`, `jwt.strategy.ts` | `SEC-01` |
| **NFR-03** | **Tính khả dụng (Usability)** | Giao diện Mobile-first, đủ 3 trạng thái UX (Skeleton, Empty, Error) | Tailwind CSS v4, Component Skeleton & Empty State | `ProductSkeleton.tsx`, `EmptyState.tsx` | `UI-UX01` |
| **NFR-04** | **Toàn vẹn dữ liệu (Integrity)** | Server-side Price Calculation, ACID Transaction, Optimistic Locking | Prisma `$transaction`, PostgreSQL Constraints | `orders.service.ts` | `DATA-01` |
| **NFR-05** | **Khả năng triển khai (Deployability)** | Chạy local bằng 1 lệnh `docker-compose up`, deploy Cloud có URL công khai | `docker-compose.yml`, Dockerfile Multi-stage | `docker-compose.yml`, Cloud URL | `DEPLOY-01` |
| **NFR-06** | **Tự động hóa CI/CD** | Pipeline CI chạy tự động: Lint $\rightarrow$ Test $\rightarrow$ Build, chặn merge khi lỗi | GitHub Actions Workflow (`ci.yml`, `cd.yml`) | `.github/workflows/ci.yml` | `CI-GATE01` |
| **NFR-07** | **Chuẩn mực mã nguồn (Clean Code)** | **Tuyệt đối không có comment trong code**, Self-documenting code, Conventional Commits | Quy định [AGENTS.md](../AGENTS.md) | Toàn bộ mã nguồn `.ts`, `.tsx` | `LINT-01` |
| **NFR-08** | **Khả năng mở rộng (Scalability)** | Kiến trúc Module hóa cao (NestJS Modules), hỗ trợ auto-retry khi CSDL cold-start | NestJS Modular Architecture + Neon Pooling | `app.module.ts`, `prisma.service.ts` | `SCALE-01` |
| **NFR-09** | **Kiểm tra sức khỏe hệ thống** | Endpoint `GET /health` kiểm tra uptime API và ping kết nối CSDL (Status: 200 OK) | Health Module / Terminus Indicator | `app.controller.ts` (`/health`) | `HEALTH-01` |

---
*Tài liệu ma trận truy vết được cập nhật liên tục qua từng giai đoạn từ Task 1 đến Task 5.*
