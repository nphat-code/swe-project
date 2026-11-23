# 📋 KẾ HOẠCH KIỂM TRA & NGHIỆM THU ASSIGNMENT 1 (AUDIT PLAN)

> **Dự án:** BrewLite — Ứng dụng đặt cà phê không dùng tiền mặt  
> **Sinh viên thực hiện:** Nguyễn Tấn Phát — MSSV: `3124410265` — Lớp: `DCT1243`  
> **Căn cứ đề bài gốc (Single Source of Truth):** [`docs/DE_BAI_ASSIGNMENT_1_GOC.md`](DE_BAI_ASSIGNMENT_1_GOC.md)  
> **Báo cáo LaTeX riêng:** [`docs/report/Assigment_template_SGU/Assignment1_report.tex`](report/Assigment_template_SGU/Assignment1_report.tex)

---

## 1. BẢNG ĐỐI CHIẾU THANG ĐIỂM 10 TASKS (10.0 ĐIỂM)

| Task | Yêu cầu đề bài (Mục 8 AS1) | Điểm | Tạo phẩm / Mã nguồn đối chiếu | Trạng thái dự kiến |
| :---: | :--- | :---: | :--- | :---: |
| **Task 1** | Khởi tạo Monorepo (`frontend`, `backend`), `README`, Git, `.env.example` | 1.0 | `frontend/`, `backend/`, `package.json`, `.env.example`, `README.md` | 🟢 Sẵn sàng kiểm chứng |
| **Task 2** | NestJS `GET /products` trả JSON menu (id, tên, giá, ảnh) từ CSDL | 1.0 | `backend/src/products/`, `backend/prisma/seed.ts` | 🟢 Sẵn sàng kiểm chứng |
| **Task 3** | Trang Menu (Next.js gọi `/products`, lưới món, loading/empty state) | 1.0 | `frontend/src/app/page.tsx`, `CategoryFilter.tsx`, `ProductCard.tsx`, `EmptyState.tsx`, `ErrorState.tsx` | 🟢 Sẵn sàng kiểm chứng |
| **Task 4** | Chi tiết món: chọn Size (S/M/L), Topping, tính giá theo tùy chọn | 1.0 | `frontend/src/components/ProductDetailModal.tsx` | 🟢 Sẵn sàng kiểm chứng |
| **Task 5** | Giỏ hàng: thêm/sửa/xóa, state Zustand, tự tính tổng, badge số lượng | 1.0 | `frontend/src/store/useCartStore.ts`, `CartDrawer.tsx`, `Header.tsx` | 🟢 Sẵn sàng kiểm chứng |
| **Task 6** | API tạo đơn `POST /orders` validate DTO, lưu trạng thái `PENDING`, trả mã đơn | 1.0 | `backend/src/orders/orders.controller.ts`, `orders.service.ts`, `create-order.dto.ts` | 🟢 Sẵn sàng kiểm chứng |
| **Task 7** | Đăng ký / Đăng nhập JWT (`/auth/register`, `/auth/login`, `bcrypt`, Guard) | 1.0 | `backend/src/auth/`, `AuthModal.tsx`, `useAuthStore.ts` | 🟢 Sẵn sàng kiểm chứng |
| **Task 8** | Thanh toán không tiền mặt (`POST /payments`: `PAID` / `PAYMENT_FAILED`, giữ giỏ khi lỗi) | 1.0 | `backend/src/payments/`, `CheckoutModal.tsx` (hỗ trợ cả Mock & PayOS VietQR thật) | 🟢 Sẵn sàng kiểm chứng |
| **Task 9** | Xác nhận đơn, lịch sử (`GET /orders/me`), `docker-compose` 3 services, `README`, demo | 1.0 | `OrderConfirmationModal.tsx`, `OrderHistoryModal.tsx`, `docker-compose.yml`, AWS live | 🟢 Sẵn sàng kiểm chứng |
| **Task 10** | Nghiệp vụ Backend: State Machine, Idempotency, Optimistic Lock, Loyalty & test `(a)(b)(c)` | 1.0 | `order-state-machine.ts`, `payments.service.ts`, `order-state-machine.spec.ts`, `concurrency-inventory.spec.ts` | 🟢 Sẵn sàng kiểm chứng |

---

## 2. KẾ HOẠCH KIỂM TRA CHI TIẾT (5 BƯỚC)

### Bước 1: Kiểm tra Quy trình Agile Scrum & Tài liệu (Mục 2, 3, 4, 10, 11) — ✅ HOÀN TẤT
- [x] **Product Vision & 6 Stakeholders:** Khớp 100% giữa `Assignment1_report.tex` ([L140–151](file:///c:/Study/HK1Nam3/CNPM/Project/docs/report/Assigment_template_SGU/Assignment1_report.tex#L140-L151)) và đề bài gốc Mục 3.
- [x] **User Stories (`US-01` $\rightarrow$ `US-10`):** Đã hoàn chỉnh tại `docs/requirements/user-stories.md` và bảng trong `Assignment1_report.tex` đúng mẫu *"Là một ..., tôi muốn ..., để ..."* kèm Acceptance Criteria.
- [x] **Sprint Backlog & Burndown Chart:** Đủ `docs/sprint/product-backlog.md` (15 PBIs / 56 SP), `sprint-1-backlog.md` (23 SP) và `sprint-2-backlog.md` (33 SP + Burndown 10 ngày + Sprint Review 8/8 + Retrospective + Backlog v1.1).
- [x] **Definition of Done (DoD — Mục 10):** Đủ 4 tiêu chuẩn DoD tại `docs/sprint/definition-of-done.md` và CI Pipeline Run `#58` vừa PASS 100% cả Frontend & Backend.

### Bước 2: Kiểm tra API & Thực thể tối thiểu (Mục 12) — ✅ HOÀN TẤT
- [x] Đủ 7/7 endpoint tối thiểu ở Mục 12.1 (`GET /products`, `GET /products/:id`, `POST /auth/register`, `POST /auth/login`, `POST /orders`, `POST /payments`, `GET /orders/me`), kèm thêm `GET /health`, `GET /products/categories`, `GET /products/toppings`, `GET /vouchers/validate`, `PATCH /orders/:id/status` và 3 endpoint PayOS VietQR thật.
- [x] Đủ 5/5 thực thể tối thiểu ở Mục 12.2 (`Product`, `User`, `Order`, `OrderItem`, `Payment`) cùng `Category`, `SizeOption`, `Topping`, `Voucher` trong `backend/prisma/schema.prisma`.

### Bước 3: Kiểm tra Task 10 & Chạy Test chứng minh `(a)`, `(b)`, `(c)` (Mục 9 & 9.1) — ✅ HOÀN TẤT
- [x] Chạy `order-state-machine.spec.ts`, `concurrency-inventory.spec.ts`, `payments.service.spec.ts`, `vouchers.service.spec.ts` (**4/4 suites, 23/23 tests PASS**):
  - **(a)** `order-state-machine.spec.ts`: kiểm tra đủ ma trận $7 \times 7$ (49 cặp) & chặn nhảy cóc.
  - **(b)** `concurrency-inventory.spec.ts`: bắn 5 request song song cùng `Idempotency-Key` chỉ xử lý 1 lần.
  - **(c)** `concurrency-inventory.spec.ts`: 8 khách đặt đồng thời món `stock = 3`, đúng 3 đơn `PAID` và 5 đơn nhận `409 Conflict`, không bán âm.
- [x] Chạy `page.test.tsx`, `ProductDetailModal.test.tsx`, `CartDrawer.test.tsx`, `CheckoutModal.test.tsx`, `OrderConfirmationModal.test.tsx`, `OrderHistoryModal.test.tsx` (**6/6 suites, 19/19 tests PASS**), chứng minh đủ 5 màn hình MVP (Mục 7) + Lịch sử đơn hàng.

### Bước 4: Kiểm tra Khởi chạy & Demo End-to-End (Mục 9, 11) — ✅ HOÀN TẤT
- [x] Kiểm tra cấu hình `docker-compose.yml` có đủ 3 services (`postgres`, `backend`, `frontend`) và `README.md` có hướng dẫn chạy chi tiết.
- [x] Chạy kiểm tra luồng thực tế trên AWS Production (`https://nphat-brewlite.duckdns.org`) gồm cả PayOS VietQR Webhook (`/api/payments/payos-webhook`) và Mock Payment.

### Bước 5: Hoàn tất Hồ sơ nộp Assignment 1
- [ ] Biên dịch `docs/report/Assigment_template_SGU/Assignment1_report.tex` trên Overleaf thành `Assignment1_report.pdf`.
- [ ] Chuẩn bị kịch bản Demo / Video end-to-end (chọn món $\rightarrow$ size/topping $\rightarrow$ giỏ hàng $\rightarrow$ đăng nhập $\rightarrow$ thanh toán $\rightarrow$ xác nhận `#xxxxxx` $\rightarrow$ lịch sử đơn) kèm link GitHub `https://github.com/nphat-code/swe-project`.

