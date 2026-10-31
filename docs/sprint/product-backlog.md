# 📋 PRODUCT BACKLOG TOÀN DIỆN HỆ THỐNG BREWLITE

> **Dự án:** BrewLite — Hệ thống đặt đồ uống không dùng tiền mặt  
> **Căn cứ đề bài:** Mục 6.1 (Task 4.1) & Mục 7.1 (Task 5.1) trong tệp đặc tả gốc [`docs/DE_BAI_ASSIGNMENT_2_GOC.md`](../DE_BAI_ASSIGNMENT_2_GOC.md).  
> **Kho mã nguồn:** [https://github.com/nphat-code/swe-project](https://github.com/nphat-code/swe-project)

---

## 1. TỔNG QUAN PHÂN BỔ EPIC & RELEASE PLAN

Product Backlog của BrewLite được quản lý theo mô hình Agile Scrum, chia thành 6 Epics chính và được hiện thực tuần tự qua 2 Sprint:

```
[PRODUCT BACKLOG: 6 EPICS - 48 STORY POINTS]
  ├── EPIC 1: Quản lý thực đơn & Xem danh mục (FR-01, FR-02) ──────────► [SPRINT 1: 18 SP]
  ├── EPIC 2: Thiết lập nền tảng Monorepo, CSDL & CI Pipeline (FR-12) ──► [SPRINT 1: 18 SP]
  │
  ├── EPIC 3: Giỏ hàng phía Client & Quản lý State (FR-03) ────────────► [SPRINT 2: 30 SP]
  ├── EPIC 4: Xác thực & Phân quyền bảo mật JWT (FR-04, FR-10) ────────► [SPRINT 2: 30 SP]
  ├── EPIC 5: Đặt hàng, Khóa lạc quan & Thanh toán Idempotent (FR-05..08) ► [SPRINT 2: 30 SP]
  └── EPIC 6: Tích điểm Loyalty, CD Pipeline & Production (FR-09) ──────► [SPRINT 2: 30 SP]
```

---

## 2. BẢNG CHI TIẾT PRODUCT BACKLOG (THEO THỨ TỰ ƯU TIÊN)

| Mã US | Tên User Story / Tính năng | Epic | Mã FR | Ưu tiên | Điểm (SP) | Sprint | Trạng thái |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **US-01** | Thiết lập cấu trúc Monorepo, Docker Compose & Prisma | Epic 2 | `FR-12` | Must | 5 | Sprint 1 | 🟢 Done |
| **US-02** | Xây dựng Backend Products API (`GET /products`, `GET /products/:id`) | Epic 1 | `FR-01` | Must | 3 | Sprint 1 | 🟢 Done |
| **US-03** | Khởi tạo dữ liệu mẫu (Database Seeding) cho đồ uống & topping | Epic 1 | `FR-01` | Must | 2 | Sprint 1 | 🟢 Done |
| **US-04** | Xây dựng Giao diện Menu Mobile-First với Tabs danh mục | Epic 1 | `FR-01` | Must | 5 | Sprint 1 | 🟢 Done |
| **US-05** | Thiết lập Pipeline CI tự động kiểm tra Lint, Test & Build | Epic 2 | `NFR-08` | Must | 3 | Sprint 1 | 🟡 Đang làm |
| **US-06** | Quản lý Giỏ hàng Client bằng Zustand & LocalStorage đồng bộ | Epic 3 | `FR-03` | Must | 5 | Sprint 2 | ⏳ Chờ làm |
| **US-07** | Modal Tùy biến món: Chọn kích cỡ (S/M/L) và đa topping kèm giá động | Epic 3 | `FR-02` | Must | 5 | Sprint 2 | ⏳ Chờ làm |
| **US-08** | Xác thực tài khoản Khách hàng / Nhân viên bằng JWT & bcrypt | Epic 4 | `FR-04` | Must | 3 | Sprint 2 | ⏳ Chờ làm |
| **US-09** | Khởi tạo đơn hàng với Prisma Transaction & Optimistic Locking (`version`) | Epic 5 | `FR-05`, `FR-06` | Must | 5 | Sprint 2 | ⏳ Chờ làm |
| **US-10** | Tích hợp Cổng thanh toán mô phỏng MoMo/VNPay bảo vệ Idempotent | Epic 5 | `FR-07` | Must | 5 | Sprint 2 | ⏳ Chờ làm |
| **US-11** | Cỗ máy trạng thái đơn hàng nghiêm ngặt (`assertTransition`) | Epic 5 | `FR-08` | Must | 3 | Sprint 2 | ⏳ Chờ làm |
| **US-12** | Tự động tích lũy điểm thưởng thành viên Loyalty (`total / 10000`) | Epic 6 | `FR-09` | Should | 2 | Sprint 2 | ⏳ Chờ làm |
| **US-13** | Xem lịch sử đơn hàng cá nhân của tài khoản đã đăng nhập | Epic 4 | `FR-10` | Must | 2 | Sprint 2 | ⏳ Chờ làm |
| **US-14** | Thiết lập Continuous Delivery (CD) tự động triển khai máy chủ đám mây | Epic 6 | `NFR-08` | Must | 3 | Sprint 2 | ⏳ Chờ làm |
| **US-15** | Bộ kiểm thử tự động toàn diện 3 tầng (Unit, Integration, E2E) | Epic 6 | `NFR-04` | Must | 5 | Sprint 2 | ⏳ Chờ làm |

---

## 3. ĐẶC TẢ CHI TIẾT CÁC USER STORY CỐT LÕI

### 3.1 US-01: Thiết lập cấu trúc Monorepo & CSDL
* **As a** Kỹ sư phần mềm,
* **I want** Một cấu trúc repository chuẩn gồm thư mục `frontend/`, `backend/`, `docs/`, `docker-compose.yml`,
* **So that** Nhóm có thể phát triển độc lập, chia sẻ types và chạy cơ sở dữ liệu nội bộ bằng một câu lệnh duy nhất.
* **Acceptance Criteria:**
  - `docker compose up -d` khởi động PostgreSQL 16 thành công trên cổng 5432.
  - Prisma kết nối được CSDL và chạy migration ban đầu không phát sinh lỗi.

### 3.2 US-02: Backend Products API
* **As a** Khách hàng sử dụng ứng dụng web,
* **I want** Gửi request API để nhận danh sách tất cả các sản phẩm đồ uống kèm giá và danh mục,
* **So that** Tôi có thể xem thông tin đồ uống một cách nhanh chóng.
* **Acceptance Criteria:**
  - `GET /products` trả về HTTP 200 kèm danh sách mảng JSON các sản phẩm còn bán (`isAvailable: true`).
  - `GET /products/:id` trả về thông tin chi tiết một món đồ uống; nếu không tìm thấy trả về HTTP 404 Not Found.
  - `GET /products/categories` trả về danh sách các danh mục (Cà phê, Trà, Đá xay, Bánh ngọt).

### 3.3 US-04: Giao diện Menu Mobile-First
* **As a** Khách hàng đặt đồ uống qua điện thoại,
* **I want** Một giao diện duyệt thực đơn hiện đại, mượt mà với các Tabs danh mục,
* **So that** Tôi có thể chuyển đổi nhanh giữa các nhóm đồ uống và chọn món dễ dàng.
* **Acceptance Criteria:**
  - Giao diện đáp ứng tốt từ kích thước màn hình 375px (iPhone) đến màn hình máy tính để bàn.
  - Hiển thị Skeleton Loading khi đang tải dữ liệu từ API.
  - Định dạng giá chuẩn tiền tệ Việt Nam (`35.000đ`).
