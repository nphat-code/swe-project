# 🏃 SPRINT 1 BACKLOG & KẾ HOẠCH TRIỂN KHAI

> **Dự án:** BrewLite — Hệ thống đặt đồ uống không dùng tiền mặt  
> **Căn cứ đề bài:** Mục 6 (Task 4 – Triển khai Sprint 1) trong tệp đặc tả gốc [`docs/DE_BAI_ASSIGNMENT_2_GOC.md`](../DE_BAI_ASSIGNMENT_2_GOC.md).  
> **Sprint Goal:** *"Tạo nền tảng kỹ thuật, tài liệu có kiểm soát phiên bản và một MVP đầu tiên chạy được cho luồng xem menu."*  
> **Thời gian Sprint 1:** 2 tuần (Học kỳ I Năm học 2026–2027)  
> **Tổng Story Points cam kết:** 23 SP  

---

## 1. MỤC TIÊU SPRINT 1 (SPRINT GOAL)

Hiện thực và bàn giao thành công phiên bản khả dụng đầu tiên (**MVP 1**):
1. **Repository & Cấu trúc Monorepo:** Hoàn thiện hạ tầng mã nguồn phân tách rõ ràng giữa `frontend/` (Next.js 16), `backend/` (NestJS 10), `docs/` và môi trường CSDL Docker Compose.
2. **Backend API Products:** Triển khai các REST endpoint `GET /products`, `GET /products/:id`, `GET /products/categories`, `GET /products/toppings` kết nối cơ sở dữ liệu PostgreSQL thông qua Prisma ORM.
3. **Database Seeding:** Script khởi tạo tự động tối thiểu 12 món đồ uống thực tế kèm đầy đủ danh mục (Cà phê Việt Nam, Cà phê Pha Máy, Trà & Trái Cây, Đá Xay) và 6 loại Topping.
4. **Giao diện Menu Mobile-First & Tùy biến món:** Giao diện Next.js hiển thị danh sách sản phẩm, Tabs phân loại danh mục, Skeleton Loading, màn hình Empty/Error State, cùng modal chi tiết tùy chọn Size (S/M/L), đa Topping và tính giá động.
5. **Continuous Integration (CI):** Pipeline GitHub Actions tự động kiểm tra cú pháp (Lint), định kiểu tĩnh (TypeCheck), chạy toàn bộ Unit Test Backend/Frontend và xác thực Build khi có Push/Pull Request.

---

## 2. BẢNG KANBAN SPRINT 1 (SPRINT 1 BACKLOG ITEMS)

| Mã Task | Hạng mục kỹ thuật / Task | Gán cho | Story Points | Trạng thái | Mã FR / NFR |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **SP1-01** | Thiết lập cấu trúc Monorepo, Docker Compose & Prisma schema | Backend | 5 SP | 🟢 **DONE** | `FR-12` |
| **SP1-02** | Hiện thực Products API (`GET /products`, `GET /products/:id`, `categories`, `toppings`) | Backend | 3 SP | 🟢 **DONE** | `FR-01` |
| **SP1-03** | Viết script Database Seed khởi tạo dữ liệu thực đơn mẫu | Backend | 2 SP | 🟢 **DONE** | `FR-01` |
| **SP1-04** | Hiện thực Giao diện Web Menu Mobile-First (Tabs, Cards, Skeleton, Empty/Error) | Frontend | 5 SP | 🟢 **DONE** | `FR-01`, `NFR-03` |
| **SP1-05** | Thiết lập Pipeline CI tự động bằng GitHub Actions (`ci.yml`) | DevOps | 3 SP | 🟢 **DONE** | `NFR-08` |
| **SP1-06** | Hoàn thiện Modal Tùy biến món (Size S/M/L, Topping, Giá động) & Bộ Unit/Flow Tests | Frontend | 5 SP | 🟢 **DONE** | `FR-02`, `NFR-03` |

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
- **Mô tả:** Xây dựng giao diện xem thực đơn trên Next.js 16 (App Router) với phong cách Mobile-First tối ưu cho điện thoại di động và máy tính bảng.
- **Tiêu chí chấp nhận (AC):**
  - Hiển thị thanh cuộn ngang các Tabs danh mục.
  - Danh sách thẻ món ăn kèm hình ảnh, tên món, mô tả và giá định dạng VND (`35.000₫`).
  - Skeleton Loading xuất hiện khi đang tải dữ liệu.
  - Giao diện Empty xuất hiện khi tìm kiếm/lọc không có món phù hợp.
  - Giao diện Error kèm nút "Thử lại kết nối" khi mất kết nối Backend API.

### 3.5 SP1-05: Pipeline CI tự động (3 SP)
- **Mô tả:** Thiết lập quy trình kiểm thử tự động tại `.github/workflows/ci.yml`.
- **Tiêu chí chấp nhận (AC):**
  - Chạy tự động khi Push hoặc mở Pull Request vào `main` hoặc `develop`.
  - Vượt qua 5 bước cho cả Backend và Frontend: Cài đặt thư viện (`npm ci`) $\rightarrow$ Kiểm tra Lint $\rightarrow$ Static TypeCheck $\rightarrow$ Chạy Unit Test kèm Coverage $\rightarrow$ Build ứng dụng.

### 3.6 SP1-06: Modal Tùy biến món & Bộ kiểm thử Unit/Flow (5 SP)
- **Mô tả:** Hoàn thiện `ProductDetailModal.tsx` (Task 4 Assignment 1 / `FR-02`) và bộ kiểm thử tự động cho API, Component và luồng chính Sprint 1.
- **Tiêu chí chấp nhận (AC):**
  - Cho phép chọn kích cỡ S/M/L (bắt buộc), chọn nhiều topping, nhập ghi chú, điều chỉnh số lượng và tính tổng giá động chính xác.
  - Hỗ trợ truy cập bàn phím/screen reader (ARIA `dialog`, `aria-pressed`, `checkbox`, phím `Escape`) và chống nhấn đúp khi thêm vào đơn hàng.
  - Toàn bộ 16 Unit Test Backend và 31 Unit/Flow Test Frontend vượt qua 100%.

---

## 4. TỔNG KẾT & ĐÁNH GIÁ CUỐI SPRINT 1 (SPRINT REVIEW & RETROSPECTIVE)

- **Vận tốc thực tế (Actual Velocity):** 23 / 23 Story Points cam kết.
- **Điểm làm tốt (What went well):**
  - Cấu trúc thư mục Monorepo chuẩn chỉ, phân tách rõ ràng giữa Frontend và Backend.
  - API sản phẩm phản hồi nhanh dưới 100ms với Prisma ORM.
  - Giao diện Menu Mobile-First mượt mà, hỗ trợ PWA và responsive hoàn hảo.
- **Thách thức (Challenges):**
  - Cần đảm bảo môi trường Docker và CSDL đồng nhất giữa máy phát triển cục bộ và máy chủ CI.
- **Kế hoạch cải tiến cho Sprint 2 (Action Items):**
  - Mở rộng sang luồng giỏ hàng, đặt đơn hàng với Optimistic Lock và thanh toán mô phỏng Idempotent.
