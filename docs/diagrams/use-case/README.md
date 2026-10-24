# SƠ ĐỒ USE CASE (USE CASE DIAGRAMS) - BREWLITE

> **Căn cứ đề bài:** Mục 3.1 & 3.3 (Task 1.1 & Task 1.3) trong tệp đặc tả gốc [`docs/DE_BAI_ASSIGNMENT_2_GOC.md`](../../docs/DE_BAI_ASSIGNMENT_2_GOC.md).  
> **Ngôn ngữ mô hình hóa:** UML 2.0 (Draw.io Vector & Mermaid).  
> **Tài liệu đặc tả chi tiết:** [`docs/requirements/system-requirements-matrix.md`](../../requirements/system-requirements-matrix.md) & [`docs/requirements/core-use-case-specification.md`](../../requirements/core-use-case-specification.md).

---

## 1. SƠ ĐỒ USE CASE TỔNG QUÁT HỆ THỐNG (SYSTEM OVERVIEW)

Sơ đồ mô hình hóa toàn bộ 16 Use Case (UC01 đến UC16) của hệ thống đặt đồ uống trực tuyến BrewLite, bao quát đầy đủ 4 nhóm tác nhân (Actors):

- **Tệp đồ họa vector (SVG):** [`use-case-system.svg`](use-case-system.svg)
- **Tệp ảnh chất lượng cao (PNG):** [`use-case-system.png`](use-case-system.png)
- **Tệp mã nguồn Mermaid:** [`use-case-system.mmd`](use-case-system.mmd)

### Phân nhóm Tác nhân & Quyền hạn:
1. **Khách hàng (Customer):** Người dùng vãng lai, duyệt menu (`UC01`), tìm kiếm đồ uống (`UC02`), tùy biến size/topping/ghi chú (`UC03`), quản lý giỏ hàng (`UC04`) và đăng ký/đăng nhập tài khoản (`UC05`).
2. **Khách thành viên (Member):** Kế thừa từ Khách hàng, tiến hành checkout đặt món (`UC06`), áp dụng mã voucher (`UC06.1`), thanh toán trực tuyến (`UC07`), tự động tích lũy điểm thưởng (`UC08`) và xem lịch sử đơn hàng cá nhân (`UC09`).
3. **Nhân viên Barista:** Nhận đơn pha chế realtime (`UC10`), cập nhật trạng thái đơn hàng (`UC11`) và hủy đơn sự cố (`UC12`).
4. **Quản trị viên (Admin):** Quản lý thực đơn đồ uống & topping (`UC13`), cập nhật số lượng tồn kho (`UC14`), tạo mã giảm giá voucher (`UC15`) và xem báo cáo thống kê doanh thu (`UC16`).
5. **Cổng thanh toán (Payment Gateway Mock):** Tác nhân thứ ba xử lý giao dịch trừ tiền MoMo / VNPay / Thẻ (`UC07`).

---

## 2. SƠ ĐỒ USE CASE TRỌNG TÂM: ĐẶT HÀNG & THANH TOÁN (CORE CHECKOUT FLOW)

Mô hình hóa chi tiết phạm vi nghiệp vụ cốt lõi nhất theo yêu cầu Task 1.3:

- **Tệp đồ họa vector (SVG):** [`use-case-checkout.svg`](use-case-checkout.svg)
- **Tệp ảnh chất lượng cao (PNG):** [`use-case-checkout.png`](use-case-checkout.png)
- **Tệp mã nguồn Mermaid:** [`use-case-checkout.mmd`](use-case-checkout.mmd)

### Các mối quan hệ chuẩn UML 2.0:
* **Kế thừa Actor (Generalization):** Khách thành viên kế thừa quyền hạn từ Khách hàng (`Member` $\rightarrow$ `Customer`).
* **Bao hàm (`<<include>>`):**
  - `UC06 (Đặt hàng - Checkout)` $\longrightarrow$ `UC05 (Đăng ký / Đăng nhập)`: Bắt buộc xác thực tài khoản trước khi hoàn tất checkout.
  - `UC06 (Đặt hàng - Checkout)` $\longrightarrow$ `UC07 (Thanh toán trực tuyến)`: Bắt buộc chuyển sang thanh toán số.
  - `UC07 (Thanh toán trực tuyến)` $\longrightarrow$ `UC07.1 (Chọn phương thức Ví / Thẻ)` và `UC07.2 (Xử lý Idempotent & Trừ tiền)`.
* **Mở rộng (`<<extend>>`):**
  - `UC06.1 (Áp dụng mã Voucher)` $\stackrel{<<extend>>}{\longrightarrow}$ `UC06 (Đặt hàng - Checkout)`: Khách hàng có thể tùy chọn áp dụng voucher nếu có.
  - `UC08 (Tích lũy điểm thưởng)` $\stackrel{<<extend>>}{\longrightarrow}$ `UC06 (Đặt hàng - Checkout)`: Tự động tích lũy 1 điểm cho mỗi 10.000 VNĐ khi thanh toán thành công.
