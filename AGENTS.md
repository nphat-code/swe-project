# Quy định dự án (Project Rules)

## 🚀 Quy tắc Git & Bàn giao
- **Làm xong phần nào push phần đó lên ngay lập tức**:
  - Khi hoàn thành bất kỳ task, tính năng, màn hình, hoặc module nào (theo từng task 1 -> 10 hoặc các phần việc cụ thể), phải kiểm tra chạy tốt, tạo commit với message rõ ràng và chạy lệnh `git push origin <branch>` ngay lập tức.
  - Không được trì hoãn hay gộp nhiều task vào 1 lần push trừ khi người dùng yêu cầu rõ ràng.
- **Tiêu chuẩn Commit**:
  - Viết commit message theo chuẩn Conventional Commits (ví dụ: `feat: ...`, `fix: ...`, `chore: ...`).
  - Luôn đảm bảo `.gitignore` chặt chẽ, không commit `node_modules`, build artifacts (`.next`, `dist`), hoặc file biến môi trường bí mật `.env`.

## 🚫 Quy tắc viết code
- **Tuyệt đối không comment trong code**:
  - Không viết bất kỳ comment giải thích, chú thích, ghi chú nào trong các file mã nguồn (`.ts`, `.tsx`, `.js`, `.css`,...).
  - Code phải tự tường minh (Self-documenting code) bằng cách đặt tên biến, hàm, kiểu dữ liệu, component rõ nghĩa và chuẩn chỉ.
  - Không để lại code thừa bị comment (`commented-out code`).

## 📄 Căn cứ yêu cầu đề tài (Single Source of Truth)
- **Tuyệt đối tuân thủ tệp Markdown đề bài gốc**:
  - Toàn bộ nội dung yêu cầu, tiêu chuẩn kỹ thuật, phân bổ điểm (5 Tasks x 2.0đ) và checklist 9.1 của Assignment 2 được lưu trữ nguyên bản tại [`docs/DE_BAI_ASSIGNMENT_2_GOC.md`](docs/DE_BAI_ASSIGNMENT_2_GOC.md).
  - Mọi hoạt động khai thác yêu cầu, mô hình hóa, thiết kế kiến trúc, lập trình Sprint 1 & 2, kiểm thử và nghiệm thu bắt buộc phải căn cứ trực tiếp vào tệp [`docs/DE_BAI_ASSIGNMENT_2_GOC.md`](docs/DE_BAI_ASSIGNMENT_2_GOC.md).
  - **Không bao giờ cần đọc, decode hay chạy script trích xuất lại từ tệp `Assignment2-BrewLite.pdf` nữa**.


