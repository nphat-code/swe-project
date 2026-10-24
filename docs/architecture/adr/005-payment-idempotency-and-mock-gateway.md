# ADR 005: Cơ Chế Idempotency Key Và Cổng Thanh Toán Mô Phỏng (Mock Payment Gateway)

## Trạng thái (Status)
**Đã phê duyệt (Accepted)** — Ngày: 2026-10-24

## Bối cảnh (Context)
Trong môi trường mạng không dây tại quán cà phê, kết nối có thể bị gián đoạn hoặc khách hàng vô tình nhấn nút "Thanh toán" nhiều lần liên tiếp.  
Nếu không có cơ chế phòng chống, khách hàng có thể bị trừ tiền hai lần cho cùng một đơn hàng (Double Charging).  
Đồng thời, trong giai đoạn phát triển và bảo vệ đồ án, việc kết nối cổng thanh toán thật (MoMo, VNPay, ZaloPay sandbox) thường gặp rào cản về hợp đồng thương mại, OTP SMS và biến động API ngoại vi.

## Quyết định (Decision)
1. **Header Chống Lặp `Idempotency-Key`:**
   - Mỗi lần Client chuẩn bị gửi yêu cầu `POST /payments`, Client tự sinh một mã định danh duy nhất UUID v4 và đính kèm vào Header HTTP: `Idempotency-Key: <UUID>`.
   - Backend sử dụng một `IdempotencyInterceptor` hoặc lưu khóa này vào bảng `Payment`. Nếu nhận được yêu cầu trùng khóa trong vòng 24 giờ, hệ thống trả về ngay kết quả thanh toán đã ghi nhận trước đó mà không trừ tiền lần thứ hai.
2. **Cổng thanh toán Mô phỏng (Mock Payment Service):**
   - Xây dựng dịch vụ Mock chuẩn hóa mô phỏng API của Cổng thanh toán MoMo / VNPay.
   - Hỗ trợ tham số hoặc trường hợp giả lập:
     - Luồng thành công (Happy path): Trả về `200 OK` kèm mã giao dịch `transactionId` duy nhất.
     - Luồng thất bại (Failure path): Giả lập tài khoản không đủ số dư, OTP sai hoặc người dùng hủy giao dịch $\rightarrow$ Trả về mã lỗi từ chối, cập nhật đơn sang `PAYMENT_FAILED`.
     - Luồng timeout: Giả lập mạng chậm để kiểm thử khả năng xử lý timeout của Client.

## Hệ quả & Đánh đổi (Consequences & Trade-offs)

### Ưu điểm (Pros):
* Đảm bảo tính bất biến (Idempotent) cho toàn bộ giao dịch thanh toán trực tuyến.
* Môi trường kiểm thử độc lập, có thể chạy tự động trong CI/CD pipeline mà không phụ thuộc dịch vụ bên ngoài.
* Dễ dàng mô phỏng các ca biên (Edge cases) hiếm gặp để kiểm thử độ bền bỉ của hệ thống.

### Hạn chế (Cons) & Giải pháp giảm thiểu:
* **Hạn chế:** Cần có kế hoạch chuyển đổi khi tích hợp cổng thanh toán production trong tương lai.
* **Giải pháp:** Sử dụng Adapter Pattern (`PaymentGatewayAdapter` Interface). Mock Payment Service và Real Gateway đều hiện thực cùng một interface, cho phép hoán đổi qua biến cấu hình `PAYMENT_PROVIDER=MOCK` hoặc `VNPAY`.
