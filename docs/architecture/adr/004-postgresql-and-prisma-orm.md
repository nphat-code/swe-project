# ADR 004: Lựa Chọn PostgreSQL Và Quy Trình Quản Lý Migration Bằng Prisma ORM

## Trạng thái (Status)
**Đã phê duyệt (Accepted)** — Ngày: 2026-10-24

## Bối cảnh (Context)
Hệ thống xử lý thanh toán, trừ tồn kho và tích lũy điểm thưởng yêu cầu tính toàn vẹn dữ liệu nghiêm ngặt theo chuẩn ACID (Atomicity, Consistency, Isolation, Durability).  
Đồng thời, khi có nhiều khách hàng cùng lúc mua cốc cà phê cuối cùng, hệ thống phải ngăn chặn bán vượt tồn kho (Overselling / Race condition) mà không được làm treo hay khóa chết CSDL (Deadlock).

## Quyết định (Decision)
1. **Hệ quản trị CSDL:** **PostgreSQL** (chạy cục bộ qua Docker Compose và chạy Cloud qua Neon Serverless Postgres).
2. **Công cụ ORM:** **Prisma ORM**:
   - `schema.prisma`: Khai báo mô hình dữ liệu tập trung, sinh Type-safe Client tự động.
   - **Migration Workflow:**
     - Development: `npx prisma migrate dev --name <migration_name>` tự động sinh các file SQL có phiên bản và timestamp trong thư mục `prisma/migrations/`.
     - CI/CD & Production: Chạy `npx prisma migrate deploy` để áp dụng các migration chưa chạy một cách an toàn.
   - **Seeding:** Tệp `prisma/seed.ts` khởi tạo sẵn danh mục, sản phẩm mẫu và tài khoản kiểm thử.
3. **Cơ chế Khóa lạc quan (Optimistic Locking):**
   - Thêm cột `version Int @default(1)` vào bảng `Product`.
   - Mỗi lệnh cập nhật tồn kho trong Prisma `$transaction` đi kèm điều kiện `WHERE id = :id AND version = :expectedVersion`, sau đó tăng `version = version + 1`. Nếu version bị thay đổi bởi giao dịch khác, transaction tự động Rollback và trả về HTTP `409 Conflict`.

## Hệ quả & Đánh đổi (Consequences & Trade-offs)

### Ưu điểm (Pros):
* Đảm bảo an toàn 100% cho giao dịch tài chính, số dư điểm thưởng và số lượng tồn kho.
* Khóa lạc quan không khóa cứng dòng dữ liệu, giúp hàng trăm khách hàng có thể đọc menu đồng thời với hiệu năng cao.
* Type-safe Client giảm thiểu toàn bộ lỗi gõ sai tên cột hoặc kiểu dữ liệu trong SQL.

### Hạn chế (Cons) & Giải pháp giảm thiểu:
* **Hạn chế:** Khi phát sinh tranh chấp mua cùng lúc, giao dịch thứ hai bị từ chối với lỗi 409 Conflict.
* **Giải pháp:** Giao diện Client bắt mã lỗi 409, giữ nguyên giỏ hàng và hiển thị thông báo thân thiện để khách hàng chọn món khác.
