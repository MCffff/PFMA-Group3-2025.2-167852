# 💰 Personal Finance Pro - Front-end (React + Vite)

Dự án Front-end thuộc hệ thống **Quản lý Tài chính Cá nhân (Personal Finance Pro)**, được xây dựng trên nền tảng **React (ES6)** kết hợp công cụ đóng gói siêu tốc **Vite** và framework CSS **Tailwind CSS**. Hệ thống cung cấp giao diện quản lý dòng tiền trực quan, bảo mật và đồng bộ thời gian thực (Real-time) với Spring Boot Backend.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

* **Thư viện cốt lõi:** React 18
* **Công cụ đóng gói & Khởi chạy:** Vite
* **Thiết kế giao diện:** Tailwind CSS + PostCSS
* **Bộ Icon hệ thống:** Lucide React (Thiết kế phẳng cao cấp)
* **Kết nối API & HTTP:** Axios (Tích hợp thực thể `api` cấu hình chung để đính kèm Token bảo mật và đồng bộ logic CORS)
* **Trực quan hóa số liệu:** Recharts (Vẽ biểu đồ cơ cấu chi tiêu hình quạt)
* **Quản lý chất lượng mã nguồn:** ESLint Strict Mode (Sạch bóng các lỗi `set-state-in-effect` hay `no-undef`)

---

## 📁 Cấu trúc thư mục dự án (Project Architecture)

Cấu trúc mã nguồn được phân lớp tường minh, tách biệt giữa giao diện bố cục, bộ định tuyến và các mô-đun chức năng:

```text
frontend/
├── .idea/                  # Cấu hình môi trường của IDE (IntelliJ / WebStorm)
├── node_modules/           # Thư viện phụ thuộc của dự án
├── public/                 # Tài nguyên tĩnh công khai (Favicon, v.v...)
├── src/
│   ├── assets/             # Hình ảnh và ảnh minh họa tĩnh (hero.png, react.svg, vite.svg)
│   ├── components/
│   │   └── layout/         # Khung giao diện cố định hệ thống
│   │       ├── MainLayout.jsx  # Bố cục giao diện chính sau khi đăng nhập
│   │       └── Sidebar.jsx     # Thanh menu điều hướng chức năng bên trái
│   ├── routes/
│   │   └── AppRoutes.jsx   # Quản lý bộ định tuyến (Router), phân quyền tuyến đường ứng dụng
│   ├── services/
│   │   ├── api.js          # Gác cổng cấu hình Axios, tích hợp toàn bộ API endpoint liên kết cổng 8080
│   │   └── mockData.js     # Dữ liệu mẫu phục vụ kiểm thử giao diện độc lập
│   ├── views/              # Nơi quản lý các trang nghiệp vụ chính của đồ án
│   │   ├── Analytics/      
│   │   │   └── AnalyticsView.jsx       # Giao diện thống kê chuyên sâu số liệu dòng tiền
│   │   ├── Auth/           
│   │   │   ├── ForgotPasswordView.jsx  # Form xử lý khôi phục mật khẩu tài khoản
│   │   │   ├── LoginView.jsx           # Trang đăng nhập hệ thống bảo mật
│   │   │   └── RegisterView.jsx        # Trang đăng ký tài khoản người dùng mới
│   │   ├── Budgets/        
│   │   │   └── BudgetsView.jsx         # Quản lý CRUD Ngân sách hạn mức & Dropdown động (UC09)
│   │   ├── Categories/     
│   │   │   └── CategoriesView.jsx      # Quản lý danh mục phân loại thu/chi
│   │   ├── Dashboard/      
│   │   │   └── DashboardView.jsx       # Biểu đồ hình quạt Recharts & Thẻ KPI tài chính (UC07)
│   │   ├── Profile/        
│   │   │   └── ChangePasswordView.jsx  # Giao diện thông tin cá nhân và thay đổi mật khẩu
│   │   ├── Transactions/   
│   │   │   └── TransactionsView.jsx    # Ghi chép giao dịch thu/chi & Lịch sử Real-time (UC04)
│   │   └── Wallets/        
│   │       └── WalletsView.jsx         # Quản lý danh sách và số dư các ví tài khoản
│   ├── App.css             # Style tùy biến cục bộ hệ thống
│   ├── App.jsx             # Component gốc kết nối bộ định tuyến và layout toàn cục
│   ├── index.css           # Điểm nạp cấu hình thư viện Tailwind CSS
│   └── main.jsx            # Điểm khởi tạo ứng dụng React bọc qua StrictMode
├── .env                    # Lưu trữ biến môi trường (Cấu hình VITE_API_URL nối xuống 8080)
├── .gitignore              # Danh mục loại trừ các tệp tin không đẩy lên GitHub
├── eslint.config.js        # Quy chuẩn gác cổng chất lượng code của bộ quét ESLint
├── index.html              # Tệp tin HTML gốc chứa điểm neo render của React
├── package.json            # Quản lý thông tin dự án, script và danh sách thư viện cài đặt
├── package-lock.json       # Khóa phiên bản chính xác của các gói thư viện
├── postcss.config.js       # File cấu hình xử lý CSS hậu kỳ cho Tailwind
├── tailwind.config.js      # File cấu hình phân phối mã màu, font chữ của Tailwind CSS
└── vite.config.js          # File cấu hình máy chủ Vite và các plugin bổ trợ
🚀 Các phân hệ chức năng cốt lõi (Use Cases)
UC04 - Ghi chép giao dịch tài chính (TransactionsView.jsx):

Cung cấp biểu mẫu ghi nhận khoản Thu (Income) / Chi (Expense) thực tế, tự động cập nhật khấu trừ số dư ví nguồn.

Tích hợp tính năng rẽ nhánh Thêm nhanh danh mục ngay trên form nhập liệu.

Tích hợp bảng Lịch sử biến động số dư đồng bộ tự động theo thời gian thực (Real-time) ngay sau khi giao dịch được thêm thành công mà không cần F5 trình duyệt.

UC07 - Dashboard tổng quan tài chính (DashboardView.jsx):

Tổng hợp 3 thẻ KPI số liệu thực tế: Tổng Thu, Tổng Chi và Tích lũy ròng (Số dư thuần) trong tháng hiện tại.

Vẽ biểu đồ cơ cấu chi tiêu theo hạng mục dạng hình quạt (Pie Chart) và trực quan hóa tỷ trọng danh mục qua thanh Progress Bar tự động co giãn phần trăm thị phần tiêu dùng.

UC09 - Thiết lập & Quản lý Ngân sách (BudgetsView.jsx):

Cho phép thiết lập hạn mức chi tiêu tối đa độc lập theo từng danh mục loại EXPENSE.

Dropdown chọn danh mục được nạp động từ MySQL (Kéo cả danh mục mặc định lẫn danh mục tự tạo nhanh của riêng User).

Hỗ trợ Modal cập nhật nhanh số tiền hạn mức (PUT) và hộp thoại xác nhận xóa bỏ bản ghi (DELETE) ngay tại bảng dữ liệu.

📦 Hướng dẫn cài đặt và Khởi chạy (Local Development)
1. Di chuyển vào thư mục Frontend
Bash
cd frontend
2. Cài đặt các gói thư viện phụ thuộc (Dependencies)
Tải và thiết lập toàn bộ các package thư viện đã được cấu hình trong package.json:

Bash
npm install
3. Cấu hình biến môi trường
Tạo hoặc mở file .env ở thư mục gốc Frontend và đảm bảo đường dẫn trỏ đúng về cổng chạy của Spring Boot Backend:

Đoạn mã
VITE_API_URL=http://localhost:8080
4. Khởi chạy dự án ở chế độ phát triển (Development Mode)
Bash
npm run dev
Hệ thống sẽ chạy trên môi trường local tại địa chỉ mặc định của Vite: http://localhost:5173