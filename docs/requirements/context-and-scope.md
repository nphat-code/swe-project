# 📑 TÀI LIỆU BỐI CẢNH, STAKEHOLDER VÀ PHẠM VI HỆ THỐNG (CONTEXT & SCOPE)
## Dự án: BrewLite — Hệ thống đặt đồ uống không dùng tiền mặt (Cashless Coffee Ordering System)

---

> **Cơ sở đào tạo:** Trường Đại học Sài Gòn — Khoa Công nghệ Thông tin  
> **Môn học:** Công nghệ Phần mềm (Software Engineering)  
> **Học kỳ:** I — Năm học 2026–2027  
> **Hạng mục:** Assignment 2 — Task 1.1: Bối cảnh, Stakeholder và Phạm vi  
> **Phiên bản:** v1.0  
> **Tác giả:** Nhóm phát triển BrewLite  

---

## 1. BỐI CẢNH DỰ ÁN & VẤN ĐỀ NGHIỆP VỤ (BUSINESS CONTEXT & PROBLEM STATEMENT)

### 1.1. Bối cảnh thực tế (Business Context)
Trong mô hình vận hành của các chuỗi đồ uống, quán cà phê hiện đại tại các khu vực trường đại học, tòa nhà văn phòng và trung tâm thương mại, lượng khách hàng thường tập trung đột biến vào các khung giờ cao điểm (sáng sớm từ 7:30 - 9:00 và giờ nghỉ trưa từ 11:30 - 13:00). 

Phương thức vận hành truyền thống dựa trên việc khách hàng xếp hàng tại quầy thu ngân, gọi món trực tiếp bằng miệng và thanh toán bằng tiền mặt/quẹt thẻ POS tại chỗ đang bộc lộ những hạn chế nghiêm trọng.

### 1.2. Ba nút thắt cổ chai cốt lõi (Core Bottlenecks)

```mermaid
flowchart TD
    A[Vận hành truyền thống tại quầy] --> B[Nút thắt 1: Xếp hàng kéo dài\nThời gian chờ 10-20 phút\nKhách hàng bỏ về giờ cao điểm]
    A --> C[Nút thắt 2: Sai sót gọi món\nNhầm size, topping, đường/đá\nÁp lực tiếng ồn quầy bar]
    A --> D[Nút thắt 3: Thanh toán tiền mặt\nĐếm tiền, thối tiền lẻ chậm\nRủi ro thất thoát sổ sách]
```

1. **Nút thắt 1: Thời gian xếp hàng kéo dài (Queue Bottleneck):**
   * Khách hàng phải mất từ 10 đến 20 phút chỉ để di chuyển theo hàng đợi, gọi món và chờ in hóa đơn.
   * Tỷ lệ khách hàng quyết định bỏ đi (churn rate) vào giờ cao điểm ước tính lên đến 15% - 25% do không kịp giờ làm việc/học tập.
2. **Nút thắt 2: Sai sót thông tin đơn đồ uống (Order Inaccuracy):**
   * Đồ uống hiện đại có mức độ cá nhân hóa rất cao (kích cỡ S/M/L, lựa chọn lượng đường, đá, và nhiều loại topping kèm theo).
   * Việc giao tiếp bằng miệng trong không gian ồn ào giờ cao điểm dễ dẫn đến nhầm lẫn khi thu ngân gõ lại vào máy POS, gây lãng phí nguyên liệu pha chế lại và trải nghiệm tiêu cực cho khách hàng.
3. **Nút thắt 3: Nghẽn thanh toán & Rủi ro dòng tiền mặt (Cash Handling Inefficiency):**
   * Việc kiểm đếm tiền mặt, trả lại tiền thối gây tiêu tốn trung bình từ 45 - 90 giây cho mỗi giao dịch tại quầy.
   * Quản lý tiền mặt tại quầy tạo áp lực đối soát cuối ca và nguy cơ thất thoát doanh thu.

### 1.3. Mục tiêu giải pháp & Chỉ số kỳ vọng (Business Goals & KPIs)
Hệ thống **BrewLite** ra đời với sứ mệnh số hóa toàn bộ trải nghiệm đặt món và thanh toán của khách hàng:

* **Mục tiêu 1:** Rút ngắn thời gian từ lúc chọn món đến khi hoàn tất thanh toán xuống **dưới 60 giây**.
* **Mục tiêu 2:** Triệt tiêu **100% sai sót** trong việc truyền đạt thông tin kích cỡ và danh sách topping nhờ vào giao diện trực quan và dữ liệu số hóa trực tiếp.
* **Mục tiêu 3:** Chuyển đổi **100% giao dịch sang hình thức không tiền mặt (Cashless)** thông qua Ví điện tử, thẻ nội địa/quốc tế và tài khoản thành viên.
* **Mục tiêu 4:** Tối ưu hóa năng suất quầy Barista thông qua mã nhận đồ uống điện tử đồng bộ tức thì khi đơn hàng được thanh toán thành công.

---

## 2. PHÂN TÍCH CÁC BÊN LIÊN QUAN (STAKEHOLDER MATRIX)

Hệ thống BrewLite tương tác và phục vụ 6 nhóm đối tượng liên quan trọng yếu:

| STT | Nhóm Stakeholder | Phân loại | Vai trò trong hệ thống | Mục tiêu & Kỳ vọng cốt lõi |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Khách hàng (Customer / Member)** | Tác nhân chính (Primary Actor) | Người dùng trực tiếp truy cập ứng dụng web trên điện thoại/máy tính, duyệt menu, tùy biến đồ uống, thanh toán và nhận nước. | - Giao diện trực quan, tải nhanh trên di động.<br/>- Tùy biến size/topping dễ dàng, tính tiền realtime.<br/>- Thanh toán tức thì, an toàn không bị trừ tiền 2 lần.<br/>- Có mã nhận nước rõ ràng và được tích điểm thưởng. |
| **2** | **Nhân viên quầy (Barista / Staff)** | Tác nhân nghiệp vụ (Secondary Actor) | Tiếp nhận các đơn hàng đã thanh toán (`PAID`), thực hiện pha chế theo đúng công thức topping/size và bàn giao cho khách. | - Thông tin đơn hàng hiển thị chuẩn xác, không bị nhầm lẫn topping.<br/>- Thao tác cập nhật trạng thái đơn tinh gọn (`PREPARING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED`).<br/>- Không phải xử lý tiền mặt tại quầy pha chế. |
| **3** | **Quản lý cửa hàng (Store Manager / PO)** | Tác nhân quản trị (Management Actor) | Theo dõi tình hình kinh doanh, quản lý danh mục món, cấu hình tồn kho nguyên liệu và giám sát chất lượng dịch vụ. | - Nắm bắt dữ liệu đơn hàng và doanh thu theo thời gian thực.<br/>- Cập nhật giá và trạng thái còn/hết món tức thì.<br/>- Giảm thiểu thất thoát doanh thu và tối ưu nhân sự quầy. |
| **4** | **Giảng viên hướng dẫn & Nghiệm thu** | Tác nhân học thuật (Assessor Actor) | Đánh giá tính chuẩn mực về quy trình Công nghệ Phần mềm, kiến trúc hệ thống và chất lượng sản phẩm bàn giao. | - Tuân thủ quy trình Agile Scrum có bằng chứng rõ ràng.<br/>- Đặc tả SRS chuẩn, mô hình hóa UML (Activity, Sequence, Class, Deployment) chính xác.<br/>- Code sạch (Clean Code), **tuyệt đối không có comment rác** trong mã nguồn.<br/>- CI/CD tự động và triển khai Production thực tế. |
| **5** | **Nhóm phát triển (Development Team)** | Tác nhân kỹ thuật (Technical Actor) | Phân tích, thiết kế kiến trúc, lập trình fullstack, kiểm thử tự động và vận hành hạ tầng đám mây. | - Cấu trúc Monorepo thống nhất, phân tách rõ Frontend/Backend.<br/>- Sử dụng công nghệ hiện đại (Next.js, NestJS, Prisma, PostgreSQL).<br/>- Cơ chế kiểm soát đồng thời (Optimistic Locking) và Idempotency vững chắc.<br/>- Pipeline CI/CD tự động kiểm soát chất lượng code. |
| **6** | **Đơn vị cổng thanh toán (Payment Provider / Mock)** | Tác nhân hệ thống ngoài (System Actor) | Dịch vụ giả lập cổng thanh toán trực tuyến (MoMo, VNPay, Thẻ ngân hàng) tiếp nhận và xử lý giao dịch. | - Xử lý an toàn với `Idempotency-Key` (bất biến lặp).<br/>- Phản hồi mã trạng thái rõ ràng (`SUCCESS` / `FAILED`).<br/>- Độ trễ phản hồi thấp (< 500ms). |

### Ma trận Quyền hạn & Mức độ quan tâm (Power / Interest Grid)

```mermaid
quadrantChart
    title Ma trận Phân tích Stakeholder (Power vs Interest)
    x-axis "Mức độ quan tâm (Interest): Thấp" --> "Mức độ quan tâm: Cao"
    y-axis "Mức độ ảnh hưởng (Power): Thấp" --> "Mức độ ảnh hưởng: Cao"
    quadrant-1 "Hợp tác chặt chẽ (Manage Closely)"
    quadrant-2 "Giữ hài lòng (Keep Satisfied)"
    quadrant-3 "Giám sát tối thiểu (Monitor)"
    quadrant-4 "Cung cấp thông tin (Keep Informed)"
    "Giảng viên nghiệm thu": [0.88, 0.92]
    "Quản lý cửa hàng / PO": [0.82, 0.85]
    "Đơn vị cổng thanh toán": [0.35, 0.72]
    "Nhóm phát triển (Dev)": [0.90, 0.45]
    "Khách hàng (Customer)": [0.85, 0.38]
    "Nhân viên Barista": [0.75, 0.32]
```

---

## 3. PHÂN ĐỊNH PHẠM VI HỆ THỐNG (SYSTEM SCOPE)

Để đảm bảo dự án hoàn thành đúng tiến độ và đạt chất lượng cao nhất trong khuôn khổ **Assignment 2 (10 điểm)**, phạm vi hệ thống được phân định minh bạch thành 3 phân vùng:

```mermaid
flowchart LR
    subgraph InScope [1. Trong phạm vi MVP - In-Scope]
        direction TB
        IS1[Duyệt Menu & Tùy biến Size/Topping]
        IS2[Quản lý giỏ hàng Zustand + LocalStorage]
        IS3[Xác thực JWT & Băm mật khẩu Bcrypt]
        IS4[Tạo đơn Server-side Calculation]
        IS5[Thanh toán Idempotent Mock MoMo/VNPay]
        IS6[Order State Machine & Optimistic Locking]
        IS7[Tích điểm Loyalty & Mã nhận nước #1042]
        IS8[Docker Compose & Triển khai Cloud HTTPS]
    end

    subgraph FutureScope [2. Mở rộng tương lai - Future Scope]
        direction TB
        FS1[Màn hình KDS quầy bar qua WebSocket]
        FS2[Cổng thanh toán thực VietQR / MoMo API]
        FS3[Ứng dụng Mobile Native React Native/Flutter]
        FS4[Thông báo đẩy Push Notification]
    end

    subgraph OutOfScope [3. Ngoài phạm vi - Out-of-Scope]
        direction TB
        OS1[Giao hàng tận nơi - Delivery Logistics]
        OS2[Thanh toán bằng tiền mặt tại quầy]
        OS3[Hệ thống kế toán doanh nghiệp ERP phức tạp]
    end
```

### 3.1. Phạm vi trong MVP (In-Scope — Nghiệm thu Assignment 2)
1. **Phân hệ Khách hàng (Customer Portal - Web App / Mobile-First):**
   * Xem danh mục đồ uống dạng Tabs (Cà phê, Trà, Đá xay, Bánh ngọt).
   * Lọc và tìm kiếm đồ uống theo thời gian thực.
   * Modal chi tiết sản phẩm: chọn kích cỡ ly (S: +0đ, M: +5.000đ, L: +10.000đ) và danh sách topping (Trân châu trắng, Kem cheese, Sương sáo,...), cập nhật tổng giá realtime.
   * Quản lý giỏ hàng: thêm/bớt/xóa món, tự động gộp món có cùng cấu hình size/topping, lưu giỏ hàng vào `localStorage` của trình duyệt.
   * Đăng ký và đăng nhập tài khoản thành viên bảo mật bằng JWT và mật khẩu băm `bcrypt`.
   * Khởi tạo đơn hàng trực tuyến (`POST /orders`) với tính toán lại giá từ CSDL (Server-side price verification) chống gian lận.
   * Thanh toán trực tuyến không dùng tiền mặt (Mock Payment Gateway) kèm mã `Idempotency-Key` chống trừ tiền lặp.
   * Màn hình thông báo đặt hàng thành công hiển thị mã nhận nước điện tử (ví dụ: `#1042`) và hướng dẫn đến quầy nhận món sau 5–7 phút.
   * Tra cứu lịch sử các đơn hàng đã đặt của tài khoản cá nhân (`GET /orders/me`).
2. **Nghiệp vụ Backend chuyên sâu (Backend Core Architecture):**
   * Cỗ máy trạng thái đơn hàng (Order State Machine) kiểm soát chu trình sống của đơn (`PENDING` $\rightarrow$ `PAID` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED`).
   * Kiểm soát tranh chấp tồn kho đồng thời (Concurrency Control) bằng kỹ thuật Khóa lạc quan (Optimistic Locking) với trường `version`.
   * Tự động tích lũy điểm thưởng thành viên (`loyaltyPoints`) khi đơn chuyển sang `PAID`.
3. **Kiểm thử, Đóng gói & Triển khai (DevOps & Delivery):**
   * Đóng gói toàn bộ hệ thống bằng `docker-compose.yml` (Frontend Next.js, Backend NestJS, Database PostgreSQL).
   * Endpoint giám sát sức khỏe `GET /health` kiểm tra kết nối API và CSDL.
   * Triển khai hoàn chỉnh trên môi trường Cloud thực tế (Vercel/Render/Neon) với giao thức HTTPS an toàn.

### 3.2. Phạm vi mở rộng tương lai (Future Scope — Phase 2)
* Màn hình chuyên dụng cho Barista tại quầy (Kitchen Display System - KDS) đồng bộ đơn thời gian thực thông qua kết nối WebSocket/SSE.
* Tích hợp trực tiếp với cổng thanh toán thực tế thông qua MoMo Open API hoặc VietQR Dynamic.
* Ứng dụng di động cài đặt trực tiếp (Native Mobile App) sử dụng React Native hoặc Flutter kèm tính năng Push Notification thông báo khi nước đã sẵn sàng.

### 3.3. Các nội dung không thực hiện (Out-of-Scope)
* **Giao hàng tận nhà (Delivery Logistics):** Hệ thống không bao gồm quản lý tài xế, tính phí ship hoặc lộ trình vận chuyển. BrewLite hoàn toàn tập trung vào mô hình khách đặt trước và tự lấy tại quầy (Takeaway / In-store Pickup).
* **Thanh toán tiền mặt:** Hệ thống định vị là giải pháp không tiền mặt (Cashless), do đó không có luồng thu tiền mặt hay thối tiền tại quầy.
* **Hệ thống kế toán - tiền lương doanh nghiệp (ERP):** Không bao gồm quản lý tài sản cố định, bảng lương nhân viên, khấu hao nguyên vật liệu chi tiết.

---

## 4. BẢNG GIẢ ĐỊNH & RÀNG BUỘC (ASSUMPTIONS & CONSTRAINTS)

### 4.1. Bảng giả định (Assumptions)
| Mã | Giả định | Mô tả chi tiết |
| :---: | :--- | :--- |
| **ASM-01** | Thiết bị người dùng | Khách hàng sở hữu thiết bị thông minh (Smartphone, Laptop, Tablet) có trình duyệt web hiện đại (Chrome, Safari, Edge) và kết nối Internet ổn định. |
| **ASM-02** | Phương thức thanh toán | Khách hàng có khả năng sử dụng các phương thức không tiền mặt (Ví điện tử MoMo, ZaloPay, Thẻ ngân hàng có Internet Banking). |
| **ASM-03** | Khung giờ hoạt động quầy | Quán cà phê duy trì kết nối mạng ổn định tại quầy Barista trong toàn bộ thời gian mở cửa để tiếp nhận thông tin đơn hàng. |
| **ASM-04** | Hạ tầng Cloud | Các nhà cung cấp đám mây miễn phí/sinh viên (Vercel, Render, Neon PostgreSQL) duy trì uptime đủ để phục vụ quá trình chấm bài và demo. |

### 4.2. Bảng ràng buộc (Constraints)
| Mã | Phân loại | Ràng buộc cụ thể |
| :---: | :--- | :--- |
| **CST-01** | Công nghệ Frontend | Sử dụng Next.js (App Router), TypeScript và Tailwind CSS. Tuân thủ thiết kế Mobile-first responsive. |
| **CST-02** | Công nghệ Backend | Sử dụng NestJS Framework (TypeScript), tuân thủ kiến trúc phân tầng (Controller - Service - Module - DTO - Entity). |
| **CST-03** | Cơ sở dữ liệu | Sử dụng hệ quản trị CSDL quan hệ PostgreSQL, truy xuất dữ liệu thông qua Prisma ORM có cơ chế Migration. |
| **CST-04** | Quy định viết mã nguồn | **Tuyệt đối không viết bất kỳ comment giải thích nào trong các file mã nguồn** (`.ts`, `.tsx`, `.js`, `.css`). Code phải tự tường minh (Self-documenting code). |
| **CST-05** | Quy chuẩn Git & Bàn giao | Làm xong task nào phải commit chuẩn Conventional Commits và thực thi `git push` lên repository ngay lập tức. |
| **CST-06** | Môi trường triển khai | Cung cấp file cấu hình `docker-compose.yml` để chạy cục bộ và triển khai ít nhất 1 phiên bản chạy thực tế trên Cloud hỗ trợ giao thức HTTPS. |

---

## 5. MA TRẬN RỦI RO BAN ĐẦU & BIỆN PHÁP GIẢM THIỂU (RISK ASSESSMENT & MITIGATION)

| Mã | Tên rủi ro | Mức độ | Khả năng | Biện pháp kỹ thuật giảm thiểu (Mitigation Strategy) |
| :---: | :--- | :---: | :---: | :--- |
| **RSK-01** | **Bán âm tồn kho (Stock Overselling)**<br/>Nhiều khách hàng cùng bấm đặt món cuối cùng tại cùng một thời điểm. | `Nghiêm trọng` | `Trung bình` | Áp dụng kỹ thuật **Optimistic Locking** thông qua trường `version` trong bảng `Product`. Kết hợp mệnh đề kiểm tra điều kiện `stock >= quantity` trong một Database Transaction duy nhất. Nếu xảy ra xung đột phiên bản, hệ thống rollback và trả về `409 Conflict`. |
| **RSK-02** | **Trừ tiền trùng lặp (Double Charging)**<br/>Khách bấm nút thanh toán nhiều lần do mạng chập chờn. | `Nghiêm trọng` | `Cao` | Bắt buộc client sinh chuỗi ngẫu nhiên duy nhất `Idempotency-Key` (UUIDv4) gửi trong HTTP Header. Backend lưu khóa này cùng kết quả giao dịch; nếu nhận lại key trùng lặp, trả về ngay kết quả đã lưu mà không gọi trừ tiền lần hai. |
| **RSK-03** | **Gian lận đơn giá từ Client (Price Tampering)**<br/>Người dùng cố tình sửa giá tiền trong payload gửi lên API. | `Nghiêm trọng` | `Thấp` | **Server-side Calculation:** Backend hoàn toàn không tin tưởng đơn giá hay tổng tiền từ client gửi lên. API chỉ nhận `productId`, `sizeOptionId` và `toppingIds`, sau đó tự truy vấn CSDL để tính toán lại 100% tổng tiền hợp lệ. |
| **RSK-04** | **Database Cold-Start Timeout**<br/>Cơ sở dữ liệu miễn phí trên Cloud rơi vào trạng thái ngủ đông (Sleep mode). | `Trung bình` | `Cao` | Client cài đặt cơ chế tự động thử lại (Retry logic) với thuật toán Exponential Backoff khi gặp mã lỗi 500/503. Backend cấu hình Connection Pooling tối ưu qua Prisma Direct URL. |
| **RSK-05** | **Nhảy cóc trạng thái đơn (Invalid State Transition)**<br/>Đơn hàng chưa thanh toán bị chuyển nhầm sang pha chế hoặc hoàn tất. | `Cao` | `Trung bình` | Xây dựng cỗ máy trạng thái hữu hạn (Order State Machine) được đóng gói trong hàm `assertTransition`. Mọi hành động chuyển trạng thái vi phạm đồ thị hợp lệ sẽ bị ném lỗi `400 Bad Request` ngay lập tức. |

---

*Tài liệu này là căn cứ pháp lý và kỹ thuật chính thức cho Task 1.1 của Dự án BrewLite.*
