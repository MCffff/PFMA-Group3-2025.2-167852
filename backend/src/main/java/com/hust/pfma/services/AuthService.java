package com.hust.pfma.services;

import com.hust.pfma.dtos.ChangePasswordRequest;
import com.hust.pfma.dtos.LoginRequest;
import com.hust.pfma.dtos.RegisterRequest;
import com.hust.pfma.models.User;
import com.hust.pfma.repositories.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Đăng ký tài khoản mới
    public User register(RegisterRequest request) {
        // Kiểm tra tính duy nhất của Email trong hệ thống
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Tên danh mục hoặc Email này đã tồn tại!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        // Tiến hành mã hóa mật khẩu bằng BCrypt trước khi nạp xuống MySQL
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        user.setPassword(hashedPassword);

        return userRepository.save(user);
    }

    // Logic xử lý đăng nhập hệ thống
    public User login(LoginRequest request) {
        // Tìm kiếm người dùng dựa trên tên đăng nhập
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Username hoặc mật khẩu không đúng. Vui lòng thử lại."));

        // Đối soát mật khẩu thô người dùng gõ với mật khẩu đã băm (Hash) trong MySQL
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Username hoặc mật khẩu không đúng. Vui lòng thử lại.");
        }

        return user;
    }

    // Logic xử lý UC03: Đối soát và Đổi mật khẩu
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy người dùng!"));

        // Đối soát mật khẩu hiện tại xem có khớp với DB cũ không
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không chính xác!");
        }

        // Mã hóa mật khẩu mới và cập nhật vào bảng users
        String hashedNewPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPassword(hashedNewPassword);

        userRepository.save(user);
    }
}