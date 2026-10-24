# SƠ ĐỒ HOẠT ĐỘNG TOÀN TRÌNH (END-TO-END ACTIVITY DIAGRAM) - BREWLITE

> **Căn cứ đề bài:** Mục 4.1 (Task 2.1 - 2.0 điểm) trong tệp đặc tả gốc [`docs/DE_BAI_ASSIGNMENT_2_GOC.md`](../../docs/DE_BAI_ASSIGNMENT_2_GOC.md).  
> **Ngôn ngữ mô hình hóa:** PlantUML chuẩn UML 2.0 (Monochrome, Black & White).  
> **Tệp mã nguồn sơ đồ:** [`activity-flow.puml`](activity-flow.puml).

---

## 1. MỤC TIÊU & NGUYÊN TẮC THIẾT KẾ SƠ ĐỒ

Sơ đồ Hoạt động (Activity Diagram) thể hiện toàn bộ vòng đời của một giao dịch đặt món và thanh toán từ lúc khách hàng bước vào hệ thống cho tới khi nhận đồ uống tại quầy Barista.

### Nguyên tắc tuân thủ chuẩn UML 2.0:
1. **5 Phân làn (Swimlanes / Partitions) phân định rõ trách nhiệm:**
   - **Khách hàng (Customer / Member):** Hành vi tương tác của người dùng cuối.
   - **Giao diện Web (Next.js Client):** Render giao diện, điều phối Client State (Zustand) và bắt lỗi.
   - **Backend API & CSDL (NestJS & PostgreSQL):** Xác thực JWT, thẩm định giá, quản lý Transaction và Khóa lạc quan (Optimistic Locking).
   - **Cổng thanh toán (Payment Gateway Mock):** Giả lập xác thực giao dịch, trừ tiền thẻ/ví điện tử.
   - **Quầy pha chế (Nhân viên Barista):** Màn hình tiếp nhận đơn hàng, đổi trạng thái đơn và trao đồ uống.
2. **Nút quyết định (Decision Diamonds):**
   - Hình thoi rỗng hoàn toàn theo chuẩn UML 2.0 (`if () then (...)`).
   - Mọi điều kiện phân nhánh / quyết định được gán trực tiếp lên đường nối (`[Guard Condition]`).
3. **Phong cách thiết kế Monochrome:**
   - Không màu mè, sử dụng chuẩn đen trắng tối giản, đường nét rõ ràng, tối ưu cho tài liệu kỹ thuật và in ấn học thuật.

---

## 2. NỘI DUNG MÃ NGUỒN SƠ ĐỒ PLANTUML

Mã nguồn sơ đồ được lưu trữ độc lập tại [`activity-flow.puml`](activity-flow.puml).

---

## 3. PHÂN TÍCH CÁC ĐIỂM QUYẾT ĐỊNH & 3 TRƯỜNG HỢP ĐẶC THÙ

Theo yêu cầu bắt buộc của Task 2.1 trong đề bài, sơ đồ mô hình hóa chi tiết 3 kịch bản ngoại lệ / biên nhạy cảm:

### 3.1. Trường hợp 1: Người dùng chưa đăng nhập (Unauthenticated Flow)
* **Vị trí kiểm tra:** Node quyết định trên làn **Giao diện Web (Next.js Client)** khi người dùng nhấn *"Tiến hành đặt hàng"*.
* **Cơ chế xử lý:**
  1. Giao diện kiểm tra token JWT trong `localStorage`.
  2. Nhánh `[Chưa đăng nhập]`: Hệ thống **không xóa giỏ hàng**, bật Modal Đăng nhập / Đăng ký (`UC05`).
  3. Sau khi nhập thông tin và nhận JWT hợp lệ, Client tự động tiếp tục luồng gửi đơn `POST /orders`.
  4. Nhánh `[Đã có JWT hợp lệ]`: Chuyển tiếp thẳng đến bước gửi đơn.

### 3.2. Trường hợp 2: Hết hàng / Tranh chấp tồn kho đồng thời (Concurrency / Out of Stock)
* **Vị trí kiểm tra:** Node quyết định trên làn **Backend API & CSDL (NestJS & PostgreSQL)** trong Prisma Transaction.
* **Cơ chế xử lý:**
  1. Áp dụng Khóa lạc quan (**Optimistic Locking**) dựa trên trường `version` trong bảng `Product`.
  2. Nhánh `[Hết hàng / Xung đột version]`: Transaction bị Rollback, Backend trả về HTTP `409 Conflict`. Giao diện Client nhận diện lỗi và hiển thị thông báo món vừa hết hàng, **giữ nguyên vẹn giỏ hàng** để khách đổi món.
  3. Nhánh `[Đủ hàng & Hợp lệ]`: Cập nhật tồn kho (`version = version + 1`), ghi bản ghi `Order` với trạng thái `PENDING_PAYMENT` và chuyển sang giao diện thanh toán.

### 3.3. Trường hợp 3: Thanh toán thất bại (Payment Failed Flow)
* **Vị trí kiểm tra:** Node quyết định trên làn **Cổng thanh toán (Payment Gateway Mock)**.
* **Cơ chế xử lý:**
  1. Khi người dùng nhập sai OTP, tài khoản không đủ số dư hoặc bấm hủy giao dịch.
  2. Nhánh `[Thanh toán thất bại / Hủy]`: Cổng thanh toán phản hồi `FAILED`. Backend cập nhật đơn sang `PAYMENT_FAILED` (không trừ hàng). Client hiển thị thông báo lỗi, **giữ nguyên giỏ hàng** và cung cấp nút *"Thử lại"* để khách đổi phương thức thanh toán.
  3. Nhánh `[Thanh toán thành công]`: Backend cập nhật trạng thái đơn sang `PAID`, ghi nhận điểm thưởng thành viên và kích hoạt luồng xử lý song song.

---

## 4. CƠ CHẾ XỬ LÝ SONG SONG (FORK / JOIN) & CỖ MÁY TRẠNG THÁI

Sau khi đơn hàng đạt trạng thái `PAID`, sơ đồ kích hoạt thanh phân nhánh song song **Fork** chia thành 2 luồng độc lập:
* **Luồng Khách hàng:** Client xóa giỏ hàng, hiển thị Modal xác nhận kèm Mã lấy nước to rõ (ví dụ: `#1042`), điểm tích lũy và thời gian dự kiến (5-7 phút). Khách hàng di chuyển đến quầy chờ.
* **Luồng Quầy Barista:** Màn hình vận hành của nhân viên Barista tức thì nhận thông báo đơn `#1042`. Barista bấm nhận đơn (`PREPARING`), tiến hành pha chế đúng Size/Topping, khi xong bấm chuyển sang `READY` và gọi mã tại quầy.

Tại thanh kết hợp **Join**, hai luồng đồng bộ gặp nhau: Khách hàng đối chiếu mã đơn `#1042`, Barista trao đồ uống và xác nhận hoàn tất $\rightarrow$ Đơn hàng chuyển sang trạng thái kết thúc `COMPLETED`.

---

## 5. MA TRẬN TRUY VẾT LIÊN KẾT YÊU CẦU (TRACEABILITY)

| Thành phần sơ đồ | Use Case liên quan | Yêu cầu chức năng (FR) | Yêu cầu phi chức năng (NFR) |
| :--- | :---: | :---: | :---: |
| Duyệt menu & Lọc danh mục | `UC01`, `UC02` | `FR-01` | `NFR-01`, `NFR-03` |
| Tùy biến Size & Topping | `UC03` (`UC03.1`, `UC03.2`, `UC03.3`) | `FR-02` | `NFR-03` |
| Quản lý giỏ hàng | `UC04` | `FR-03` | `NFR-03` |
| Xác thực JWT / Modal Đăng nhập | `UC05` | `FR-04` | `NFR-02` |
| Khởi tạo đơn & Khóa lạc quan | `UC06` | `FR-05`, `FR-08` | `NFR-04` |
| Thanh toán trực tuyến & Idempotent | `UC07` (`UC07.1`, `UC07.2`) | `FR-06` | `NFR-02`, `NFR-04` |
| Tích lũy điểm thưởng thành viên | `UC08` | `FR-09` | `NFR-04` |
| Tiếp nhận & Pha chế tại quầy | `UC10`, `UC11`, `UC12` | `FR-07`, `FR-12` | `NFR-03` |
