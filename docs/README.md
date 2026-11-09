# 📚 QUẢN LÝ HỒ SƠ TÀI LIỆU KỸ THUẬT BREWLITE (TASK 4.2)

> **Căn cứ đề bài:** Mục 6.2 (Task 4.2 – Quản lý tài liệu) trong tệp đặc tả gốc [`docs/DE_BAI_ASSIGNMENT_2_GOC.md`](DE_BAI_ASSIGNMENT_2_GOC.md).  
> **Quy định đề bài:** *"Đưa toàn bộ tạo phẩm của Task 1–3 vào thư mục `docs`. Mọi thay đổi yêu cầu, sơ đồ hoặc kiến trúc phải đi qua commit/pull request và ghi rõ lý do."*  
> **Kho mã nguồn:** [https://github.com/nphat-code/swe-project](https://github.com/nphat-code/swe-project)

---

## 1. CẤU TRÚC HỒ SƠ TÀI LIỆU TOÀN HỆ THỐNG

Thư mục `docs/` được cấu trúc phân cấp chặt chẽ, tương ứng với toàn bộ các giai đoạn phát triển phần mềm của Assignment 2:

```plaintext
docs/
├── DE_BAI_ASSIGNMENT_1_GOC.md   # Văn bản gốc 12 mục của Assignment 1 (10 Tasks Scrum)
├── DE_BAI_ASSIGNMENT_2_GOC.md   # Single Source of Truth: Văn bản gốc 9 mục của Assignment 2
├── README.md                    # Tài liệu này: Mục lục hồ sơ & Quy chế kiểm soát tài liệu
├── traceability-matrix.md       # Mục 8: Ma trận truy vết yêu cầu (FR/NFR -> Diagram -> Code)
├── deployment.md                # Task 3.2: Hướng dẫn triển khai chi tiết trên AWS Cloud
│
├── requirements/                # TASK 1: KHAI THÁC & ĐẶC TẢ YÊU CẦU (2.0đ)
│   ├── context-and-scope.md     # Task 1.1: Bối cảnh, 6 Stakeholder, Phạm vi & Ma trận rủi ro
│   ├── system-requirements-matrix.md # Task 1.2: Danh mục FR-01..12, NFR-01..08 & Use Case tổng quát
│   └── core-use-case-specification.md # Task 1.3: Đặc tả Use Case trọng tâm (Đặt hàng & Thanh toán)
│
├── diagrams/                    # TASK 2: MÔ HÌNH HÓA HỆ THỐNG (2.0đ)
│   ├── use-case/                # Task 1.2 & 1.3: Sơ đồ Use Case tổng quát & Trọng tâm (.mmd / .png)
│   ├── activity/                # Task 2.1: Sơ đồ Hoạt động Swimlane, Fork/Join (.puml, .svg, .png)
│   ├── sequence/                # Task 2.2: Sơ đồ Tuần tự luồng Checkout có alt, opt, loop (.mmd, .svg, .png)
│   ├── class/                   # Task 2.3: Sơ đồ Lớp Domain 7 thực thể cốt lõi (.mmd, .drawio.svg, .drawio.png)
│   └── deployment/              # Task 3.2: Sơ đồ Triển khai Production AWS (.puml, .png)
│
├── architecture/                # TASK 3: THIẾT KẾ KIẾN TRÚC & QUYẾT ĐỊNH (2.0đ)
│   ├── architecture-description.md # Task 3.1: Tài liệu kiến trúc C4 kết hợp Modular Monolith
│   └── adr/                     # 6 Bản ghi quyết định kiến trúc (Architecture Decision Records)
│       ├── 001-monorepo-structure.md
│       ├── 002-frontend-nextjs-pwa.md
│       ├── 003-backend-nestjs-modular.md
│       ├── 004-postgresql-and-prisma-orm.md
│       ├── 005-payment-idempotency-and-mock-gateway.md
│       └── 006-logging-and-health-monitoring.md
│
├── sprint/                      # TASK 4: QUẢN LÝ SPRINT & AGILE SCRUM
│   ├── branching-strategy.md    # Task 4.1: Chiến lược phân nhánh GitFlow & Quy trình Pull Request
│   ├── definition-of-done.md    # Task 4.1: Tiêu chuẩn hoàn thành 3 cấp (Story, Sprint, Release)
│   ├── product-backlog.md       # Task 4.1: Product Backlog 6 Epics, 15 User Stories
│   └── sprint-1-backlog.md      # Task 4.1: Sprint 1 Backlog 5 tasks kèm Acceptance Criteria
│
└── report/                      # BÁO CÁO HỌC THUẬT LATEX & XUẤT BẢN PDF
    └── figures/                 # Toàn bộ hình ảnh sơ đồ độ phân giải cao phục vụ báo cáo
```

---

## 2. QUY CHẾ QUẢN LÝ PHIÊN BẢN TÀI LIỆU (DOCUMENTATION CHANGE CONTROL)

Tuân thủ nghiêm ngặt yêu cầu của Mục 6.2 đề tài Assignment 2:
1. **Kiểm soát phiên bản bằng Git (Versioned Documentation):** Mọi văn bản đặc tả (`.md`), mã nguồn sơ đồ (`.puml`, `.mmd`) và ảnh kết xuất (`.svg`, `.png`) đều phải được quản lý phiên bản trong Git repository.
2. **Quy tắc thay đổi tài liệu (Change Request Policy):**
   - Không sửa trực tiếp tài liệu trên nhánh `main`. Mọi hiệu chỉnh hoặc bổ sung phải xuất phát từ nhánh `develop` hoặc nhánh tính năng `feature/*`.
   - Mỗi lần sửa đổi yêu cầu, sơ đồ hoặc kiến trúc phải tạo commit có định dạng Conventional Commits với tiền tố `docs:` kèm thông điệp giải thích rõ lý do thay đổi.
   - Khi có thay đổi lớn ảnh hưởng đến nghiệp vụ hoặc sơ đồ, phải cập nhật đồng thời [traceability-matrix.md](traceability-matrix.md) và báo cáo học thuật [`Assignment_report.tex`](../Assignment_report.tex).
3. **Đảm bảo tính nhất quán (Single Source of Truth):**
   - Đề bài gốc [`DE_BAI_ASSIGNMENT_2_GOC.md`](DE_BAI_ASSIGNMENT_2_GOC.md) là căn cứ tối cao.
   - Không được phép có sự mâu thuẫn giữa tài liệu yêu cầu (Task 1), sơ đồ thiết kế (Task 2), kiến trúc (Task 3) và mã nguồn thực thi (Task 4 & 5).

---

## 3. NHẬT KÝ LỊCH SỬ THAY ĐỔI TÀI LIỆU (REVISION HISTORY)

| Phiên bản | Ngày cập nhật | Task liên quan | Tệp tài liệu thay đổi | Lý do & Nội dung thay đổi | Commit Hash |
| :---: | :---: | :---: | :--- | :--- | :---: |
| **v1.0** | Tuần 1 | Task 1 | `docs/requirements/*` | Khởi tạo trọn bộ hồ sơ yêu cầu: Bối cảnh, Stakeholder, 12 FRs, 8 NFRs, Use Case tổng quát và Use Case trọng tâm. | `e971ac0` |
| **v1.1** | Tuần 2 | Task 2 | `docs/diagrams/activity/*` | Hiện thực Sơ đồ Hoạt động theo quy chuẩn: 5 Swimlane, không Yes/No, có Fork/Join. | `a9881c6` |
| **v1.2** | Tuần 2 | Task 2 | `docs/diagrams/sequence/*` | Hoàn thiện Sơ đồ Tuần tự: Cân bằng Activation Bar, 5 Lifeline chuẩn, phân nhánh `alt` / `opt` / `loop`. | `a9881c6` |
| **v1.3** | Tuần 2 | Task 2 | `docs/diagrams/class/*` | Hoàn thiện Sơ đồ Lớp Domain 7 thực thể, sửa lỗi render Enum trên Draw.io / Visual Paradigm. | `d158f0e` |
| **v1.4** | Tuần 3 | Task 3 | `docs/architecture/*`, `docs/deployment.md` | Hoàn thiện tài liệu kiến trúc C4, 6 bản ghi ADRs và Sơ đồ Triển khai hạ tầng Production AWS EC2. | `c37d22b` |
| **v1.5** | Sprint 1 | Task 4.1 | `docs/sprint/*` | Bổ sung hồ sơ quy trình Agile: Branching Strategy, Definition of Done, Product Backlog, Sprint 1 Backlog. | `8b9d6af` |
| **v1.6** | Sprint 1 | Task 4.3 & 4.4 | `.github/workflows/ci.yml`, `docs/sprint/*` | Hoàn thiện MVP Sprint 1, 14 unit tests, pipeline CI tự động và cập nhật trạng thái Backlog DONE. | `faa86ba` |
| **v1.7** | Sprint 1 | Task 4 (Hoàn thiện) | `ProductDetailModal.tsx`, `*.test.tsx`, `.github/workflows/ci.yml`, `docs/sprint/*`, `docs/traceability-matrix.md` | Hoàn tất 100% Task 4: chuẩn hóa ARIA/tùy chọn món, bổ sung unit/flow tests FE & BE (16 BE + 31 FE), sửa CI đa nền tảng & đồng bộ Backlog/Traceability. | *Task 4 Final* |
