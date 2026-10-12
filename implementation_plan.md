# Kế hoạch Triển khai Dự án BrewLite (Assignment 2)
## Requirements to Deployment (VER 1.0) — Tổng điểm: 10 Điểm

Dự án **BrewLite** (Hệ thống đặt đồ uống không dùng tiền mặt) được phát triển theo chuỗi quy trình chuẩn Công nghệ Phần mềm từ Khai thác yêu cầu, Mô hình hóa, Thiết kế kiến trúc đến Hiện thực hóa qua 2 Sprint, CI/CD và Triển khai Production.

> [!IMPORTANT]
> **Quy tắc thực hiện & Bàn giao dự án (Theo quy định & AGENTS.md):**
> 1. **Quy tắc thực hiện tuần tự:** 5 Task lớn phải được hoàn thành đúng thứ tự. Task sau chỉ được nghiệm thu khi các tạo phẩm của task trước đã có đầy đủ trên kho mã nguồn với lịch sử commit rõ ràng.
> 2. **Làm xong phần nào push phần đó lên ngay lập tức:** Hoàn thành bất kỳ task/module nào, kiểm tra chạy tốt, tạo commit chuẩn Conventional Commits và thực thi `git push origin <branch>` ngay lập tức.
> 3. **Tuyệt đối không comment trong code:** Code tự tường minh (Self-documenting), không có chú thích trong mã nguồn (`.ts`, `.tsx`, `.js`, `.css`), không để lại code thừa bị comment.
> 4. **Các lưu ý cập nhật từ Giảng viên & notes:**
>    - Yêu cầu chức năng: viết theo định dạng **User Story** chuẩn (`As a... I want to... So that...`).
>    - Sơ đồ Use Case: Đặc tả 1 use case cốt lõi duy nhất (**Đặt và thanh toán đơn hàng**) theo **bảng chuẩn CNPM 7 ô** (Use Case Name, Actor, Description, Pre-condition, Normal Flow, Exception, Alternative Flow).
>    - Sơ đồ Activity: Điều kiện trên nhánh rẽ **không dùng Yes/No**, phải ghi **hành động/trạng thái cụ thể**; thể hiện đầy đủ quan hệ, **Fork**, **Join**, và các nhánh xử lý hết hàng, chưa đăng nhập, thanh toán thất bại.
>    - Sơ đồ Sequence: Thể hiện đầy đủ các Lifeline (`Customer -> Next.js UI -> NestJS API -> Database -> Payment Service`), JWT validation, transaction tạo đơn & cập nhật tồn kho, Idempotency-Key, rẽ nhánh Alt thành công/thất bại.
>    - Sơ đồ Class: Dựa vào Sequence Diagram, ở mức Domain với tối thiểu 7 lớp (`User`, `Product`, `Order`, `OrderItem`, `Payment`, `Promotion`, `LoyaltyTransaction`), mô tả chi tiết: **Tên class**, **Tên thuộc tính**, **Tên phương thức**, quan hệ và enum trạng thái.
>    - Kiến trúc & Triển khai: Khuyến khích nền tảng **AWS** hoặc **Azure** (hoặc PaaS thực tế có HTTPS). Sơ đồ Deployment phản ánh đúng hạ tầng thực tế.
>    - Ma trận truy vết bắt buộc (`docs/traceability-matrix.md`): Liên kết xuyên suốt Yêu cầu <-> Sơ đồ <-> API/Code <-> Test Case.

---

## Bảng Tổng Hợp 5 Task & Phân Bổ Điểm Số

| Task | Giai đoạn thực hiện | Tạo phẩm chính bắt buộc | Điểm | Trạng thái |
| :---: | :--- | :--- | :---: | :---: |
| **Task 1** | Khai thác và đặc tả yêu cầu | Stakeholder, Phạm vi, SRS với User Stories, Use Case tổng quát, Đặc tả Use Case cốt lõi bảng 7 ô | **2.0** | 🟡 Đang hoàn thiện tạo phẩm |
| **Task 2** | Mô hình hóa hệ thống | Activity Diagram (Fork/Join, No Yes/No), Sequence Diagram, Class Diagram mức Domain | **2.0** | 🟡 Đang hoàn thiện tạo phẩm |
| **Task 3** | Thiết kế kiến trúc | Mô tả kiến trúc C4/Phân lớp, các bản ghi ADR, UML Deployment Diagram (AWS/Azure) | **2.0** | ⏳ Chờ Task 2 nghiệm thu |
| **Task 4** | Triển khai Sprint 1 | Chuẩn hóa cấu trúc repo, quản lý tài liệu `docs/`, MVP Menu chạy được, CI Pipeline | **2.0** | ⏳ Chờ Task 3 nghiệm thu |
| **Task 5** | Triển khai Sprint 2, CI/CD & Delivery | MVP hoàn chỉnh end-to-end, Unit/Integration/E2E Test, CD Pipeline, Triển khai Production & Bàn giao | **2.0** | ⏳ Chờ Task 4 nghiệm thu |
| **TỔNG** | **Toàn bộ Assignment 2** | **Bộ hồ sơ tài liệu, mã nguồn, pipeline CI/CD và sản phẩm chạy thực tế** | **10.0** | |

---

## Chi Tiết Kế Hoạch Từng Task

### 📝 Task 1: Khai thác và đặc tả yêu cầu (2.0 Điểm)

- [ ] **Task 1.1: Bối cảnh, Stakeholder và Phạm vi**
  - **Tạo phẩm:** `docs/requirements/context-and-scope.md`
  - **Nội dung:**
    - Vấn đề nghiệp vụ cần giải quyết (giảm thời gian xếp hàng giờ cao điểm, loại bỏ sai sót gọi món bằng miệng, thanh toán không dùng tiền mặt).
    - Phân tích 6 nhóm stakeholder chính: Khách hàng (Customer), Nhân viên quầy (Barista/Staff), Quản lý cửa hàng (Store Manager), Giảng viên nghiệm thu, Nhóm phát triển (Dev Team), Đơn vị cổng thanh toán (Payment Provider).
    - Mục tiêu & kỳ vọng của từng stakeholder.
    - Phân định rõ ràng: Phạm vi trong MVP (In-Scope), Phạm vi mở rộng tương lai (Future Scope), Các nội dung không thực hiện (Out-of-Scope).
    - Bảng giả định, ràng buộc kỹ thuật/nghiệp vụ và rủi ro ban đầu kèm giải pháp giảm thiểu.
  - *Hành động Git:* Commit `docs(req): add context and scope specification with stakeholder matrix` & `git push`.

- [ ] **Task 1.2: Yêu cầu chức năng (User Stories) & Phi chức năng (SRS rút gọn)**
  - **Tạo phẩm:** `docs/requirements/srs-user-stories.md`
  - **Nội dung:**
    - Yêu cầu chức năng: Viết theo định dạng **User Stories** chuẩn (`As a <role>, I want <action>, So that <benefit>`) có mã định danh `FR-01` đến `FR-12`.
    - Phân nhóm yêu cầu chức năng tối thiểu: Menu, Chi tiết sản phẩm & tùy biến, Giỏ hàng, Xác thực JWT, Đặt đơn hàng, Thanh toán không tiền mặt, Quản lý trạng thái đơn hàng, Lịch sử đơn hàng, Khuyến mãi & Tích điểm.
    - Yêu cầu phi chức năng có mã `NFR-01` đến `NFR-08`: Hiệu năng (Response time < 500ms, PWA load < 2s), Bảo mật (Bcrypt hash, JWT token, Idempotency header), Tính khả dụng (Mobile-first, responsive, zero comment trong code), Khả năng triển khai (Dockerized, CI/CD tự động).
    - Phân loại mức độ ưu tiên theo chuẩn MoSCoW (Must have, Should have, Could have, Won't have).
    - Bộ tiêu chí chấp nhận (Acceptance Criteria - AC) có thể kiểm chứng được theo cú pháp `Given - When - Then`.
    - Sơ đồ Use Case tổng quát toàn hệ thống (Mermaid / PlantUML).
  - *Hành động Git:* Commit `docs(req): add simplified SRS with user stories, NFRs and MoSCoW prioritization` & `git push`.

- [ ] **Task 1.3: Đặc tả Use Case trọng tâm (Đặt và thanh toán đơn hàng)**
  - **Tạo phẩm:** `docs/requirements/core-use-case-spec.md`
  - **Nội dung:**
    - Chọn Use Case cốt lõi: **UC-CHECKOUT: Đặt và thanh toán đơn hàng trực tuyến**.
    - Sơ đồ Use Case chi tiết cho phạm vi Use Case này.
    - Bảng đặc tả chuẩn 7 ô theo quy chuẩn Công nghệ Phần mềm:
      1. *Use Case Name:* Đặt và thanh toán đơn hàng (Order Checkout & Payment)
      2. *Actor:* Khách hàng (Customer), Cổng thanh toán (Payment Gateway)
      3. *Description:* Quy trình khách hàng xác nhận giỏ hàng, nhập thông tin nhận đồ uống, chọn phương thức thanh toán không tiền mặt và hoàn tất giao dịch.
      4. *Pre-condition:* Khách hàng đã chọn ít nhất 1 món vào giỏ hàng (`items.length > 0`).
      5. *Normal Flow:* Các bước tuần tự từ kiểm tra giỏ hàng -> nhập thông tin -> gửi yêu cầu thanh toán -> cổng thanh toán xử lý -> trừ tồn kho -> chuyển trạng thái đơn sang `PAID` -> xuất hóa đơn & mã đơn điện tử.
      6. *Alternative Flow:* Khách hàng áp dụng mã voucher giảm giá; Khách hàng đã đăng nhập tài khoản thành viên tích điểm; Khách hàng thay đổi phương thức thanh toán.
      7. *Exception:* Món ăn bị hết hàng giữa lúc checkout (Optimistic Locking conflict); Thanh toán thất bại hoặc người dùng hủy; Mất kết nối cổng thanh toán (Timeout); Gửi lặp request thanh toán (Idempotency duplicate).
    - Liên kết chéo Use Case với các mã định danh `FR-xx` tương ứng.
  - *Hành động Git:* Commit `docs(req): add 7-field standard core checkout and payment use case specification` & `git push`.

---

### 🎨 Task 2: Mô hình hóa hệ thống (2.0 Điểm)

- [ ] **Task 2.1: Sơ đồ Hoạt động (Activity Diagram)**
  - **Tạo phẩm:** `docs/diagrams/activity-flow.puml` và ảnh xuất `docs/diagrams/activity-flow.svg`
  - **Nội dung:**
    - Thể hiện trọn vẹn luồng End-to-End: Duyệt Menu -> Tùy biến món -> Giỏ hàng -> Đặt đơn -> Thanh toán -> Nhận đồ uống.
    - Điểm bắt đầu (Initial node) và điểm kết thúc (Activity final node).
    - Phân chia **Swimlane** rõ ràng giữa 4 đối tượng: Khách hàng (Customer), Giao diện Web (Next.js UI), Backend API (NestJS), Cổng thanh toán (Payment Gateway).
    - **Điều kiện rẽ nhánh (Decision / Merge):** Tuyệt đối **không dùng Yes/No**, sử dụng hành động và điều kiện nghiệp vụ cụ thể (ví dụ: `[Thông tin giỏ hàng hợp lệ & còn tồn kho]`, `[Món ăn hết hàng]`, `[Đã đăng nhập thành viên]`, `[Chưa đăng nhập - Tiếp tục dạng khách]`, `[Thanh toán thành công]`, `[Thanh toán thất bại / Hủy giao dịch]`).
    - Thể hiện quan hệ song song bằng **Fork** (ví dụ: song song kiểm tra tính hợp lệ của đơn hàng và kiểm tra tính hợp lệ của thông tin thanh toán / tồn kho) và **Join** (đồng bộ kết quả trước khi tiến hành trừ tiền).
    - Xử lý đầy đủ 3 trường hợp ngoại lệ bắt buộc: **Hết hàng**, **Chưa đăng nhập**, **Thanh toán thất bại**.
  - *Hành động Git:* Commit `docs(diagrams): add end-to-end activity diagram with swimlanes, fork-join and explicit guards` & `git push`.

- [ ] **Task 2.2: Sơ đồ Tuần tự (Sequence Diagram)**
  - **Tạo phẩm:** `docs/diagrams/sequence-checkout.puml` và ảnh xuất `docs/diagrams/sequence-checkout.svg`
  - **Nội dung:**
    - Đặc tả cho Use Case trọng tâm ở Task 1.3.
    - 5 Lifeline tối thiểu theo đúng yêu cầu đề bài:
      `Customer -> Next.js UI -> NestJS API -> Database -> Payment Service`
    - Thể hiện request/response và thứ tự gọi API tuần tự chuẩn REST.
    - Kiểm tra JWT Token và validate dữ liệu DTO bằng `class-validator`.
    - Khởi tạo Database Transaction khi tạo đơn hàng (`PENDING`) và cập nhật kiểm tra tồn kho.
    - Xử lý cơ chế lũy thừa `Idempotency-Key` khi client gửi lại request thanh toán.
    - Nhánh rẽ `alt` cho 2 kịch bản: Thanh toán thành công (chuyển đơn sang `PAID`, trừ stock, tích điểm) và Thanh toán thất bại (chuyển `PAYMENT_FAILED`, giữ giỏ hàng).
    - Thông báo kết quả cuối cùng hiển thị trên giao diện người dùng.
  - *Hành động Git:* Commit `docs(diagrams): add core checkout sequence diagram with transaction, idempotency and alt fragments` & `git push`.

- [ ] **Task 2.3: Sơ đồ Lớp (Class Diagram mức Domain)**
  - **Tạo phẩm:** `docs/diagrams/class-domain.puml` và ảnh xuất `docs/diagrams/class-domain.svg` kèm mô tả chi tiết trong `docs/diagrams/class-description.md`
  - **Nội dung:**
    - Xây dựng dựa trên các đối tượng tham gia trong Sequence Diagram.
    - Tối thiểu 7 lớp cốt lõi: `User`, `Product`, `Order`, `OrderItem`, `Payment`, `Promotion`, `LoyaltyTransaction`.
    - Mỗi lớp được mô tả đầy đủ 3 phần:
      1. **Tên Class (Class Name)**
      2. **Tên Thuộc tính (Attributes):** kiểu dữ liệu, phạm vi truy cập (`-`, `+`, `#`).
      3. **Tên Phương thức (Methods / Operations):** kiểu trả về, tham số.
    - Thể hiện chính xác các mối quan hệ (Association, Aggregation, Composition, Generalization/Inheritance) và chỉ số số lượng (Multiplicity: `1`, `0..*`, `1..*`).
    - Thể hiện các Enum trạng thái: `OrderStatus` (`PENDING`, `PAID`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`, `PAYMENT_FAILED`), `PaymentMethod`, `PaymentStatus`, `Role`.
    - Đảm bảo nhất quán 100% với Schema Prisma và SRS.
  - *Hành động Git:* Commit `docs(diagrams): add domain class diagram with detailed attributes, methods and relationships` & `git push`.

---

### 🏗️ Task 3: Thiết kế kiến trúc hệ thống (2.0 Điểm)

- [ ] **Task 3.1: Phương pháp và Quyết định kiến trúc (Architecture & ADRs)**
  - **Tạo phẩm:** `docs/architecture/architecture-description.md` và thư mục `docs/architecture/adr/`
  - **Nội dung:**
    - Trình bày kiến trúc theo mô hình C4 (System Context, Container, Component) hoặc Kiến trúc phân lớp (Layered Architecture):
      - Frontend: Next.js App Router (Client Components, Server Components, PWA).
      - Backend: NestJS Modular Architecture (Controllers, Services, Repositories, DTOs, Guards, Interceptors).
      - Database: PostgreSQL với cơ chế Migration của Prisma ORM.
      - Mock Payment Service: Giả lập cổng thanh toán không tiền mặt.
      - Logging, Health Check endpoint (`GET /health`) và Quản lý cấu hình biến môi trường (`ConfigService`).
      - Phân tích lý do lựa chọn kiến trúc, ưu điểm, hạn chế và trade-offs.
    - Xây dựng 5 bản ghi quyết định kiến trúc quan trọng (ADR):
      - `docs/architecture/adr/001-monorepo-structure.md`: Lý do chọn cấu trúc Monorepo chia tách frontend/backend.
      - `docs/architecture/adr/002-order-state-machine.md`: Thiết kế Finite State Machine kiểm soát vòng đời đơn hàng.
      - `docs/architecture/adr/003-optimistic-locking-concurrency.md`: Kiểm soát bán hàng đồng thời bằng trường version.
      - `docs/architecture/adr/004-idempotency-key-payment.md`: Thiết kế chống trùng lặp giao dịch thanh toán.
      - `docs/architecture/adr/005-cloud-deployment-strategy.md`: Lựa chọn nền tảng Cloud (AWS / Azure / Vercel + Neon).
  - *Hành động Git:* Commit `docs(arch): add architecture overview and architectural decision records` & `git push`.

- [ ] **Task 3.2: Sơ đồ Triển khai (Deployment Diagram)**
  - **Tạo phẩm:** `docs/deployment.md`, `docs/diagrams/deployment-diagram.puml` và ảnh xuất `.svg`
  - **Nội dung:**
    - Sơ đồ UML Deployment Diagram cho môi trường Production thực tế (khuyến khích kiến trúc AWS hoặc Azure):
      - User Client Device: Web Browser / Mobile PWA.
      - CDN & Web Hosting: Vercel / AWS CloudFront + S3 (phục vụ Next.js SSR/PWA).
      - Container / API Service: Docker Container chạy NestJS API trên Render / Railway / AWS ECS / Azure Container Apps (kết nối cổng 443 HTTPS).
      - Database: PostgreSQL Managed Database có Persistent Storage (Neon Serverless PostgreSQL / AWS RDS / Azure Database for PostgreSQL).
      - Container Registry (Docker Hub / AWS ECR / GitHub Packages) và CI/CD Automation runner.
      - Ranh giới bảo mật (Network boundary, HTTPS/TLS termination, Internal connection string, Secret Manager / Environment Variables).
      - Phân định rõ ràng 3 môi trường: **Local Development** (Docker Compose) $\rightarrow$ **CI Environment** (GitHub Actions) $\rightarrow$ **Production Environment** (Cloud).
  - *Hành động Git:* Commit `docs(deploy): add production deployment diagram and cloud infrastructure specification` & `git push`.

---

### 💻 Task 4: Triển khai Sprint 1 (2.0 Điểm)

*Sprint Goal: Tạo nền tảng kỹ thuật, tài liệu có kiểm soát phiên bản và một MVP đầu tiên chạy được cho luồng xem menu.*

- [ ] **Task 4.1: Chuẩn hóa cấu trúc Repository & Quy trình Agile**
  - **Nội dung:**
    - Rà soát cấu trúc thư mục chuẩn: `apps/web` (hoặc `frontend/`), `apps/api` (hoặc `backend/`), `docs/`, `tests/`, `.github/workflows/`, `docker-compose.yml`, `.env.example`, `README.md`.
    - Chiến lược phân nhánh Git: `main` (Production release), `develop` (Sprint integration), `feature/*` (Từng tính năng/task).
    - Thiết lập bảng theo dõi Product Backlog / Sprint Backlog cho Sprint 1 và Sprint 2.
    - Thiết lập quy ước Commit (Conventional Commits) và Định nghĩa hoàn thành (Definition of Done - DoD).
  - *Hành động Git:* Commit `chore: standardize repository structure, agile guidelines and definition of done` & `git push`.

- [ ] **Task 4.2: Đồng bộ & Quản lý Tài liệu**
  - **Nội dung:**
    - Đưa toàn bộ các tạo phẩm đã hoàn thành ở Task 1, Task 2 và Task 3 vào đúng cấu trúc thư mục `docs/`.
    - Thiết lập file ma trận truy vết ban đầu: `docs/traceability-matrix.md` kết nối các yêu cầu Sprint 1 với API và màn hình.
  - *Hành động Git:* Commit `docs: synchronize all requirements, diagrams and traceability matrix into docs folder` & `git push`.

- [ ] **Task 4.3: Hiện thực MVP Sprint 1 (Menu Browse Flow)**
  - **Nội dung:**
    - Backend: Endpoint `GET /products` (hỗ trợ lọc theo category), `GET /products/:id`, `GET /products/categories`.
    - Database: Seed dữ liệu mẫu phong phú (cà phê, trà, đá xay, bánh, sizes, toppings).
    - Frontend: Trang Menu chuẩn mobile-first/PWA bằng Next.js, hiển thị danh mục dạng Tabs, danh sách sản phẩm card sắc nét, định dạng tiền VND.
    - Xử lý đầy đủ 3 trạng thái UX: Đang tải (Skeleton Loading), Trống (Empty State) và Báo lỗi khi mất kết nối (Error State kèm nút Retry tự động).
    - Unit tests & Component tests cho API sản phẩm và Menu list.
  - *Hành động Git:* Commit `feat: complete Sprint 1 MVP menu browse flow with backend APIs and tests` & `git push`.

- [ ] **Task 4.4: Thiết lập Continuous Integration (CI Pipeline)**
  - **Tạo phẩm:** `.github/workflows/ci.yml`
  - **Nội dung:**
    - Pipeline CI tự động kích hoạt khi có Pull Request hoặc Push vào `main`/`develop`.
    - Quy trình 4 bước bắt buộc: `Install Dependencies -> Lint Code -> Run Unit Tests -> Build Frontend & Backend`.
    - Cấu hình bắt buộc: Pull Request không được merge nếu lint, test hoặc build thất bại (Quality Gate).
    - Chạy thử nghiệm và lưu minh chứng (log chạy thành công và log phát hiện lỗi có chủ đích).
  - *Hành động Git:* Commit `ci: setup automated GitHub Actions CI workflow with quality gates` & `git push`.

---

### 🚀 Task 5: Triển khai Sprint 2, CI/CD và Delivery (2.0 Điểm)

*Sprint Goal: Hoàn thành luồng end-to-end, tự động hóa đóng gói và triển khai một phiên bản production có thể truy cập được.*

- [ ] **Task 5.1: Hoàn thiện tính năng MVP End-to-End**
  - **Nội dung:**
    - Chi tiết sản phẩm: Modal chọn Size (S/M/L) và Topping, cập nhật giá realtime.
    - Giỏ hàng: Quản lý giỏ hàng phía Client bằng Zustand, tính tổng tiền tự động, lưu LocalStorage.
    - Xác thực người dùng: Module Auth (`POST /auth/register`, `POST /auth/login`), mã hóa bcrypt, cấp phát JWT, Auth Guard.
    - Đặt đơn hàng: API `POST /orders`, validate DTO bằng `class-validator`, tạo đơn `PENDING`.
    - Thanh toán trực tuyến: Mock Payment Gateway, API `POST /payments`, cập nhật `PAID` hoặc `PAYMENT_FAILED`.
    - Xác nhận và lịch sử đơn hàng: Màn hình Order Success hiển thị mã nhận nước, trang `GET /orders/me` tra cứu đơn cá nhân.
    - Nghiệp vụ chuyên sâu: Order State Machine (`assertTransition`), Idempotent Payment header, Optimistic Locking tồn kho (`version`), Tích điểm thưởng Loyalty.
  - *Hành động Git:* Commit `feat: complete Sprint 2 MVP end-to-end checkout, payment and advanced business logic` & `git push`.

- [ ] **Task 5.2: Tích hợp và Bộ kiểm thử toàn diện**
  - **Nội dung:**
    - Unit Tests cho toàn bộ nghiệp vụ quan trọng: State Machine, Idempotency, Concurrency Control, Loyalty.
    - Integration Tests cho luồng tạo đơn và thanh toán `POST /orders` & `POST /payments`.
    - End-to-End (E2E) Test: Luồng hoàn chỉnh từ duyệt Menu -> chọn món/size/topping -> giỏ hàng -> đặt đơn -> thanh toán thành công -> hiển thị mã đơn.
    - Cơ chế Migration/Seed có thể tái tạo CSDL chỉ bằng 1 câu lệnh.
    - `docker-compose.yml` hoàn chỉnh khởi động đồng thời cả 3 dịch vụ: Frontend (Next.js), Backend (NestJS), Database (PostgreSQL).
    - Endpoint kiểm tra sức khỏe hệ thống: `GET /health` trả về trạng thái API và kết nối CSDL.
  - *Hành động Git:* Commit `test: add comprehensive unit, integration and e2e test suite with local docker-compose` & `git push`.

- [ ] **Task 5.3: Continuous Delivery/Deployment (CD Pipeline)**
  - **Tạo phẩm:** `.github/workflows/cd.yml`
  - **Nội dung:**
    - Pipeline CD tự động hoàn chỉnh:
      `Push/Tag -> Lint & Test -> Build -> Docker Image -> Push Registry -> Deploy -> Smoke Test`
    - Đóng gói Docker Image đa tầng (Multi-stage build) tối ưu dung lượng, gắn tag bằng Commit SHA hoặc Semantic Version (`v1.0.0`).
    - Triển khai an toàn vào môi trường Production sử dụng GitHub Secrets.
    - Tự động chạy migration database an toàn trước khi switch traffic.
    - Smoke Test kiểm tra tự động endpoint `GET /health` ngay sau khi deploy.
    - Kịch bản và hướng dẫn Rollback khi deploy gặp sự cố.
  - *Hành động Git:* Commit `ci: add automated CD pipeline with docker image build, cloud deploy and smoke test` & `git push`.

- [ ] **Task 5.4: Triển khai Production & Hồ sơ bàn giao**
  - **Nội dung:**
    - Triển khai hệ thống lên môi trường Cloud thực tế (URL Frontend truy cập được qua HTTPS, URL Backend API & Health Check hoạt động).
    - Đảm bảo cơ sở dữ liệu Production bảo mật, không mở port public trực tiếp ra Internet.
    - Quản lý Secret tuyệt đối: không commit file `.env` hoặc để lộ token trong log CI.
    - Tạo Release Tag `v1.0.0` trên GitHub kèm Release Notes chi tiết.
    - `README.md` hướng dẫn toàn diện: Cài đặt local, chạy test, build, deploy, rollback và danh sách URL production.
    - Kịch bản và Video Demo trực tiếp luồng End-to-End.
    - Tài liệu Sprint Review & Sprint Retrospective đúc kết kinh nghiệm qua 2 Sprint.
  - *Hành động Git:* Commit `docs: finalize deployment handover, release notes v1.0.0 and sprint retrospective` & `git push`.

---

### 🔗 Ma Trận Truy Vết Bắt Buộc (Traceability Matrix)

Tệp bắt buộc: `docs/traceability-matrix.md` liên kết chặt chẽ từng thành phần xuyên suốt dự án:

| Mã yêu cầu | Use Case / User Story | Thiết kế / Sơ đồ tương ứng | Hiện thực Code / API | Mã Kiểm thử (Test ID) |
| :---: | :--- | :--- | :--- | :---: |
| **FR-01** | US-01: Duyệt thực đơn & danh mục | Activity-01, Class-Product | `GET /products`, `GET /products/categories`, `MenuPage.tsx` | API-T01, UI-T01 |
| **FR-02** | US-02: Tùy biến Size & Topping | Activity-01, Class-OrderItem | `GET /products/:id`, `ProductDetailModal.tsx` | UI-T02 |
| **FR-03** | US-03: Quản lý giỏ hàng | Activity-01, Class-Order | `useCartStore.ts`, `CartDrawer.tsx` | UNIT-CART01 |
| **FR-04** | US-04: Đăng ký & Đăng nhập JWT | Sequence-01, Class-User | `POST /auth/login`, `POST /auth/register`, `JwtAuthGuard` | API-AUTH01 |
| **FR-05** | US-05: Khởi tạo đơn hàng | Sequence-01, Class-Order | `POST /orders`, `OrdersService.createOrder` | INT-ORD01 |
| **FR-06** | US-06: Thanh toán không tiền mặt | Sequence-01, Class-Payment | `POST /payments`, `PaymentsService.processPayment` | INT-PAY01 |
| **FR-07** | US-07: Vòng đời đơn (State Machine) | Sequence-01, Class-Order | `OrdersService.assertTransition` | UNIT-STATE01 |
| **FR-08** | US-08: Thanh toán Idempotent | Sequence-01, Class-Payment | `IdempotencyInterceptor`, `POST /payments` | UNIT-IDEMP01 |
| **FR-09** | US-09: Kiểm soát tồn kho đồng thời | Sequence-01, Class-Product | Prisma Optimistic Locking (version check) | UNIT-CONCUR01 |
| **FR-10** | US-10: Tích điểm thành viên | Sequence-01, Class-Loyalty | `LoyaltyService.awardPoints` | UNIT-LOYAL01 |
| **FR-11** | US-11: Theo dõi & Lịch sử đơn | Activity-01, Class-Order | `GET /orders/me`, `OrderSuccessPage.tsx` | E2E-FLOW01 |
| **NFR-01** | Tốc độ phản hồi API < 500ms | Deployment-01 | NestJS Fastify/Express + Neon connection pool | PERF-01 |
| **NFR-02** | Bảo mật HTTPS & An toàn bí mật | Deployment-01 | SSL/TLS, GitHub Secrets, không commit `.env` | SEC-01 |
| **NFR-03** | Kiểm tra sức khỏe tự động | Deployment-01 | `GET /health`, GitHub Actions Smoke Test | HEALTH-01 |

---

## Danh Mục Hồ Sơ & Checklist Nghiệm Thu Bàn Giao

- [ ] **1. Mã nguồn & Quyền truy cập:**
  - Repository GitHub chứa toàn bộ source code frontend, backend, test và docs.
  - Cung cấp quyền truy cập (Invite collaborator) cho Giảng viên hướng dẫn.
- [ ] **2. Tài liệu Yêu cầu (Task 1):**
  - `docs/requirements/context-and-scope.md` (Stakeholder, In-scope, Out-of-scope, Giả định, Ràng buộc).
  - `docs/requirements/srs-user-stories.md` (SRS rút gọn, User Stories, NFRs, MoSCoW, AC).
  - `docs/requirements/core-use-case-spec.md` (Sơ đồ và bảng chuẩn 7 ô cho Use Case Đặt và thanh toán).
- [ ] **3. Sơ đồ Mô hình hóa (Task 2):**
  - `docs/diagrams/activity-flow.puml` & `.svg` (Swimlane, Fork/Join, Guard cụ thể).
  - `docs/diagrams/sequence-checkout.puml` & `.svg` (5 lifeline, Transaction, Idempotency, Alt).
  - `docs/diagrams/class-domain.puml` & `.svg` + `docs/diagrams/class-description.md` (7 lớp domain, tên class/thuộc tính/phương thức).
- [ ] **4. Thiết kế Kiến trúc & Hạ tầng (Task 3):**
  - `docs/architecture/architecture-description.md` (Kiến trúc phân lớp, C4, trade-offs).
  - Thư mục `docs/architecture/adr/` (5 bản ghi quyết định kiến trúc).
  - `docs/deployment.md` & `docs/diagrams/deployment-diagram.puml` & `.svg` (Kiến trúc Cloud AWS/Azure).
- [ ] **5. Ma trận Truy vết:**
  - `docs/traceability-matrix.md` liên kết từ Yêu cầu -> Sơ đồ -> API/Code -> Test Case.
- [ ] **6. Mã nguồn & Kiểm thử (Task 4 & 5):**
  - Source code Frontend Next.js mobile-first/PWA (Zero comment).
  - Source code Backend NestJS modular architecture (Zero comment).
  - Prisma Schema & file seed dữ liệu mẫu phong phú.
  - Bộ Unit, Integration và E2E tests tự động.
  - `docker-compose.yml` chạy local đầy đủ 3 services.
  - Endpoint `GET /health` kiểm tra sức khỏe hệ thống.
- [ ] **7. Pipeline CI/CD tự động:**
  - `.github/workflows/ci.yml` (Lint -> Test -> Build trên PR).
  - `.github/workflows/cd.yml` (Docker Build -> Deploy Production -> Smoke Test).
  - Minh chứng pipeline chạy thành công và pipeline phát hiện lỗi.
- [ ] **8. Triển khai Production & Bàn giao:**
  - URL Frontend Production truy cập qua HTTPS.
  - URL Backend API Production và `GET /health`.
  - Database Production bảo mật (không public port).
  - Release Tag `v1.0.0` và Release Notes trên GitHub.
  - `README.md` hoàn chỉnh hướng dẫn cài đặt, test, build, deploy và rollback.
  - Video demo luồng End-to-End và tài liệu Sprint Review & Retrospective.
