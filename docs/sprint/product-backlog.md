# 📋 PRODUCT BACKLOG HỆ THỐNG BREWLITE

> **Dự án:** BrewLite — Hệ thống đặt đồ uống không dùng tiền mặt  
> **Căn cứ đề bài:** Mục 6.1 (Task 4.1) & Mục 7.1 (Task 5.1) trong tệp đặc tả gốc [`docs/DE_BAI_ASSIGNMENT_2_GOC.md`](../DE_BAI_ASSIGNMENT_2_GOC.md).  
> **Chỉ đạo Giảng viên ([notes](../../notes)):** *Thay thế User Story bằng các sơ đồ UML (Use Case, Activity, Sequence, Class); không viết User Story dài dòng, quản lý Product Backlog bằng bảng mã FR tinh gọn để phục vụ truy vết.*  
> **Kho mã nguồn:** [https://github.com/nphat-code/swe-project](https://github.com/nphat-code/swe-project)

---

## 1. TỔNG QUAN PHÂN BỔ EPIC & RELEASE PLAN

Product Backlog của BrewLite được quản lý theo mô hình Agile Scrum, tổ chức thành 6 Epics kỹ thuật bám sát 12 Yêu cầu Chức năng (`FR-01` $\rightarrow$ `FR-12`) và được hiện thực tuần tự qua 2 Sprint:

```
[PRODUCT BACKLOG: 6 EPICS KỸ THUẬT - 56 STORY POINTS]
  ├── EPIC 1: Quản lý thực đơn, Danh mục & Tùy biến món (FR-01, FR-02) ► [SPRINT 1: 23 SP]
  ├── EPIC 2: Nền tảng Monorepo, CSDL PostgreSQL & CI Pipeline (FR-12) ─► [SPRINT 1: 23 SP]
  │
  ├── EPIC 3: Giỏ hàng Client & Quản lý State Zustand (FR-03) ────────► [SPRINT 2: 33 SP]
  ├── EPIC 4: Xác thực & Phân quyền bảo mật JWT (FR-04, FR-10) ────────► [SPRINT 2: 33 SP]
  ├── EPIC 5: Đặt hàng, Khóa lạc quan & Thanh toán Idempotent (FR-05..08) ► [SPRINT 2: 33 SP]
  └── EPIC 6: Tích điểm Loyalty, CD Pipeline & Production Cloud (FR-09) ► [SPRINT 2: 33 SP]
```

---

## 2. BẢNG DANH MỤC PRODUCT BACKLOG (TRUY VẾT THEO MÃ FR & UML)

| Mã PBI | Tên Hạng mục Kỹ thuật (Backlog Item) | Epic | Mã FR / NFR | Ánh xạ Use Case | Ưu tiên | SP | Sprint | Trạng thái |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **PBI-01** | Thiết lập cấu trúc Monorepo, Docker Compose & Prisma schema | Epic 2 | `FR-12` | Nền tảng | Must | 5 | Sprint 1 | 🟢 Done |
| **PBI-02** | Xây dựng Backend Products API (`GET /products`, `GET /products/:id`) | Epic 1 | `FR-01` | `UC01` | Must | 3 | Sprint 1 | 🟢 Done |
| **PBI-03** | Khởi tạo dữ liệu mẫu (Database Seeding) cho đồ uống & topping | Epic 1 | `FR-01` | `UC01` | Must | 2 | Sprint 1 | 🟢 Done |
| **PBI-04** | Xây dựng Giao diện Menu Mobile-First với Tabs danh mục | Epic 1 | `FR-01` | `UC01` | Must | 5 | Sprint 1 | 🟢 Done |
| **PBI-05** | Thiết lập Pipeline CI tự động kiểm tra Lint, Test & Build | Epic 2 | `NFR-08` | DevOps | Must | 3 | Sprint 1 | 🟢 Done |
| **PBI-06** | Quản lý Giỏ hàng Client bằng Zustand & LocalStorage đồng bộ | Epic 3 | `FR-03` | `UC04` | Must | 5 | Sprint 2 | 🟢 Done |
| **PBI-07** | Modal Tùy biến món: Chọn kích cỡ (S/M/L) và đa topping kèm giá động | Epic 1 | `FR-02` | `UC02`, `UC03` | Must | 5 | Sprint 1 | 🟢 Done |
| **PBI-08** | Xác thực tài khoản Khách hàng / Nhân viên bằng JWT & bcrypt | Epic 4 | `FR-04` | `UC09`, `UC10` | Must | 3 | Sprint 2 | 🟢 Done |
| **PBI-09** | Khởi tạo đơn hàng với Prisma Transaction & Optimistic Locking (`version`) | Epic 5 | `FR-05`, `FR-06` | `UC05` | Must | 5 | Sprint 2 | 🟢 Done |
| **PBI-10** | Tích hợp Cổng thanh toán mô phỏng MoMo/VNPay bảo vệ Idempotent | Epic 5 | `FR-07` | `UC06` | Must | 5 | Sprint 2 | 🟡 Đang làm (Xong Backend `POST /payments`; chờ UI Checkout Bước 4.2) |
| **PBI-11** | Cỗ máy trạng thái đơn hàng nghiêm ngặt (`assertTransition`) | Epic 5 | `FR-08` | `UC07`, `UC13` | Must | 3 | Sprint 2 | 🟢 Done |
| **PBI-12** | Tự động tích lũy điểm thưởng thành viên Loyalty (`total / 10000`) | Epic 6 | `FR-09` | `UC08` | Should | 2 | Sprint 2 | 🟢 Done |
| **PBI-13** | Xem lịch sử đơn hàng cá nhân của tài khoản đã đăng nhập | Epic 4 | `FR-10` | `UC11` | Must | 2 | Sprint 2 | 🟡 Đang làm (Xong Backend `GET /orders/me`; chờ UI Bước 4.2) |
| **PBI-14** | Thiết lập Continuous Delivery (CD) tự động triển khai máy chủ đám mây | Epic 6 | `NFR-08` | DevOps | Must | 3 | Sprint 2 | ⏳ Chờ làm |
| **PBI-15** | Bộ kiểm thử tự động toàn diện 3 tầng (Unit, Integration, E2E) | Epic 6 | `NFR-04` | QA | Must | 5 | Sprint 2 | 🟡 Đang làm (Xong Unit & Integration Test Task 10 (a)(b)(c); chờ UI/E2E Bước 4.2 & 5) |

---

## 3. ÁNH XẠ HẠNG MỤC BACKLOG VỚI SƠ ĐỒ UML & TIÊU CHÍ CHẤP NHẬN

Thay vì sử dụng mẫu câu User Story văn bản dài dòng, mọi hạng mục trong Product Backlog được quy chiếu trực tiếp đến các sơ đồ mô hình hóa UML tại Task 2:

### 3.1 PBI-01: Cấu trúc Monorepo & CSDL (FR-12)
- **Ánh xạ Kiến trúc:** Container Diagram trong [architecture-description.md](../architecture/architecture-description.md).
- **Mô hình Dữ liệu:** Sơ đồ Lớp Domain [class-domain.mmd](../diagrams/class/class-domain.mmd).
- **Tiêu chí chấp nhận:**
  - `docker compose up -d` khởi động PostgreSQL 16 thành công trên cổng 5432.
  - Prisma kết nối được CSDL và chạy migration ban đầu không phát sinh lỗi.

### 3.2 PBI-02: Backend Products API (FR-01)
- **Ánh xạ Use Case:** `UC01` (Xem thực đơn) trong [use-case-system.mmd](../diagrams/use-case/use-case-system.mmd).
- **Ánh xạ Sơ đồ Hoạt động:** Swimlane *Backend API & CSDL* trong [activity-flow.puml](../diagrams/activity/activity-flow.puml).
- **Tiêu chí chấp nhận:**
  - `GET /products` trả về danh sách sản phẩm còn bán (`isAvailable: true`), hỗ trợ lọc theo query `category`.
  - `GET /products/:id` trả về chi tiết món kèm các tùy chọn size và danh sách topping; nếu không tìm thấy trả về HTTP 404 Not Found.
  - `GET /products/categories` trả về danh mục đồ uống kèm số lượng sản phẩm.
  - Unit tests đạt 100% độ bao phủ dòng lệnh.

### 3.3 PBI-04: Giao diện Menu Mobile-First (FR-01, NFR-03)
- **Ánh xạ Sơ đồ Hoạt động:** Swimlane *Giao diện Web* và hành động *Duyệt Menu đồ uống* trong [activity-flow.puml](../diagrams/activity/activity-flow.puml).
- **Tiêu chí chấp nhận:**
  - Tối ưu Mobile-First, đáp ứng mượt mà từ màn hình 375px (iPhone) đến Desktop.
  - Hiển thị Skeleton Loading khi đang tải dữ liệu từ API.
  - Màn hình Empty State khi không tìm thấy món theo từ khóa tìm kiếm.
  - Định dạng giá chuẩn tiền tệ Việt Nam (`35.000đ`).
