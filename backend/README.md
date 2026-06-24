# Personal Finance Management Assistant (PFMA) - Backend API

Hệ thống Backend cung cấp dịch vụ RESTful API phục vụ cho Ứng dụng Quản lý Tài chính Cá nhân độc lập (`PFMA`). Dự án được xây dựng dựa trên nền tảng **Spring Boot Framework**, kết hợp với cơ sở dữ liệu **MySQL**, áp dụng mô hình kiến trúc phân lớp chuẩn hóa nhằm đảm bảo tính toàn vẹn, bảo mật và khả năng mở rộng dữ liệu.

---

## 🏗️ Kiến trúc Hệ thống & Sơ đồ Cấu trúc Thư mục

Dự án tuân thủ mô hình kiến trúc **Layered Architecture** (Kiến trúc phân lớp), cô lập độc lập quyền quản lý dữ liệu từ tầng Controller đón request, tầng Service xử lý nghiệp vụ toán học, đến tầng Repository tương tác vật lý trực tiếp với Database qua Hibernate.

```text
backend [pfma]
├── .idea/
├── .mvn/
└── src/
    └── main/
        └── java/
            └── com.hust.pfma/
                ├── config/               # Cấu hình hệ thống (Security, CORS, Web Filter)
                │   ├── SecurityConfig.java
                │   └── WebConfig.java
                │
                ├── controllers/          # Tầng đón nhận Request & Điều hướng Endpoint API
                │   ├── AuthController.java
                │   ├── BudgetController.java
                │   ├── CategoryController.java
                │   ├── DashboardController.java
                │   ├── ReportController.java
                │   ├── TransactionController.java
                │   └── WalletController.java
                │
                ├── dtos/                 # Đối tượng chuyển đổi dữ liệu phẳng (Data Transfer Object)
                │   ├── BudgetRequest.java
                │   ├── CategoryReportResponse.java
                │   ├── CategoryRequest.java
                │   ├── ChangePasswordRequest.java
                │   ├── DashboardResponse.java
                │   ├── LoginRequest.java
                │   ├── MonthlyReportResponse.java
                │   ├── RegisterRequest.java
                │   ├── ResetPasswordRequest.java
                │   ├── TransactionRequest.java
                │   ├── UpdateProfileRequest.java
                │   └── WalletRequest.java
                │
                ├── models/               # Tầng thực thể ánh xạ trực tiếp xuống DB (OR/M Entities)
                │   ├── Budget.java
                │   ├── Category.java
                │   ├── Transaction.java
                │   ├── User.java
                │   └── Wallet.java
                │
                ├── repositories/         # Tầng giao tiếp dữ liệu MySQL (Spring Data JPA / JPQL Queries)
                │   ├── BudgetRepository.java
                │   ├── CategoryRepository.java
                │   ├── TransactionRepository.java
                │   ├── UserRepository.java
                │   └── WalletRepository.java
                │
                └── services/             # Tầng xử lý logic nghiệp vụ và ràng buộc hệ thống
                    ├── AuthService.java
                    ├── BudgetService.java
                    ├── CategoryService.java
                    ├── ReportService.java
                    ├── TransactionService.java
                    └── WalletService.java
📑 Danh sách Use Cases & Danh mục Hệ thống API công bố
Dưới đây là đặc tả các Endpoint chính được phân rã theo các Use Cases lõi của hệ thống để hỗ trợ Front-end tích hợp:

1. Xác thực & Tài khoản (AuthController)
POST /api/auth/register : Đăng ký tài khoản người dùng mới (RegisterRequest).

POST /api/auth/login : Đăng nhập hệ thống, cấp quyền truy cập (LoginRequest).

PUT /api/auth/profile : Cập nhật thông tin cá nhân của User (UpdateProfileRequest).

PUT /api/auth/change-password : Đổi mật khẩu an toàn (ChangePasswordRequest).

POST /api/auth/reset-password : Khôi phục mật khẩu khi quên (ResetPasswordRequest).

2. Quản lý Ví tiền tài chính (WalletController)
GET /api/wallets/user/{userId} : Lấy danh sách ví khả dụng của một người dùng.

POST /api/wallets : Khởi tạo ví tiền mới (WalletRequest).

3. Danh mục phân loại thu chi (CategoryController)
GET /api/categories/user/{userId} : Lấy toàn bộ danh mục mặc định của hệ thống và danh mục tự thêm của cá nhân.

POST /api/categories : Người dùng tự thêm nhanh một danh mục phân loại mới (CategoryRequest).

4. Ghi chép biến động giao dịch (TransactionController)
GET /api/transactions/user/{userId} : Tra cứu lịch sử biến động số dư, sắp xếp theo thời gian mới nhất.

POST /api/transactions : Lưu vết giao dịch phát sinh, tự động cộng/trừ tiền trực tiếp vào số dư ví tương ứng (TransactionRequest).

5. Thiết lập hạn mức ngân sách (BudgetController)
GET /api/budgets/user/{userId} : Lấy bảng danh sách ngân sách hạn mức đang áp dụng kèm số tiền đã chi tiêu (spent).

POST /api/budgets : Thiết lập kích hoạt một hạn mức chi tiêu mới cho danh mục (BudgetRequest).

PUT /api/budgets/{id} : Điều chỉnh tăng/giảm số tiền giới hạn tối đa của ngân sách.

DELETE /api/budgets/{id} : Gỡ bỏ hạn mức ngân sách khỏi hệ thống.

6. Thống kê & Dashboard tổng quan (DashboardController & ReportController)
GET /api/dashboard/user/{userId} : Bốc số liệu tổng thu, tổng chi, tích lũy ròng và tỉ trọng % cơ cấu chi tiêu trong tháng hiện tại.

GET /api/reports/monthly/{userId} : Xuất số liệu thống kê thu chi theo chu kỳ các tháng phục vụ vẽ biểu đồ cột xu hướng.

🛠️ Hướng dẫn Khởi chạy dự án (Setup & Run)
1. Ràng buộc Môi trường tiền đề
Java Development Kit (JDK): Phiên bản từ 17 trở lên.

Apache Maven: Để quản lý dependency và build dự án.

Cơ sở dữ liệu: MySQL Server (Khuyến nghị bản 8.0+).

2. Cấu hình Cơ sở dữ liệu (application.properties)
Mở file src/main/resources/application.properties và chỉnh sửa các tham số kết nối đến tài khoản MySQL cục bộ của ông:

Properties
spring.datasource.url=jdbc:mysql://localhost:3306/pfma_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Cấu hình Hibernate tự động đồng bộ cấu trúc thực thể xuống bảng dữ liệu
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
(Lưu ý: Ông nhớ tự tạo trước một Database trống tên là pfma_db trong MySQL Workbench hoặc phpMyAdmin trước khi chạy nhé)

3. Lệnh khởi chạy dự án qua Terminal
Tại thư mục gốc của dự án (nơi có file pom.xml), chạy chuỗi lệnh sau để dọn dẹp và chạy Server:

Bash
# Xóa thư mục target cũ và tải các dependency cần thiết
mvn clean install

# Khởi chạy ứng dụng Spring Boot
mvn spring-boot:run
Sau khi hệ thống khởi động thành công, Server ứng dụng sẽ lắng nghe tại cổng: http://localhost:8080.

🔒 Cấu hình Chính sách CORS (Cross-Origin Resource Sharing)
Hệ thống đã được cấu hình bộ lọc bảo mật an toàn cho phép Front-end (React/Vite chạy tại cổng http://localhost:5173) liên kết dữ liệu, gửi nhận đầy đủ các phương thức HTTP cơ bản bao gồm: GET, POST, PUT, DELETE.