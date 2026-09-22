# Quy định dự án (Project Rules)

## 🚀 Quy tắc Git & Bàn giao
- **Làm xong phần nào push phần đó lên ngay lập tức**:
  - Khi hoàn thành bất kỳ task, tính năng, màn hình, hoặc module nào (theo từng task 1 -> 10 hoặc các phần việc cụ thể), phải kiểm tra chạy tốt, tạo commit với message rõ ràng và chạy lệnh `git push origin <branch>` ngay lập tức.
  - Không được trì hoãn hay gộp nhiều task vào 1 lần push trừ khi người dùng yêu cầu rõ ràng.
- **Tiêu chuẩn Commit**:
  - Viết commit message theo chuẩn Conventional Commits (ví dụ: `feat: ...`, `fix: ...`, `chore: ...`).
  - Luôn đảm bảo `.gitignore` chặt chẽ, không commit `node_modules`, build artifacts (`.next`, `dist`), hoặc file biến môi trường bí mật `.env`.
