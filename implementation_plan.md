# 📋 KẾ HOẠCH TRIỂN KHAI DỰ ÁN BREWLITE (ASSIGNMENT 1 & ASSIGNMENT 2)
## Master Implementation Plan: Agile Scrum 10 Tasks & Requirements to Deployment (VER 1.0)

> **Môn học:** Công nghệ Phần mềm (Software Engineering) — ĐH Sài Gòn  
> **Dự án:** BrewLite — Hệ thống đặt đồ uống không dùng tiền mặt (Cashless Coffee Ordering System)  
> **Đề bài gốc Assignment 1:** [`docs/DE_BAI_ASSIGNMENT_1_GOC.md`](docs/DE_BAI_ASSIGNMENT_1_GOC.md) *(10 Tasks x 1.0đ = 10.0 Điểm)*  
> **Đề bài gốc Assignment 2:** [`docs/DE_BAI_ASSIGNMENT_2_GOC.md`](docs/DE_BAI_ASSIGNMENT_2_GOC.md) *(5 Tasks x 2.0đ = 10.0 Điểm)*  
> **Trạng thái hiện tại:**
> * **Assignment 1 (10 Tasks Scrum):** 🟢 **Đã xong Task 1 $\rightarrow$ 8 & Task 10 (Sprint 1, 2 & Checkout/Payment — 9.0/10.0đ)** | 🟡 **Đang làm Task 9 (~65% — xong Xác nhận & Lịch sử đơn, chờ Docker Compose 3 services Bước 5)**
> * **Assignment 2 (5 Tasks tuần tự):** 🟢 **Đã xong Task 1, 2, 3, 4 (8.0/10.0đ)** | 🟡 **Đang triển khai Task 5 (Hoàn tất Giai đoạn 1 $\rightarrow$ 4 / 5 Giai đoạn)**

---

## 🧭 CÁC NGUYÊN TẮC BẮT BUỘC CỦA DỰ ÁN (PROJECT LAWS)

1. **Quy tắc thực hiện tuần tự (Sequential Rule):**
   * Hoàn thành tuần tự từng Task, kiểm tra build/test không lỗi trước khi sang Task tiếp theo.
2. **Quy tắc Git & Bàn giao (Git Push Immediately - [AGENTS.md](AGENTS.md)):**
   * Làm xong phần nào, kiểm tra chạy tốt, tạo commit chuẩn Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`,...) và chạy lệnh `git push origin main` ngay lập tức.
3. **Tuyệt đối không comment trong code (Self-Documenting Code - [AGENTS.md](AGENTS.md)):**
   * Không viết bất kỳ comment giải thích, ghi chú nào trong các file mã nguồn (`.ts`, `.tsx`, `.js`, `.css`).
   * Không để lại code thừa bị comment. Code phải tự tường minh qua tên biến, hàm, type.
4. **Chỉ đạo của Giảng viên ([GHI_CHU_GIANG_VIEN.md](GHI_CHU_GIANG_VIEN.md) & [notes](notes)):**
   * **Thay thế User Story bằng Sơ đồ UML:** Không viết User Story văn bản dài dòng; thay thế bằng sơ đồ UML trực quan (Use Case, Activity, Sequence, Class), chỉ giữ bảng mã `FR` tinh gọn để truy vết.
   * **Sơ đồ Activity:** Điều kiện rẽ nhánh **không dùng Yes/No**, phải có hành động/trạng thái cụ thể; có **Fork**, **Join**, xử lý đầy đủ: hết hàng, chưa đăng nhập, thanh toán thất bại.
   * **Sơ đồ Class:** Mức Domain cho tối thiểu 7 lớp (`User`, `Product`, `Order`, `OrderItem`, `Payment`, `Promotion`, `LoyaltyTransaction`) kèm thuộc tính, phương thức, quan hệ, multiplicity và enum trạng thái.
   * **Kiến trúc & Triển khai:** Sơ đồ Deployment phản ánh đúng hạ tầng thực tế (AWS EC2 Ubuntu, Nginx SSL, Docker Compose).

---

## 📊 PHẦN I: KIỂM TRA TIẾN ĐỘ & KẾ HOẠCH TRIỂN KHAI ASSIGNMENT 1 (10 TASKS X 1.0Đ)

### 1.1 Bảng đối chiếu trạng thái 10 Tasks trong `BrewLite-CongNghePhanMem.pdf`

| Task | Sprint | Tên hạng mục (Story) | Yêu cầu / Tiêu chí chấp nhận chính | Điểm | Trạng thái | Chi tiết đối chiếu trong Codebase |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- |
| **Task 1** | Sprint 1 | **Khởi tạo dự án và cấu trúc** | Tạo monorepo/2 thư mục `frontend` (Next.js) + `backend` (NestJS), chạy được, có `README`, Git, `.env.example` | **1.0** | 🟢 **Đã xong (100%)** | Đã có `frontend/`, `backend/`, `README.md`, `.env.example`, `.gitignore`, `.github/workflows/ci.yml`. |
| **Task 2** | Sprint 1 | **API danh sách sản phẩm** | NestJS `GET /products` (& `GET /products/:id`) trả về JSON menu (id, tên, giá, ảnh) từ CSDL | **1.0** | 🟢 **Đã xong (100%)** | Đã có `ProductsController`, `ProductsService`, `prisma/seed.ts` và 14 unit tests pass 100%. |
| **Task 3** | Sprint 1 | **Trang Menu (Frontend)** | Next.js gọi `/products`, render lưới sản phẩm, có loading/empty/error state | **1.0** | 🟢 **Đã xong (100%)** | Đã có `page.tsx`, `ProductCard.tsx`, `CategoryFilter.tsx`, `ProductSkeleton.tsx`, `EmptyState.tsx`, `ErrorState.tsx`. |
| **Task 4** | Sprint 1 | **Chi tiết và tùy chọn sản phẩm** | Màn hình chi tiết: chọn size (S/M/L) và topping; tự tính giá theo tùy chọn | **1.0** | 🟢 **Đã xong (100%)** | Đã hoàn thiện `ProductDetailModal.tsx` (chọn Size S/M/L, đa Topping, ghi chú, số lượng, tính giá động, chuẩn ARIA/Escape/chống double-submit) kèm unit tests (`ProductDetailModal.test.tsx`, `page.test.tsx`, `api.test.ts`) và CI Pipeline pass 100%. Sẵn sàng nối Zustand Store ở Task 5. |
| **Task 5** | Sprint 2 | **Giỏ hàng (Cart)** | Thêm/sửa số lượng/xóa; lưu state (Zustand/Context); tự tính tổng tiền; badge số lượng | **1.0** | 🟢 **Đã xong (100%)** | Đã hoàn tất `useCartStore.ts` (Zustand + `localStorage`, gộp món trùng size/topping/note, áp mã giảm giá, tính tổng), `CartDrawer.tsx`, tích hợp `Header.tsx` & `page.tsx` (không còn `alert()`) kèm unit tests (`useCartStore.test.ts`, `CartDrawer.test.tsx`, `page.test.tsx`). |
| **Task 6** | Sprint 2 | **API tạo đơn hàng** | NestJS `POST /orders` nhận giỏ hàng, validate (`class-validator`), lưu đơn trạng thái `PENDING`, trả mã đơn | **1.0** | 🟢 **Đã xong (100%)** | Đã hoàn tất `OrdersModule`, `OrdersController`, `OrdersService`, `CreateOrderDto`, `VouchersModule` (`POST /orders`, `GET /vouchers/validate`), tính giá server-side, kiểm tra tồn kho gộp & unit tests (`orders.*.spec.ts`, `vouchers.*.spec.ts`). |
| **Task 7** | Sprint 2 | **Đăng ký / Đăng nhập (JWT)** | `POST /auth/register`, `/auth/login`; băm mật khẩu (`bcrypt`); phát JWT; guard bảo vệ route đặt đơn | **1.0** | 🟢 **Đã xong (100%)** | Đã hoàn tất Backend `AuthModule` + `JwtAuthGuard` bảo vệ `POST /orders`, `GET /orders/me`, `GET /orders/:id` + Frontend `useAuthStore.ts`, `AuthModal.tsx`, `Header.tsx` kèm unit tests đầy đủ. |
| **Task 8** | Sprint 3 | **Thanh toán không tiền mặt** | Tích hợp mock payment: chọn Ví/Thẻ, gọi `POST /payments`; đơn chuyển `PAID` khi thành công, `PAYMENT_FAILED` khi lỗi | **1.0** | 🟢 **Đã xong (100%)** | Đã hoàn tất Backend `PaymentsModule` (`POST /payments` Ví/Thẻ, `simulateFailure`, retry `PAYMENT_FAILED`) và Frontend `CheckoutModal.tsx` (chọn `Ví điện tử` / `Thẻ ngân hàng`, áp voucher, mô phỏng lỗi/thành công giữ giỏ hàng, tự sinh `Idempotency-Key` + `CheckoutModal.test.tsx`). |
| **Task 9** | Sprint 3 | **Xác nhận, lịch sử đơn & bàn giao** | Màn hình xác nhận (mã đơn, trạng thái) & `GET /orders/me`; `docker-compose` chạy cả 3 (FE, BE, DB); `README` | **1.0** | 🟡 **Đang làm (~65%)** | Đã xong Backend `GET /orders/me`, `GET /orders/:id`, `README.md` và giao diện `OrderConfirmationModal.tsx` (mã đơn động `#xxxxxx`, `PAID`, điểm thưởng) + `OrderHistoryModal.tsx` (`GET /orders/me`, thanh toán lại / hủy đơn) kèm unit tests. **Cần làm:** `GET /health`, Dockerfile FE/BE + `docker-compose.yml` 3 services & tài liệu bàn giao ở Bước 5. |
| **Task 10** | Sprint 3 | **Nghiệp vụ backend** | (1) State Machine `assertTransition`, (2) Thanh toán `Idempotency-Key`, (3) Tồn kho đồng thời (Transaction + Optimistic Locking), (4) Khuyến mãi/Loyalty + **Bộ Test (a)(b)(c)** | **1.0** | 🟢 **Đã xong (100%)** | Đã hoàn tất cả 4 nghiệp vụ lõi ở Backend & bộ kiểm thử chứng minh 3 tiêu chí Mục 9: **(a)** `order-state-machine.spec.ts` (ma trận 7x7), **(b)** `payments.service.spec.ts` + `concurrency-inventory.spec.ts` (5-way parallel + replay `Idempotency-Key`), **(c)** `concurrency-inventory.spec.ts` (8-luồng đồng thời + rollback đa món; tổng Backend 17 suites / 88 tests pass 100%). |

---

### 1.2 Lộ trình 5 Giai đoạn (Phases) hoàn thiện Task 5 $\rightarrow$ Task 10 (Đồng bộ với Task 5 Assignment 2)

#### 🔹 Giai đoạn 1: Chuẩn hóa Prisma Schema & Thực thể tối thiểu (Mục 12.2 PDF)
- [x] **Bước 1.1:** Cập nhật `backend/prisma/schema.prisma` bổ sung model `Payment`:
  * Trường: `id`, `orderId`, `idempotencyKey (@unique)`, `amount`, `method`, `status`, `createdAt` (kèm `transactionId`, `paidAt`), liên kết với `Order` và khởi tạo baseline migration `0001_init`.
  * Kiểm tra các thực thể bắt buộc Mục 12.2: `Product(id, name, basePrice, imageUrl, stock, version)`, `User(id, email, password, loyaltyPoints)`, `Order`, `OrderItem`, `Payment`, `Voucher`.
- [x] **Bước 1.2:** Cập nhật `backend/prisma/seed.ts` (seed sẵn 2 tài khoản mẫu `customer@brewlite.vn` & `barista@brewlite.vn` và làm sạch bảng `Payment` khi seed), chạy `npx prisma db push`, `npx prisma generate` & `npx prisma db seed`.
- [x] **Bước 1.3:** Commit & push ngay (`feat(prisma): add Payment model and align schema with Assignment 1`).

#### 🔹 Giai đoạn 2: Triển khai Sprint 2 — Auth JWT (Task 7), Giỏ hàng Zustand (Task 5) & API Tạo đơn (Task 6)
- [x] **Bước 2.1 (Task 7 - Backend Auth):**
  * Tạo `backend/src/auth/` (`auth.module.ts`, `auth.controller.ts`, `auth.service.ts`, `jwt.strategy.ts`, `jwt-auth.guard.ts`, `dto/register.dto.ts`, `dto/login.dto.ts`, `types/auth.types.ts`) và tích hợp vào `AppModule` + Swagger UI (`/api`).
  * Hiện thực `POST /auth/register` (băm mật khẩu bằng `bcrypt` salt=10, kiểm tra trùng email + `P2002`, trả JWT + `SafeUser`), `POST /auth/login` (xác thực mật khẩu, trả JWT + `SafeUser`), `GET /auth/me` (bảo vệ bằng `JwtAuthGuard`).
  * Viết 22 unit tests (`auth.service.spec.ts`, `auth.controller.spec.ts`, `jwt.strategy.spec.ts`, `auth.dto.spec.ts`), kiểm chứng smoke test với Neon DB, commit & push ngay.
- [x] **Bước 2.2 (Task 5 - Frontend Giỏ hàng Zustand & Auth UI):**
  * Cài đặt `zustand` trong `frontend/` (`package.json` & `package-lock.json`).
  * Tạo `frontend/src/store/useCartStore.ts` đồng bộ `localStorage` (thêm món, gộp món trùng size/topping/note, tăng/giảm số lượng, xóa món, áp mã giảm giá, tính tổng tiền).
  * Tạo `frontend/src/store/useAuthStore.ts` và `frontend/src/lib/useHasHydrated.ts` lưu JWT token & thông tin user an toàn SSR/hydration.
  * Xây dựng `frontend/src/components/CartDrawer.tsx` và `frontend/src/components/AuthModal.tsx`, tích hợp vào `Header.tsx` và `page.tsx`.
  * Kiểm tra lint/typecheck/test (`11 suites / 45 tests passed`) & `next build`, commit & push ngay.
- [x] **Bước 2.3 (Task 6 & Task 10.3/10.4 - Backend Tạo đơn hàng):**
  * Tạo `backend/src/vouchers/` (`vouchers.module.ts`, `vouchers.controller.ts`, `vouchers.service.ts`) cung cấp endpoint `GET /vouchers/validate?code=...&subtotal=...` và `applyVoucherDiscount()`.
  * Tạo `backend/src/orders/` (`orders.module.ts`, `orders.controller.ts`, `orders.service.ts`, `order-state-machine.ts`, `dto/create-order.dto.ts`).
  * Hiện thực `POST /orders` (bảo vệ bằng `JwtAuthGuard`, validate bằng `class-validator` + chặn client giả mạo giá), tính lại giá từ CSDL (`Product`/`SizeOption`/`Topping`), kiểm tra & áp mã `Voucher` (Task 10.4), kiểm tra tồn kho gộp theo sản phẩm và tạo đơn ở trạng thái `PENDING` / `UNPAID`.
  * Hiện thực `GET /orders/me` (Task 9) và `GET /orders/:id` (kiểm tra quyền sở hữu `CUSTOMER`) trả về danh sách/chi tiết đơn hàng.
  * Viết bộ unit tests (`vouchers.*.spec.ts`, `orders.*.spec.ts`, `order-state-machine.spec.ts`), chạy smoke test HTTP thực tế với Neon DB, commit & push ngay.

#### 🔹 Giai đoạn 3: Triển khai Sprint 3 (Phần 1) — Nghiệp vụ Backend (Task 10) & Thanh toán (Task 8)
- [x] **Bước 3.1 (Task 10.1 - Order State Machine):**
  * Hiện thực hàm `assertTransition(currentStatus, targetStatus)` & `canTransition` trong `backend/src/orders/order-state-machine.ts` đúng sơ đồ Mục 9.1:
    * `PENDING` $\rightarrow$ `PAID`, `PAYMENT_FAILED`, `CANCELLED`
    * `PAYMENT_FAILED` $\rightarrow$ `PENDING` (thử lại), `CANCELLED`
    * `PAID` $\rightarrow$ `PREPARING`, `CANCELLED`
    * `PREPARING` $\rightarrow$ `READY`
    * `READY` $\rightarrow$ `COMPLETED`
    * `COMPLETED`, `CANCELLED` là trạng thái kết thúc (chặn mọi chuyển tiếp).
  * Thêm endpoint `PATCH /orders/:id/status` (`UpdateOrderStatusDto`, `OrdersController.updateOrderStatus`, `OrdersService.updateOrderStatus`) dùng `assertTransition`, kiểm soát RBAC (`CUSTOMER` chỉ hủy/thử lại đơn của mình; `STAFF`/`ADMIN` điều phối trạng thái), đồng bộ `paymentStatus`, hoàn tồn kho khi hủy đơn đã thanh toán trong `$transaction` + `updateMany` chống xung đột.
  * Kiểm chứng ma trận 49 cặp chuyển tiếp trong `order-state-machine.spec.ts` + RBAC/hoàn kho trong `orders.service.spec.ts` và smoke test HTTP thực tế với Neon DB.
- [x] **Bước 3.2 (Task 8, Task 10.2, 10.3, 10.4 - Thanh toán Idempotent, Optimistic Locking & Loyalty):**
  * Tạo `backend/src/payments/` (`payments.module.ts`, `payments.controller.ts`, `payments.service.ts`, `dto/create-payment.dto.ts`) và đăng ký vào `AppModule` + Swagger tag `payments`.
  * Hiện thực `POST /payments` (bảo vệ bằng `JwtAuthGuard`, kiểm tra quyền sở hữu đơn):
    * Nhận `idempotencyKey` (ưu tiên Header `Idempotency-Key`, fallback body), `orderId`, `method` (`WALLET` / `CARD` / `MOCK_*`), và cờ mô phỏng `simulateFailure` (tùy chọn).
    * **Idempotency (Task 10.2):** Nếu `idempotencyKey` đã tồn tại trong `Payment` (hoặc xảy ra xung đột đồng thời `P2002` / `ConflictException` khi cùng key đang xử lý song song), trả về ngay kết quả giao dịch đã commit với `idempotentReplay: true` mà không trừ kho hay cộng điểm lần 2.
    * **Optimistic Locking tồn kho (Task 10.3):** Trong `prisma.$transaction`, gộp số lượng theo từng `productId` sắp xếp thứ tự cố định (tránh deadlock), thực hiện `updateMany({ where: { id: productId, isAvailable: true, version: product.version, stock: { gte: requiredQty } }, data: { stock: { decrement: requiredQty }, version: { increment: 1 } } })`. Nếu `count === 0`, ném `ConflictException` để rollback toàn bộ transaction.
    * **State Machine & Loyalty (Task 10.1 & 10.4):** Kiểm tra `assertTransition` (hỗ trợ retry từ `PAYMENT_FAILED -> PENDING -> PAID`); khi thanh toán thành công cập nhật đơn `PAID`, tạo `Payment`, cộng `loyaltyPoints` (`Math.floor(finalAmount / 10000)`) cho `User`; khi lỗi đánh dấu `PAYMENT_FAILED` giữ nguyên tồn kho & giỏ hàng client.
  * Kiểm chứng 13 unit tests (`payments.*.spec.ts`), smoke test HTTP thực tế (mô phỏng lỗi, retry, sequential & parallel same-key idempotency, diff-key optimistic lock race) với Neon DB, commit & push ngay.

#### 🔹 Giai đoạn 4: Triển khai Sprint 3 (Phần 2) — Bộ Test bắt buộc Task 10 & Giao diện Thanh toán / Xác nhận / Lịch sử (Task 8, 9)
- [x] **Bước 4.1 (Task 10 - Bộ Unit & Integration Tests chứng minh 3 tiêu chí chấm Mục 9):**
  * **(a) Test Order State Machine (`order-state-machine.spec.ts` & `concurrency-inventory.spec.ts`):** Chứng minh cho phép các chuyển tiếp hợp lệ và ném lỗi chặn mọi chuyển tiếp sai (`PENDING -> COMPLETED`, `COMPLETED -> PAID`, `CANCELLED -> PAID`, v.v.).
  * **(b) Test Thanh toán Idempotent (`payments.service.spec.ts` & `concurrency-inventory.spec.ts`):** Chứng minh gửi 2 lần (tuần tự & 5-way `Promise.all`) cùng `Idempotency-Key` chỉ tạo 1 bản ghi thanh toán / xử lý đơn 1 lần duy nhất; đồng thời chặn double-charge nếu cùng 1 đơn bị gọi song song với 2 key khác nhau.
  * **(c) Test Đặt hàng / Thanh toán đồng thời (`concurrency-inventory.spec.ts`):** Chứng minh khi nhiều khách đặt cùng lúc (`Promise.all` / `Promise.allSettled`) vượt số lượng `stock` còn lại, cơ chế Transaction + Optimistic Locking (`version`) chặn chính xác các đơn vượt tồn kho, không bao giờ để `stock < 0` và rollback toàn phần nếu món sau hết hàng.
  * Commit & push ngay.
- [x] **Bước 4.2 (Task 8 & Task 9 - Frontend Checkout, Màn hình Xác nhận `#1042` & Lịch sử đơn):**
  * Xây dựng `CheckoutModal.tsx`: chọn phương thức `Ví điện tử` / `Thẻ ngân hàng`, nhập mã giảm giá (`BREWLITEFIRST` / `COFFEELOVER`), tùy chọn mô phỏng thanh toán Thành công / Thất bại (giữ nguyên giỏ hàng khi lỗi và tái sử dụng đơn để retry), tự sinh `Idempotency-Key` khi gọi `POST /payments`.
  * Xây dựng `OrderConfirmationModal.tsx`: hiển thị xác nhận đặt hàng thành công, mã đơn động từ backend (`orderNumber`), trạng thái `PAID`, điểm thưởng tích lũy và lời nhắc tới quầy nhận nước (bám sát wireframe Mục 7).
  * Xây dựng `OrderHistoryModal.tsx` (kèm nút `Đơn hàng` trên `Header.tsx`): gọi `GET /orders/me` hiển thị lịch sử đơn hàng, cho phép hủy đơn (`PATCH /orders/:id/status`) và thanh toán lại nếu đơn ở trạng thái `PAYMENT_FAILED` / `PENDING` (Frontend 14 suites / 53 tests pass 100%).
  * Commit & push ngay.

#### 🔹 Giai đoạn 5: Docker Compose 3 Services, Health Check & Bàn giao (Task 9 & Task 5.2/5.3 Assignment 2)
- [ ] **Bước 5.1:** Thêm `GET /health` endpoint vào Backend (`AppController` / `HealthController`).
- [ ] **Bước 5.2:** Tạo `backend/Dockerfile` và `frontend/Dockerfile` đa tầng (multi-stage build).
- [ ] **Bước 5.3:** Cập nhật `docker-compose.yml` chạy trọn bộ 3 services: `postgres`, `backend`, `frontend` theo đúng yêu cầu Task 9.
- [ ] **Bước 5.4:** Cập nhật `README.md`, `docs/sprint/` (bổ sung biểu đồ Sprint Burndown Chart & Sprint Retrospective theo Mục 2.4 và Mục 11 của PDF Assignment 1) và `docs/traceability-matrix.md`.
- [ ] **Bước 5.5:** Commit & push toàn bộ lên `origin main`.

---

## 📊 PHẦN II: TIẾN ĐỘ TỔNG QUAN 5 TASK CỦA ASSIGNMENT 2 (PROGRESS DASHBOARD)

| Task | Giai đoạn | Tạo phẩm chính | Điểm | Trạng thái | Tiến độ |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **Task 1** | **Khai thác & đặc tả yêu cầu** | `context-and-scope.md`, `system-requirements-matrix.md`, `core-use-case-specification.md`, `use-case-system.png/mmd`, `use-case-checkout.mmd` | **2.0** | 🟢 **HOÀN THÀNH** | **100%** |
| **Task 2** | **Mô hình hóa hệ thống** | Activity Diagram (`.puml` / `.png`), Sequence Diagram (`.mmd` / `.png`), Domain Class Diagram (`.mmd` / `.drawio.png`) | **2.0** | 🟢 **HOÀN THÀNH** | **100%** |
| **Task 3** | **Thiết kế kiến trúc & Triển khai** | `docs/architecture/architecture-description.md`, thư mục `docs/architecture/adr/`, `docs/deployment.md` | **2.0** | 🟢 **HOÀN THÀNH** | **100%** |
| **Task 4** | **Triển khai Sprint 1** | Chuẩn hóa repo, MVP Menu duyệt đồ uống (Next.js + NestJS), `.github/workflows/ci.yml` | **2.0** | 🟢 **HOÀN THÀNH** | **100%** |
| **Task 5** | **Triển khai Sprint 2 & CI/CD** | MVP End-to-End (Task 5..10 của Assignment 1), Bộ Test (Unit/Integration/E2E), `.github/workflows/cd.yml`, Triển khai Production HTTPS | **2.0** | 🟡 **Đang triển khai (Xong Giai đoạn 1 $\rightarrow$ 4 / 5)** | **80%** |
| **TỔNG** | **TOÀN BỘ ASSIGNMENT 2** | **Hệ thống chạy thực tế, mã nguồn, tài liệu và pipeline CI/CD** | **10.0** | 🟢 **ĐÃ ĐẠT 8.0/10.0 (+ Task 5: 80%)** | **96%** |
