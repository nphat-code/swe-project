# ADR 003: Lựa Chọn NestJS Với Kiến Trúc Modular / Domain-Driven

## Trạng thái (Status)
**Đã phê duyệt (Accepted)** — Ngày: 2026-10-24

## Bối cảnh (Context)
Hệ thống backend cần xử lý các nghiệp vụ tài chính, kiểm soát số lượng tồn kho theo thời gian thực, quản lý cỗ máy trạng thái đơn hàng (Order State Machine), xác thực người dùng và tích hợp cổng thanh toán.  
Cần lựa chọn giữa framework tối giản như Express.js thuần và framework có tính cấu trúc cao, tuân thủ nguyên lý Dependency Injection (DI) như NestJS.

## Quyết định (Decision)
Lựa chọn **NestJS** kết hợp kiến trúc **Domain-Driven Modular**:
1. Chia backend thành các Module độc lập: `AuthModule`, `ProductsModule`, `OrdersModule`, `PaymentsModule`, `LoyaltyModule`, `HealthModule`.
2. Áp dụng chuẩn **ValidationPipe** với `class-validator` và `class-transformer` để kiểm tra chặt chẽ DTO đầu vào trước khi vào tầng Controller.
3. Sử dụng **Guards** (`JwtAuthGuard`, `RolesGuard`) cho tầng bảo vệ quyền truy cập.
4. Triển khai **State Machine** trong `OrdersService` để ràng buộc chuyển trạng thái hợp lệ của đơn hàng:
   $$\text{PENDING} \longrightarrow \text{PAID} \longrightarrow \text{PREPARING} \longrightarrow \text{READY} \longrightarrow \text{COMPLETED}$$

## Hệ quả & Đánh đổi (Consequences & Trade-offs)

### Ưu điểm (Pros):
* Kiến trúc chuẩn công nghiệp, dễ đọc hiểu, dễ bàn giao cho các thành viên trong nhóm.
* Tách biệt rõ ràng Controller (xử lý HTTP request), Service (chứa toàn bộ nghiệp vụ) và Repository/Prisma (tầng dữ liệu).
* Thuận lợi tối đa cho việc viết Unit Test bằng Jest với mocks của NestJS Testing Module.

### Hạn chế (Cons) & Giải pháp giảm thiểu:
* **Hạn chế:** Cần viết nhiều boilerplate code (Module, Controller, Service, DTO).
* **Giải pháp:** Sử dụng Nest CLI (`nest g mo`, `nest g co`, `nest g s`) để sinh khung mã nguồn tự động và chuẩn mực.
