# SƠ ĐỒ TRIỂN KHAI HỆ THỐNG (UML DEPLOYMENT DIAGRAM) - BREWLITE

> **Căn cứ đề bài:** Mục 5.2 (Task 3.2 - 2.0 điểm) trong tệp đặc tả gốc [`docs/DE_BAI_ASSIGNMENT_2_GOC.md`](../../docs/DE_BAI_ASSIGNMENT_2_GOC.md).  
> **Căn cứ chỉ dẫn giảng viên:** Ghi chú thực thi hạ tầng đám mây tại [`notes`](../../../notes) *(AWS EC2, Ubuntu OS, SSH login qua IP, Git pull, gán tên miền & IP tĩnh)*.  
> **Ngôn ngữ mô hình hóa:** PlantUML / UML 2.0 (Monochrome, Black & White).  
> **Tệp mã nguồn sơ đồ chính thức:** [`deployment-diagram.puml`](deployment-diagram.puml)

---

## 1. MỤC TIÊU & NGUYÊN TẮC THIẾT KẾ SƠ ĐỒ

Sơ đồ Triển khai (Deployment Diagram) thể hiện kiến trúc phần cứng, máy chủ ảo, hạ tầng mạng, các container Docker và thành phần phần mềm được phân bổ, kết nối với nhau trong môi trường vận hành thực tế (Production Environment).

### Nguyên tắc tuân thủ chuẩn UML 2.0 & Đề bài:
1. **Phân định rõ ràng các ranh giới thực thi (Execution Boundaries):**
   - **Thiết bị người dùng (Client Device):** Smartphone / Máy tính chạy trình duyệt web hoặc PWA.
   - **Máy trạm quản trị (DevOps Workstation):** Kỹ sư vận hành kết nối dòng lệnh bảo mật qua SSH và điều khiển Git.
   - **Dịch vụ mạng ngoại vi (External Services):** Máy chủ phân giải tên miền (DNS Provider) và Cổng thanh toán giả lập (Mock Payment Gateway).
   - **Đám mây AWS VPC (Cloud Infrastructure):** Máy chủ ảo AWS EC2 chạy hệ điều hành Ubuntu 22.04 LTS với địa chỉ IP tĩnh (Elastic IP) và tên miền định tuyến.
2. **Ký hiệu chuẩn hóa theo UML 2.0:**
   - `node`: Thể hiện môi trường máy chủ vật lý, máy ảo (VM) hoặc Docker Container.
   - `component` / `artifact`: Thể hiện module mã nguồn, tiến trình chạy hoặc tệp cấu hình (`.env`, `nginx.conf`, `docker-compose.yml`).
   - `database` / `storage`: Thể hiện hệ quản trị CSDL PostgreSQL và phân vùng lưu trữ bền vững (Mounted EBS SSD Volume).
   - Giao thức mạng rõ ràng: Ghi rõ cổng kết nối (`Port 443`, `Port 22`, `Port 3000`, `Port 3001`, `Port 5432`) và giao thức (`HTTPS`, `SSH`, `HTTP`, `TCP`).
3. **Phong cách thiết kế Monochrome:**
   - Đường nét đen trắng chuẩn mực, rõ ràng, tối ưu cho báo cáo kỹ thuật và in ấn học thuật.

---

## 2. NỘI DUNG MÃ NGUỒN SƠ ĐỒ PLANTUML

Mã nguồn sơ đồ được lưu trữ độc lập tại tệp [`deployment-diagram.puml`](deployment-diagram.puml).

---

## 3. PHÂN TÍCH CHI TIẾT CÁC TẦNG HẠ TẦNG & THÀNH PHẦN

### 3.1. Thiết bị người dùng (Client Tier)
* **Thành phần:** `Web Browser` chạy trên thiết bị cá nhân (Desktop / Mobile).
* **Cơ chế hoạt động:** 
  - `User Interface`: Tải các trang HTML/CSS/JS do Next.js biên dịch.
  - `API Client`: Thực hiện các cuộc gọi REST API bất đồng bộ thông qua `fetch` hoặc `axios`.

### 3.2. Quản trị & Vận hành (DevOps & Deployment Workflow)
* Đúng theo yêu cầu giảng viên hướng dẫn trong môn học:
  1. **Đẩy mã nguồn:** Lập trình viên đẩy code lên kho chứa GitHub (`git push origin main`).
  2. **Kết nối máy chủ:** Kỹ sư DevOps đăng nhập vào máy chủ Ubuntu trên AWS thông qua giao thức SSH dòng lệnh:
     ```bash
     ssh -i "brewlite-key.pem" ubuntu@13.250.x.x
     ```
  3. **Kéo mã nguồn & Cấu hình:** Thực hiện `git pull` để nhận mã nguồn mới nhất, áp dụng tệp biến môi trường `.env` và tệp điều phối `docker-compose.yml`.

### 3.3. Máy chủ AWS EC2 Ubuntu & Reverse Proxy Nginx
* **Hạ tầng:** AWS EC2 Instance cấu hình hệ điều hành **Ubuntu 22.04 LTS**, gắn địa chỉ **Elastic IP** tĩnh.
* **Tên miền (Domain Name):** Thuê tên miền (ví dụ: `brewlite.coffee`), cấu hình DNS Bản ghi A (`A-Record`) trỏ thẳng về Elastic IP của EC2.
* **Nginx Reverse Proxy:**
  - Tiếp nhận kết nối HTTPS cổng 443 (được mã hóa SSL/TLS bởi Let's Encrypt / Certbot).
  - Tự động định tuyến (Reverse Proxy):
    - Các yêu cầu tải trang (`/`) $\rightarrow$ chuyển tiếp tới Next.js Container (`HTTP : 3000`).
    - Các yêu cầu gọi API (`/api/*`) $\rightarrow$ chuyển tiếp tới NestJS API Container (`HTTP : 3001`).
  - Định kỳ thăm dò sức khỏe hệ thống (`Health Check Probe`) qua endpoint `GET /health`.

### 3.4. Cụm Docker Compose (Container Runtime)
Toàn bộ hệ thống chạy khép kín trong mạng nội bộ Docker:
1. **Frontend Container (`web`):** Chạy Next.js Node.js Server phục vụ Server-Side Rendering (SSR) và Client Component.
2. **Backend Container (`api`):** Chạy NestJS REST API Server, xử lý logic nghiệp vụ, quản lý trạng thái đơn hàng (`assertTransition`), thẩm định bảo mật và ghi log ra luồng JSON (`stdout`).
3. **Database Container (`db`):** Chạy PostgreSQL 16 Engine. Thư mục dữ liệu `/var/lib/postgresql/data` được gắn trực tiếp ra phân vùng ổ cứng ngoài (**AWS EBS SSD Volume**) nhằm đảm bảo an toàn dữ liệu, không bị mất mát khi container khởi động lại.

---

## 4. BẢNG DANH MỤC GIAO THỨC & CỔNG KẾT NỐI (PORTS & PROTOCOLS)

| Tuyến kết nối | Điểm bắt đầu (Source) | Điểm kết thúc (Target) | Giao thức (Protocol) | Cổng (Port) | Mục đích kỹ thuật |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DNS Resolution** | Trình duyệt Client | DNS Provider | DNS / UDP | 53 | Phân giải tên miền `brewlite.coffee` ra Elastic IP |
| **Client HTTPS Traffic** | Trình duyệt Client | Nginx Web Server | HTTPS / TLS 1.3 | 443 | Tải tài nguyên giao diện và gửi request đặt đơn |
| **Remote SSH Admin** | Máy trạm DevOps | OpenSSH Server (sshd) | SSH / TCP | 22 | Quản trị từ xa bằng lệnh terminal `ssh -i ...` |
| **Git Deployment** | Máy chủ Ubuntu | GitHub Repository | HTTPS / Git Protocol | 443 / 9418 | Tải mã nguồn cập nhật về máy chủ (`git pull`) |
| **Web Reverse Proxy** | Nginx | Next.js Container | HTTP | 3000 | Chuyển tiếp request trang giao diện người dùng |
| **API Reverse Proxy** | Nginx | NestJS API Container | HTTP | 3001 | Chuyển tiếp request gọi API nghiệp vụ |
| **Health Probe** | Nginx / Cron | NestJS API Container | HTTP | 3001 | Kiểm tra sức khỏe hệ thống (`GET /health`) |
| **Database Connection**| NestJS Service | PostgreSQL Engine | TCP (SSL internal) | 5432 | Truy vấn dữ liệu CRUD qua Prisma Connection Pool |
| **Payment Gateway** | NestJS Service | Mock Payment Server | HTTPS Outbound | 443 | Giao tiếp xác thực giao dịch thanh toán |

---

## 5. HƯỚNG DẪN XEM & XUẤT SƠ ĐỒ

1. **Xem trực tiếp trong Visual Studio Code:**
   - Cài đặt tiện ích mở rộng **PlantUML** (của *jebbs*).
   - Mở tệp [`deployment-diagram.puml`](deployment-diagram.puml) và nhấn tổ hợp phím `Alt + D` để xem bản vẽ trực quan.
2. **Xuất sang ảnh chất lượng cao (PNG / SVG):**
   - Click chuột phải vào mã nguồn `deployment-diagram.puml` $\rightarrow$ Chọn `PlantUML: Export Current Diagram` $\rightarrow$ Chọn định dạng `png` hoặc `svg` để đính kèm vào báo cáo Word/PDF.
