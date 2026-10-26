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

---

## 6. HƯỚNG DẪN TỰ VẼ TRÊN VISUAL PARADIGM ONLINE (BẢNG KÝ HIỆU & BỐ CỤC)

Tài liệu này dùng làm căn cứ chuẩn mực khi nhóm tự kéo thả trên giao diện vẽ trực quan (Visual Paradigm Online / Draw.io).

### 6.1. Bảng tra cứu ký hiệu chuẩn UML 2.0 (Toolbox Palette)
* **`<<d>>` (Device):** Khối hộp 3D có nhãn `<<device>>`. Dùng đại diện cho thiết bị phần cứng vật lý (Client Smartphone/Laptop, DevOps PC).
* **Hộp 3D trơn (Node):** Dùng cho máy chủ ảo tổng thể đám mây (`AWS EC2 Virtual Machine Instance`) hoặc các nền tảng dịch vụ đám mây ngoại vi (`<<cloud service>>`).
* **`<<e>>` (Execution Environment):** Khối hộp 3D có nhãn `<<execution environment>>`. Dùng cho hệ điều hành, runtime hoặc container (`Ubuntu 22.04 LTS`, `Docker Engine`, các `Docker Containers`).
* **Component (Hình chữ nhật 2 mấu bên trái):** Thành phần phần mềm thực thi độc lập (`Next.js Server`, `NestJS API`, `Nginx Server`, `PostgreSQL 16 Engine`).
* **`<<a>>` (Artifact):** Biểu tượng trang giấy gấp góc có chữ `<<a>>`. Dùng cho tệp cấu hình triển khai (`.env`, `docker-compose.yml`, `nginx.conf`) hoặc kho lưu trữ tệp mã nguồn (`Git Repository`).
* **Cylinder Database (Hình trụ CSDL):** Ký hiệu hình trụ lấy từ nút `+ Shapes...` $\rightarrow$ tìm `Database`. Dùng biểu diễn phân vùng ổ đĩa/CSDL lưu trữ bền vững (`Persistent EBS SSD Volume`).
* **Lưu ý về `<ds>` (Deployment Specification):** Ký hiệu `<ds>` trên palette là đặc tả tham số triển khai (tham số cấu hình), không dùng làm ký hiệu lưu trữ CSDL.
* **Đường nét liền (Communication Path):** Đường truyền vật lý/mạng giữa các Node (ghi nhãn cổng `HTTPS : 443`, `SSH : 22`, `TCP : 5432`).
* **Mũi tên nét đứt `..>` (Dependency / Manifest):** Thể hiện sự phụ thuộc hoặc nạp cấu hình (`UI ..> API Client`, `Git pull ..> config`).

### 6.2. Bảng phân công ký hiệu (Mapping Table) cho hệ thống BrewLite
| Thành phần hệ thống | Ký hiệu trong Palette | Cách vẽ \& Nhãn hiển thị trên sơ đồ |
| :--- | :---: | :--- |
| **Thiết bị người dùng** | `<<d>>` *(Device)* | `Client Device (Mobile / Desktop)` |
| **Trình duyệt web** | `<<e>>` *(Execution Env)* | `Web Browser (Chrome / Safari / PWA)` |
| **Mã nguồn giao diện & API** | **Component** *(2 mấu)* | `User Interface (Next.js)` và `API Client (Fetch/Axios)` (lồng trong Browser) |
| **Máy trạm kỹ sư** | `<<d>>` *(Device)* | `DevOps Workstation (Admin Machine)` |
| **Công cụ Terminal & Git** | **Component** *(2 mấu)* | `SSH Client (Terminal)` và `Git Client` (lồng trong DevOps Station) |
| **Dịch vụ tên miền DNS** | **Hộp 3D trơn** *(Node)* hoặc **Cloud** | **Khung ngoài:** Node `<<cloud service>> DNS Provider (Cloudflare / Route 53)`<br/>**Bên trong:** Component hoặc Text: `DNS A-Record: brewlite.coffee -> Elastic IP` |
| **Kho mã nguồn GitHub** | **Hộp 3D trơn** *(Node)* hoặc **Cloud** | **Khung ngoài:** Node `<<cloud service>> GitHub Platform`<br/>**Bên trong:** `<<a>>` (Artifact): `Git Repository (origin/main)` |
| **Cổng thanh toán giả lập** | **Hộp 3D trơn** *(Node)* | `<<external service>> Mock Payment Gateway (MoMo / VNPay / Visa Webhook)` |
| **Máy chủ đám mây** | **Hộp 3D trơn** *(Node)* | `AWS EC2 Virtual Machine Instance (Ubuntu 22.04 LTS)`<br/>*[Elastic IP: 13.250.x.x \| Domain: brewlite.coffee]* |
| **Hệ điều hành máy chủ** | `<<e>>` *(Execution Env)* | `Ubuntu 22.04 LTS` *(khung lồng bên trong EC2)* |
| **Cổng đón Reverse Proxy** | **Component** *(2 mấu)* | `Nginx Web Server (SSL/TLS 1.3 Termination, Ports 80 & 443)`<br/>*(Đặt trong `<<executionEnvironment>> Ubuntu 22.04 LTS`, nằm phía trên và bên ngoài khối Docker Engine để làm Gateway đón luồng HTTPS 443)* |
| **Cổng tiếp nhận SSH** | **Component** *(2 mấu)* | `OpenSSH Server (sshd) [TCP Port 22]`<br/>*(Đặt ở góc trên bên phải trong khung Ubuntu 22.04 LTS để đón dây SSH từ DevOps PC)* |
| **Tiến trình kéo code Git** | **Component** *(2 mấu)* | `Git CLI Runner [git pull origin main]`<br/>*(Đặt trong khung Ubuntu 22.04 LTS, nhận kết nối kéo code từ GitHub Repo)* |
| **Engine chạy Container** | `<<e>>` *(Execution Env)* | `Docker Container Runtime Engine (Docker Compose)` |
| **Container Frontend** | `<<e>>` *(Execution Env)* | `Container: Frontend (web)` chứa Component `Next.js Node Server [Port 3000]` |
| **Container Backend** | `<<e>>` *(Execution Env)* | `Container: Backend API (api)` chứa Component `NestJS REST API Service [Port 3001]`, `Health Probe`, `Logger` |
| **Container CSDL** | `<<e>>` *(Execution Env)* | `Container: Database (db)` chứa Component `PostgreSQL 16 Engine [Port 5432]` |
| **Ổ đĩa lưu trữ ngoài** | **Hình trụ Database** *(Cylinder)* | `Mounted AWS EBS SSD Volume (/var/lib/postgresql/data - Persistent)`<br/>*(Nằm cùng trong `Container: db`, đặt **bên dưới** ô `PostgreSQL 16 Engine`, nối dây `Mount Volume`)* |
| **Tệp cấu hình & Biến MT** | `<<a>>` *(Artifact)* | `<<a>> Configuration & Secrets (.env, nginx.conf, docker-compose.yml)`<br/>*(Đặt trong khung Ubuntu 22.04 LTS, gần Docker Engine)* |

### 6.3. Bố cục 3 tầng không bị đè chéo dây nối (3-Tier Layout)
```plaintext
+-------------------------------------------------------------------------------------------------+
| [TẦNG 1: THIẾT BỊ ĐẦU CUỐI & QUẢN TRỊ]                                                          |
|  +--------------------------------+                         +---------------------------------+ |
|  | <<device>> Client Device       |                         | <<device>> DevOps Workstation   | |
|  |  +-- <<e>> Web Browser ------+ |                         |  - Terminal SSH Client (Port 22)| |
|  |  |  - User Interface (UI)    | |                         |  - Git CLI                      | |
|  |  |  - API Client             | |                         +---------------------------------+ |
|  |  +---------------------------+ |                                          |                  |
|  +--------------------------------+                                          |                  |
+------------------------------------------------------------------------------|------------------+
                               |                                               |
                               v                                               v
+-------------------------------------------------------------------------------------------------+
| [TẦNG 2: MẠNG TRUNG GIAN & NGOẠI VI]                                                            |
|  (Cloud) DNS: brewlite.coffee -> Elastic IP             (Cloud) GitHub Repository (origin/main) |
+-------------------------------------------------------------------------------------------------+
                               |                                               |
                               v                                               v
+-------------------------------------------------------------------------------------------------+
| [TẦNG 3: MÁY CHỦ AWS EC2 UBUNTU]                                                                |
|  +--------------------------------------------------------------------------------------------+ |
|  | Node: AWS EC2 Instance [Elastic Public IP: 13.250.x.x | Domain: brewlite.coffee]           | |
|  |  +-- <<e>> Ubuntu 22.04 LTS -------------------------------------------------------------+ | |
|  |  |  - OpenSSH Server (sshd) [Port 22] <------------------- [Nối từ DevOps SSH Client]     | | |
|  |  |  - Git Runner [git pull] <----------------------------- [Nối từ GitHub Repository]     | | |
|  |  |  - Configuration Artifact (.env, nginx.conf)                                         | | |
|  |  |  - Nginx Reverse Proxy (Ports 80 & 443) <------------- [Nối từ Client HTTPS]          | | |
|  |  |                                                                                       | | |
|  |  |  +-- <<e>> Docker Compose Runtime Engine -------------------------------------------+ | | |
|  |  |  |  +---------------------+  +----------------------+  +-------------------------+  | | | |
|  |  |  |  | <<e>> Container web |  | <<e>> Container api  |  | <<e>> Container db      |  | | | |
|  |  |  |  |  - Next.js (:3000)  |  |  - NestJS API (:3001)|  |  - PostgreSQL (:5432)   |  | | | |
|  |  |  |  |                     |  |  - Health Probe      |  |  - Mounted EBS SSD Vol  |  | | | |
|  |  |  |  +---------------------+  +----------------------+  +-------------------------+  | | | |
|  |  |  +----------------------------------------------------------------------------------+ | | |
|  |  +---------------------------------------------------------------------------------------+ | |
|  +--------------------------------------------------------------------------------------------+ |
+-------------------------------------------------------------------------------------------------+
```

### 6.4. Quy tắc kẻ dây nối (Connectors) chuyên nghiệp
1. **Dây HTTPS (Port 443):** Nối từ `Client Device` $\rightarrow$ xuyên qua `DNS/Internet` $\rightarrow$ cắm vào đỉnh `Nginx Reverse Proxy`. Ghi nhãn: `HTTPS : 443 (Pages & API)`.
2. **Dây SSH (Port 22):** Nối từ `DevOps Workstation` (bên phải) $\rightarrow$ cắm vào `OpenSSH (sshd)`. Ghi nhãn: `SSH : 22 (ssh -i key.pem ubuntu@IP)`.
3. **Dây Git Sync:** Nối từ `DevOps Git` $\rightarrow$ `GitHub Repo` $\rightarrow$ `Server Git Runner`. Ghi nhãn: `git push` và `git pull`.
4. **Dây nội bộ Docker:**
   - Từ `Nginx` rẽ 2 nhánh: xuống `Container web (HTTP : 3000)` và `Container api (HTTP : 3001)`.
   - Từ `NestJS API` nối ngang sang `PostgreSQL (TCP : 5432)`.
   - Từ `NestJS API` nối ra ngoài sang `Mock Payment Gateway (HTTPS Outbound)`.
5. **Dây Mount Volume (Lưu trữ CSDL):** Nối từ `PostgreSQL 16 Engine` cắm xuống hình trụ `Mounted AWS EBS SSD Volume` bên trong `Container: db`. Ghi nhãn: `Mount Volume` hoặc `Read/Write`.


