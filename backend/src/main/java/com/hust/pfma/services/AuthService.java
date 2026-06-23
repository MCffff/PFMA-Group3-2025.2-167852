package com.hust.pfma.services;

import com.hust.pfma.dtos.ChangePasswordRequest;
import com.hust.pfma.dtos.LoginRequest;
import com.hust.pfma.dtos.RegisterRequest;
import com.hust.pfma.models.User;
import com.hust.pfma.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Autowired
    public AuthService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    // Đăng ký tài khoản mới
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Tên danh mục hoặc Email này đã tồn tại!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        user.setPassword(hashedPassword);

        return userRepository.save(user);
    }

    // Logic xử lý đăng nhập hệ thống
    public User login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Username hoặc mật khẩu không đúng. Vui lòng thử lại."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Username hoặc mật khẩu không đúng. Vui lòng thử lại.");
        }

        return user;
    }

    // Logic xử lý UC03: Đối soát và Đổi mật khẩu
    public void changePassword(ChangePasswordRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không chính xác!");
        }

        String hashedNewPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPassword(hashedNewPassword);

        userRepository.save(user);
    }

    /**
     * LUỒNG THAY THẾ UC01: Khởi tạo tiến trình Quên mật khẩu, sinh mã xác thực và gửi mail
     */
    public void processForgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản nào liên kết với Email này!"));

        // Sinh Token UUID ngắn gọn để người dùng tiện copy/nhập vào giao diện
        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        // Tiến hành đóng gói và đẩy Mail đi qua giao thức SMTP cấu hình trong properties
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("PFMA Support <noreply@gmail.com>");
            message.setTo(user.getEmail());
            message.setSubject("[PFMA] Mã khôi phục mật khẩu tài khoản");
            message.setText("Chào bạn,\n\nBạn đã gửi yêu cầu khôi phục mật khẩu trên hệ thống Personal Finance Pro.\n\n"
                    + "MÃ XÁC THỰC CỦA BẠN LÀ: " + token + "\n\n"
                    + "Mã xác thực này có hiệu lực trong vòng 15 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.\n\n"
                    + "Trân trọng,\nPFMA Đội ngũ phát triển.");
            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Hệ thống SMTP không thể gửi email. Vui lòng kiểm tra cấu hình application.properties!");
        }
    }

    /**
     * LUỒNG THAY THẾ UC01: Xác thực token và cập nhật mật khẩu mới (có băm BCrypt mã hóa)
     */
    public void updatePasswordWithToken(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new RuntimeException("Mã xác thực không hợp lệ hoặc không tồn tại!"));

        // Kiểm tra thời hạn Token chống brute-force hoặc sử dụng mã cũ quá hạn
        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã xác thực đã hết hạn! Vui lòng yêu cầu cấp mã mới.");
        }

        // Tiến hành băm mật khẩu mới bằng BCrypt y hệt lúc đăng ký để đồng bộ bảo mật
        String hashedNewPassword = passwordEncoder.encode(newPassword);
        user.setPassword(hashedNewPassword);

        // Xóa dấu vết token sau khi đổi thành công để vô hiệu hóa mã này hoàn toàn
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);
    }
}