# SƠ ĐỒ TRIỂN KHAI HỆ THỐNG (UML DEPLOYMENT DIAGRAM) - BREWLITE

> **Ngôn ngữ mô hình hóa:** PlantUML / UML 2.0 & Mermaid.js  
> **Tệp PlantUML chuẩn mẫu:** [`deployment-web-app.puml`](deployment-web-app.puml)  
> **Tệp PlantUML triển khai AWS/Ubuntu:** [`deployment-aws.puml`](deployment-aws.puml)  
> **Tệp Mermaid toàn trình Production:** [`deployment-production.mmd`](deployment-production.mmd)  
> **Tệp đồ họa vector (SVG):** [`deployment-production.svg`](deployment-production.svg)  
> **Tệp ảnh chất lượng cao (PNG):** [`deployment-production.png`](deployment-production.png)

---

## 1. MỤC TIÊU & PHẠM VI MÔ HÌNH HÓA

Sơ đồ Triển khai (Deployment Diagram) thể hiện kiến trúc phần cứng, máy chủ ảo, hạ tầng mạng, container và các thành phần phần mềm (artifacts, components) được phân bổ và giao tiếp với nhau trong môi trường vận hành thực tế.

### Các nguyên tắc chuẩn UML 2.0:
1. **Phân định rõ Node vật lý / máy chủ ảo:**
   - Client Device (Máy tính cá nhân / Điện thoại di động chạy Web Browser).
   - DevOps Station (Máy trạm quản trị kết nối qua giao thức an toàn).
   - Load Balancer / Reverse Proxy (Bộ cân bằng tải phân phối lưu lượng).
   - Application Server Tier (Cụm Web/App Server xử lý nghiệp vụ).
   - Database Server Tier (Hệ quản trị CSDL & Volume lưu trữ bền vững).
2. **Ký hiệu chuẩn hóa:**
   - `node`: Thể hiện môi trường thực thi (EC2, Virtual Host, Docker Container, Browser).
   - `component` / `artifact`: Thể hiện module mã nguồn hoặc tệp cấu hình thực thi.
   - `database`: Thể hiện nút lưu trữ dữ liệu chuyên dụng.
   - Giao thức mạng rõ ràng: `HTTPS (Port 443)`, `SSH (Port 22)`, `TCP (Port 5432)`.

---

## 2. CÁC PHIÊN BẢN SƠ ĐỒ TRIỂN KHAI

### 2.1. Sơ đồ mô hình chuẩn N-Tier Web App ([`deployment-web-app.puml`](deployment-web-app.puml))
- Chuẩn hóa từ mẫu kiến trúc tải cao:
  - **Client Device:** Chứa Web Browser với 2 thành phần `User Interface` và `API Client`.
  - **Load Generator:** Node giả lập kiểm thử tải (`Artillery`/`JMeter`) bơm lưu lượng qua Internet.
  - **Load Balancer Host:** Nginx / ALB tiếp nhận cổng HTTPS 443 và phân phối Round-Robin.
  - **Application Server Tier:** Cụm 3 Web Server instances độc lập xử lý song song.
  - **Persistence Tier:** Database Server (PostgreSQL) tiếp nhận kết nối qua cổng TCP 5432.

### 2.2. Sơ đồ triển khai hạ tầng AWS EC2 Ubuntu ([`deployment-aws.puml`](deployment-aws.puml))
- Phù hợp với khuyến nghị môi trường AWS/Azure:
  - **Hệ điều hành:** Ubuntu Server 22.04 LTS chạy trên AWS EC2.
  - **Quản trị & Triển khai:** DevOps kết nối SSH (Port 22), pull mã nguồn từ GitHub về server.
  - **Cấu hình (Config):** File `.env`, `nginx.conf` và `docker-compose.yml` điều phối service.
  - **Đóng gói Container:** Next.js (Port 3000), NestJS API (Port 3001) và PostgreSQL 16 (Port 5432) với EBS Volume bền vững.

### 2.3. Sơ đồ Production Serverless Cloud ([`deployment-production.mmd`](deployment-production.mmd))
- Kiến trúc microservices đám mây hiện đại:
  - **Frontend:** Vercel Global Edge Network (CDN & SSR).
  - **Backend API:** Render Web Service (Docker Container Node.js 20).
  - **Database:** Neon Serverless PostgreSQL với PgBouncer Connection Pooler.
  - **CI/CD:** GitHub Actions tự động build, test và kích hoạt Webhook deploy.

---

## 3. BẢNG DANH MỤC GIAO THỨC & CỔNG KẾT NỐI

| Tuyến kết nối | Nguồn phát | Điểm đến | Giao thức | Cổng (Port) | Mục đích |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Client Web Traffic** | Web Browser | Load Balancer | HTTPS / TLS 1.3 | 443 | Tải trang giao diện & gọi REST API |
| **Remote Admin** | DevOps Workstation | AWS EC2 (sshd) | SSH / TCP | 22 | Quản trị từ xa, pull code từ Git, cập nhật config |
| **Reverse Proxy Web** | Nginx / LB | Next.js Container | HTTP | 3000 | Chuyển tiếp request giao diện |
| **Reverse Proxy API** | Nginx / LB | NestJS Container | HTTP | 3001 | Chuyển tiếp request nghiệp vụ Backend |
| **Database Connection**| NestJS App | PostgreSQL Engine | TCP (SSL) | 5432 | Truy vấn dữ liệu CRUD qua Prisma ORM |
| **Testing Traffic** | Load Generator | Load Balancer | HTTP / HTTPS | 80 / 443 | Kiểm thử khả năng chịu tải & hiệu năng hệ thống |
