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
* **Máy chủ Cloud AWS EC2 (Ubuntu 22.04 LTS):**
  - **Nginx Reverse Proxy & SSL:** Tiếp nhận cổng 80 (HTTP tự động chuyển hướng sang 443) và cổng 443 (HTTPS), tự động định tuyến traffic:
    - Yêu cầu trang giao diện (`/`) $\longrightarrow$ chuyển tiếp tới Next.js Container (`HTTP : 3000`).
    - Yêu cầu gọi API (`/api/*`) $\longrightarrow$ chuyển tiếp tới NestJS API Container (`HTTP : 3001`).
  - **Docker Compose Network:** Mạng bridge nội bộ khép kín kết nối 3 container:
    - Container `web`: Frontend Next.js 15 PWA.
    - Container `api`: Backend NestJS 11 REST API.
    - Container `db`: CSDL PostgreSQL 16 gắn phân vùng ổ cứng ngoài (**AWS EBS SSD Volume**) tại `/var/lib/postgresql/data`.
* **Cổng thanh toán ngoại vi (Mock Payment Gateway):** Backend giao tiếp qua HTTPS Outbound cổng 443 để xác thực giao dịch không dùng tiền mặt.

---

## 2. YÊU CẦU TIỀN ĐỀ HỆ THỐNG (SYSTEM PREREQUISITES)

Để triển khai hệ thống thành công, môi trường máy chủ hoặc máy trạm phát triển cần đáp ứng các thông số kỹ thuật tối thiểu sau:

| Thành phần | Phiên bản tối thiểu | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Hệ điều hành** | Ubuntu 22.04 LTS / macOS / Windows 11 (WSL2) | Nền tảng thực thi ứng dụng |
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
| `NEXT_PUBLIC_API_URL` | String | `http://localhost:3001` (Dev) / `https://brewlite.coffee/api` (Prod) | URL gốc gọi API từ trình duyệt Client |

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

Triển khai thực tế trên máy chủ **AWS EC2 (Ubuntu 22.04 LTS)** theo đúng mô hình chỉ đạo của Giảng viên.

#### Bước 1: Khởi tạo & Đăng nhập máy chủ AWS EC2
1. Khởi tạo EC2 Instance (tối thiểu `t3.small` - 2 vCPU, 2GB RAM hoặc `t3.medium`).
2. Gán địa chỉ **Elastic IP** tĩnh cho instance để IP không bị đổi khi khởi động lại.
3. Cấu hình Security Group mở các cổng mạng:
   - `Port 22` (SSH): Giới hạn IP của quản trị viên.
   - `Port 80` (HTTP): Mở toàn cầu (`0.0.0.0/0`) để cấp chứng chỉ SSL.
   - `Port 443` (HTTPS): Mở toàn cầu (`0.0.0.0/0`) phục vụ khách hàng.
4. Đăng nhập qua terminal dòng lệnh bằng SSH key:
   ```bash
   ssh -i "brewlite-prod-key.pem" ubuntu@<ELASTIC_IP>
   ```

#### Bước 2: Thiết lập môi trường máy chủ Ubuntu
Cài đặt Docker Engine và Docker Compose plugin chính thức trên Ubuntu:
```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg git nginx certbot python3-certbot-nginx

# Cài đặt Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu
newgrp docker
```

#### Bước 3: Triển khai mã nguồn qua Git
```bash
git clone https://github.com/nphat-code/swe-project.git
cd swe-project

# Cấu hình biến môi trường Production
cp .env.example .env
nano .env # Điền mật khẩu database mạnh, JWT_SECRET an toàn và NEXT_PUBLIC_API_URL
```

#### Bước 4: Khởi chạy Cụm dịch vụ Docker
```bash
# Khởi chạy cụm container chế độ chạy ngầm (detached)
docker compose up --build -d

# Thực thi Migration trên CSDL Production
docker compose exec api npx prisma migrate deploy

# Nạp dữ liệu danh mục & thực đơn ban đầu
docker compose exec api npx prisma db seed
```

#### Bước 5: Cấu hình Nginx Reverse Proxy & Chứng chỉ SSL HTTPS
Tạo tệp cấu hình Nginx tại `/etc/nginx/sites-available/brewlite`:

```nginx
server {
    server_name brewlite.coffee www.brewlite.coffee;

    # Giao diện người dùng Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API NestJS
    location /api/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }

    # Health Check endpoint
    location /health {
        proxy_pass http://127.0.0.1:3001/health;
        proxy_set_header Host $host;
    }
}
```

Kích hoạt cấu hình và cấp chứng chỉ bảo mật SSL miễn phí qua Let's Encrypt:
```bash
sudo ln -s /etc/nginx/sites-available/brewlite /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Cấp chứng chỉ HTTPS tự động gia hạn
sudo certbot --nginx -d brewlite.coffee -d www.brewlite.coffee
```

---

## 5. QUY TRÌNH KIỂM TRA TÍNH SẴN SÀNG & GIÁM SÁT (HEALTH CHECK)

Sau khi hoàn tất triển khai, thực hiện các bước nghiệm thu kỹ thuật:

### 5.1. Thăm dò Endpoint Sức khỏe (Health Check Probe)
Thực thi lệnh kiểm tra:
```bash
curl -i https://brewlite.coffee/health
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
docker compose logs -f --tail=100 api
```

---

## 6. QUY TRÌNH ROLLBACK & XỬ LÝ SỰ CỐ (TROUBLESHOOTING & RECOVERY)

### 6.1. Quy trình khôi phục phiên bản trước (Rollback)
Khi phiên bản mới phát sinh lỗi nghiêm trọng trên Production:
```bash
# 1. Quay ngược mã nguồn về commit ổn định gần nhất
git log --oneline -n 5
git checkout <COMMIT_HASH_ON_DINH>

# 2. Tái tạo lại container
docker compose up --build -d

# 3. Kiểm tra lại health check
curl https://brewlite.coffee/health
```

### 6.2. Sao lưu và Phục hồi CSDL (Database Backup & Restore)
* **Sao lưu dữ liệu định kỳ (Backup Dump):**
  ```bash
  docker compose exec -t db pg_dump -U postgres brewlite > backup_$(date +%Y%m%d_%H%M%S).sql
  ```
* **Khôi phục dữ liệu từ bản sao lưu (Restore):**
  ```bash
  cat backup_20261031_090000.sql | docker compose exec -T db psql -U postgres brewlite
  ```

### 6.3. Bảng xử lý các lỗi thường gặp (Common Pitfalls)

| Hiện tượng lỗi | Nguyên nhân gốc | Biện pháp xử lý triệt để |
| :--- | :--- | :--- |
| **`Error: P1001: Can't reach database server`** | Container `db` chưa kịp sẵn sàng hoặc sai `DATABASE_URL`. | Kiểm tra `docker compose ps`, xác định cổng 5432 và tên host `db` trong mạng Docker. |
| **`HTTP 409 Conflict` khi đặt món** | Tranh chấp tồn kho đồng thời (Optimistic Lock). | Bình thường theo thiết kế; Client hiển thị cảnh báo và giữ nguyên giỏ hàng. |
| **`HTTP 401 Unauthorized` trên API** | Thiếu Header `Authorization: Bearer <token>` hoặc token hết hạn. | Thực hiện đăng nhập lại để nhận token mới. |
| **Giao diện không gọi được API trên Cloud** | Biến `NEXT_PUBLIC_API_URL` trỏ nhầm về `localhost`. | Cập nhật `.env` sang URL tên miền chính thức và chạy `docker compose build web`. |
