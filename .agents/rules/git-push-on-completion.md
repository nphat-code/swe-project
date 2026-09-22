# Rule: Push ngay sau khi hoàn thành từng phần việc

## Bắt buộc (Mandatory)
1. **Làm xong phần nào, push ngay phần đó:**
   - Ngay sau khi hoàn thành một task, một tính năng hoặc một hạng mục logic (như Task 1, Task 2,..., hoặc một subtask hoàn chỉnh), agent phải thực hiện commit và đẩy code lên remote repository ngay lập tức (`git push origin <branch>`).
   - Tuyệt đối không dồn nhiều task/phần việc lại để push một lần.

2. **Quy trình hoàn thành một phần:**
   - Kiểm tra, build và xác minh code chạy được, không phát sinh lỗi.
   - Thêm các file thay đổi hợp lệ (`git add ...`), đảm bảo không commit các file rác, cache, secrets hoặc `node_modules`.
   - Commit với thông điệp rõ ràng theo chuẩn Conventional Commits (ví dụ: `feat(backend): ...`, `feat(frontend): ...`, `docs: ...`).
   - Chạy lệnh `git push origin <branch>` (thường là nhánh `main` hoặc nhánh tính năng đang làm việc).
   - Báo cáo rõ commit hash và trạng thái push cho người dùng.
