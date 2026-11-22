# BÁO CÁO BÀI TẬP LỚN (LATEX REPORT) - BREWLITE

> **Thư mục lưu trữ template và mã nguồn báo cáo LaTeX:** `docs/report/`

---

## 1. CẤU TRÚC HAI BÁO CÁO CHUẨN SGU

Thư mục [`Assigment_template_SGU/`](Assigment_template_SGU/) chứa trọn bộ 2 báo cáo LaTeX dùng chung logo và hệ thống hình vẽ UML:
```plaintext
docs/report/Assigment_template_SGU/
├── Assignment1_report.tex    # Báo cáo Assignment 1 (Agile Scrum & 10 Tasks + Task 10 Backend)
├── Assignment_report.tex     # Báo cáo Assignment 2 (Requirements to Deployment: Task 1 -> Task 5 + Traceability)
├── figures/                  # Các sơ đồ UML (Use Case, Activity, Sequence, Class, Deployment)
├── logoITSGU.png             # Logo Khoa CNTT ĐH Sài Gòn (Trang bìa)
└── logoITSGUsmall.png        # Logo Khoa CNTT ĐH Sài Gòn (Header)
```

---

## 2. HƯỚNG DẪN XUẤT FILE PDF TRÊN OVERLEAF

* Hệ thống đã cấu hình sẵn `.gitignore` để tự động loại bỏ các tệp rác sinh ra trong quá trình biên dịch LaTeX (`*.aux`, `*.log`, `*.toc`, `*.out`, `*.synctex.gz`,...).
* Để xuất cả 2 file PDF sắc nét, đúng font tiếng Việt:
  1. Tải toàn bộ thư mục `docs/report/Assigment_template_SGU/` lên **Overleaf** (chọn Compiler: **pdfLaTeX**).
  2. Vào **Menu → Main document** chọn `Assignment1_report.tex` → **Recompile** → tải PDF lưu thành `Assignment1_report.pdf`.
  3. Đổi **Main document** sang `Assignment_report.tex` → **Recompile** → tải PDF lưu thành `Assignment2_report.pdf` (hoặc `Assignment_report.pdf`).
