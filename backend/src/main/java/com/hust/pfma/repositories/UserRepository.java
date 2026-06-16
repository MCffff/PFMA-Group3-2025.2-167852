package com.hust.pfma.repositories;

import com.hust.pfma.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Tìm kiếm người dùng dựa vào Username để đăng nhập
    Optional<User> findByUsername(String username);

    // Kiểm tra xem Email đã tồn tại chưa để đăng ký
    boolean existsByEmail(String email);
}