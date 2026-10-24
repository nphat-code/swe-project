# ADR 002: Lựa Chọn Next.js App Router, PWA Và Zustand Store

## Trạng thái (Status)
**Đã phê duyệt (Accepted)** — Ngày: 2026-10-24

## Bối cảnh (Context)
BrewLite định hướng là ứng dụng đặt đồ uống không dùng tiền mặt (Cashless Ordering) tại quán cà phê. Khách hàng sử dụng điện thoại thông minh để quét mã QR tại bàn/quầy, duyệt thực đơn và đặt nước ngay lập tức.  
Yêu cầu đặt ra:
1. Trải nghiệm tức thì không bắt buộc người dùng phải tải và cài ứng dụng cồng kềnh từ App Store / Google Play.
2. Tốc độ tải trang bước đầu cực nhanh (FCP $\le 1.8\text{s}$ theo `NFR-01`).
3. Giỏ hàng và tùy chọn món phải được bảo toàn ngay cả khi mất sóng nhẹ, chưa đăng nhập, hoặc thanh toán không thành công.

## Quyết định (Decision)
1. **Next.js (App Router) với React Server Components (RSC):**
   - Server Components render HTML thực đơn tĩnh từ máy chủ, giảm lượng JavaScript gửi về client.
   - Client Components phụ trách các thành phần tương tác: Cart Drawer, Modal tùy biến đồ uống, Form thanh toán.
2. **Progressive Web App (PWA):**
   - Cung cấp `manifest.json` và Service Worker để người dùng có thể "Thêm vào màn hình chính" (Add to Home Screen) như ứng dụng Native.
3. **Zustand Store cho Quản lý giỏ hàng (`useCartStore`):**
   - Lưu trữ state giỏ hàng phía Client, tự động sync vào `localStorage`.
   - Giữ nguyên trạng thái khi người dùng chuyển hướng sang luồng đăng nhập (`UC05`) hoặc đổi phương thức thanh toán sau khi bị từ chối (`UC07`).

## Hệ quả & Đánh đổi (Consequences & Trade-offs)

### Ưu điểm (Pros):
* Khởi động nhanh, tối ưu hóa kích thước bundle.
* Trải nghiệm mượt mà, chạm ngón tay tối ưu (Touch target $\ge 48\text{px}$).
* Giải quyết triệt để vấn đề mất giỏ hàng khi người dùng chưa đăng nhập.

### Hạn chế (Cons) & Giải pháp giảm thiểu:
* **Hạn chế:** Cần quản lý ranh giới rõ ràng giữa Server Components và Client Components để tránh lỗi hydration mismatch.
* **Giải pháp:** Tách biệt rõ ràng các component tĩnh (`ProductCardStatic`) và component động (`AddToCartButton`, `CartDrawer`).
