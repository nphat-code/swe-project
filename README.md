# ☕ BrewLite — Cashless Coffee Ordering System

> **Bài tập lớn môn Công nghệ Phần mềm (Software Engineering) - ĐH Sài Gòn**
> **Mô hình quy trình:** Agile Scrum (3 Sprints - 10 Tasks)
> **Product Vision:** *"BrewLite giúp khách hàng đặt và thanh toán đồ uống không dùng tiền mặt chỉ trong vài chạm, giảm thời gian xếp hàng và nhận đơn nhanh tại quầy."*

---

## 📚 Tài liệu Dự án & Trình bày Sản phẩm
* 📑 **[Tài liệu Trình bày & Báo cáo Sản phẩm (Chi tiết)](docs/TAI_LIEU_TRINH_BAY_SAN_PHAM.md)**: Tổng quan bối cảnh, Stakeholders, Chân dung người dùng, 10 User Stories, Kiến trúc, Cỗ máy trạng thái (State Machine), Kịch bản Demo 10 phút, Sprint Retrospective.
* 🖥️ **[Slide Thuyết trình Sản phẩm Tương tác Web (presentation.html)](docs/presentation.html)**: Slide deck 10 trang thiết kế hiện đại, sẵn sàng mở trực tiếp bằng trình duyệt (nhấn phím `F` để full-screen, phím mũi tên `←` / `→` chuyển trang) để báo cáo trước Giảng viên và Hội đồng.
* 📖 **[Sổ tay Kiến thức Công nghệ Phần mềm](docs/KIENTHUC_CNPM.md)**: Khái niệm cốt lõi Monorepo, Dependency Injection, DTO, ValidationPipe, CORS, Docker, Agile Scrum.

---

## 🏗️ Kiến trúc & Công nghệ

* **Frontend:** [Next.js](https://nextjs.org/) (React 19, TypeScript, TailwindCSS v4, App Router, Lucide Icons, Zustand / React Query)
* **Backend:** [NestJS](https://nestjs.com/) (TypeScript, REST API, `class-validator`, Passport JWT, State Machine, Optimistic Locking)
* **Cơ sở dữ liệu:** PostgreSQL + Prisma ORM
* **Thanh toán:** Mock Payment Gateway (Mô phỏng Ví điện tử / Thẻ ngân hàng)
* **DevOps:** Docker Compose, Git Conventional Commits

---

## 📁 Cấu trúc thư mục Monorepo

```plaintext
swe-project/
├── .agents/                 # Quy chuẩn Agent & Rules
├── .vscode/                 # Cấu hình IDE (Markdown preview)
├── backend/                 # NestJS REST API Server
│   ├── src/
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── nest-cli.json
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # Next.js App Router Web App
│   ├── src/
│   │   └── app/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── package.json
│   └── tailwind.config.ts
├── .env.example             # Biến môi trường mẫu
├── .gitignore               # Loại trừ node_modules, build artifacts, env
├── AGENTS.md                # Quy định làm việc của dự án
├── docker-compose.yml       # Docker Compose cho PostgreSQL
├── package.json             # Root monorepo npm scripts
└── README.md                # Tài liệu hướng dẫn dự án
```

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 1. Yêu cầu hệ thống
* Node.js >= 20.x (khuyên dùng Node 22 LTS)
* npm >= 10.x
* Docker & Docker Compose (cho PostgreSQL)

### 2. Cài đặt biến môi trường
Sao chép file `.env.example` thành file `.env` ở thư mục gốc hoặc trong từng thư mục `backend/` và `frontend/`:
```bash
cp .env.example .env
```

### 3. Cài đặt dependencies
```bash
# Cài đặt backend
npm --prefix backend install

# Cài đặt frontend
npm --prefix frontend install
```

### 4. Khởi động cơ sở dữ liệu (PostgreSQL)
```bash
docker compose up -d postgres
```

### 5. Chạy ứng dụng chế độ phát triển (Development)

**Chạy Backend (NestJS):**
```bash
npm run dev:backend
# API hoạt động tại: http://localhost:3001
# Endpoint test: http://localhost:3001
```

**Chạy Frontend (Next.js):**
```bash
npm run dev:frontend
# Web hoạt động tại: http://localhost:3000
```

---

## 📋 Lộ trình 10 Task Backlog (Scrum)

| Task | Tên tác vụ | Sprint | Điểm | Trạng thái |
| :---: | :--- | :---: | :---: | :---: |
| **1** | Khởi tạo dự án và cấu trúc Monorepo (Next.js + NestJS) | Sprint 1 | 1 | ⏳ Đang làm |
| **2** | API danh sách sản phẩm (`GET /products`) + Prisma ORM | Sprint 1 | 1 | ⏱️ Chờ |
| **3** | Giao diện trang Menu đồ uống (Frontend) | Sprint 1 | 1 | ⏱️ Chờ |
| **4** | Chi tiết sản phẩm & tùy chọn Size, Topping | Sprint 1 | 1 | ⏱️ Chờ |
| **5** | Giỏ hàng (Cart) & State Management | Sprint 2 | 1 | ⏱️ Chờ |
| **6** | API tạo đơn hàng (`POST /orders`) | Sprint 2 | 1 | ⏱️ Chờ |
| **7** | Đăng ký & Đăng nhập người dùng (JWT Auth) | Sprint 2 | 1 | ⏱️ Chờ |
| **8** | Tích hợp thanh toán không tiền mặt (Mock Payment) | Sprint 3 | 1 | ⏱️ Chờ |
| **9** | Xác nhận đơn, lịch sử (`GET /orders/me`) & Dockerize | Sprint 3 | 1 | ⏱️ Chờ |
| **10**| Nghiệp vụ backend (State Machine, Idempotent, Concurrency, Loyalty) + Test | Sprint 3 | 1 | ⏱️ Chờ |

---

## ✅ Definition of Done (DoD)
- [x] Code biên dịch thành công, không có lỗi TypeScript / Linter.
- [x] Có commit chuẩn Conventional Commits và đẩy ngay lên remote Git.
- [x] API có validation đầu vào và xử lý lỗi chặt chẽ.
- [x] Đầy đủ tài liệu hướng dẫn khởi chạy.
