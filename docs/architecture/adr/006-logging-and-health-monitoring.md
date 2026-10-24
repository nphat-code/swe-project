# ADR 006: Chiến Lược Ghi Log Có Cấu Trúc Và Kiểm Tra Sức Khỏe Hệ Thống (Health Check)

## Trạng thái (Status)
**Đã phê duyệt (Accepted)** — Ngày: 2026-10-24

## Bối cảnh (Context)
Khi hệ thống chạy trên môi trường Container hóa và Cloud Production (Docker, Render, Railway), đội ngũ kỹ thuật cần:
1. Phát hiện sớm sự cố treo ứng dụng, mất kết nối CSDL hoặc rò rỉ bộ nhớ.
2. Nền tảng điều phối (Orchestrator) cần biết lúc nào container đã sẵn sàng nhận traffic (Readiness Probe) và khi nào container bị lỗi để tự khởi động lại (Liveness Probe).
3. Khả năng truy vết lỗi và theo dõi luồng giao dịch qua các tầng (Request tracing) mà không làm rò rỉ dữ liệu nhạy cảm (mật khẩu, token) ra log.

## Quyết định (Decision)
1. **Kiểm tra sức khỏe hệ thống (Health Check):**
   - Hiện thực endpoint `GET /health` sử dụng `@nestjs/terminus`.
   - Kiểm tra đồng thời:
     - Tình trạng tiến trình API (Memory heap, Uptime).
     - Kết nối sống tới cơ sở dữ liệu PostgreSQL (`prisma.health.ts`).
   - Kết quả phản hồi HTTP `200 OK` khi hệ thống khỏe mạnh và `503 Service Unavailable` khi mất kết nối CSDL.
2. **Ghi Log có cấu trúc (Structured Logging):**
   - Chuẩn hóa log theo định dạng JSON trên Production bao gồm các trường: `timestamp`, `level` (`INFO`, `WARN`, `ERROR`), `context`, `correlationId`, `message`.
   - Gắn `x-correlation-id` vào mỗi Request HTTP thông qua Middleware để truy vết xuyên suốt vòng đời của request từ lúc nhận đến lúc trả về kết quả.
   - Lọc bỏ tuyệt đối các trường nhạy cảm: `password`, `accessToken`, `creditCardNumber` trước khi ghi log.

## Hệ quả & Đánh đổi (Consequences & Trade-offs)

### Ưu điểm (Pros):
* Tích hợp mượt mà với Docker `HEALTHCHECK` và bộ giám sát của dịch vụ Cloud.
* Giúp việc debug lỗi trên môi trường production nhanh chóng, chính xác.
* Đảm bảo tuân thủ tiêu chuẩn an toàn bảo mật dữ liệu người dùng (`NFR-02`).

### Hạn chế (Cons) & Giải pháp giảm thiểu:
* **Hạn chế:** Tăng dung lượng log nếu ghi log ở mức `DEBUG` quá nhiều trên production.
* **Giải pháp:** Cấu hình mức log mặc định là `INFO` trên Production và chỉ mở `DEBUG` khi ở môi trường Local Development.
