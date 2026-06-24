# Personal Finance Management Assistant (PFMA)

**PFMA** là ứng dụng hỗ trợ Quản lý và Tối ưu hóa Tài chính Cá nhân độc lập. Hệ thống được thiết kế nhằm giúp người dùng dễ dàng ghi chép biến động số dư, thiết lập ngân sách hạn mức, giám sát dòng tiền thực tế theo thời gian thực thông qua các biểu đồ trực quan, từ đó đưa ra các quyết định chi tiêu thông minh hơn.

Dự án áp dụng kiến trúc phân tách hoàn toàn giữa **Backend API (Spring Boot)** và **Frontend UI (React.js + Tailwind CSS)**.

---

## 🏗️ Kiến trúc Tổng thể & Cấu trúc mã nguồn

Dự án được tổ chức thành một Monorepo chứa hai phân hệ độc lập:

```text
PFMA-Project-Root/
├── backend/                  # PHÂN HỆ BACKEND (Spring Boot Application)
│   ├── src/main/java/        # Mã nguồn Java (Controller, Service, Repository, Model, DTO)
│   ├── src/main/resources/   # File cấu hình cấu trúc hệ thống (application.properties)
│   └── pom.xml               # Quản lý thư viện dependency của Maven
│
└── frontend/                 # PHÂN HỆ FRONTEND (React.js Single Page Application)
    ├── src/
    │   ├── components/       # Các UI Component dùng chung
    │   ├── views/            # Các màn hình chức năng chính (Dashboard, Transactions, Budgets...)
    │   └── services/         # Cấu hình gọi API thủ công kết nối sang Backend (api.js)
    ├── package.json          # Quản lý thư viện NodeJS
    └── vite.config.js        # Cấu hình công cụ đóng gói Vite
📊 Bản đồ Tính năng Hệ thống (Core Use Cases)
Hệ thống được phát triển hoàn chỉnh xoay quanh các lõi nghiệp vụ thiết yếu:

UC01 - UC04: Xác thực người dùng (Authentication): Hệ thống đăng ký, đăng nhập bảo mật, phân tách cô lập kho dữ liệu của từng cá nhân. Hỗ trợ cập nhật hồ sơ và đổi/khôi phục mật khẩu.

UC05: Quản lý ví tài chính: Khởi tạo và quản lý số dư các nguồn tiền độc lập (Ví tiền mặt, tài khoản ngân hàng, ví điện tử).

UC06: Ghi chép giao dịch: Biến động cộng/trừ tiền trực tiếp vào số dư ví tương ứng dựa trên các phát sinh thu chi thực tế.

UC07: Dashboard tổng quan: Thống kê tổng thu, tổng chi, tích lũy ròng và tự động tính toán tỷ trọng phân phối dòng tiền theo từng hạng mục danh mục trong tháng hiện tại.

UC08: Báo cáo chuyên sâu: Kết xuất đồ thị cơ cấu (Biểu đồ tròn) và đồ thị xu hướng dòng tiền (Biểu đồ cột) theo chu kỳ thời gian.

UC09: Thiết lập ngân sách hạn mức: Đặt ngưỡng cảnh báo chi tiêu tối đa cho từng danh mục. Hỗ trợ đầy đủ các luồng thêm mới, điều chỉnh tăng/giảm hạn mức hoặc xóa bỏ ngân sách.

🛠️ Hướng dẫn Triển khai & Khởi chạy Hệ thống (Deployment Guide)
1. Chuẩn bị Môi trường Tiền đề
Backend: Java Development Kit (JDK) 17+, Apache Maven 3.6+.

Frontend: Node.js (Bản LTS 18+ hoặc 20+), npm.

Database: MySQL Server 8.0+.

2. Triển khai Cấu trúc Dữ liệu & Chạy Backend
Truy cập vào hệ quản trị MySQL của ông, tạo sẵn một Database trống:

SQL
CREATE DATABASE pfma_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
Di chuyển vào thư mục backend/src/main/resources/application.properties, cấu hình lại thông tin kết nối tài khoản MySQL:

Properties
spring.datasource.url=jdbc:mysql://localhost:3306/pfma_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=TÊN_USER_CỦA_ÔNG
spring.datasource.password=MẬT_KHẨU_CỦA_ÔNG
spring.jpa.hibernate.ddl-auto=update
Mở Terminal tại thư mục /backend và chạy lệnh khởi động Server:

Bash
mvn clean install
mvn spring-boot:run
Cổng chạy mặc định của API: http://localhost:8080

3. Triển khai & Khởi chạy Frontend
Mở một cửa sổ Terminal mới độc lập, di chuyển vào thư mục /frontend.

Cài đặt toàn bộ gói thư viện giao diện (bao gồm các gói vẽ biểu đồ recharts, bộ icon lucide-react):

Bash
npm install
Khởi chạy Front-end ở chế độ môi trường phát triển (Development Mode):

Bash
npm run dev
Cổng chạy mặc định của Giao diện: http://localhost:5173

🔒 Chính sách Kết nối CORS
Hệ thống được cấu hình mở cổng kết nối CORS an toàn tại tầng Backend (WebConfig.java), cho phép ứng dụng React từ cổng 5173 giao tiếp mượt mà và thực thi đầy đủ các giao thức tiêu chuẩn GET, POST, PUT, DELETE sang cổng API 8080.