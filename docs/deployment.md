# 🚀 HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG (DEPLOYMENT GUIDE) — BREWLITE

> **Căn cứ đề bài:** Mục 5.2 (Task 3.2 - 1.0 điểm) & Mục 7.3, 8.1 trong tệp đặc tả gốc [`docs/DE_BAI_ASSIGNMENT_2_GOC.md`](DE_BAI_ASSIGNMENT_2_GOC.md).  
> **Dự án:** Hệ thống đặt đồ uống không dùng tiền mặt BrewLite (Cashless Coffee Ordering System).  
> **Căn cứ chỉ đạo giảng viên:** Triển khai trên máy chủ đám mây AWS EC2 Ubuntu, phân định 3 ranh giới môi trường (Local $\rightarrow$ CI $\rightarrow$ Production), cấu hình Nginx Reverse Proxy, SSL HTTPS và CSDL bền vững.  
> **Sơ đồ UML Deployment:** [`docs/diagrams/deployment/deployment-diagram.png`](diagrams/deployment/deployment-diagram.png)

---

## 1. SƠ ĐỒ TRIỂN KHAI TỔNG THỂ (UML DEPLOYMENT DIAGRAM)

![UML Deployment Diagram](diagrams/deployment/deployment-diagram.png)

### Ranh giới kiến trúc & Tuyến giao tiếp:
* **Thiết bị người dùng (Client Tier):** Smartphone / Laptop truy cập qua trình duyệt Web Browser hoặc PWA giao tiếp mã hóa toàn diện qua **HTTPS (Cổng 443)**.
* **Máy trạm DevOps (DevOps Station):** Kỹ sư quản trị kết nối dòng lệnh an toàn qua giao thức **SSH (Cổng 22)** bằng khóa bảo mật RSA/Ed25519 (`ssh -i key.pem ubuntu@IP`).
* **Máy chủ Cloud AWS EC2 (`ap-southeast-2`, Ubuntu 26.04 LTS, IP `3.26.221.207`, Domain `nphat-brewlite.duckdns.org`):**
  - **Nginx Reverse Proxy & SSL (Let's Encrypt):** Tiếp nhận cổng 80 (HTTP tự động chuyển hướng sang 443) và cổng 443 (HTTPS), tự động định tuyến traffic:
    - Yêu cầu trang giao diện (`/`) $\longrightarrow$ chuyển tiếp tới Next.js Container (`127.0.0.1:3000`).
    - Yêu cầu gọi API (`/api/*`) $\longrightarrow$ chuyển tiếp tới NestJS API Container (`127.0.0.1:3001`).
  - **Docker Compose Network (`docker-compose.prod.yml`):** Mạng bridge nội bộ khép kín kết nối 3 container:
    - Container `brewlite_frontend_prod`: Frontend Next.js 16 PWA (`127.0.0.1:3000`).
    - Container `brewlite_backend_prod`: Backend NestJS 10 REST API (`127.0.0.1:3001`).
    - Container `brewlite_postgres_prod`: CSDL PostgreSQL 16 (bind `127.0.0.1:5432` phục vụ SSH Tunnel, chặn hoàn toàn từ Internet) gắn volume bền vững `postgres_prod_data` tại `/var/lib/postgresql/data`.
* **Cổng thanh toán ngoại vi (PayOS VietQR Gateway):** Backend giao tiếp qua HTTPS Outbound cổng 443 với `api-merchant.payos.vn` để tạo mã QR VietQR và nhận Webhook Inbound về `/api/payments/payos-webhook`.

---

## 2. YÊU CẦU TIỀN ĐỀ HỆ THỐNG (SYSTEM PREREQUISITES)

Để triển khai hệ thống thành công, môi trường máy chủ hoặc máy trạm phát triển cần đáp ứng các thông số kỹ thuật tối thiểu sau:

| Thành phần | Phiên bản tối thiểu | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Hệ điều hành** | Ubuntu 22.04 / 24.04 / 26.04 LTS / macOS / Windows 11 | Nền tảng thực thi ứng dụng |
| **Node.js** | `v20.x` LTS (khuyên dùng Node `22.x`) | Runtime JavaScript cho Next.js & NestJS |
| **npm** | `v10.x` trở lên | Quản lý gói phụ thuộc Monorepo Workspaces |
| **Docker Engine** | `v24.x` trở lên | Đóng gói và cô lập các dịch vụ |
| **Docker Compose**| `v2.20.x` trở lên | Điều phối đa container cục bộ và trên máy chủ |
| **Git** | `v2.40.x` trở lên | Quản lý phiên bản mã nguồn |
| **Phần cứng tối thiểu** | 2 vCPU, 4GB RAM, 20GB SSD | Đảm bảo đủ RAM khi biên dịch Next.js SSR |

---

## 3. CẤU HÌNH BIẾN MÔI TRƯỜNG (.ENV CONFIGURATION)

Hệ thống tuân thủ nguyên tắc **Twelve-Factor App**, toàn bộ thông tin nhạy cảm và cấu hình được tách biệt qua biến môi trường.

### 3.1. Bảng danh mục biến môi trường bắt buộc

| Tên biến | Kiểu dữ liệu | Giá trị mẫu | Giải thích kỹ thuật |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | String | `development` / `production` | Chế độ thực thi ứng dụng |
| `PORT` | Number | `3001` | Cổng lắng nghe của NestJS API Server |
| `DATABASE_URL` | String | `postgresql://user:pass@localhost:5432/brewlite` | Chuỗi kết nối PostgreSQL cho Prisma ORM |
| `JWT_SECRET` | String | `super-secret-jwt-key-min-32-chars` | Khóa bí mật ký token xác thực JWT |
| `JWT_EXPIRES_IN` | String | `7d` | Thời gian sống của Bearer Token |
| `NEXT_PUBLIC_API_URL` | String | `http://localhost:3001` (Dev) / `https://nphat-brewlite.duckdns.org/api` (Prod) | URL gốc gọi API từ trình duyệt Client |
| `FRONTEND_URL` | String | `http://localhost:3000` (Dev) / `https://nphat-brewlite.duckdns.org` (Prod) | Domain được phép CORS & URL trả về |
| `PAYOS_CLIENT_ID` / `PAYOS_API_KEY` / `PAYOS_CHECKSUM_KEY` | String | *(Secret từ PayOS)* | Bộ khóa xác thực tạo mã QR & kiểm tra chữ ký Webhook PayOS VietQR |

### 3.2. Khởi tạo tệp `.env`
Sao chép từ tệp mẫu `.env.example` đã được chuẩn hóa tại thư mục gốc:

```bash
cp .env.example .env
```

> [!WARNING]
> Tuyệt đối không commit tệp `.env` chứa mật khẩu thực tế lên GitHub. Tệp `.gitignore` của dự án đã được cấu hình chặt chẽ để loại trừ mọi biến thể của `.env`.

---

## 4. CHI TIẾT 3 MÔI TRƯỜNG TRIỂN KHAI (3 EXECUTION BOUNDARIES)

---

### 🟢 MÔI TRƯỜNG 1: LOCAL DEVELOPMENT (PHÁT TRIỂN CỤC BỘ)

Có 2 phương thức vận hành trên máy trạm lập trình viên:

#### Cách 1: Chạy trực tiếp qua Node.js & Docker PostgreSQL (Khuyên dùng khi dev)

1. **Khởi động CSDL PostgreSQL qua Docker Compose:**
   ```bash
   docker compose up -d postgres
   ```
2. **Cài đặt toàn bộ thư viện Monorepo:**
   ```bash
   npm --prefix backend install
   npm --prefix frontend install
   ```
3. **Thực hiện di chuyển lược đồ CSDL (Prisma Migration) & Nạp dữ liệu mẫu (Seed):**
   ```bash
   cd backend
   npx prisma migrate deploy
   npx prisma db seed
   cd ..
   ```
4. **Khởi chạy đồng thời cả Backend và Frontend:**
   ```bash
   npm run dev
   ```
   * **Frontend Next.js:** Truy cập tại `http://localhost:3000`
   * **Backend NestJS API:** Truy cập tại `http://localhost:3001`
   * **Kiểm tra Health Check:** `http://localhost:3001/health`

---

#### Cách 2: Đóng gói toàn bộ cụm dịch vụ qua Docker Compose (3 Services)

Khởi chạy cả 3 container (`postgres`, `backend`, `frontend`) trong mạng bridge nội bộ chỉ với 1 câu lệnh duy nhất (container `backend` tự chạy `prisma migrate deploy` và nạp dữ liệu mẫu khi database rỗng):

```bash
docker compose up --build -d
```

Kiểm tra trạng thái các container đang chạy:
```bash
docker compose ps
```

Dừng và dọn dẹp tài nguyên:
```bash
docker compose down
```

---

### 🟡 MÔI TRƯỜNG 2: CI/CD PIPELINE (TỰ ĐỘNG HÓA GITHUB ACTIONS)

Mỗi khi lập trình viên tạo Pull Request hoặc đẩy mã nguồn lên nhánh `main`, quy trình CI tự động kích hoạt thông qua tệp `.github/workflows/ci.yml`.

#### Các công đoạn kiểm tra chất lượng (Quality Gates):
1. **Checkout & Setup:** Tải mã nguồn và thiết lập môi trường Node.js `20.x` kèm cơ chế lưu đệm `cache: npm`.
2. **Lint & Code Style:**
   ```bash
   npm run lint
   ```
   * Kiểm tra lỗi cú pháp, quy ước đặt tên và bảo đảm không có comment rác trong mã nguồn.
3. **Type Check:**
   ```bash
   npm run build:check
   ```
   * Biên dịch kiểm tra kiểu tĩnh TypeScript (`tsc --noEmit`) trên toàn bộ Monorepo.
4. **Automated Testing:**
   ```bash
   npm test
   ```
   * Khởi chạy bộ kiểm thử đơn vị Jest (Unit Tests) cho các hàm nghiệp vụ, State Machine và tính toán giá.
5. **Docker Build Validation:**
   * Thử nghiệm đóng gói Docker Image multi-stage của `frontend` và `backend` để đảm bảo không lỗi Dockerfile trước khi đẩy lên máy chủ.

---

### 🔴 MÔI TRƯỜNG 3: PRODUCTION CLOUD ENVIRONMENT (ĐÁM MÂY SẢN XUẤT)

Triển khai thực tế trên máy chủ **AWS EC2 (Ubuntu 26.04 LTS, IP `3.26.221.207`, Domain `nphat-brewlite.duckdns.org`)** theo đúng mô hình chỉ đạo của Giảng viên.

#### Bước 1: Khởi tạo & Đăng nhập máy chủ AWS EC2
1. Khởi tạo EC2 Instance **Ubuntu 22.04 / 24.04 / 26.04 LTS** (`t3.small` hoặc Free Tier `t2.micro` / `t3.micro` — script bootstrap tự tạo 2GB Swap chống tràn RAM khi build).
2. Gán địa chỉ **Elastic IP** tĩnh cho instance để IP không bị đổi khi khởi động lại.
3. Cấu hình Security Group mở đúng 3 cổng mạng cần thiết (tuyệt đối **không** mở cổng `5432` PostgreSQL):
   - `Port 22` (SSH): Giới hạn IP quản trị viên.
   - `Port 80` (HTTP): Mở toàn cầu (`0.0.0.0/0`) để cấp chứng chỉ SSL.
   - `Port 443` (HTTPS): Mở toàn cầu (`0.0.0.0/0`) phục vụ khách hàng.
4. Đăng nhập qua terminal dòng lệnh bằng SSH key:
   ```bash
   ssh -i "brewlite-prod-key.pem" ubuntu@<ELASTIC_IP>
   ```

#### Bước 2: Clone mã nguồn & Chạy Script Bootstrap tự động
```bash
git clone https://github.com/nphat-code/swe-project.git
cd swe-project
chmod +x deploy/aws-ec2-bootstrap.sh
./deploy/aws-ec2-bootstrap.sh
newgrp docker
```

#### Bước 3: Cấu hình biến môi trường Production (`.env`)
Nếu chưa mua tên miền riêng, bạn có thể dùng miễn phí `<ELASTIC_IP>.sslip.io` (ví dụ: `3.1.25.100.sslip.io`) để Let's Encrypt cấp chứng chỉ HTTPS hợp lệ:
```bash
cat <<'EOF' > .env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<MAT_KHAU_DB_MANH>
POSTGRES_DB=brewlite_db
JWT_SECRET=<CHUOI_BI_MAT_TOI_THIEU_32_KY_TU>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://<DOMAIN_HOAC_IP.sslip.io>
NEXT_PUBLIC_API_URL=https://<DOMAIN_HOAC_IP.sslip.io>/api
EOF
```

#### Bước 4: Khởi chạy Cụm dịch vụ Production (`docker-compose.prod.yml`)
Tệp [`docker-compose.prod.yml`](../docker-compose.prod.yml) cô lập `postgres` hoàn toàn trong mạng nội bộ, chỉ bind `frontend` (`127.0.0.1:3000`) và `backend` (`127.0.0.1:3001`) cho Nginx Reverse Proxy, đồng thời tự chạy `prisma migrate deploy` và nạp dữ liệu mẫu khi DB trống:
```bash
docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml ps
```

#### Bước 5: Kích hoạt SSL HTTPS miễn phí qua Certbot (Let's Encrypt)
Cập nhật `server_name` trong `/etc/nginx/sites-available/brewlite` (mẫu sẵn tại [`deploy/nginx/brewlite.conf`](../deploy/nginx/brewlite.conf)) và cấp chứng chỉ HTTPS tự động gia hạn:
```bash
sudo sed -i "s/server_name _;/server_name <DOMAIN_HOAC_IP.sslip.io>;/" /etc/nginx/sites-available/brewlite
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d <DOMAIN_HOAC_IP.sslip.io> --non-interactive --agree-tos -m <EMAIL_CUA_BAN> --redirect
```

#### Bước 6: Tự động hóa CD từ GitHub Actions lên AWS EC2
Vào **GitHub Repository → Settings → Secrets and variables → Actions** và khai báo:
- **Secrets:**
  - `EC2_HOST`: Địa chỉ Elastic IP của AWS EC2
  - `EC2_USER`: `ubuntu`
  - `EC2_SSH_KEY`: Toàn bộ nội dung file khóa riêng tư `.pem`
- **Variables:**
  - `PRODUCTION_API_URL`: `https://<DOMAIN_HOAC_IP.sslip.io>/api`
  - `PRODUCTION_WEB_URL`: `https://<DOMAIN_HOAC_IP.sslip.io>`

---

## 5. QUY TRÌNH KIỂM TRA TÍNH SẴN SÀNG & GIÁM SÁT (HEALTH CHECK)

Sau khi hoàn tất triển khai, thực hiện các bước nghiệm thu kỹ thuật:

### 5.1. Thăm dò Endpoint Sức khỏe (Health Check Probe)
Thực thi lệnh kiểm tra:
```bash
curl -i https://nphat-brewlite.duckdns.org/health
```

Phản hồi chuẩn định dạng JSON (`HTTP 200 OK`):
```json
{
  "status": "ok",
  "timestamp": "2026-10-31T09:15:00.000Z",
  "uptime": 3600.5,
  "database": {
    "status": "up",
    "latencyMs": 8
  }
}
```

### 5.2. Giám sát luồng Log trực tiếp
Theo dõi log vận hành của container Backend API để kịp thời phát hiện lỗi:
```bash
docker compose -f docker-compose.prod.yml logs -f --tail=100 backend
```

---

## 6. QUY TRÌNH ROLLBACK & XỬ LÝ SỰ CỐ (TROUBLESHOOTING & RECOVERY)

### 6.1. Quy trình khôi phục phiên bản trước (Rollback)
Khi phiên bản mới phát sinh lỗi nghiêm trọng trên Production:
```bash
git log --oneline -n 5
git checkout <COMMIT_HASH_ON_DINH>
docker compose -f docker-compose.prod.yml up --build -d
curl https://<DOMAIN_HOAC_IP.sslip.io>/health
```

### 6.2. Sao lưu và Phục hồi CSDL (Database Backup & Restore)
* **Sao lưu dữ liệu định kỳ (Backup Dump):**
  ```bash
  docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres brewlite_db > backup_$(date +%Y%m%d_%H%M%S).sql
  ```
* **Khôi phục dữ liệu từ bản sao lưu (Restore):**
  ```bash
  cat backup_20261110_090000.sql | docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres brewlite_db
  ```

### 6.3. Bảng xử lý các lỗi thường gặp (Common Pitfalls)

| Hiện tượng lỗi | Nguyên nhân gốc | Biện pháp xử lý triệt để |
| :--- | :--- | :--- |
| **`Error: P1001: Can't reach database server`** | Container `postgres` chưa kịp sẵn sàng hoặc sai `DATABASE_URL`. | Kiểm tra `docker compose -f docker-compose.prod.yml ps`, xác định cổng 5432 và tên host `postgres` trong mạng Docker. |
| **`HTTP 409 Conflict` khi đặt món** | Tranh chấp tồn kho đồng thời (Optimistic Lock). | Bình thường theo thiết kế; Client hiển thị cảnh báo và giữ nguyên giỏ hàng. |
| **`HTTP 401 Unauthorized` trên API** | Thiếu Header `Authorization: Bearer <token>` hoặc token hết hạn. | Thực hiện đăng nhập lại để nhận token mới. |
| **Giao diện không gọi được API trên Cloud** | Biến `NEXT_PUBLIC_API_URL` trỏ nhầm về `localhost`. | Cập nhật `.env` sang URL HTTPS chính thức và chạy `docker compose -f docker-compose.prod.yml up --build -d frontend`. |
