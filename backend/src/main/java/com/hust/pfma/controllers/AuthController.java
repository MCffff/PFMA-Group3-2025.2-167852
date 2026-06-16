package com.hust.pfma.controllers;

import com.hust.pfma.dtos.ChangePasswordRequest;
import com.hust.pfma.dtos.LoginRequest;
import com.hust.pfma.dtos.RegisterRequest;
import com.hust.pfma.models.User;
import com.hust.pfma.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // API phục vụ UC02: Đăng ký tài khoản
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        try {
            User registeredUser = authService.register(request);
            return ResponseEntity.ok(registeredUser);
        } catch (RuntimeException e) {
            // Trả về lỗi 400 nếu trùng email kèm thông báo chuẩn
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // API phục vụ UC01: Đăng nhập hệ thống
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        try {
            User user = authService.login(request);
            // Giai đoạn này trả về thông tin User hợp lệ để Frontend có dữ liệu xử lý
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            // Trả về lỗi 401 Unauthorized nếu thông tin sai lệch đúng theo tài liệu đặc tả hướng dẫn
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // API phục vụ UC03: Đổi mật khẩu
    @PutMapping("/change-password/{id}")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        try {
            authService.changePassword(id, request);
            return ResponseEntity.ok("Cập nhật mật khẩu thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
