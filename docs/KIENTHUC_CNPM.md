# 📚 SỔ TAY KIẾN THỨC CÔNG NGHỆ PHẦN MỀM — DỰ ÁN BREWLITE

> Tài liệu tổng hợp toàn bộ các khái niệm, kiến trúc và kỹ thuật cốt lõi được áp dụng trong bài tập lớn môn **Công nghệ Phần mềm (Software Engineering)**. Rất quan trọng khi làm báo cáo, vấn đáp và bảo vệ đồ án.

---

## 🏛️ PHẦN 1: KIẾN TRÚC HỆ THỐNG & MONOREPO

### 1. Kiến trúc Monorepo là gì?
* **Khái niệm:** Thay vì chia Frontend và Backend thành 2 repository Git riêng biệt, ta đặt cả hai vào cùng **một repository duy nhất** (`swe-project/`).
* **Lợi ích thực tế:**
  * Quản lý phiên bản đồng bộ: Một commit có thể bao gồm cả sự thay đổi ở Backend (thêm API) và Frontend (dùng API đó).
  * Tiện lợi khi chấm bài & nộp bài: Giảng viên chỉ cần clone 1 repo duy nhất là có đủ toàn bộ hệ thống.
  * Tái sử dụng code/types: Dễ dàng chia sẻ type, interface DTO giữa Frontend và Backend.

### 2. NPM Workspaces
* Được cấu hình trong file gốc `package.json`:
  ```json
  "workspaces": ["backend", "frontend"]
  ```
* **Cơ chế:** NPM sẽ tự động quét và liên kết các package con. Khi đứng ở thư mục gốc gõ `npm install`, NPM sẽ tối ưu hóa thư mục `node_modules` dùng chung, tránh trùng lặp dung lượng ổ cứng.

---

## 🎨 PHẦN 2: FRONTEND HIỆN ĐẠI (Next.js App Router)

### 1. Mô hình App Router trong Next.js
* **File-based Routing:** Mỗi thư mục con trong `src/app/` tự động trở thành một đường dẫn URL:
  * `src/app/page.tsx` $\rightarrow$ Đường dẫn `/` (Trang chủ)
  * `src/app/orders/page.tsx` $\rightarrow$ Đường dẫn `/orders` (Lịch sử đơn)

### 2. Sự khác biệt giữa `layout.tsx` và `page.tsx`
* **`layout.tsx` (Giao diện cố định):**
  * Chứa khung HTML chuẩn: `<html>`, `<body>`, Header, Footer, nạp Font chữ.
  * **Cơ chế đặc biệt:** Khi người dùng chuyển đổi giữa các trang, `layout.tsx` **không bị reload lại**, chỉ có `{children}` bên trong thay đổi $\rightarrow$ Tăng tốc độ hiển thị và tiết kiệm băng thông.
* **`page.tsx` (Nội dung thay đổi):**
  * Đại diện cho nội dung độc nhất của từng URL cụ thể.

### 3. TailwindCSS v4
* Sử dụng trường phái **Utility-first CSS**: Thay vì viết từng file `.css` với class riêng, ta gắn trực tiếp các class chức năng vào JSX (ví dụ: `flex`, `items-center`, `rounded-xl`, `bg-amber-500`).
* Tự động loại bỏ mã CSS thừa khi build production (`next build`), tạo bundle siêu nhẹ.

---

## ⚙️ PHẦN 3: BACKEND CHUẨN DOANH NGHIỆP (NestJS)

NestJS được xây dựng dựa trên các mẫu thiết kế (Design Patterns) hướng đối tượng kinh điển:

```
Request từ Client
       │
       ▼
 [ ValidationPipe ]  ── (Kiểm tra dữ liệu đầu vào đúng chuẩn DTO)
       │
       ▼
 [ AppController ]   ── (Định tuyến URL, tiếp nhận request HTTP)
       │
       ▼
  [ AppService ]     ── (Xử lý nghiệp vụ logic, tính toán)
       │
       ▼
 [ Database/Prisma ] ── (Lưu trữ dữ liệu)
```

### 1. Khái niệm Dependency Injection (DI) & Inversion of Control (IoC)
*(Câu hỏi kinh điển khi vấn đáp đồ án)*
* **Vấn đề thông thường:** Trong `AppController`, nếu ta tự viết `const service = new AppService()`, Controller sẽ bị phụ thuộc cứng vào Service đó (Tight Coupling) $\rightarrow$ Rất khó viết Unit Test Mock.
* **Giải pháp của NestJS (DI):** 
  * Đánh dấu Service với `@Injectable()`.
  * Khai báo trong constructor của Controller: `constructor(private readonly appService: AppService) {}`.
  * **NestJS IoC Container** sẽ tự động khởi tạo đối tượng `AppService` và "bơm" (inject) vào Controller khi server khởi động $\rightarrow$ Loose Coupling, dễ dàng thay thế bằng Mock Service khi test.

### 2. DTO (Data Transfer Object) & ValidationPipe
* **DTO:** Là một class định nghĩa hình hài dữ liệu mà Client được phép gửi lên Server (ví dụ: tạo đơn hàng phải có `productId`, `quantity`, `size`).
* **ValidationPipe:** Đặt ở `main.ts`:
  * `whitelist: true`: Tự động loại bỏ bất kỳ trường lạ nào mà client cố tình gửi kèm.
  * `forbidNonWhitelisted: true`: Báo lỗi ngay lập tức (`400 Bad Request`) nếu phát hiện trường không hợp lệ $\rightarrow$ Chống tấn công sửa đổi dữ liệu (Mass Assignment Vulnerability).

### 3. CORS (Cross-Origin Resource Sharing)
* **Trình duyệt web có cơ chế Same-Origin Policy:** Mặc định cấm trang web ở `http://localhost:3000` (Frontend) gửi request lấy dữ liệu từ `http://localhost:3001` (Backend) vì khác port (khác Origin).
* **Giải pháp:** Cấu hình `app.enableCors(...)` tại `main.ts` của NestJS để Backend chủ động cho phép trình duyệt gửi request sang.

---

## 🐳 PHẦN 4: DEVOPS & BẢO MẬT

### 1. Docker & Docker Compose
* **Mục đích:** Thay vì yêu cầu mọi thành viên trong nhóm hoặc giảng viên phải tự cài PostgreSQL lên máy tính (dễ gặp lỗi sai phiên bản, xung đột port), ta dùng `docker-compose.yml`:
  ```bash
  docker compose up -d postgres
  ```
* Docker sẽ kéo image `postgres:16-alpine` về chạy cô lập trong container, đảm bảo môi trường phát triển của mọi người **giống nhau 100%**.

### 2. Nguyên tắc Quản lý Biến Môi Trường (12-Factor App)
* **Tuyệt đối không commit file `.env` lên Git:** File `.env` chứa thông tin mật (Mật khẩu Database, Secret key JWT).
* **Luôn tạo `.env.example`:** Để các thành viên khác trong nhóm biết dự án cần những biến môi trường nào để sao chép ra cấu hình.

### 3. Tiêu chuẩn Conventional Commits
Quy tắc đặt tên commit giúp lịch sử Git rõ ràng, chuyên nghiệp:
* `feat:` Tính năng mới (ví dụ: `feat(backend): add get products api`).
* `fix:` Sửa lỗi (ví dụ: `fix(auth): correct token expiration calculation`).
* `docs:` Viết hoặc sửa tài liệu (ví dụ: `docs: add software engineering notes`).
* `chore:` Cấu hình, cài thư viện, chỉnh sửa tool.

---

## 🔄 PHẦN 5: QUY TRÌNH PHÁT TRIỂN AGILE SCRUM

| Khái niệm | Ý nghĩa trong dự án BrewLite |
| :--- | :--- |
| **Product Owner (PO)** | Người quyết định yêu cầu sản phẩm và độ ưu tiên các tính năng. |
| **Scrum Master (SM)** | Người điều phối, đảm bảo nhóm tuân thủ đúng quy trình Scrum và tháo gỡ rào cản. |
| **Development Team** | Các thành viên trực tiếp thiết kế, lập trình và kiểm thử. |
| **Product Backlog** | Danh sách các hạng mục kỹ thuật (Product Backlog Items - PBI) của dự án BrewLite, ánh xạ trực tiếp với 12 yêu cầu chức năng (`FR-01` $\rightarrow$ `FR-12`). |
| **Sprint Backlog** | Các hạng mục kỹ thuật được cam kết hoàn thành trong 1 Sprint (Sprint 1: Nền tảng & MVP Menu; Sprint 2: Luồng Checkout End-to-End, Testing & CD). |
| **Increment** | Bản sản phẩm tăng trưởng chạy được thực tế sau mỗi Sprint. |
| **Definition of Done (DoD)** | Tiêu chuẩn để nghiệm thu một task: Code chạy được, không lỗi build, có commit Git, có validation, có test. |
| **Burndown Chart** | Biểu đồ theo dõi số lượng Story Points còn lại giảm dần theo từng ngày làm việc. |
