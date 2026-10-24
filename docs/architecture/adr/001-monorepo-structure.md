# ADR 001: Lựa Chọn Cấu Trúc Monorepo Cho Toàn Bộ Hệ Thống

## Trạng thái (Status)
**Đã phê duyệt (Accepted)** — Ngày: 2026-10-24

## Bối cảnh (Context)
Dự án BrewLite là một hệ thống đặt đồ uống trực tuyến end-to-end bao gồm giao diện người dùng Web/PWA di động (Next.js), dịch vụ Backend API (NestJS), cơ sở dữ liệu PostgreSQL và các tài liệu kỹ thuật, sơ đồ thiết kế.  
Cần lựa chọn mô hình tổ chức kho mã nguồn giữa **Monorepo** (một repository chứa cả frontend, backend, docs) và **Polyrepo** (tách riêng thành nhiều repository độc lập).

## Quyết định (Decision)
Lựa chọn cấu trúc **Monorepo** với sơ đồ tổ chức thư mục như sau:
```plaintext
brewlite/
|-- apps/
|   |-- web/                  # Frontend Next.js PWA
|   `-- api/                  # Backend NestJS
|-- docs/
|   |-- requirements/         # Tài liệu yêu cầu Task 1
|   |-- diagrams/             # Sơ đồ thiết kế Task 2
|   |-- architecture/         # Tài liệu kiến trúc Task 3
|   `-- traceability-matrix.md
|-- tests/                    # Integration & E2E Tests
|-- .github/workflows/        # CI/CD Workflows
|-- docker-compose.yml
|-- .env.example
`-- README.md
```

## Hệ quả & Đánh đổi (Consequences & Trade-offs)

### Ưu điểm (Pros):
1. **Chia sẻ Type Definitions & DTOs:** Frontend và Backend có thể dùng chung các định nghĩa Interface, Enums (`OrderStatus`, `Role`, `PaymentMethod`), giảm thiểu tối đa tình trạng sai lệch schema giữa Client và Server.
2. **Quy trình CI/CD tích hợp duy nhất:** Toàn bộ pipeline kiểm thử (Lint, Test, Build) và triển khai được quản lý tập trung trong một workflow GitHub Actions.
3. **Quản lý phiên bản đồng nhất:** Dễ dàng kiểm soát Traceability giữa tài liệu yêu cầu trong `docs/` và mã nguồn trong `apps/`.
4. **Trải nghiệm chạy cục bộ (DX):** Chỉ cần một lệnh `docker-compose up` là có thể khởi chạy toàn bộ hệ sinh thái (PostgreSQL + API + Web).

### Hạn chế (Cons) & Giải pháp giảm thiểu:
* **Hạn chế:** Kích thước repository lớn hơn so với việc tách lẻ.
* **Giải pháp:** Sử dụng file `.gitignore` nghiêm ngặt, không commit thư mục `node_modules`, build artifacts (`.next`, `dist`) hay database volumes.
