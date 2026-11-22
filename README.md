# ☕ BrewLite — Cashless Coffee Ordering System
## Đề tài Bài tập lớn môn Công nghệ Phần mềm (Software Engineering) — ĐH Sài Gòn
### Assignment 2: Requirements to Deployment (VER 1.0) — Thang điểm 10.0

> **Mô hình quy trình:** Chuỗi quy trình phát triển 5 Tasks tuần tự (Khai thác yêu cầu $\rightarrow$ Mô hình hóa $\rightarrow$ Kiến trúc $\rightarrow$ Sprint 1 $\rightarrow$ Sprint 2 & CI/CD Delivery)  
> **Product Vision:** *"BrewLite giúp khách hàng đặt và thanh toán đồ uống không dùng tiền mặt chỉ trong vài chạm, giảm thời gian xếp hàng và nhận đơn nhanh tại quầy."*  
> **Kho mã nguồn:** [nphat-code/swe-project](https://github.com/nphat-code/swe-project)  
> 🌐 **Live Production URL (AWS EC2):** [https://3.26.221.207.sslip.io](https://3.26.221.207.sslip.io)  
> 🔌 **Live REST API:** [https://3.26.221.207.sslip.io/api](https://3.26.221.207.sslip.io/api)  
> 🩺 **Live Health Probe:** [https://3.26.221.207.sslip.io/health](https://3.26.221.207.sslip.io/health) (`status: ok`, `database: up`, `latency: 1ms`)

---

## 📚 Hồ Sơ Tài Liệu Dự Án (Assignment 2 Deliverables)

* 📜 **[Đặc Tả Đề Bài Gốc Assignment 1 (10 Tasks Scrum)](docs/DE_BAI_ASSIGNMENT_1_GOC.md):** Toàn văn nội dung gốc 12 mục của Assignment 1, lộ trình 3 Sprint và tiêu chí chấm Task 1–10.
* 📜 **[Đặc Tả Đề Bài Gốc Assignment 2 (Single Source of Truth)](docs/DE_BAI_ASSIGNMENT_2_GOC.md):** Toàn văn nội dung gốc 9 mục của Assignment 2, tiêu chuẩn kỹ thuật, thang điểm chi tiết (5 Task x 2.0đ) và checklist 9.1 nộp bài.
* 📋 **[Kế Hoạch Triển Khai Master Plan (Theo dõi tiến độ)](implementation_plan.md):** Kế hoạch chi tiết từng bước, tiêu chí chấp nhận và trạng thái nghiệm thu của từng Task.
* 📑 **Tài liệu Task 1 — Khai thác & Đặc tả Yêu cầu (2.0đ):**
  * 📝 [Danh mục 10 User Stories & Acceptance Criteria (Assignment 1)](docs/requirements/user-stories.md)
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
* 🏃 **Tài liệu Task 4 & Task 5 — Quản lý Sprint 1 & Sprint 2:**
  * 🌿 [Chiến lược phân nhánh Git & Quy trình Pull Request](docs/sprint/branching-strategy.md)
  * 🏁 [Định nghĩa Hoàn thành (Definition of Done - DoD)](docs/sprint/definition-of-done.md)
  * 📋 [Product Backlog toàn diện (Sprint 1 & Sprint 2)](docs/sprint/product-backlog.md)
  * 🏃 [Sprint 1 Backlog & Đánh giá](docs/sprint/sprint-1-backlog.md)
  * 📈 [Sprint 2 Backlog, Burndown Chart, Review & Retrospective](docs/sprint/sprint-2-backlog.md)
  * 🏷️ [Release Notes v1.0.0 & Hướng dẫn Rollback](docs/release-notes.md)
  * 🐳 [Hướng dẫn Triển khai & Vận hành (Deployment Guide)](docs/deployment.md)
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
├── .github/workflows/       # Pipeline CI/CD tự động (ci.yml, cd.yml)
├── backend/                 # NestJS REST API Server
│   ├── Dockerfile           # Multi-stage Docker build (Node 20 Alpine)
│   ├── prisma/              # Prisma Schema, 0001_init Migration & Seed script
│   ├── src/                 # Auth, Products, Vouchers, Orders, Payments, Health
│   └── test/                # HTTP End-to-End Tests (Supertest + Jest)
├── frontend/                # Next.js App Router Web App (Mobile-first PWA)
│   ├── Dockerfile           # Multi-stage Docker build (Next.js standalone)
│   └── src/                 # Pages, Modals (Checkout/Confirmation/History), Zustand
├── docs/                    # Hồ sơ tài liệu kỹ thuật & Scrum (Task 1 -> Task 5)
│   ├── requirements/        # Task 1: Bối cảnh, FR/NFR, Use Case spec
│   ├── diagrams/            # Task 2: Activity, Sequence, Class, Deployment, Use Case
│   ├── architecture/        # Task 3: Kiến trúc C4, ADRs
│   ├── sprint/              # Sprint 1 & 2 Backlog, Burndown, Review & Retrospective
│   ├── traceability-matrix.md # Mục 8: Ma trận truy vết yêu cầu
│   ├── deployment.md        # Hướng dẫn triển khai & rollback
│   ├── release-notes.md     # Release Notes v1.0.0
│   └── DE_BAI_ASSIGNMENT_2_GOC.md # Văn bản đề bài gốc Assignment 2
├── scripts/                 # Script khởi chạy dev đồng thời (dev.mjs)
├── docker-compose.yml       # Docker Compose trọn bộ 3 services (postgres, backend, frontend)
├── .env.example             # Biến môi trường mẫu
├── AGENTS.md                # Quy định dự án (Git push ngay, Zero comment)
├── implementation_plan.md   # Master Implementation Plan
└── README.md                # Tài liệu hướng dẫn dự án
```

---

## 🚀 Hướng dẫn Cài đặt, Khởi chạy, Kiểm thử & Triển khai

### 1. Yêu cầu hệ thống
* Node.js >= 20.x (khuyên dùng Node 22 LTS)
* npm >= 10.x
* Docker Engine >= 24.x & Docker Compose v2.x

### 2. Chạy nhanh trọn bộ 3 Services bằng Docker Compose (Khuyên dùng)
Khởi chạy đồng thời **PostgreSQL + NestJS Backend + Next.js Frontend** chỉ với 1 lệnh:
```bash
docker compose up --build -d
```
* Container `backend` tự động chạy `./node_modules/.bin/prisma migrate deploy` và tự động nạp dữ liệu mẫu (`SEED_IF_EMPTY=true`) nếu database đang rỗng.
* **Web Frontend:** `http://localhost:3000`
* **Backend API & Swagger:** `http://localhost:3001` và `http://localhost:3001/api`
* **Health Check (kèm DB ping):** `http://localhost:3001/health`

Tài khoản & mã giảm giá mẫu đã được seed sẵn:
* **Khách hàng:** `customer@brewlite.vn` / `BrewLite@2026`
* **Nhân viên quầy (Barista):** `barista@brewlite.vn` / `BrewLite@2026`
* **Mã Voucher:** `BREWLITEFIRST` (giảm 20%, tối đa 30k, đơn từ 40k) & `COFFEELOVER` (giảm 10%, tối đa 25k, đơn từ 50k)

Xem trạng thái & log container hoặc dừng hệ thống:
```bash
docker compose ps
docker compose logs -f backend
docker compose down
```

### 3. Chạy chế độ phát triển cục bộ (Local Node.js Dev)
1. Sao chép biến môi trường:
   ```bash
   cp .env.example .env
   ```
2. Khởi động PostgreSQL & cài đặt dependencies:
   ```bash
   docker compose up -d postgres
   npm --prefix backend install
   npm --prefix frontend install
   ```
3. Chạy migration & seed database:
   ```bash
   npm --prefix backend exec prisma migrate deploy
   npm --prefix backend exec prisma db seed
   ```
4. Khởi chạy đồng thời Backend (`3001`) và Frontend (`3000`):
   ```bash
   npm run dev
   ```

### 4. Kiểm thử & Đóng gói (Lint, TypeCheck, Unit, Integration, E2E & Build)
```bash
npm run lint
npm run typecheck
npm run test
npm --prefix backend run test:e2e
npm run build
```

### 5. Triển khai CI/CD & Rollback (Deploy & Recovery)
* **CI (`ci.yml`):** Tự động chạy `Install -> Lint -> TypeCheck -> Unit/Integration Tests -> HTTP E2E -> Build` cho mọi Push/Pull Request.
* **CD (`cd.yml`):** Khi push lên `main`, tạo tag `v*.*.*`, hoặc chạy thủ công (`workflow_dispatch`):
  1. Chạy toàn bộ Quality Gate.
  2. Build multi-stage Docker images & kiểm thử smoke stack `docker compose up -d` (`GET /health`, `GET /products`, `GET /`).
  3. Đẩy image gắn tag SHA/SemVer lên GitHub Container Registry (`ghcr.io`) và gọi deploy hook + post-deploy `/health` probe khi cấu hình secrets (`PRODUCTION_DEPLOY_HOOK`, `PRODUCTION_API_URL`, `PRODUCTION_WEB_URL`).
* **Rollback nhanh khi sự cố:** Xem chi tiết 3 phương án khôi phục tại [`docs/release-notes.md`](docs/release-notes.md#4-hướng-dẫn-rollback-khi-sự-cố-phát-sinh) và [`docs/deployment.md`](docs/deployment.md#6-quy-trình-rollback--xử-lý-sự-cố-troubleshooting--recovery).

---

## 📊 Lộ Trình 5 Task Assignment 2 (Thang điểm 10.0)

| Task | Tên tác vụ | Phân bổ | Điểm | Trạng thái |
| :---: | :--- | :---: | :---: | :--- |
| **Task 1** | **Khai thác và đặc tả yêu cầu** (Context, FR/NFR, Core Use Case Spec) | Tuần 1 | **2.0** | 🟢 **Đã xong** |
| **Task 2** | **Mô hình hóa hệ thống** (Activity, Sequence, Class Diagram) | Tuần 2 | **2.0** | 🟢 **Đã xong** |
| **Task 3** | **Thiết kế kiến trúc** (C4/Layered, ADRs, Deployment Diagram) | Tuần 3 | **2.0** | 🟢 **Đã xong** |
| **Task 4** | **Triển khai Sprint 1** (MVP Menu đồ uống, Seed DB, CI Pipeline) | Sprint 1 | **2.0** | 🟢 **Đã xong** |
| **Task 5** | **Triển khai Sprint 2, CI/CD & Delivery** (MVP E2E, Tests 3 tầng, Docker 3 services, CD, Docs) | Sprint 2 | **2.0** | 🟢 **Hoàn tất mã nguồn, Docker & CD (chờ gắn secret URL Cloud Production)** |

---

## ✅ Định Nghĩa Hoàn Thành (Definition of Done - DoD)
- [x] Code biên dịch thành công, không có lỗi TypeScript / Linter.
- [x] **Tuyệt đối không có comment giải thích trong mã nguồn** (Tuân thủ [AGENTS.md](AGENTS.md)).
- [x] Có commit chuẩn Conventional Commits và đẩy ngay lên remote Git (`git push origin main`).
- [x] API có validation DTO, kiểm tra `GET /health` kèm DB và xử lý lỗi chặt chẽ.
- [x] Bộ kiểm thử 3 tầng (Unit, Integration đồng thời `(a)(b)(c)`, HTTP E2E Supertest), `docker-compose.yml` 3 services, CD workflow & tài liệu bàn giao hoàn chỉnh.
