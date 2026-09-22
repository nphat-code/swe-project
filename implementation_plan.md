# Kế hoạch triển khai dự án BrewLite (Agile Scrum)

Ứng dụng đặt cà phê không dùng tiền mặt **BrewLite** được xây dựng theo kiến trúc Monorepo gồm **Frontend (Next.js + TailwindCSS + Zustand/React Query)** và **Backend (NestJS + PostgreSQL + Prisma)**.

Theo yêu cầu: **Hoàn thành đến đâu sẽ commit và `git push` lên GitHub ngay lập tức đến đó.**

---

## User Review Required

> [!IMPORTANT]
> **Quy tắc thực hiện & Đẩy mã nguồn:**
> Mỗi task khi hoàn thành sẽ được chạy kiểm thử/xác minh, tạo commit với message chuẩn (Conventional Commits), và thực thi `git push origin main` ngay lập tức.
>
> Vui lòng xác nhận cấu trúc công nghệ cho Frontend & Backend:
> - **Frontend:** Next.js (App Router, TypeScript, TailwindCSS, Lucide Icons, Zustand)
> - **Backend:** NestJS (TypeScript, Prisma ORM, PostgreSQL, Passport JWT, class-validator)
> - **Monorepo:** Cấu trúc 2 thư mục độc lập `frontend/` và `backend/` tại thư mục gốc kèm `docker-compose.yml`.

---

## Lộ trình 3 Sprint (10 Tasks)

### 🏃 Sprint 1: Nền tảng & Hiển thị Menu (Task 1 - 4)
- **Task 1 (Completed):** Khởi tạo cấu trúc monorepo (`frontend/`, `backend/`), `.gitignore`, root `package.json`, `.env.example`, `README.md`, kiểm tra chạy "Hello World" cả 2 phía. $\rightarrow$ *Commit & Push Task 1*.
- **Task 2:** Khởi tạo CSDL Prisma PostgreSQL, seed dữ liệu mẫu đồ uống (cà phê sữa, americano, cappuccino, trà đào,... size, topping, giá, ảnh), tạo API `GET /products` và `GET /products/:id`. $\rightarrow$ *Commit & Push Task 2*.
- **Task 3:** Dựng giao diện trang Menu trên Next.js: Header (logo, giỏ hàng badge), thanh danh mục, lưới hiển thị đồ uống, xử lý Loading skeleton và Empty state. $\rightarrow$ *Commit & Push Task 3*.
- **Task 4:** Màn hình / Modal chi tiết sản phẩm: chọn Size (S/M/L) và Topping (Trân châu, Kem,...), cập nhật realtime đơn giá tạm tính. $\rightarrow$ *Commit & Push Task 4*.

---

### 🏃 Sprint 2: Giỏ hàng & Đặt đơn & Đăng nhập (Task 5 - 7)
- **Task 5:** Quản lý giỏ hàng phía Client với Zustand: Thêm/sửa số lượng/xóa sản phẩm, tính tổng tiền tự động, đồng bộ badge số lượng trên header, lưu LocalStorage. $\rightarrow$ *Commit & Push Task 5*.
- **Task 6:** Backend API tạo đơn hàng: `POST /orders`, validate DTO với `class-validator`, tạo đơn ở trạng thái `PENDING`, trừ kiểm tra hợp lệ, sinh mã đơn hàng. $\rightarrow$ *Commit & Push Task 6*.
- **Task 7:** Xác thực người dùng (JWT): Module Auth (`POST /auth/register`, `POST /auth/login`), băm mật khẩu `bcrypt`, cấp phát JWT, Auth Guard bảo vệ các route đặt đơn và thông tin tài khoản. $\rightarrow$ *Commit & Push Task 7*.

---

### 🏃 Sprint 3: Thanh toán, Bàn giao & Nghiệp vụ nâng cao (Task 8 - 10)
- **Task 8:** Thanh toán không tiền mặt: Tích hợp Mock Payment Gateway (Ví điện tử / Thẻ), API `POST /payments`, cập nhật trạng thái đơn thành `PAID` nếu thành công, `PAYMENT_FAILED` nếu lỗi (giữ nguyên giỏ hàng để thanh toán lại). $\rightarrow$ *Commit & Push Task 8*.
- **Task 9:** Màn hình xác nhận đặt hàng thành công + Lịch sử đơn `GET /orders/me` + Hoàn thiện `docker-compose.yml` chạy cả 3 service (Frontend, Backend, PostgreSQL) + `README.md` hướng dẫn chi tiết bàn giao. $\rightarrow$ *Commit & Push Task 9*.
- **Task 10 (Nghiệp vụ Backend Chuyên Sâu & Test):**
  1. *Order State Machine:* Hàm `assertTransition` kiểm soát chặt chẽ luồng: `PENDING` $\rightarrow$ `PAID` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED` (và `PAYMENT_FAILED`, `CANCELLED`). Chặn và ném exception nếu chuyển trạng thái sai.
  2. *Idempotent Payment:* Sử dụng header `Idempotency-Key` đảm bảo gửi lặp không bị trừ tiền hay xử lý 2 lần.
  3. *Kiểm soát tồn kho đồng thời (Concurrency Control):* Transaction + Optimistic Locking (trường `version`) đảm bảo không bán âm tồn kho khi nhiều khách đặt cùng thời điểm.
  4. *Khuyến mãi & Điểm thưởng (Loyalty):* Voucher giảm giá và tích lũy điểm khi đơn `PAID`.
  5. *Unit & Integration Tests:* Bộ test tự động chứng minh cả 4 tiêu chí của Task 10. $\rightarrow$ *Commit & Push Task 10*.

---

## Chi tiết kế hoạch Task 1 (Khởi tạo dự án & Cấu trúc)

### Các file thay đổi & khởi tạo:
- [NEW] `.gitignore`: Bỏ qua `node_modules`, `.next`, `dist`, `.env`, log,... cho cả monorepo, frontend và backend.
- [NEW] `backend/`: Khởi tạo NestJS dự án bằng Nest CLI / template chuẩn TypeScript.
- [NEW] `frontend/`: Khởi tạo Next.js với App Router, TypeScript, TailwindCSS.
- [NEW] `.env.example`: File mẫu biến môi trường cho cả frontend và backend.
- [NEW] `docker-compose.yml`: Cấu hình chạy PostgreSQL cục bộ và các service.
- [NEW] `README.md`: Tài liệu hướng dẫn cài đặt, cấu trúc dự án và quy trình Scrum.

## Kế hoạch kiểm tra (Verification Plan)
- Chạy `npm run build` hoặc khởi động dev server cho cả Backend (NestJS trả về endpoint `GET /` -> `"Hello World"`) và Frontend (Next.js hiển thị trang chủ).
- Kiểm tra `git status` đảm bảo không commit file rác / `node_modules`.
- Commit và thực hiện `git push origin main`, kiểm tra mã nguồn đã lên GitHub thành công.
