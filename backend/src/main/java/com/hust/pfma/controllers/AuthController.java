package com.hust.pfma.controllers;

import com.hust.pfma.dtos.ChangePasswordRequest;
import com.hust.pfma.dtos.LoginRequest;
import com.hust.pfma.dtos.RegisterRequest;
import com.hust.pfma.models.User;
import com.hust.pfma.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map; // Import Map để bóc tách JSON nhanh ở Frontend

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // API phục vụ UC02: Đăng ký tài khoản (Giữ nguyên)
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        try {
            User registeredUser = authService.register(request);
            return ResponseEntity.ok(registeredUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API phục vụ UC01: Đăng nhập hệ thống (Giữ nguyên)
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        try {
            User user = authService.login(request);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // API phục vụ UC03: Đổi mật khẩu
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            // Gọi hàm xử lý logic dịch vụ
            authService.changePassword(request);

            // Trả về JSON Object chứa "status" và "message" đúng cấu hình Front-End yêu cầu
            return ResponseEntity.ok(Map.of("status", "success", "message", "Đổi mật khẩu thành công!"));
        } catch (RuntimeException e) {
            // Khi có lỗi (sai mật khẩu, sai ID), bắn JSON lỗi về cho Axios bắt
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    /**
     * API 1: Tiếp nhận yêu cầu gửi mail quên mật khẩu
     * POST http://localhost:8080/api/auth/forgot-password?email=...
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        try {
            authService.processForgotPassword(email);
            return ResponseEntity.ok("Mã xác thực khôi phục mật khẩu đã được gửi qua Email của bạn thành công.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * API 2: Nhận mã Token cùng mật khẩu mới để tiến hành thay đổi dữ liệu
     * POST http://localhost:8080/api/auth/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> requestBody) {
        try {
            String token = requestBody.get("token");
            String newPassword = requestBody.get("newPassword");

            if (token == null || newPassword == null) {
                return ResponseEntity.badRequest().body("Lỗi: Thiếu mã xác thực hoặc mật khẩu mới!");
            }

            authService.updatePasswordWithToken(token, newPassword);
            return ResponseEntity.ok("Đặt lại mật khẩu mới thành công! Bạn có thể sử dụng thông tin này để đăng nhập.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}