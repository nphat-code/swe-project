# ☕ BrewLite — Cashless Coffee Ordering System
## Đề tài Bài tập lớn môn Công nghệ Phần mềm (Software Engineering) — ĐH Sài Gòn
### Assignment 2: Requirements to Deployment (VER 1.0) — Thang điểm 10.0

> **Mô hình quy trình:** Chuỗi quy trình phát triển 5 Tasks tuần tự (Khai thác yêu cầu $\rightarrow$ Mô hình hóa $\rightarrow$ Kiến trúc $\rightarrow$ Sprint 1 $\rightarrow$ Sprint 2 & CI/CD Delivery)  
> **Product Vision:** *"BrewLite giúp khách hàng đặt và thanh toán đồ uống không dùng tiền mặt chỉ trong vài chạm, giảm thời gian xếp hàng và nhận đơn nhanh tại quầy."*  
> **Kho mã nguồn:** [nphat-code/swe-project](https://github.com/nphat-code/swe-project)

---

## 📚 Hồ Sơ Tài Liệu Dự Án (Assignment 2 Deliverables)

* 📜 **[Đặc Tả Đề Bài Gốc Assignment 2 (Single Source of Truth)](docs/DE_BAI_ASSIGNMENT_2_GOC.md):** Toàn văn nội dung gốc 9 mục của Assignment 2, tiêu chuẩn kỹ thuật, thang điểm chi tiết (5 Task x 2.0đ) và checklist 9.1 nộp bài.
* 📋 **[Kế Hoạch Triển Khai Master Plan (Theo dõi tiến độ)](implementation_plan.md):** Kế hoạch chi tiết từng bước, tiêu chí chấp nhận và trạng thái nghiệm thu của từng Task.
* 📑 **Tài liệu Task 1 — Khai thác & Đặc tả Yêu cầu (2.0đ):**
  * 📋 [Task 1.1: Bối cảnh, Stakeholder & Phạm vi](docs/requirements/context-and-scope.md)
  * 📋 [Task 1.2: Danh mục yêu cầu FR/NFR & Sơ đồ Use Case tổng quát](docs/requirements/system-requirements-matrix.md)
  * 📋 [Task 1.3: Đặc tả Use Case trọng tâm (Đặt hàng & Thanh toán)](docs/requirements/core-use-case-specification.md)
* 📊 **Tài liệu Task 2 — Mô hình hóa Hệ thống (2.0đ):**
  * 🔄 [Sơ đồ Hoạt động (Activity Diagram)](docs/diagrams/activity/README.md) *(Swimlane, Fork/Join, Không Yes/No)*
  * ⏱️ [Sơ đồ Tuần tự (Sequence Diagram)](docs/diagrams/sequence/README.md) *(5 Lifelines, alt/opt/loop, Idempotent)*
  * 🏛️ [Sơ đồ Lớp Domain (Class Diagram)](docs/diagrams/class/README.md) *(7 Lớp Domain, Multiplicity, Enums)*
* 🏗️ **Tài liệu Task 3 — Thiết kế Kiến trúc (2.0đ):**
  * 🏛️ [Tài liệu Kiến trúc C4 / Phân lớp](docs/architecture/architecture-description.md) & Các bản ghi ADR (`docs/architecture/adr/`)
  * ☁️ [Sơ đồ Triển khai Production (Deployment Diagram)](docs/diagrams/deployment/README.md)
* 🏃 **Tài liệu Task 4 — Triển khai Sprint 1 (2.0đ):**
  * 🌿 [Chiến lược phân nhánh Git & Quy trình Pull Request](docs/sprint/branching-strategy.md)
  * 🏁 [Định nghĩa Hoàn thành (Definition of Done - DoD)](docs/sprint/definition-of-done.md)
  * 📋 [Product Backlog toàn diện (Sprint 1 & Sprint 2)](docs/sprint/product-backlog.md)
  * 🏃 [Sprint 1 Backlog & Kế hoạch Thực thi](docs/sprint/sprint-1-backlog.md)
* 🔗 **Mục 8 — Ma trận Truy vết Bắt buộc:**
  * 📊 [Ma trận Truy vết Yêu cầu (Traceability Matrix)](docs/traceability-matrix.md)

---

## 🏗️ Kiến trúc & Công nghệ Lựa chọn

* **Frontend:** [Next.js](https://nextjs.org/) (React 19, TypeScript, TailwindCSS v4, App Router, Mobile-First / PWA, Zustand)
* **Backend:** [NestJS](https://nestjs.com/) (TypeScript, REST API, Modular Architecture, `class-validator`, Passport JWT)
* **Cơ sở dữ liệu:** PostgreSQL (Neon Serverless PG) + Prisma ORM
* **Nghiệp vụ cốt lõi:** Order State Machine (`assertTransition`), Idempotent Payment, Optimistic Locking (`version`), Loyalty Points
* **Thanh toán:** Mock Payment Gateway (Mô phỏng Ví MoMo / VNPay / Thẻ ngân hàng)
* **DevOps & CI/CD:** Docker Compose, GitHub Actions (`ci.yml`, `cd.yml`), Vercel / Render Cloud Deployment

---

## 📁 Cấu trúc Thư mục Monorepo

```plaintext
swe-project/
├── .agents/                 # Quy chuẩn Agent & Rules
├── .github/workflows/       # Pipeline CI/CD tự động (Task 4.4, Task 5.3)
├── backend/                 # NestJS REST API Server
│   ├── prisma/              # Prisma Schema & Seed script
│   └── src/                 # Controllers, Services, DTOs, Guards
├── frontend/                # Next.js App Router Web App (Mobile-first)
│   └── src/                 # Components, Pages, Stores (Zustand)
├── docs/                    # Hồ sơ tài liệu kỹ thuật bắt buộc
│   ├── requirements/        # Task 1: Bối cảnh, FR/NFR, Use Case spec
│   ├── diagrams/            # Task 2: Activity, Sequence, Class, Use Case
│   ├── architecture/        # Task 3: Kiến trúc C4, ADRs
│   ├── traceability-matrix.md # Mục 8: Ma trận truy vết
│   ├── deployment.md        # Task 3.2 & Task 5.4: Sơ đồ triển khai Cloud
│   └── DE_BAI_ASSIGNMENT_2_GOC.md # Văn bản đề bài gốc Assignment 2
├── tests/                   # Bộ kiểm thử tự động (Unit, Integration, E2E)
├── docker-compose.yml       # Docker Compose cho PostgreSQL & local services
├── .env.example             # Biến môi trường mẫu
├── AGENTS.md                # Quy định dự án (Git push ngay, Zero comment)
├── implementation_plan.md   # Master Implementation Plan
└── README.md                # Tài liệu hướng dẫn dự án
```

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

### 1. Yêu cầu hệ thống
* Node.js >= 20.x (khuyên dùng Node 22 LTS)
* npm >= 10.x
* Docker & Docker Compose

### 2. Cài đặt biến môi trường
Sao chép file `.env.example` thành file `.env` ở thư mục gốc:
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

### 4. Khởi động cơ sở dữ liệu
```bash
docker compose up -d postgres
```

### 5. Chạy ứng dụng chế độ phát triển (Development)

**Chạy Backend (NestJS API - http://localhost:3001):**
```bash
npm run dev:backend
```

**Chạy Frontend (Next.js Web - http://localhost:3000):**
```bash
npm run dev:frontend
```

---

## 📊 Lộ Trình 5 Task Assignment 2 (Thang điểm 10.0)

| Task | Tên tác vụ | Phân bổ | Điểm | Trạng thái |
| :---: | :--- | :---: | :---: | :---: |
| **Task 1** | **Khai thác và đặc tả yêu cầu** (Context, FR/NFR, Core Use Case Spec) | Tuần 1 | **2.0** | 🟢 **Đã xong** |
| **Task 2** | **Mô hình hóa hệ thống** (Activity, Sequence, Class Diagram) | Tuần 2 | **2.0** | 🟢 **Đã xong** |
| **Task 3** | **Thiết kế kiến trúc** (C4/Layered, ADRs, Deployment Diagram) | Tuần 3 | **2.0** | 🟢 **Đã xong** |
| **Task 4** | **Triển khai Sprint 1** (MVP Menu đồ uống, Seed DB, CI Pipeline) | Sprint 1 | **2.0** | 🟢 **Đã xong** |
| **Task 5** | **Triển khai Sprint 2, CI/CD & Delivery** (End-to-End, Tests, CD, Cloud Production) | Sprint 2 | **2.0** | ⏳ Chờ triển khai |

---

## ✅ Định Nghĩa Hoàn Thành (Definition of Done - DoD)
- [x] Code biên dịch thành công, không có lỗi TypeScript / Linter.
- [x] **Tuyệt đối không có comment giải thích trong mã nguồn** (Tuân thủ [AGENTS.md](AGENTS.md)).
- [x] Có commit chuẩn Conventional Commits và đẩy ngay lên remote Git (`git push origin main`).
- [x] API có validation DTO và xử lý lỗi chặt chẽ.
- [x] Tạo phẩm hoàn thành đầy đủ theo đúng thứ tự tuần tự của đề bài.
