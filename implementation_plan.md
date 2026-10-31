# 📋 KẾ HOẠCH TRIỂN KHAI DỰ ÁN BREWLITE (ASSIGNMENT 2)
## Master Implementation Plan: Requirements to Deployment (VER 1.0)
### Thang điểm đánh giá: 10.0 Điểm (5 Tasks x 2.0 Điểm)

> **Môn học:** Công nghệ Phần mềm (Software Engineering) — ĐH Sài Gòn  
> **Dự án:** BrewLite — Hệ thống đặt đồ uống không dùng tiền mặt (Cashless Coffee Ordering System)  
> **Căn cứ pháp lý & kỹ thuật:** [Yêu cầu Đề Bài Gốc Assignment 2 (Single Source of Truth)](docs/DE_BAI_ASSIGNMENT_2_GOC.md)  
> **Trạng thái tổng thể:** 🟢 **Task 1: ĐÃ HOÀN THÀNH (2.0/2.0 Điểm)** | 🟡 **Task 2: ĐANG THỰC HIỆN (0.0/2.0 Điểm)**

---

## 🧭 CÁC NGUYÊN TẮC BẮT BUỘC CỦA DỰ ÁN (PROJECT LAWS)

1. **Quy tắc thực hiện tuần tự (Sequential Rule):**
   * 5 Task lớn phải hoàn thành đúng thứ tự: Task 1 $\rightarrow$ Task 2 $\rightarrow$ Task 3 $\rightarrow$ Task 4 $\rightarrow$ Task 5.
   * Task sau chỉ được nghiệm thu khi các tạo phẩm của task trước đã có đầy đủ trên kho mã nguồn với lịch sử commit rõ ràng.
2. **Quy tắc Git & Bàn giao (Git Push Immediately - [AGENTS.md](AGENTS.md)):**
   * Làm xong phần nào, kiểm tra chạy tốt, tạo commit chuẩn Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`,...) và chạy lệnh `git push origin main` ngay lập tức.
3. **Tuyệt đối không comment trong code (Self-Documenting Code - [AGENTS.md](AGENTS.md)):**
   * Không viết bất kỳ comment giải thích, ghi chú nào trong các file mã nguồn (`.ts`, `.tsx`, `.js`, `.css`).
   * Không để lại code thừa bị comment. Code phải tự tường minh qua tên biến, hàm, type.
4. **Chỉ đạo của Giảng viên ([GHI_CHU_GIANG_VIEN.md](GHI_CHU_GIANG_VIEN.md) & [notes](notes)):**
   * **Thay thế User Story bằng Sơ đồ UML:** Không viết User Story văn bản dài dòng; thay thế bằng sơ đồ UML trực quan (Use Case, Activity, Sequence, Class), chỉ giữ bảng mã `FR` tinh gọn để truy vết.
   * **Sơ đồ Activity:** Điều kiện rẽ nhánh **không dùng Yes/No**, phải có hành động/trạng thái cụ thể; có **Fork**, **Join**, xử lý đầy đủ: hết hàng, chưa đăng nhập, thanh toán thất bại.
   * **Sơ đồ Sequence:** Đủ 5 lifeline (`Customer -> Next.js UI -> NestJS API -> Database -> Payment Service`), kiểm tra JWT, transaction tạo đơn & trừ kho, Idempotency-Key, nhánh alt.
   * **Sơ đồ Class:** Mức Domain cho tối thiểu 7 lớp (`User`, `Product`, `Order`, `OrderItem`, `Payment`, `Promotion`, `LoyaltyTransaction`) kèm thuộc tính, phương thức, quan hệ, multiplicity và enum trạng thái.
   * **Kiến trúc & Triển khai:** Sơ đồ Deployment phản ánh đúng hạ tầng thực tế (Render / Railway / Vercel + Neon PostgreSQL / AWS / Azure).

---

## 📊 TIẾN ĐỘ TỔNG QUAN 5 TASK (PROGRESS DASHBOARD)

| Task | Giai đoạn | Tạo phẩm chính | Điểm | Trạng thái | Tiến độ |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **Task 1** | **Khai thác & đặc tả yêu cầu** | `context-and-scope.md`, `system-requirements-matrix.md`, `core-use-case-specification.md`, `use-case-system.png/mmd`, `use-case-checkout.mmd` | **2.0** | 🟢 **HOÀN THÀNH** | **100%** |
| **Task 2** | **Mô hình hóa hệ thống** | Activity Diagram (`.puml` / `.svg`), Sequence Diagram (`.puml` / `.svg`), Domain Class Diagram (`.puml` / `.svg`) | **2.0** | 🟡 **ĐANG LÀM** | **20%** |
| **Task 3** | **Thiết kế kiến trúc** | `docs/architecture/architecture-description.md`, thư mục `docs/architecture/adr/`, `docs/deployment.md` | **2.0** | ⏳ Chờ Task 2 | **0%** |
| **Task 4** | **Triển khai Sprint 1** | Chuẩn hóa repo, MVP Menu duyệt đồ uống (Next.js + NestJS), `.github/workflows/ci.yml` | **2.0** | ⏳ Chờ Task 3 | **0%** |
| **Task 5** | **Triển khai Sprint 2 & CI/CD** | MVP End-to-End, Bộ Test (Unit/Integration/E2E), `.github/workflows/cd.yml`, Triển khai Production HTTPS | **2.0** | ⏳ Chờ Task 4 | **0%** |
| **TỔNG** | **TOÀN BỘ ASSIGNMENT 2** | **Hệ thống chạy thực tế, mã nguồn, tài liệu và pipeline CI/CD** | **10.0** | | **24%** |

---

## 🔍 CHI TIẾT TỪNG TASK & TẠO PHẨM NGHIỆM THU

---

### 🟢 TASK 1: KHAI THÁC VÀ ĐẶC TẢ YÊU CẦU (2.0 / 2.0 Điểm) — [ĐÃ XONG 100%]

- [x] **Task 1.1: Bối cảnh, Stakeholder và Phạm vi**
  * **File:** [`docs/requirements/context-and-scope.md`](docs/requirements/context-and-scope.md)
  * **Kết quả:** Phân tích vấn đề nghiệp vụ BrewLite; 6 nhóm Stakeholder kèm mục tiêu & kỳ vọng; phân định In-Scope (MVP), Future Scope, Out-of-Scope; Bảng giả định, ràng buộc kỹ thuật và ma trận 5 rủi ro ban đầu kèm giải pháp.
  * **Git Status:** Đã commit và push remote.

- [x] **Task 1.2: Yêu cầu chức năng, phi chức năng & Sơ đồ Use Case tổng quát**
  * **File tài liệu:** [`docs/requirements/system-requirements-matrix.md`](docs/requirements/system-requirements-matrix.md)
  * **File sơ đồ:** [`docs/diagrams/use-case/use-case-system.mmd`](docs/diagrams/use-case/use-case-system.mmd) & [`use-case-system.png`](docs/diagrams/use-case/use-case-system.png)
  * **Kết quả:** 
    * Bảng danh mục 12 yêu cầu chức năng `FR-01` $\rightarrow$ `FR-12` phân loại theo MoSCoW (9 Must, 2 Should, 1 Could).
    * Bảng danh mục 8 yêu cầu phi chức năng `NFR-01` $\rightarrow$ `NFR-08`.
    * Sơ đồ Use Case tổng quát toàn hệ thống gồm 5 phân hệ, 5 tác nhân (Customer, Member, Barista, Admin, Payment Gateway), 16 Use Case chính và 4 Sub-Use Case chuẩn UML.
  * **Git Status:** Đã commit và push remote.

- [x] **Task 1.3: Đặc tả một Use Case trọng tâm (Đặt & Thanh toán đơn hàng)**
  * **File tài liệu:** [`docs/requirements/core-use-case-specification.md`](docs/requirements/core-use-case-specification.md)
  * **File sơ đồ:** [`docs/diagrams/use-case/use-case-checkout.mmd`](docs/diagrams/use-case/use-case-checkout.mmd)
  * **Kết quả:**
    * Sơ đồ phân phạm vi trọng tâm: `UC04` (Giỏ hàng), `UC05` (Đặt hàng), `UC05.1` (Voucher), `UC06` (Thanh toán trực tuyến).
    * Bảng đặc tả chuẩn CNPM: Actor, Trigger, Pre-conditions, Post-conditions (Success/Failure).
    * Luồng sự kiện chính (Main Flow - 13 bước), 3 Luồng thay thế (Alternative Flows), 5 Luồng ngoại lệ (Exception Flows).
    * 5 Tiêu chí chấp nhận (AC-CORE-01 $\rightarrow$ 05) theo chuẩn `Given - When - Then` làm căn cứ viết Test cho Task 5.2.
    * Bảng ma trận truy vết với các mã `FR` và `NFR`.
  * **Git Status:** Đã commit và push remote.

---

### 🟡 TASK 2: MÔ HÌNH HÓA HỆ THỐNG (0.0 / 2.0 Điểm) — [TIẾP THEO]

> **Yêu cầu kỹ thuật:** Bắt buộc lưu cả tệp mã nguồn (`.puml` / `.mmd`) và ảnh kết xuất trực quan (`.svg` hoặc `.png`). Cả 3 sơ đồ không mâu thuẫn với SRS, Use Case hoặc CSDL.

- [ ] **Task 2.1: Sơ đồ Hoạt động (Activity Diagram)**
  * **File dự kiến:** `docs/diagrams/activity/activity-flow.puml` & `docs/diagrams/activity/activity-flow.svg` (kèm `.mmd`)
  * **Tiêu chí bắt buộc:**
    * Luồng End-to-End: Duyệt Menu $\rightarrow$ Tùy biến món $\rightarrow$ Giỏ hàng $\rightarrow$ Đặt đơn $\rightarrow$ Thanh toán $\rightarrow$ Nhận đồ uống.
    * 4 Swimlane rõ ràng: Khách hàng (Customer), Giao diện Web (Next.js UI), Máy chủ Backend (NestJS API), Cổng thanh toán (Payment Gateway).
    * **Điều kiện rẽ nhánh (Guard condition):** **Tuyệt đối không dùng Yes/No**, phải dùng hành động cụ thể (`[Còn tồn kho]`, `[Món ăn hết hàng]`, `[Đã đăng nhập thành viên]`, `[Khách vãng lai]`, `[Thanh toán thành công]`, `[Thanh toán thất bại]`).
    * Có sử dụng **Fork** (tách luồng song song) và **Join** (đồng bộ luồng).
    * Xử lý đủ 3 trường hợp ngoại lệ: Hết hàng, Chưa đăng nhập, Thanh toán thất bại.

- [ ] **Task 2.2: Sơ đồ Tuần tự (Sequence Diagram)**
  * **File dự kiến:** `docs/diagrams/sequence/sequence-checkout.puml` & `docs/diagrams/sequence/sequence-checkout.svg` (kèm `.mmd`)
  * **Tiêu chí bắt buộc:**
    * Đặc tả chi tiết cho Use Case trọng tâm ở Task 1.3 (Đặt & Thanh toán đơn hàng).
    * 5 Lifeline tối thiểu: `Customer -> Next.js UI -> NestJS API -> Database -> Payment Service`.
    * Thứ tự gọi API và cấu trúc request/response chuẩn REST.
    * Kiểm tra JWT Token và validate dữ liệu DTO bằng `ValidationPipe`.
    * Mở Database Transaction khi tạo đơn hàng (`PENDING`) và cập nhật kiểm tra tồn kho.
    * Xử lý cơ chế lũy thừa `Idempotency-Key` khi client gửi lặp lại yêu cầu thanh toán.
    * Nhánh rẽ `alt` cho 2 kịch bản: Thanh toán thành công (`PAID`, trừ stock, tích điểm) và Thất bại (`PAYMENT_FAILED`, giữ giỏ hàng).
    * Thông báo kết quả cuối cùng cho người dùng.

- [ ] **Task 2.3: Sơ đồ Lớp (Class Diagram mức Domain)**
  * **File dự kiến:** `docs/diagrams/class/class-domain.puml` & `docs/diagrams/class/class-domain.svg` (kèm `.mmd`)
  * **Tiêu chí bắt buộc:**
    * Xây dựng ở mức Domain dựa trên các thực thể tham gia trong Sequence Diagram.
    * Tối thiểu 7 lớp cốt lõi: `User`, `Product`, `Order`, `OrderItem`, `Payment`, `Promotion`, `LoyaltyTransaction`.
    * Mỗi lớp mô tả đủ 3 thành phần: **Tên class**, **Tên thuộc tính (Attributes + Kiểu dữ liệu)**, **Tên phương thức (Methods + Kiểu trả về/Tham số)**.
    * Thể hiện mối quan hệ chính xác: Association, Composition, Generalization và Multiplicity (`1`, `0..*`, `1..*`).
    * Thể hiện các enum trạng thái: `Role`, `OrderStatus`, `PaymentStatus`.

---

### ⏳ TASK 3: THIẾT KẾ KIẾN TRÚC HỆ THỐNG (0.0 / 2.0 Điểm)

- [ ] **Task 3.1: Phương pháp và Quyết định kiến trúc (Architecture & ADRs)**
  * **File dự kiến:** `docs/architecture/architecture-description.md` và thư mục `docs/architecture/adr/`
  * **Tiêu chí bắt buộc:**
    * Trình bày kiến trúc theo mô hình C4 (System Context, Container, Component) hoặc Kiến trúc phân lớp:
      * Frontend Next.js App Router (Server Components + Client Components, PWA).
      * Backend NestJS theo Module/Domain (`ProductsModule`, `OrdersModule`, `PaymentsModule`, `AuthModule`).
      * PostgreSQL + Prisma ORM + cơ chế Migration.
      * Mock Payment Service.
      * Logging, Health Check endpoint (`GET /health`) và Quản lý biến môi trường (`ConfigService`).
      * Lý do chọn kiến trúc, ưu điểm, hạn chế và trade-offs.
    * 5 Bản ghi quyết định kiến trúc quan trọng (ADR):
      * `docs/architecture/adr/001-monorepo-structure.md`: Kiến trúc Monorepo frontend/backend.
      * `docs/architecture/adr/002-order-state-machine.md`: Cỗ máy trạng thái đơn hàng.
      * `docs/architecture/adr/003-optimistic-locking-concurrency.md`: Kiểm soát bán hàng đồng thời bằng version.
      * `docs/architecture/adr/004-idempotency-key-payment.md`: Thiết kế chống trừ tiền trùng lặp.
      * `docs/architecture/adr/005-cloud-deployment-strategy.md`: Quyết định nền tảng triển khai Cloud.

- [ ] **Task 3.2: Sơ đồ Triển khai (Deployment Diagram)**
  * **File dự kiến:** `docs/deployment.md`, `docs/diagrams/deployment/deployment-diagram.puml` & `.png`
  * **Tiêu chí bắt buộc:**
    * Sơ đồ UML Deployment Diagram cho môi trường Production thực tế.
    * Thể hiện: Thiết bị người dùng (Browser/PWA), Dịch vụ CDN phục vụ Next.js, Container chạy NestJS API, PostgreSQL có persistent storage, Container Registry.
    * Giao thức HTTPS, kết nối nội bộ, cổng mạng, secrets/environment variables, health check và logging.
    * Phân định rõ 3 ranh giới: **Local Development** (Docker Compose) $\rightarrow$ **CI Environment** (GitHub Actions) $\rightarrow$ **Production Environment** (Cloud).

---

### ⏳ TASK 4: TRIỂN KHAI SPRINT 1 (0.0 / 2.0 Điểm)

> **Sprint Goal:** Tạo nền tảng kỹ thuật, tài liệu có kiểm soát phiên bản và một MVP đầu tiên chạy được cho luồng xem menu.

- [ ] **Task 4.1: Chuẩn hóa Repository & Quy trình Agile**
  * Cấu trúc thư mục Monorepo chuẩn (`frontend/`, `backend/`, `docs/`, `tests/`).
  * Chiến lược phân nhánh Git: `main` (Release), `develop` (Integration), `feature/*`.
  * `README.md` cập nhật theo Assignment 2, `.gitignore` chặt chẽ, `.env.example`.
  * Issue Board / Product Backlog theo dõi Sprint 1 và Sprint 2 trên GitHub Project.
  * Quy ước commit (Conventional Commits) và Definition of Done (DoD).
- [ ] **Task 4.2: Quản lý Tài liệu**
  * Đưa toàn bộ tạo phẩm Task 1–3 vào thư mục `docs/`.
  * Mọi thay đổi yêu cầu, sơ đồ phải đi qua Git commit/pull request và ghi rõ lý do.
- [ ] **Task 4.3: Hiện thực MVP Sprint 1 (Menu Browse Flow)**
  * Backend API: `GET /products` (lọc theo danh mục), `GET /products/:id`, `GET /products/categories`.
  * Frontend Web: Màn hình Menu Next.js Mobile-first, hiển thị Tabs danh mục, lưới sản phẩm sắc nét, giá VND (`35.000đ`).
  * Đầy đủ 3 trạng thái UX: Skeleton Loading, Empty State, Error State kèm nút Retry tự động.
  * Dữ liệu mẫu seed vào CSDL phong phú và chân thực.
  * Kiểm thử tối thiểu cho API sản phẩm và component menu.
- [ ] **Task 4.4: Thiết lập Continuous Integration (CI Pipeline)**
  * Tệp cấu hình: `.github/workflows/ci.yml`.
  * Chu trình tự động: `Install -> Lint -> Unit Test -> Build`.
  * Quality Gate: Pull Request không được merge nếu có bất kỳ bước nào thất bại.
  * Lưu trữ minh chứng: Link PR, ảnh/log chạy thành công và phát hiện lỗi.

---

### ⏳ TASK 5: TRIỂN KHAI SPRINT 2, CI/CD VÀ DELIVERY (0.0 / 2.0 Điểm)

> **Sprint Goal:** Hoàn thành luồng End-to-End, tự động hóa đóng gói và triển khai một phiên bản production có thể truy cập được.

- [ ] **Task 5.1: Hoàn thiện tính năng MVP End-to-End**
  * Chi tiết sản phẩm: Modal chọn Size (S/M/L) và Topping, cập nhật giá realtime.
  * Giỏ hàng: Client Store (Zustand), lưu `localStorage`, tăng giảm số lượng, tính tổng tiền.
  * Đăng ký, đăng nhập JWT: Băm mật khẩu `bcrypt`, cấp token, bảo vệ endpoint bằng `AuthGuard`.
  * Tạo đơn hàng: API `POST /orders`, validate DTO, tính lại giá trên server, tạo đơn `PENDING`.
  * Thanh toán trực tuyến giả lập: API `POST /payments`, chọn Ví/Thẻ, cập nhật `PAID` hoặc `PAYMENT_FAILED`.
  * Xác nhận & Lịch sử đơn: Màn hình nhận nước mã `#1042`, trang `GET /orders/me` tra cứu đơn cá nhân.
  * 4 nghiệp vụ lõi: **Order State Machine** (`assertTransition`), **Idempotent Payment**, **Optimistic Locking** tồn kho (`version`), **Loyalty Points**.
- [ ] **Task 5.2: Tích hợp và Bộ kiểm thử toàn diện**
  * Unit Tests cho toàn bộ nghiệp vụ quan trọng (State Machine, Idempotency, Concurrency, Loyalty).
  * Integration Tests cho API tạo đơn và thanh toán `POST /orders` & `POST /payments`.
  * Ít nhất 1 kịch bản End-to-End (E2E) Test trọn vẹn từ Menu đến Xác nhận đơn.
  * Database Migration & Seed có thể tái tạo CSDL chỉ bằng 1 câu lệnh.
  * Tệp `docker-compose.yml` khởi động đầy đủ cả 3 services (web, api, postgres) ở local.
  * Endpoint kiểm tra sức khỏe hệ thống: `GET /health`.
- [ ] **Task 5.3: Continuous Delivery/Deployment (CD Pipeline)**
  * Tệp cấu hình: `.github/workflows/cd.yml`.
  * Chu trình tự động: `Push/Tag -> Lint & Test -> Build -> Docker Image -> Push Registry -> Deploy -> Smoke Test`.
  * Đóng gói Docker Image đa tầng có tag Commit SHA / SemVer (`v1.0.0`).
  * Triển khai vào Production sử dụng GitHub Secrets an toàn.
  * Tự động chạy migration CSDL an toàn trước khi switch traffic.
  * Smoke Test tự động gọi `GET /health` sau khi deploy.
  * Kế hoạch rollback khi triển khai gặp sự cố.
- [ ] **Task 5.4: Triển khai Production & Hồ sơ bàn giao**
  * URL Frontend Production truy cập được qua HTTPS.
  * URL Backend API Production và Health Check (`/health`).
  * Database Production bảo mật (không public port trực tiếp).
  * Secrets được bảo vệ tuyệt đối (không lộ `.env`).
  * Release Tag `v1.0.0` và Release Notes chi tiết trên GitHub.
  * `README.md` hoàn chỉnh hướng dẫn cài đặt, test, build, deploy và rollback.
  * Video demo trực tiếp luồng End-to-End.
  * Biên bản **Sprint Review** và **Sprint Retrospective** sau 2 Sprint.

---

### 🔗 MỤC 8: MA TRẬN TRUY VẾT BẮT BUỘC (TRACEABILITY MATRIX)

* **Tệp bắt buộc:** [`docs/traceability-matrix.md`](docs/traceability-matrix.md)
* Liên kết 5 cột: `Mã yêu cầu (FR-xx)` $\iff$ `Use-case / User Story` $\iff$ `Thiết kế / Sơ đồ` $\iff$ `Code / API` $\iff$ `Mã Kiểm thử (Test ID)`.

---

## 🧹 BẢNG RÀ SOÁT TỒN DƯ TỪ ASSIGNMENT 1 & KẾT QUẢ XỬ LÝ
 
| Thành phần tồn dư từ Assignment 1 | Vấn đề / Khác biệt với Assignment 2 | Kết quả xử lý đã thực hiện |
| :--- | :--- | :--- |
| **Mô hình "10 Tasks - 3 Sprints" trong README.md** | Assignment 2 quy định chặt chẽ **5 Task lớn (mỗi task 2 điểm)** và **2 Sprints**. Việc để bảng 10 task cũ gây sai lệch với cấu trúc chấm điểm. | Đã cập nhật lại `README.md` bám sát 5 Task lớn; chuyển 10 task cũ thành các Backlog Items thuộc Sprint 1 và Sprint 2. |
| **Tài liệu cũ: `docs/DAC_TA_YEU_CAU_PHAN_MEM.md`** | Là tài liệu SRS kiểu cũ dạng nguyên khối (monolith), chứa các phần mô tả 10 task và User Stories văn bản dài dòng. | **Đã xóa bỏ hoàn toàn khỏi repository**; toàn bộ hồ sơ nghiệm thu chính thức của Task 1 đã chuẩn hóa tại `docs/requirements/`. |
| **Tài liệu cũ: `docs/TAI_LIEU_TRINH_BAY_SAN_PHAM.md`** | Chứa danh sách User Story văn bản và bảng Product Backlog 3 Sprint cũ. | **Đã xóa bỏ hoàn toàn khỏi repository** để tránh sai lệch cấu trúc 2 Sprint của Assignment 2. |
| **Tài liệu cũ: `docs/SO_DO_USE_CASE.md`** | Chứa 6 bảng đặc tả 7 ô cho 6 Use Case khác nhau, gây phân tán phạm vi. | **Đã xóa bỏ hoàn toàn khỏi repository**; tập trung duy nhất vào Use Case trọng tâm tại [`docs/requirements/core-use-case-specification.md`](docs/requirements/core-use-case-specification.md). |
| **Tài liệu trùng lặp: `docs/YEU_CAU_ASSIGNMENT_2.md`** | Trùng lặp chức năng sau khi đã tạo tệp nguyên văn [docs/DE_BAI_ASSIGNMENT_2_GOC.md](docs/DE_BAI_ASSIGNMENT_2_GOC.md). | **Đã xóa bỏ hoàn toàn khỏi repository**; xác lập `docs/DE_BAI_ASSIGNMENT_2_GOC.md` là Single Source of Truth. |
| **Cấu trúc thư mục thiếu các folder bắt buộc** | Chưa có `docs/architecture/adr/`, `docs/diagrams/sequence/`, `docs/diagrams/class/`, `docs/diagrams/deployment/`, `.github/workflows/`, `tests/`. | Khởi tạo đầy đủ cấu trúc khung thư mục theo đúng Mục 9 của Assignment 2. |
| **Sơ đồ PlantUML cũ của Use Case** | Từng có file `use-case-system.puml` và `use-case-checkout.puml` gây phân mảnh với mã Mermaid. | Đã dọn dẹp sạch sẽ, chuẩn hóa 100% Use Case sang mã Mermaid và ảnh Draw.io theo yêu cầu của bạn. |
