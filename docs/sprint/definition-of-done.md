# 🏁 ĐỊNH NGHĨA HOÀN THÀNH (DEFINITION OF DONE - DoD)

> **Dự án:** BrewLite — Hệ thống đặt đồ uống không dùng tiền mặt  
> **Căn cứ đề bài:** Mục 6.1 (Task 4.1) trong tệp đặc tả gốc [`docs/DE_BAI_ASSIGNMENT_2_GOC.md`](../DE_BAI_ASSIGNMENT_2_GOC.md).  
> **Kho mã nguồn:** [https://github.com/nphat-code/swe-project](https://github.com/nphat-code/swe-project)

---

## 1. MỤC TIÊU & Ý NGHĨA

Định nghĩa hoàn thành (Definition of Done - DoD) là một thỏa thuận kỹ thuật minh bạch giữa toàn bộ thành viên trong nhóm phát triển. Một tính năng, một hạng mục công việc (Backlog Item) hoặc một phiên bản Sprint chỉ được công nhận là **Hoàn thành (Done)** khi đáp ứng đầy đủ tất cả các tiêu chí định lượng bên dưới.

Không chấp nhận bất kỳ mã nguồn nào ở trạng thái "gần xong", "chạy được trên máy cá nhân nhưng lỗi trên CI", hoặc "thiếu kiểm thử tự động".

---

## 2. TIÊU CHUẨN HOÀN THÀNH Ở 3 CẤP ĐỘ

### 2.1 Cấp độ 1: Backlog Item / Feature Level (Mức Tính năng kỹ thuật FR)

Mỗi Hạng mục tính năng (PBI / FR) được gắn trạng thái **DONE** khi đáp ứng toàn bộ các điều kiện:

- [ ] **Hiện thực chức năng:** Mã nguồn hiện thực chính xác các tiêu chí chấp nhận (Acceptance Criteria) trong bản đặc tả Use Case và SRS.
- [ ] **Tuân thủ quy tắc viết mã ([`AGENTS.md`](../../AGENTS.md)):**
  - **Tuyệt đối không comment trong code:** Không để lại comment giải thích, ghi chú hoặc mã thừa bị comment (`// ...`, `/* ... */`).
  - Code tự tường minh bằng cách đặt tên biến, hàm, kiểu dữ liệu, component rõ nghĩa.
- [ ] **Định kiểu tĩnh nghiêm ngặt (Strict TypeScript):** Không dùng `any`, định nghĩa rõ interface / DTO / type.
- [ ] **Kiểm thử đơn vị (Unit Tests):**
  - Đã viết unit test cho các hàm xử lý logic nghiệp vụ và API endpoint.
  - Tỷ lệ độ bao phủ (code coverage) đối với các module nghiệp vụ cốt lõi đạt $\ge 80\%$.
- [ ] **Giao diện người dùng (Frontend):**
  - Đạt chuẩn Mobile-First, tương thích tốt trên màn hình di động (tối thiểu chiều rộng 375px) và Desktop.
  - Xử lý đầy đủ 3 trạng thái phụ: **Loading (Skeleton)**, **Empty (Không có dữ liệu)**, và **Error (Lỗi kết nối/mạng)**.
- [ ] **Kiểm tra cục bộ (Local Lint & Build):** Chạy `npm run lint` và `npm run build` không phát sinh lỗi hoặc cảnh báo nghiêm trọng.

---

### 2.2 Cấp độ 2: Sprint Level (Mức Hoàn thành Sprint 1 & Sprint 2)

Một Sprint được nghiệm thu khi đáp ứng các điều kiện:

- [ ] **Tất cả User Stories thuộc Sprint Backlog đều đạt DoD cấp độ 1.**
- [ ] **Tích hợp liên tục (CI) 100% Xanh:**
  - Pipeline GitHub Actions (`.github/workflows/ci.yml`) tự động vượt qua 4 chặng: `Install` $\rightarrow$ `Lint` $\rightarrow$ `Unit Test` $\rightarrow$ `Build`.
- [ ] **Đồng bộ cơ sở dữ liệu:**
  - Script Prisma Migration được kiểm tra chạy trơn tru trên database sạch (`prisma migrate reset`).
  - Script tạo dữ liệu mẫu (`prisma/seed.ts`) tạo đầy đủ dữ liệu thực tế cho menu, danh mục và topping.
- [ ] **Truy vết yêu cầu (Traceability):**
  - Cập nhật Ma trận truy vết ([`docs/traceability-matrix.md`](../traceability-matrix.md)) liên kết mã `FR` với mã nguồn và bài test tương ứng.
- [ ] **Họp tổng kết Sprint (Sprint Retrospective):**
  - Đánh giá những điểm làm tốt (What went well), thách thức phát sinh (Challenges) và kế hoạch hành động cải tiến (Action items).

---

### 2.3 Cấp độ 3: Release / Production Level (Mức Bàn giao sản phẩm - Task 5)

Sản phẩm được coi là sẵn sàng bàn giao nghiệm thu đồ án khi:

- [ ] **Đóng gói Container:** Cả Frontend và Backend đều được đóng gói bằng Docker Multi-stage build với image nhẹ tối ưu.
- [ ] **Triển khai Production thành công:**
  - Ứng dụng chạy trên môi trường có thể truy cập qua Internet với giao thức an toàn HTTPS (cổng 443).
  - Endpoint kiểm tra sức khỏe `GET /health` phản hồi HTTP `200 OK` kèm trạng thái kết nối Database.
- [ ] **Hồ sơ tài liệu đầy đủ:**
  - Bản báo cáo học thuật định dạng PDF chuẩn khoa CNTT Đại học Sài Gòn ([`Assignment_report.pdf`](../report/Assigment_template_SGU/Assignment_report.pdf)) bao gồm đầy đủ 5 nhiệm vụ và các sơ đồ kiến trúc.
  - Tệp hướng dẫn triển khai và phục hồi ([`docs/deployment.md`](../deployment.md)) có thể chạy lặp lại độc lập bởi bất kỳ kỹ sư nào.
