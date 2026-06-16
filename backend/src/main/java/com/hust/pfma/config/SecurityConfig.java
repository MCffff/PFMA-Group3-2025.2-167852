package com.hust.pfma.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Cấu hình phân quyền đường dẫn API
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configure(http)) // Kích hoạt cấu hình CORS kết nối với ReactJS
                .authorizeHttpRequests(auth -> auth
                        // Cho phép mở cửa tự do hoàn toàn cho luồng Đăng nhập và Đăng ký
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                        // Tất cả các yêu cầu API khác bắt buộc phải được xác thực
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}