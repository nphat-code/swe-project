# BÁO CÁO BÀI TẬP LỚN (LATEX REPORT) - BREWLITE

> **Thư mục lưu trữ template và mã nguồn báo cáo LaTeX:** `docs/report/`

---

## 1. HƯỚNG DẪN GIẢI NÉN TEMPLATE

Bạn hãy giải nén toàn bộ tệp `.zip` template báo cáo LaTeX của bạn vào chính thư mục này:
```plaintext
docs/report/
├── main.tex                  # Tệp mã nguồn chính
├── chapters/                 # Các chương báo cáo (Chương 1, 2, 3...)
├── figures/ (hoặc images/)   # Thư mục chứa hình ảnh, sơ đồ kiến trúc
├── references.bib            # Danh mục tài liệu tham khảo
└── *.cls / *.sty             # Tệp định dạng template trường / khoa
```

---

## 2. LƯU Ý KHI BIÊN DỊCH (COMPILE)

* Hệ thống đã cấu hình sẵn `.gitignore` để tự động loại bỏ các tệp rác sinh ra trong quá trình biên dịch LaTeX (`*.aux`, `*.log`, `*.toc`, `*.out`, `*.synctex.gz`,...).
* Bạn có thể mở thư mục này bằng VS Code (với extension **LaTeX Workshop**) hoặc tải cả thư mục này lên **Overleaf** để cộng tác soạn thảo cùng nhóm.
