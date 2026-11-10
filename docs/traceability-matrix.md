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
| **FR-01** | **Duyệt menu & Lọc danh mục** | `UC01` (Xem thực đơn) | - Sơ đồ Use Case tổng quát<br/>- `activity-flow.puml`<br/>- `class-domain.mmd` (`Product`, `ProductCategory`) | - `GET /products`<br/>- `GET /products/categories`<br/>- `CategoryFilter.tsx`, `ProductCard.tsx`, `page.tsx` | `API-T01` (`products.*.spec.ts`)<br/>`UI-T01` (`CategoryFilter.test.tsx`, `ProductCard.test.tsx`, `page.test.tsx`) | 🟢 Hoàn tất Task 4 (Sprint 1) |
| **FR-02** | **Tùy biến Size & Topping** | `UC03` (Tùy biến món)<br/>`UC03.1`, `UC03.2`, `UC03.3` | - `activity-flow.puml`<br/>- `class-domain.mmd` (`Size`, `OrderItem`) | - `GET /products/:id`<br/>- `GET /products/toppings`<br/>- `ProductDetailModal.tsx` | `UI-T02` (`ProductDetailModal.test.tsx`, `api.test.ts`) | 🟢 Hoàn tất Task 4 (Sprint 1) |
| **FR-03** | **Quản lý Giỏ hàng Client** | `UC04` (Quản lý giỏ hàng) | - `use-case-checkout.mmd`<br/>- `activity-flow.puml`<br/>- `class-domain.mmd` (`OrderItem`) | - `useCartStore.ts` (Zustand)<br/>- `CartDrawer.tsx`, `Header.tsx`, `page.tsx` | `UNIT-CART01` (`useCartStore.test.ts`, `CartDrawer.test.tsx`, `page.test.tsx`) | 🟢 Hoàn tất Task 5 (Sprint 2) |
| **FR-04** | **Xác thực người dùng (JWT)** | `UC05` (Đăng ký / Đăng nhập) | - `sequence-checkout.mmd`<br/>- `class-domain.mmd` (`User`, `Role`) | - `POST /auth/register`, `POST /auth/login`, `GET /auth/me`<br/>- `AuthController`, `AuthService`, `JwtStrategy`, `JwtAuthGuard` (bảo vệ `/orders`)<br/>- `useAuthStore.ts`, `AuthModal.tsx`, `Header.tsx` | `API-AUTH01` (`auth.*.spec.ts`)<br/>`UI-AUTH01` (`AuthModal.test.tsx`, `useAuthStore.test.ts`) | 🟢 Hoàn tất Task 7 (Sprint 2) |
| **FR-05** | **Khởi tạo đơn hàng (Server Calc & JWT)** | `UC06` (Đặt hàng - Checkout) | - `use-case-checkout.mmd`<br/>- `sequence-checkout.mmd`<br/>- `class-domain.mmd` (`Order`, `User`) | - `POST /orders`<br/>- `OrdersController.createOrder`, `OrdersService.createOrder`<br/>- `CheckoutModal.tsx` | `INT-ORD01` (`orders.*.spec.ts`, `CheckoutModal.test.tsx`, `page.test.tsx`) | 🟢 Hoàn tất Task 6 & Checkout UI (Bước 4.2) |
| **FR-06** | **Thanh toán trực tuyến Idempotent** | `UC07` (Thanh toán trực tuyến) | - `use-case-checkout.mmd`<br/>- `sequence-checkout.mmd`<br/>- `class-domain.mmd` (`Payment`) | - `POST /payments`<br/>- `PaymentsController.processPayment`, `PaymentsService.processPayment`<br/>- `CheckoutModal.tsx`, `OrderConfirmationModal.tsx` | `INT-PAY01` (`payments.service.spec.ts`, `concurrency-inventory.spec.ts`)<br/>`UNIT-IDEMP01` (`payments.*.spec.ts`, `CheckoutModal.test.tsx`, `OrderConfirmationModal.test.tsx`, `page.test.tsx`) | 🟢 Hoàn tất Task 8 (Thanh toán không tiền mặt & Idempotency) |
| **FR-07** | **Cỗ máy trạng thái đơn (State Machine)** | `UC11` (Cập nhật trạng thái) | - `sequence-checkout.mmd`<br/>- `class-domain.mmd` (`OrderStatus`) | - `order-state-machine.ts` (`assertTransition`, `canTransition`, `getAllowedTransitions`)<br/>- `PATCH /orders/:id/status` (`OrdersController.updateOrderStatus`, `OrdersService.updateOrderStatus`, `UpdateOrderStatusDto`) | `UNIT-STATE01` (`order-state-machine.spec.ts`, `orders.service.spec.ts`, `orders.controller.spec.ts`, `orders.dto.spec.ts`, `concurrency-inventory.spec.ts`) | 🟢 Hoàn tất Task 10.1 (Order State Machine) |
| **FR-08** | **Kiểm soát tồn kho đồng thời** | `UC14` (Quản lý tồn kho) | - `sequence-checkout.mmd`<br/>- `class-domain.mmd` (`Product.version`) | - `PaymentsService.processPayment` (`$transaction` + `product.updateMany` với `version` & `stock >= qty`)<br/>- `OrdersService.updateOrderStatus` (hoàn tồn kho khi hủy đơn `PAID`) | `UNIT-CONCUR01` (`payments.service.spec.ts`, `concurrency-inventory.spec.ts`) | 🟢 Hoàn tất Optimistic Locking BE & Test Task 10.3 |
| **FR-09** | **Tích lũy điểm thưởng thành viên** | `UC08` (Tích lũy điểm thưởng) | - `use-case-checkout.mmd`<br/>- `class-domain.mmd` (`LoyaltyTransaction`) | - `PaymentsService.calculateLoyaltyPoints` (`Math.floor(finalAmount / 10000)` khi `PAID`)<br/>- `Header.tsx`, `CheckoutModal.tsx`, `OrderConfirmationModal.tsx` | `UNIT-LOYAL01` (`payments.service.spec.ts`, `OrderConfirmationModal.test.tsx`, `page.test.tsx`) | 🟢 Hoàn tất Backend & UI Loyalty (Task 10.4) |
| **FR-10** | **Xem lịch sử đơn hàng** | `UC09` (Xem lịch sử đơn hàng) | - `activity-flow.puml`<br/>- `class-domain.mmd` (`Order`) | - `GET /orders/me`, `GET /orders/:id`<br/>- `OrderHistoryModal.tsx`, `Header.tsx` | `E2E-FLOW01` (`orders.*.spec.ts`, `checkout-flow.e2e-spec.ts`, `OrderHistoryModal.test.tsx`, `page.test.tsx`) | 🟢 Hoàn tất Task 9 (Lịch sử đơn & Retry) |
| **FR-11** | **Áp dụng mã Voucher giảm giá** | `UC06.1` (Áp dụng Voucher) | - `use-case-checkout.mmd`<br/>- `class-domain.mmd` (`Promotion`) | - `GET /vouchers/validate`<br/>- `VouchersController.validateVoucher`, `VouchersService`<br/>- `CartDrawer.tsx` | `INT-VOUCH01` (`vouchers.*.spec.ts`, `useCartStore.test.ts`) | 🟢 Hoàn tất Backend & UI Voucher (Task 10.4) |
| **FR-12** | **Quầy tiếp nhận pha chế Barista** | `UC10`, `UC11`, `UC12` | - `activity-flow.puml` | - `app/barista/page.tsx` *(Mở rộng)* | `UI-BARISTA01` | 🟢 Hoàn tất Task 1 & Task 2 |

---

## 2. MA TRẬN TRUY VẾT YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

| Mã NFR | Nhóm chất lượng | Tiêu chuẩn kiểm chứng | Thiết kế / Giải pháp kiến trúc | Thành phần Code / Hạ tầng | Mã Kiểm thử (Test ID) |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **NFR-01** | **Hiệu năng (Performance)** | Thời gian phản hồi API $\le 500\text{ms}$ (p95); FCP $\le 1.8\text{s}$ | Next.js SSR/PWA + Prisma Connection Pooling | `main.ts`, Neon Serverless PG | `PERF-01` |
| **NFR-02** | **Bảo mật (Security)** | Mật khẩu băm `bcrypt` (salt $\ge 10$), Token JWT, HTTPS/TLS, Header `Idempotency-Key` | Passport-JWT Guard, SSL/TLS, `PaymentsService` Idempotency Check | `auth.service.ts`, `jwt.strategy.ts`, `jwt-auth.guard.ts`, `payments.service.ts`, `payments.controller.ts` | `SEC-01` (`auth.*.spec.ts`, `payments.*.spec.ts`, `concurrency-inventory.spec.ts`) |
| **NFR-03** | **Tính khả dụng (Usability)** | Giao diện Mobile-first, đủ 3 trạng thái UX (Skeleton, Empty, Error) | Tailwind CSS v4, Component Skeleton, Empty & Error State | `ProductSkeleton.tsx`, `EmptyState.tsx`, `ErrorState.tsx` | `UI-UX01` (`EmptyState.test.tsx`, `ErrorState.test.tsx`) |
| **NFR-04** | **Toàn vẹn dữ liệu (Integrity)** | Server-side Price Calculation, ACID Transaction, Optimistic Locking | Prisma `$transaction`, PostgreSQL Constraints | `orders.service.ts`, `vouchers.service.ts`, `payments.service.ts` | `DATA-01` (`orders.service.spec.ts`, `vouchers.service.spec.ts`, `payments.service.spec.ts`, `concurrency-inventory.spec.ts`) |
| **NFR-05** | **Khả năng triển khai (Deployability)** | Chạy local bằng 1 lệnh `docker compose up --build -d`, sẵn sàng deploy Cloud | `docker-compose.yml`, Dockerfile Multi-stage | `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`, `docs/release-notes.md` | `DEPLOY-01` (CD `docker-package-and-smoke`) |
| **NFR-06** | **Tự động hóa CI/CD** | Pipeline CI/CD chạy tự động: Lint $\rightarrow$ TypeCheck $\rightarrow$ Test & E2E $\rightarrow$ Build $\rightarrow$ Docker Compose Smoke $\rightarrow$ Deploy/Rollback | GitHub Actions Workflow (`ci.yml`, `cd.yml`) | `.github/workflows/ci.yml`, `.github/workflows/cd.yml` | `CI-GATE01` |
| **NFR-07** | **Chuẩn mực mã nguồn (Clean Code)** | **Tuyệt đối không có comment trong code**, Self-documenting code, Conventional Commits | Quy định [AGENTS.md](../AGENTS.md) | Toàn bộ mã nguồn `.ts`, `.tsx` | `LINT-01` (`npm run lint`, AST check) |
| **NFR-08** | **Khả năng mở rộng (Scalability)** | Kiến trúc Module hóa cao (NestJS Modules), hỗ trợ auto-retry khi CSDL cold-start | NestJS Modular Architecture + Neon Pooling | `app.module.ts`, `prisma.service.ts` | `SCALE-01` |
| **NFR-09** | **Kiểm tra sức khỏe hệ thống** | Endpoint `GET /health` kiểm tra uptime API và ping PostgreSQL (`SELECT 1`, `200 OK` / `503`) | Health Probe Pattern | `app.controller.ts`, `app.service.ts` (`/health`) | `HEALTH-01` (`app.controller.spec.ts`, `checkout-flow.e2e-spec.ts`) |

---
*Tài liệu ma trận truy vết được cập nhật liên tục qua từng giai đoạn từ Task 1 đến Task 5.*
