package com.hust.pfma.repositories;

import com.hust.pfma.models.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    // Lấy ra tất cả các hạn mức ngân sách của một Người dùng cụ thể
    List<Budget> findByUserId(Long userId);

    // Tìm xem danh mục này của User này có đang bị quản lý bởi ngân sách nào trong tháng này không
    Optional<Budget> findByUserIdAndCategoryIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long userId, Long categoryId, LocalDate date1, LocalDate date2
    );
}