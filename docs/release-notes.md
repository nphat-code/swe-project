# 🏷️ RELEASE NOTES — BREWLITE v1.0.0

> **Phiên bản:** `v1.0.0` (MVP Release — Sprint 1 & Sprint 2 Delivery)  
> **Dự án:** BrewLite — Hệ thống đặt đồ uống không dùng tiền mặt  
> **Kho mã nguồn:** [nphat-code/swe-project](https://github.com/nphat-code/swe-project)

---

## 1. TỔNG QUAN PHIÊN BẢN `v1.0.0`

Phiên bản `v1.0.0` hoàn thiện toàn bộ 10 Tasks của **Assignment 1** và lộ trình 5 Tasks của **Assignment 2** từ đặc tả yêu cầu đến đóng gói, kiểm thử 3 tầng, quy trình CI/CD và triển khai thực tế trên máy chủ **AWS EC2 (Ubuntu 26.04 LTS)**:

* **Production URL (AWS EC2):**
  * Frontend Web / PWA: [https://3.26.221.207.sslip.io](https://3.26.221.207.sslip.io)
  * Backend REST API: [https://3.26.221.207.sslip.io/api](https://3.26.221.207.sslip.io/api)
  * Health Probe (`GET /health`): [https://3.26.221.207.sslip.io/health](https://3.26.221.207.sslip.io/health) (`200 OK`, `database.status: "up"`, `latencyMs: 1ms`)
* **Menu & Tùy biến đồ uống (`FR-01`, `FR-02`):** Danh mục đồ uống, lọc tìm kiếm, trạng thái Skeleton/Empty/Error, chọn Size (`S`/`M`/`L`), đa Topping, ghi chú và tính giá động.
* **Giỏ hàng & Xác thực (`FR-03`, `FR-04`):** Giỏ hàng Zustand đồng bộ `localStorage`, gộp món trùng tùy biến, áp mã khuyến mãi (`BREWLITEFIRST`, `COFFEELOVER`); đăng ký/đăng nhập JWT + `bcrypt` bảo vệ route đơn hàng.
* **Đặt hàng & Thanh toán Idempotent (`FR-05`, `FR-06`, `FR-08`, `FR-11`):**
  * Tính lại giá toàn phần phía Server (`POST /orders`), phát sinh mã đơn `#xxxxxx`.
  * Thanh toán không tiền mặt mô phỏng Ví điện tử / Thẻ ngân hàng (`POST /payments`) hỗ trợ `Idempotency-Key` chống trừ tiền/tạo giao dịch lặp lại và giữ nguyên giỏ hàng khi gặp lỗi `PAYMENT_FAILED` để khách hàng thử lại.
  * Kiểm soát tồn kho đồng thời bằng `prisma.$transaction` kết hợp Optimistic Locking (`version`) + hoàn kho tự động khi hủy đơn `PAID`.
* **Order State Machine & Loyalty (`FR-07`, `FR-09`, `FR-10`):** Chặt chẽ chuyển tiếp `PENDING -> PAID -> PREPARING -> READY -> COMPLETED` (và nhánh `PAYMENT_FAILED`/`CANCELLED`), phân quyền RBAC (`CUSTOMER` / `STAFF` / `ADMIN`), tích điểm thành viên (`Math.floor(finalAmount / 10000)`), màn hình Xác nhận đơn & Lịch sử đơn hàng (`GET /orders/me`).
* **Hạ tầng & Giám sát (`NFR-05`, `NFR-06`, `NFR-09`):**
  * Endpoint `GET /health` thăm dò kết nối PostgreSQL (`SELECT 1`) kèm độ trễ `latencyMs`, trả `200 OK` hoặc `503 Service Unavailable`.
  * Multi-stage `backend/Dockerfile`, `frontend/Dockerfile` và `docker-compose.yml` điều phối trọn bộ 3 services (`postgres`, `backend`, `frontend`).
  * GitHub Actions CI (`.github/workflows/ci.yml`) và CD (`.github/workflows/cd.yml`) với kiểm chứng Docker Compose end-to-end.

---

## 2. MIGRATION & DỮ LIỆU KHỞI TẠO

* **Prisma Migration:** `backend/prisma/migrations/0001_init/migration.sql` (bao gồm các bảng `users`, `categories`, `products`, `size_options`, `toppings`, `orders`, `payments`, `order_items`, `vouchers`).
* **Auto-Seeding an toàn:** Khi khởi chạy qua `docker compose up --build`, container `backend` tự chạy `./node_modules/.bin/prisma migrate deploy` và nạp 12 đồ uống, 4 danh mục, 6 topping, 2 voucher và 2 tài khoản mẫu (`customer@brewlite.vn` / `barista@brewlite.vn`, mật khẩu `BrewLite@2026`) nếu bảng `products` đang rỗng (`SEED_IF_EMPTY=true`).

---

## 3. CHẤT LƯỢNG & KIỂM THỬ

* **Backend Unit & Integration Tests:** `17 suites / 89 tests` pass 100% (bao gồm ma trận 49 cặp Order State Machine, Idempotency 5-luồng song song và Optimistic Lock 8-khách tranh tồn kho).
* **Backend HTTP End-to-End Tests (`supertest`):** `checkout-flow.e2e-spec.ts` kiểm chứng trọn luồng `GET /health` $\rightarrow$ `GET /products` $\rightarrow$ `POST /auth/register` $\rightarrow$ `GET /vouchers/validate` $\rightarrow$ `POST /orders` $\rightarrow$ `POST /payments` (lỗi + retry + replay) $\rightarrow$ `GET /orders/me` $\rightarrow$ `PATCH /orders/:id/status`.
* **Frontend Unit & Flow Tests:** `14 suites / 53 tests` pass 100%.
* **Clean Code (`AGENTS.md`):** Quét AST TypeScript đảm bảo `0` comment trong mã nguồn.

---

## 4. HƯỚNG DẪN ROLLBACK KHI SỰ CỐ PHÁT SINH

Nếu phiên bản mới triển khai phát sinh lỗi (health check `/health` trả khác `200 OK` hoặc phát hiện lỗi hồi quy):

### Cách 1: Rollback trên máy chủ Docker Compose / EC2
```bash
git log --oneline -n 5
git checkout <STABLE_TAG_OR_COMMIT_SHA>
docker compose up --build -d
curl -f http://localhost:3001/health
```

### Cách 2: Rollback bằng Image Tag trên GHCR (`sha-<previous>` hoặc `vX.Y.Z`)
```bash
export BREWLITE_IMAGE_TAG=sha-<PREVIOUS_GOOD_SHA>
docker pull ghcr.io/<OWNER>/swe-project-backend:${BREWLITE_IMAGE_TAG}
docker pull ghcr.io/<OWNER>/swe-project-frontend:${BREWLITE_IMAGE_TAG}
docker compose up -d --no-build
```

### Cách 3: Phục hồi Schema/Dữ liệu PostgreSQL (khi có thay đổi DB)
```bash
cat backup_truoc_khi_deploy.sql | docker compose exec -T postgres psql -U postgres brewlite_db
```

