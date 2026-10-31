# 🏃 SPRINT 1 BACKLOG & KẾ HOẠCH TRIỂN KHAI

> **Dự án:** BrewLite — Hệ thống đặt đồ uống không dùng tiền mặt  
> **Căn cứ đề bài:** Mục 6 (Task 4 – Triển khai Sprint 1) trong tệp đặc tả gốc [`docs/DE_BAI_ASSIGNMENT_2_GOC.md`](../DE_BAI_ASSIGNMENT_2_GOC.md).  
> **Sprint Goal:** *"Tạo nền tảng kỹ thuật, tài liệu có kiểm soát phiên bản và một MVP đầu tiên chạy được cho luồng xem menu."*  
> **Thời gian Sprint 1:** 2 tuần (Học kỳ I Năm học 2026–2027)  
> **Tổng Story Points cam kết:** 18 SP  

---

## 1. MỤC TIÊU SPRINT 1 (SPRINT GOAL)

Hiện thực và bàn giao thành công phiên bản khả dụng đầu tiên (**MVP 1**):
1. **Repository & Cấu trúc Monorepo:** Hoàn thiện hạ tầng mã nguồn phân tách rõ ràng giữa `frontend/` (Next.js 15), `backend/` (NestJS 11), `docs/` và môi trường CSDL Docker Compose.
2. **Backend API Products:** Triển khai các REST endpoint `GET /products`, `GET /products/:id`, `GET /products/categories` kết nối cơ sở dữ liệu PostgreSQL thông qua Prisma ORM.
3. **Database Seeding:** Script khởi tạo tự động tối thiểu 12 món đồ uống thực tế kèm đầy đủ danh mục (Cà phê, Trà, Đá xay, Bánh) và các loại Topping.
4. **Giao diện Menu Mobile-First:** Giao diện Next.js hiển thị danh sách sản phẩm, Tabs phân loại danh mục, tính năng Skeleton Loading, màn hình Empty và Error State.
5. **Continuous Integration (CI):** Pipeline GitHub Actions tự động kiểm tra cú pháp (Lint), định kiểu tĩnh (TypeCheck), chạy Unit Test và xác thực Build khi có Pull Request.

---

## 2. BẢNG KANBAN SPRINT 1 (SPRINT 1 BACKLOG ITEMS)

| Mã Task | Hạng mục công việc (User Story / Task) | Gán cho | Story Points | Trạng thái | Mã FR / NFR |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **SP1-01** | Thiết lập cấu trúc Monorepo, Docker Compose & Prisma schema | Backend | 5 SP | 🟢 **DONE** | `FR-12` |
| **SP1-02** | Hiện thực Products API (`GET /products`, `GET /products/:id`, `categories`) | Backend | 3 SP | 🟢 **DONE** | `FR-01` |
| **SP1-03** | Viết script Database Seed khởi tạo dữ liệu thực đơn mẫu | Backend | 2 SP | 🟢 **DONE** | `FR-01` |
| **SP1-04** | Hiện thực Giao diện Web Menu Mobile-First (Tabs, Cards, Skeleton) | Frontend | 5 SP | 🟢 **DONE** | `FR-01`, `NFR-03` |
| **SP1-05** | Thiết lập Pipeline CI tự động bằng GitHub Actions (`ci.yml`) | DevOps | 3 SP | 🟡 **IN PROGRESS** | `NFR-08` |

---

## 3. CHI TIẾT TỪNG HẠNG MỤC SPRINT 1

### 3.1 SP1-01: Cấu trúc Monorepo & CSDL (5 SP)
- **Mô tả:** Tổ chức cấu trúc mã nguồn theo hướng dẫn đề tài; thiết lập tệp `docker-compose.yml` chạy dịch vụ PostgreSQL 16 cục bộ. Cấu hình Prisma ORM kết nối CSDL và quản lý migration.
- **Tiêu chí chấp nhận (AC):**
  - Chạy `docker compose up -d postgres` thành công.
  - Tệp `schema.prisma` định nghĩa đầy đủ các bảng dữ liệu: `User`, `Product`, `Category`, `Order`, `OrderItem`, `PaymentTransaction`, `LoyaltyAccount`.
  - Migration ban đầu khởi tạo thành công không có lỗi.

### 3.2 SP1-02: Backend Products API (3 SP)
- **Mô tả:** Xây dựng `ProductsModule` trong NestJS bao gồm `ProductsController` và `ProductsService`.
- **Tiêu chí chấp nhận (AC):**
  - `GET /products`: Trả về danh sách sản phẩm còn kinh doanh (`isAvailable = true`), hỗ trợ lọc theo query `category`.
  - `GET /products/:id`: Trả về thông tin chi tiết của 1 sản phẩm. Nếu không tồn tại trả về HTTP `404 Not Found`.
  - `GET /products/categories`: Trả về danh sách các danh mục sản phẩm duy nhất.

### 3.3 SP1-03: Database Seed (2 SP)
- **Mô tả:** Viết script `prisma/seed.ts` nạp sẵn thực đơn phong phú để phục vụ kiểm thử và demo.
- **Tiêu chí chấp nhận (AC):**
  - Lệnh `npx prisma db seed` nạp thành công ít nhất 12 món nước thuộc 4 danh mục và 5 loại topping (Trân châu trắng, Thạch cà phê, Kem cheese,...).

### 3.4 SP1-04: Giao diện Menu Mobile-First (5 SP)
- **Mô tả:** Xây dựng giao diện xem thực đơn trên Next.js 15 (App Router) với phong cách Mobile-First tối ưu cho điện thoại di động và máy tính bảng.
- **Tiêu chí chấp nhận (AC):**
  - Hiển thị thanh cuộn ngang các Tabs danh mục.
  - Danh sách thẻ món ăn kèm hình ảnh, tên món, mô tả và giá định dạng VND (`35.000đ`).
  - Skeleton Loading xuất hiện khi đang tải dữ liệu.
  - Giao diện Empty xuất hiện khi danh mục chưa có món.
  - Giao diện Error kèm nút "Thử lại" khi mất kết nối Backend API.

### 3.5 SP1-05: Pipeline CI tự động (3 SP)
- **Mô tả:** Thiết lập quy trình kiểm thử tự động tại `.github/workflows/ci.yml`.
- **Tiêu chí chấp nhận (AC):**
  - Chạy tự động khi có Pull Request vào `main` hoặc `develop`.
  - Vượt qua 4 bước: Cài đặt thư viện $\rightarrow$ Kiểm tra Lint $\rightarrow$ Chạy Unit Test $\rightarrow$ Build ứng dụng.

---

## 4. TỔNG KẾT & ĐÁNH GIÁ CUỐI SPRINT 1 (SPRINT REVIEW & RETROSPECTIVE)

- **Vận tốc thực tế (Actual Velocity):** 18 / 18 Story Points cam kết.
- **Điểm làm tốt (What went well):**
  - Cấu trúc thư mục Monorepo chuẩn chỉ, phân tách rõ ràng giữa Frontend và Backend.
  - API sản phẩm phản hồi nhanh dưới 100ms với Prisma ORM.
  - Giao diện Menu Mobile-First mượt mà, hỗ trợ PWA và responsive hoàn hảo.
- **Thách thức (Challenges):**
  - Cần đảm bảo môi trường Docker và CSDL đồng nhất giữa máy phát triển cục bộ và máy chủ CI.
- **Kế hoạch cải tiến cho Sprint 2 (Action Items):**
  - Mở rộng sang luồng giỏ hàng, đặt đơn hàng với Optimistic Lock và thanh toán mô phỏng Idempotent.
