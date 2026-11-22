# 📋 KẾ HOẠCH ĐÁNH GIÁ & NGHIỆM THU ASSIGNMENT 2 (AUDIT PLAN)

> **Dự án:** BrewLite — Cashless Coffee Ordering System  
> **Sinh viên thực hiện:** Nguyễn Tấn Phát — MSSV: `3124410265` — Lớp: `DCT1243`  
> **Căn cứ đề bài gốc (Single Source of Truth):** [`docs/DE_BAI_ASSIGNMENT_2_GOC.md`](DE_BAI_ASSIGNMENT_2_GOC.md)  
> **Kho mã nguồn:** [https://github.com/nphat-code/swe-project](https://github.com/nphat-code/swe-project) (Tag `v1.0.0`)  
> **Production AWS EC2:** [https://3.26.221.207.sslip.io](https://3.26.221.207.sslip.io)

---

## 1. BẢNG TỔNG QUAN TRẠNG THÁI THEO THANG ĐIỂM (10.0 ĐIỂM)

| Hạng mục (Rubric) | Điểm | Tạo phẩm chính đã kiểm tra | Trạng thái | Hạng mục cần rà soát / bổ sung |
| :--- | :---: | :--- | :---: | :--- |
| **Task 1** — Khai thác & đặc tả yêu cầu | 2.0 | `docs/requirements/context-and-scope.md`, `system-requirements-matrix.md`, `core-use-case-specification.md` | 🟢 100% | Đã đồng bộ 100% tên danh mục, API (`GET /vouchers/validate`), component (`OrderConfirmationModal`, `OrderHistoryModal`) và AWS EC2. |
| **Task 2** — Mô hình hóa hệ thống (UML) | 2.0 | `docs/diagrams/{use-case,activity,sequence,class}/` (đủ nguồn `.puml`/`.mmd` & ảnh `.png`/`.svg`) | 🟢 100% | Đã đồng bộ `class-domain.mmd` khớp `schema.prisma` (`Role: STAFF`, `PaymentStatus: UNPAID/PAID/FAILED`, xóa `CASH` khỏi `PaymentMethod`). |
| **Task 3** — Thiết kế kiến trúc | 2.0 | `docs/architecture/architecture-description.md`, 6 ADRs (`001`–`006`), `deployment-diagram.{puml,png}`, `docs/deployment.md` | 🟡 95% | Cập nhật tên miền thật `3.26.221.207.sslip.io` vào `deployment-diagram.puml`. |
| **Task 4** — Triển khai Sprint 1 & CI | 2.0 | Monorepo (`frontend/`, `backend/`, `docs/`), Backlog, DoD, Products API + Menu MVP, `.github/workflows/ci.yml`, `docs/sprint/ci-evidence/README.md` | 🟢 98% | Xác minh `ci-evidence/README.md` có đủ link PR, ảnh/log 1 lần CI đỏ và 1 lần CI xanh (Mục 6.4). |
| **Task 5** — Sprint 2, CD & Delivery | 2.0 | MVP End-to-End, 32 suites / 143 tests + E2E, `docker-compose.yml` + `prod`, `.github/workflows/cd.yml`, AWS HTTPS live, tag `v1.0.0`, `docs/release-notes.md` | 🟡 85% | Cấu hình GitHub Secrets để CD chạy xanh thật lên AWS, mở Public Repo, xuất PDF mới và quay Video demo. |
| **Mục 8** — Truy vết bắt buộc | Bắt buộc | `docs/traceability-matrix.md` | 🟢 100% | Đã cập nhật dòng `FR-12` khớp chính xác `PATCH /orders/:id/status` (RBAC `STAFF`/`ADMIN`) và ghi rõ UI KDS là mở rộng v1.1. |

---

## 2. KẾ HOẠCH KIỂM TRA CHI TIẾT (6 BƯỚC)

### Bước 1: Rà soát độ nhất quán Tài liệu & Sơ đồ (Task 1 + Task 2 + Mục 8) — ✅ HOÀN TẤT
- [x] Đối chiếu `docs/requirements/context-and-scope.md` (đủ 6 Stakeholder, In-scope, Out-of-scope, giả định, ràng buộc; đồng bộ 4 danh mục thực tế & AWS EC2).
- [x] Đối chiếu `docs/requirements/system-requirements-matrix.md` với Controller thực tế trong `backend/src/` và các component trong `frontend/src/components/`.
- [x] Đối chiếu `docs/requirements/core-use-case-specification.md` (Actor, Trigger, Tiền/Hậu điều kiện, Luồng chính/thay thế/ngoại lệ, mã FR; sửa `GET /vouchers/validate`, `BREWLITEFIRST`, `OrderHistoryModal.tsx`).
- [x] Đối chiếu 3 sơ đồ UML (`activity-flow.puml`, `sequence-checkout.mmd`, `class-domain.mmd`) với `backend/prisma/schema.prisma` (loại bỏ `CASH` khỏi `PaymentMethod`, đồng bộ enum `Role`/`PaymentStatus`/`Size`).
- [x] Rà soát toàn bộ bảng `docs/traceability-matrix.md` (12 FR + 9 NFR).

### Bước 2: Rà soát Kiến trúc & Sơ đồ Triển khai Production (Task 3)
- [ ] Đối chiếu `docs/architecture/architecture-description.md` và 6 file `docs/architecture/adr/001..006*.md` khớp phiên bản thực tế (`Next.js 16`, `NestJS 10`, `PostgreSQL 16`, `Prisma 6`).
- [ ] Cập nhật `docs/diagrams/deployment/deployment-diagram.puml` phản ánh đúng hạ tầng AWS EC2 thực tế (`3.26.221.207.sslip.io`, Nginx SSL, 3 container `frontend`, `backend`, `postgres` cô lập nội bộ).

### Bước 3: Xác thực toàn bộ Quality Gate cục bộ (Task 4 + Task 5.2)
- [ ] Chạy `npm run lint` (0 lỗi ESLint ở cả `backend` & `frontend`).
- [ ] Chạy `npm run typecheck` (`tsc --noEmit` đạt 0 lỗi).
- [ ] Chạy `npm test` (Backend `17 suites / 89 tests` + Frontend `14 suites / 53 tests`).
- [ ] Chạy `npm --prefix backend run test:e2e` (Supertest HTTP E2E `checkout-flow.e2e-spec.ts`).
- [ ] Chạy `npm run build` (`nest build` & `next build`).
- [ ] Quét AST đảm bảo `0` comment trong mã nguồn `.ts`/`.tsx`/`.js`/`.css` theo `AGENTS.md`.
- [ ] Kiểm tra `docs/sprint/ci-evidence/README.md` đủ link PR + log/ảnh 1 lần CI đỏ & 1 lần CI xanh.

### Bước 4: Kiểm thử End-to-End trực tiếp trên AWS Production (Task 5.1 + Task 5.4)
- [ ] Kiểm tra `GET https://3.26.221.207.sslip.io/health` trả HTTP `200 OK` (`status: "ok"`, `database.status: "up"`).
- [ ] Kiểm tra `GET https://3.26.221.207.sslip.io/api/products` trả đủ 12 món / 4 danh mục.
- [ ] Kiểm thử trọn luồng người dùng trên `https://3.26.221.207.sslip.io`:
  - Duyệt menu $\rightarrow$ Chọn Size/Topping $\rightarrow$ Thêm giỏ hàng $\rightarrow$ Áp mã `BREWLITEFIRST` $\rightarrow$ Đăng nhập `customer@brewlite.vn` $\rightarrow$ Thanh toán thất bại (`PAYMENT_FAILED`, giữ nguyên giỏ) $\rightarrow$ Thanh toán lại thành công (`PAID`, cộng điểm Loyalty) $\rightarrow$ Xem lịch sử đơn (`GET /api/orders/me`).
- [ ] Xác nhận cổng PostgreSQL `5432` không mở public từ bên ngoài Internet.

### Bước 5: Kích hoạt & kiểm chứng GitHub Actions CD tự động (Task 5.3)
- [ ] Khai báo GitHub Repository Secrets: `EC2_HOST` (`3.26.221.207`), `EC2_USER` (`ubuntu`), `EC2_SSH_KEY` (nội dung `brewlite-key.pem`).
- [ ] Khai báo GitHub Repository Variables: `PRODUCTION_API_URL` (`https://3.26.221.207.sslip.io/api`), `PRODUCTION_WEB_URL` (`https://3.26.221.207.sslip.io`).
- [ ] Kích hoạt workflow `.github/workflows/cd.yml` trên GitHub Actions và kiểm tra xanh trọn chuỗi: `quality-gate` $\rightarrow$ `docker-package-and-smoke` $\rightarrow$ `deploy-production` (SSH AWS + smoke `/health`) $\rightarrow$ `create-release`.

### Bước 6: Chốt Checklist nộp bài Mục 9.1 (Đề bài gốc)
- [ ] **1.** Link repository (`https://github.com/nphat-code/swe-project`) đã bật **Public** hoặc đã cấp quyền Collaborator cho giảng viên.
- [ ] **2.** SRS, đặc tả use-case và ma trận truy vết (`docs/requirements/`, `docs/traceability-matrix.md`).
- [ ] **3.** Activity, Sequence, Class và Deployment diagram (`docs/diagrams/`).
- [ ] **4.** Source code Frontend, Backend và Migration (`frontend/`, `backend/prisma/migrations/`).
- [ ] **5.** Unit, Integration và End-to-End test (`npm test`, `test:e2e`).
- [ ] **6.** Pipeline CI/CD chạy thành công trên GitHub Actions (`.github/workflows/ci.yml`, `cd.yml`).
- [ ] **7.** URL Production HTTPS (`https://3.26.221.207.sslip.io`), API (`/api`) và Health Check (`/health`).
- [ ] **8.** Release notes (`docs/release-notes.md`), `README.md` và hướng dẫn rollback (`docs/deployment.md`).
- [ ] **9.** Xuất PDF mới từ `Assignment_report.tex` & `Assignment1_report.tex` trên Overleaf, chuẩn bị Video/Demo và Sprint Retrospective (`docs/sprint/sprint-2-backlog.md`).

