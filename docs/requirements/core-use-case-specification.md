# 📌 ĐẶC TẢ USE CASE TRỌNG TÂM — DỰ ÁN BREWLITE (TASK 1.3)
## Core Use Case Specification: Đặt Hàng & Thanh Toán Trực Tuyến (Online Checkout)

---

> **Cơ sở đào tạo:** Trường Đại học Sài Gòn — Khoa Công nghệ Thông tin  
> **Môn học:** Công nghệ Phần mềm (Software Engineering)  
> **Hạng mục:** Assignment 2 — Task 1.3: Đặc tả một use-case trọng tâm  
> **Phiên bản:** v1.0  
> **Use Case lựa chọn:** `UC06 - Đặt hàng` & `UC07 - Thanh toán trực tuyến`  

---

## 1. PHẠM VI & SƠ ĐỒ USE CASE TRỌNG TÂM (FOCUS SCOPE DIAGRAM)

Use case **"Đặt hàng và Thanh toán trực tuyến"** là mạch máu nghiệp vụ cốt lõi nhất của BrewLite, giải quyết bài toán: *Khách hàng không phải xếp hàng chờ thanh toán tiền mặt tại quầy, mà có thể hoàn tất chọn món, áp voucher, thanh toán trực tuyến qua Ví điện tử / Thẻ và nhận mã lấy nước trong vài chạm.*

* **Hình ảnh sơ đồ trực quan:** [`docs/diagrams/use-case/use-case-checkout.png`](../diagrams/use-case/use-case-checkout.png) | [`SVG Vector`](../diagrams/use-case/use-case-checkout.svg)
* **Mã nguồn sơ đồ:** [`Mermaid Source (docs/diagrams/use-case/use-case-checkout.mmd)`](../diagrams/use-case/use-case-checkout.mmd)

```mermaid
flowchart LR
    Customer[Khách hàng]
    Member[Khách thành viên]
    PaymentGW[Cổng thanh toán MoMo / VNPay]

    Member -.->|Kế thừa| Customer

    subgraph CheckoutBoundary [PHẠM VI TRỌNG TÂM: ĐẶT HÀNG & THANH TOÁN (BREWLITE)]
        UC04([UC04: Quản lý giỏ hàng])
        UC05([UC05: Đăng ký / Đăng nhập])
        UC06([UC06: Đặt hàng - Checkout])
        UC06_1([UC06.1: Áp dụng mã Voucher])
        
        UC07([UC07: Thanh toán trực tuyến])
        UC07_1([UC07.1: Chọn phương thức Ví / Thẻ])
        UC07_2([UC07.2: Xử lý Idempotent & Trừ tiền])
        
        UC08([UC08: Tích lũy điểm thưởng])
        UC09([UC09: Xem lịch sử đơn hàng])
    end

    Customer --- UC04
    Customer --- UC05

    Member --- UC06
    Member --- UC08
    Member --- UC09

    UC06 -.->|include| UC05
    UC06 -.->|include| UC07
    UC06_1 -.->|extend| UC06
    UC08 -.->|extend| UC06
    
    UC07 -.->|include| UC07_1
    UC07 -.->|include| UC07_2
    UC07_2 --- PaymentGW
```

---

## 2. BẢNG ĐẶC TẢ CHI TIẾT USE CASE TRỌNG TÂM (USE CASE SPECIFICATION)

| Thuộc tính | Chi tiết đặc tả kỹ thuật |
| :--- | :--- |
| **Tên Use Case** | **UC-CORE: Đặt Hàng & Thanh Toán Trực Tuyến (Online Order & Checkout)** |
| **Mã định danh** | `UC06: Đặt hàng - Checkout` & `UC07: Thanh toán trực tuyến` (liên kết `UC05: Đăng ký / Đăng nhập`, `UC07.1: Chọn phương thức`, `UC07.2: Xử lý Idempotent`, `UC06.1: Voucher`, `UC08: Tích lũy điểm thưởng`, `UC09: Xem lịch sử đơn`) |
| **Tác nhân chính (Primary Actor)** | **Khách thành viên (Member)** (Khách hàng sau khi đăng nhập / xác thực JWT) |
| **Tác nhân hỗ trợ (Supporting Actor)** | **Cổng thanh toán điện tử (Mock Payment Gateway)** (MoMo, VNPay, Thẻ ngân hàng) |
| **Sự kiện kích hoạt (Trigger)** | Khách hàng nhấn nút **"Tiến hành đặt hàng"** từ Giỏ hàng (Cart Drawer) hoặc nút **"Thanh toán ngay"** trên màn hình Checkout. |
| **Tiền điều kiện (Pre-conditions)** | 1. Giỏ hàng của khách hàng có ít nhất 1 sản phẩm (`cartCount > 0`).<br/>2. Các món trong giỏ hàng ở trạng thái khả dụng kinh doanh (`isAvailable = true`) và còn tồn kho (`stock > 0`).<br/>3. **Khách hàng đã đăng nhập tài khoản thành viên thành công và sở hữu Token JWT hợp lệ** (nếu chưa đăng nhập, hệ thống kích hoạt luồng `UC05` yêu cầu đăng nhập trước).<br/>4. Máy khách (Client) duy trì kết nối Internet và gọi được REST API Backend (`/health` trả về `200 OK`). |
| **Hậu điều kiện thành công (Post-conditions - Success)** | 1. Đơn hàng được tạo thành công trong CSDL gắn với `userId` của Member, trạng thái chuyển từ `PENDING` $\rightarrow$ `PAID`.<br/>2. Số lượng tồn kho (`stock`) của các món được trừ an toàn bằng cơ chế Khóa lạc quan (**Optimistic Locking**).<br/>3. Giao dịch thanh toán được ghi nhận kèm mã `Idempotency-Key` và `transactionId`.<br/>4. Khách hàng nhận được Mã đơn hàng to rõ (ví dụ: `#1042`) kèm thông báo: *"Mời bạn đến quầy nhận nước sau 5-7 phút"*.<br/>5. Giỏ hàng phía Client được xóa sạch (`cartItems = []`).<br/>6. Hệ thống tự động tích lũy điểm thưởng thành viên tương ứng (10.000đ = 1 điểm, lưu vào `LoyaltyTransaction`).<br/>7. Đơn hàng được lưu vào trang Lịch sử đơn hàng cá nhân (`UC09`). |
| **Hậu điều kiện thất bại (Post-conditions - Failure)** | 1. Đơn hàng chuyển sang trạng thái `PAYMENT_FAILED` hoặc `CANCELLED`.<br/>2. Số lượng tồn kho không bị trừ (hoặc được hoàn lại trong Transaction).<br/>3. Giỏ hàng của khách hàng được giữ nguyên vẹn để khách không phải chọn món lại từ đầu.<br/>4. Khách hàng nhận được thông báo lỗi rõ ràng kèm lý do (ví dụ: *Tài khoản không đủ số dư*, *Món vừa hết hàng*). |

---

## 3. CÁC LUỒNG SỰ KIỆN CHI TIẾT (FLOW OF EVENTS)

```mermaid
sequenceDiagram
    autonumber
    actor C as Khách hàng / Thành viên
    participant UI as Giao diện Web (Next.js)
    participant API as API Server (NestJS)
    participant DB as PostgreSQL (Prisma)
    participant Pay as Cổng Thanh Toán (Mock)

    C->>UI: 1. Nhấn "Tiến hành đặt hàng" từ Giỏ
    alt Chưa đăng nhập (Không có JWT)
        UI->>C: 2. Hiển thị Modal Đăng nhập / Đăng ký (UC05)
        C->>UI: 3. Nhập tài khoản & Đăng nhập
        UI->>API: 4. POST /auth/login
        API-->>UI: 5. Trả về accessToken (JWT)
    end
    UI->>C: 6. Hiển thị Form Checkout (Họ tên, SĐT tự điền, Phương thức)
    C->>UI: 7. Chọn Ví MoMo & Bấm "Thanh toán ngay"
    UI->>API: 8. POST /orders (Items, Size, Topping; Header: Bearer JWT)
    Note over API: JwtAuthGuard: Xác thực JWT & lấy userId<br/>Kiểm tra DTO & Tính lại giá từ CSDL
    API->>DB: 9. Tạo Order (Trạng thái = PENDING, userId)
    DB-->>API: 10. Trả về Order (#1042)
    API-->>UI: 11. Trả về orderId
    UI->>API: 12. POST /payments (orderId, Idempotency-Key, Method, Bearer JWT)
    API->>Pay: 13. Yêu cầu trừ tiền giả lập
    Pay-->>API: 14. Phản hồi SUCCESS
    Note over API: State Machine: PENDING -> PAID<br/>Optimistic Lock: Trừ stock<br/>Tích điểm Loyalty: total / 10000
    API->>DB: 15. Transaction: Update PAID, trừ stock, tạo Payment, cộng Points
    DB-->>API: 16. Transaction hoàn tất
    API-->>UI: 17. Thanh toán thành công (200 OK)
    UI->>UI: 18. Dọn sạch giỏ hàng (Zustand/LocalStorage)
    UI-->>C: 19. Màn hình Xác nhận (Mã đơn #1042, Điểm tích lũy)
```

### 3.1. Luồng sự kiện chính (Normal / Main Flow)

1. **Khách hàng** duyệt giỏ hàng và nhấn nút **"Tiến hành đặt hàng"**.
2. **Hệ thống** kiểm tra trạng thái xác thực người dùng:
   * **Nếu chưa đăng nhập:** Hệ thống hiển thị Modal Đăng nhập / Đăng ký (`UC05`). Khách hàng đăng nhập thành công, hệ thống lưu chuỗi `accessToken` (JWT) vào phiên làm việc.
   * **Nếu đã đăng nhập:** Hệ thống tự động chuyển tiếp vào màn hình Đặt hàng (Checkout).
3. **Màn hình Đặt hàng (Checkout)** hiển thị các thông tin:
   * Thông tin người nhận: Họ và tên, Số điện thoại từ hồ sơ thành viên (cho phép điều chỉnh).
   * Danh sách tóm tắt các món (Tên, Size, Topping, Ghi chú, Số lượng, Đơn giá).
   * Bảng kê tài chính: Tạm tính, Chiết khấu voucher (nếu có), Tổng tiền thanh toán.
   * Lựa chọn phương thức thanh toán: Ví điện tử MoMo, ZaloPay, VNPay, hoặc Thẻ ngân hàng.
4. **Khách hàng** chọn phương thức thanh toán (ví dụ: Ví MoMo) và nhấn nút **"Xác nhận thanh toán • [Tổng tiền]"**.
5. **Giao diện Client** gửi yêu cầu `POST /orders` kèm theo header `Authorization: Bearer <JWT>` và payload DTO chứa danh sách món lên Backend.
6. **Backend NestJS** thực hiện các bước kiểm tra nghiệp vụ:
   * `JwtAuthGuard` kiểm tra tính hợp lệ của Token JWT và trích xuất `userId` của Thành viên.
   * `ValidationPipe` thẩm định tính hợp lệ của cấu trúc dữ liệu đầu vào.
   * Backend truy vấn CSDL để lấy đơn giá gốc, phụ thu size, giá topping và **tự động tính toán lại tổng tiền trên Server** (chống gian lận sửa giá từ Client).
   * Khởi tạo bản ghi `Order` trong CSDL với trạng thái khởi đầu là `PENDING`, liên kết với `userId` và sinh mã đơn hiển thị (ví dụ: `#1042`).
   * Trả về thông tin đơn hàng vừa tạo (`orderId`) cho Client.
7. **Client** nhận `orderId`, tự động sinh chuỗi mã khóa duy nhất `Idempotency-Key` (chuỗi UUIDv4) và gửi yêu cầu `POST /payments` (kèm JWT Header) lên Backend.
8. **Backend** chuyển tiếp yêu cầu trừ tiền đến **Cổng thanh toán điện tử (Mock Payment Gateway)**.
9. **Cổng thanh toán** xử lý trừ tiền và phản hồi kết quả giao dịch thành công (`status: SUCCESS`, `transactionId: "TXN_..."`).
10. **Backend** thực thi khối lệnh `prisma.$transaction` đảm bảo tính toàn vẹn dữ liệu:
    * Kích hoạt cỗ máy trạng thái (Order State Machine) chuyển trạng thái đơn hàng từ `PENDING` $\rightarrow$ `PAID`.
    * Áp dụng Khóa lạc quan (**Optimistic Locking**) kiểm tra trường `version` và trừ số lượng tồn kho (`stock = stock - qty`) của từng món.
    * Ghi nhận bản ghi thanh toán vào bảng `Payment` với trạng thái `PAID`.
    * Tự động tính và cộng dồn điểm tích lũy vào tài khoản thành viên (`loyaltyPoints = loyaltyPoints + (total / 10000)`, lưu bản ghi `LoyaltyTransaction`).
11. **Backend** phản hồi mã `200 OK` kèm dữ liệu đơn hàng đã thanh toán thành công về Client.
12. **Client** thực hiện dọn sạch giỏ hàng trong bộ nhớ `Zustand` và `localStorage`.
13. **Hệ thống** điều hướng người dùng đến **Màn hình Xác nhận Đơn hàng (Order Success Screen)** hiển thị mã đơn `#1042` to rõ, điểm thưởng vừa tích lũy, trạng thái `ĐÃ THANH TOÁN` kèm thông điệp: *"Mời bạn đến quầy nhận nước sau 5-7 phút"*. Đơn hàng đồng thời được lưu vào trang Lịch sử đơn hàng (`UC09`).

---

### 3.2. Các luồng thay thế (Alternative Flows)

* **A1. Khách hàng chưa đăng nhập tài khoản (Unauthenticated Branch):**
  * Tại bước 2, nếu khách hàng chưa đăng nhập hoặc Token JWT hết hạn, hệ thống hiển thị Modal Đăng nhập / Đăng ký (`UC05`).
  * Khách hàng hoàn tất đăng nhập, hệ thống tự động giữ nguyên các món trong giỏ hàng và chuyển tiếp vào màn hình Checkout mà không làm mất dữ liệu người dùng đã chọn.
* **A2. Khách hàng sử dụng điểm thưởng thành viên giảm giá (Loyalty Redemption Flow):**
  * Tại bước 3, hệ thống hiển thị số điểm thưởng hiện có trong tài khoản thành viên.
  * Khách hàng tích chọn *"Dùng điểm thưởng giảm giá"* (ví dụ: 50 điểm = giảm 50.000đ). Tổng tiền thanh toán được trừ đi tương ứng trước khi gọi thanh toán.
* **A3. Khách hàng áp dụng mã Voucher ưu đãi (Voucher Flow):**
  * Tại bước 2, khách hàng nhập mã khuyến mãi (ví dụ: `BREWLITEFIRST`, `COFFEELOVER`) vào ô voucher và nhấn *"Áp dụng"*.
  * Hệ thống gọi `GET /vouchers/validate?code=...` để kiểm tra tính hợp lệ: hạn dùng, trạng thái hoạt động, giá trị đơn hàng tối thiểu.
  * Nếu hợp lệ, hệ thống trừ số tiền chiết khấu vào mục `Giảm giá Voucher` và tính lại tổng tiền.
* **A4. Xử lý yêu cầu gửi lặp lại do mạng gián đoạn (Idempotent Flow):**
  * Nếu khách hàng vô tình bấm nút *"Thanh toán"* 2 lần liên tiếp hoặc đường truyền mạng bị ngắt quãng khiến Client gửi lại request `POST /payments` có cùng `Idempotency-Key`.
  * `PaymentsService.processPayment` kiểm tra khóa duy nhất `Payment.idempotencyKey` trong CSDL và phát hiện khóa này đã được xử lý trước đó.
  * Backend **không trừ tiền lần thứ hai**, mà trả về ngay lập tức kết quả giao dịch đã lưu trước đó kèm mã `200 OK`.

---

### 3.3. Các luồng ngoại lệ & Xử lý sự cố (Exception Flows)

* **E1. Món ăn bị người khác mua hết trước khi thanh toán (Concurrency / Out of Stock):**
  * **Xảy ra tại:** Bước 6 (khi tạo đơn) hoặc Bước 10 (khi trừ tồn kho).
  * **Xử lý:** Backend phát hiện `stock < quantity` hoặc tranh chấp phiên bản Optimistic Lock (`version` không khớp). Transaction tự động bị Rollback, ném ngoại lệ `409 Conflict`.
  * **Phản hồi UI:** Hệ thống hiển thị thông báo: *"Rất tiếc! Món [Tên món] vừa hết hàng do có nhiều người cùng đặt. Vui lòng kiểm tra lại giỏ hàng."*, giỏ hàng được giữ nguyên để khách hàng đổi món khác.
* **E2. Dữ liệu thông tin đặt hàng không hợp lệ (Validation Error):**
  * **Xảy ra tại:** Bước 5 (Client gửi payload sai/thiếu).
  * **Xử lý:** Bộ lọc `ValidationPipe` phát hiện Số điện thoại không đúng 10 chữ số hoặc danh sách món bị rỗng. Backend trả về `400 Bad Request`.
  * **Phản hồi UI:** Form Checkout bôi đỏ trường nhập liệu bị sai và hiển thị thông báo lỗi cụ thể (ví dụ: *"Số điện thoại phải gồm 10 chữ số hợp lệ"*).
* **E3. Giao dịch thanh toán bị từ chối hoặc người dùng hủy thanh toán (Payment Failed):**
  * **Xảy ra tại:** Bước 9 (Cổng thanh toán phản hồi).
  * **Xử lý:** Cổng thanh toán trả về `status: FAILED` (do tài khoản không đủ số dư, nhập sai mã OTP, hoặc người dùng hủy giao dịch).
  * **State Machine:** Backend chuyển trạng thái đơn hàng sang `PAYMENT_FAILED`.
  * **Phản hồi UI:** Hệ thống hiển thị Modal cảnh báo lỗi thanh toán, **tuyệt đối không xóa giỏ hàng**, đồng thời cung cấp nút *"Thử lại"* hoặc *"Chọn phương thức thanh toán khác"*.
* **E4. Mất kết nối Cổng thanh toán (Gateway Timeout / Network Error):**
  * **Xảy ra tại:** Bước 8 (Gọi sang Gateway nhưng không nhận được phản hồi sau 10 giây).
  * **Xử lý:** Backend ghi nhận log cảnh báo sự cố kết nối, giữ nguyên đơn hàng ở trạng thái `PENDING` và trả về `504 Gateway Timeout`.
  * **Phản hồi UI:** Hệ thống báo lỗi đường truyền và hướng dẫn khách kiểm tra lại lịch sử đơn hàng hoặc liên hệ nhân viên quầy để đối soát.
* **E5. Vi phạm quy tắc chuyển đổi trạng thái (State Machine Violation):**
  * **Xảy ra khi:** Có request cố tình chuyển đơn hàng từ trạng thái không hợp lệ (ví dụ: từ `CANCELLED` mà đòi sang `PAID`).
  * **Xử lý:** Hàm kiểm soát nghiệp vụ `assertTransition` ném lỗi `BadRequestException`: *"Không thể chuyển trạng thái đơn hàng từ CANCELLED sang PAID"*.

---

## 4. BẢNG TIÊU CHÍ CHẤP NHẬN (ACCEPTANCE CRITERIA - AC) ĐỂ VIẾT TEST

Bảng này cung cấp các kịch bản kiểm thử theo cấu trúc chuẩn `Given - When - Then`, trực tiếp phục vụ cho việc viết **Unit Test, Integration Test và E2E Test** ở Task 5.2:

```
┌────────────────────────────────────────────────────────────────────────┐
│                              TEST SUITE                                │
├───────────────┬────────────────────────────────────────────────────────┤
│ TC-CORE-01    │ Luồng thanh toán MoMo thành công (Happy Path)          │
│ TC-CORE-02    │ Kiểm soát trừ tiền lặp lại (Idempotency Key)           │
│ TC-CORE-03    │ Xử lý thanh toán thất bại (Payment Failed)             │
│ TC-CORE-04    │ Tranh chấp tồn kho đồng thời (Optimistic Locking)       │
│ TC-CORE-05    │ Tự động tính giá phía Server chống can thiệp Client    │
└───────────────┴────────────────────────────────────────────────────────┘
```

| Mã kịch bản | Tên kịch bản kiểm thử | Given (Tiền đề) | When (Hành động) | Then (Kết quả kỳ vọng) |
| :---: | :--- | :--- | :--- | :--- |
| **AC-CORE-01** | **Đặt hàng & Thanh toán thành công (Happy Path)** | Khách hàng đã đăng nhập tài khoản thành viên, có 2 món trong giỏ. | Nhấn *"Xác nhận thanh toán"* qua cổng Ví MoMo giả lập. | - Đơn hàng gắn với `userId`, chuyển sang `PAID`.<br/>- Tồn kho các món giảm tương ứng.<br/>- Tích lũy điểm thưởng thành viên.<br/>- Giỏ hàng rỗng.<br/>- Trả về mã đơn `#1042` kèm thời gian chờ 5-7 phút. |
| **AC-CORE-02** | **Bảo vệ tính lũy thừa (Idempotency)** | Một đơn hàng `orderId` đang ở trạng thái `PENDING` và đã gửi request thanh toán có `Idempotency-Key: KEY-123`. | Client gửi tiếp request thứ hai có cùng `Idempotency-Key: KEY-123`. | - Hệ thống phát hiện khóa trùng lặp.<br/>- Chỉ thực hiện trừ tiền đúng 1 lần duy nhất.<br/>- Cả 2 request đều nhận được kết quả `200 OK`. |
| **AC-CORE-03** | **Thanh toán thất bại giữ nguyên giỏ hàng** | Khách hàng thực hiện thanh toán với tài khoản giả lập không đủ số dư. | Cổng thanh toán phản hồi `status: FAILED`. | - Đơn hàng chuyển sang `PAYMENT_FAILED`.<br/>- Tồn kho không bị trừ.<br/>- Giỏ hàng của khách hàng trên giao diện **được giữ nguyên** để chọn lại phương thức. |
| **AC-CORE-04** | **Kiểm soát bán âm tồn kho (Concurrency)** | Món Trà đào chỉ còn `stock = 1`, `version = 1`. Hai khách hàng A và B cùng bấm thanh toán cùng một phần nghìn giây. | Cả hai request gọi cập nhật tồn kho đồng thời trong transaction. | - Khách hàng A thành công: `stock = 0`, `version = 2`.<br/>- Khách hàng B thất bại do không khớp `version`: nhận lỗi `409 Conflict`, không bị trừ tiền oan. |
| **AC-CORE-05** | **Bảo mật tính giá trên Server (Tamper-proof)** | Kẻ gian can thiệp mã nguồn Client sửa giá ly cà phê từ `35.000đ` thành `1.000đ`. | Gửi payload gian lận `POST /orders` lên Backend. | - Backend bỏ qua giá gửi lên từ Client.<br/>- Backend tự truy vấn giá gốc từ CSDL và tính đúng `35.000đ`.<br/>- Số tiền trong hóa đơn thanh toán là `35.000đ`. |

---

## 5. MA TRẬN LIÊN KẾT TRUY VẾT YÊU CẦU (TRACEABILITY MAPPING)

Use case trọng tâm này kết nối trực tiếp với các mã định danh yêu cầu trong tài liệu [system-requirements-matrix.md](system-requirements-matrix.md):

| Nhóm yêu cầu | Mã định danh | Tên yêu cầu cụ thể | Thành phần hiện thực trong dự án |
| :--- | :--- | :--- | :--- |
| **Chức năng (FR)** | `FR-02` | Tùy biến đồ uống (Size, Topping, Ghi chú) | `ProductDetailModal.tsx` |
| | `FR-03` | Quản lý giỏ hàng phía Client | `useCartStore` (Zustand), `localStorage` |
| | `FR-04` | Xác thực tài khoản thành viên (JWT) | `POST /auth/login`, `JwtAuthGuard` |
| | `FR-05` | Khởi tạo đơn hàng (Server Calculation & JWT Guard) | `POST /orders`, `OrdersService.createOrder` |
| | `FR-06` | Thanh toán trực tuyến Idempotent | `POST /payments`, `PaymentsService.processPayment` (`idempotencyKey`) |
| | `FR-07` | Cỗ máy trạng thái đơn hàng | `order-state-machine.ts` (`assertTransition`), `OrderStatus` |
| | `FR-08` | Kiểm soát tồn kho tranh chấp | `Optimistic Locking` (`Product.version`), `prisma.$transaction` |
| | `FR-09` | Tích lũy điểm thưởng thành viên | `PaymentsService.calculateLoyaltyPoints`, `User.loyaltyPoints` |
| | `FR-10` | Xem lịch sử đơn hàng (dành cho Member) | `OrderHistoryModal.tsx`, `GET /orders/me` |
| | `FR-11` | Áp dụng mã Voucher giảm giá | `GET /vouchers/validate` (`VouchersService`) |
| **Phi chức năng (NFR)** | `NFR-01` | Hiệu năng phản hồi API $\le 500\text{ ms}$ | Prisma Connection Pooling, Stateless REST API |
| | `NFR-02` | Bảo mật giao dịch & Idempotent Header | HTTPS/TLS, JWT Guard, UUIDv4 Idempotency Key |
| | `NFR-03` | Trải nghiệm Mobile-first & Skeleton | Tailwind CSS v4, Lucide React Icons |
| | `NFR-04` | Toàn vẹn dữ liệu ACID & Server Calculation | PostgreSQL Transaction, Optimistic Concurrency Control |
| | `NFR-06` | CI/CD Quality Gate kiểm thử tự động | GitHub Actions (`.github/workflows/ci.yml`) |
| | `NFR-07` | Mã nguồn sạch, không viết comment giải thích | Tuân thủ tuyệt đối [AGENTS.md](../../AGENTS.md) |
