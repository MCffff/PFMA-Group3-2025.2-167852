package com.hust.pfma.repositories;

import com.hust.pfma.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * UC05 & UC07: Lấy toàn bộ lịch sử giao dịch của một người dùng cụ thể.
     */
    @Query("SELECT t FROM Transaction t WHERE t.wallet.user.id = :userId ORDER BY t.transactionDate DESC")
    List<Transaction> findByUserId(@Param("userId") Long userId);

    /**
     * UC08 (Thống kê 1): Tính tổng tiền chi tiêu của từng Danh mục để vẽ Biểu đồ tròn cơ cấu.
     */
    @Query("SELECT t.category.name, SUM(t.amount) " +
            "FROM Transaction t " +
            "WHERE t.wallet.user.id = :userId AND t.category.type = 'EXPENSE' " +
            "GROUP BY t.category.name")
    List<Object[]> sumExpenseByCategory(@Param("userId") Long userId);

    /**
     * UC08 (Thống kê 2): Tính tổng Thu nhập vs Chi tiêu theo từng Tháng để vẽ Biểu đồ cột xu hướng.
     */
    @Query("SELECT MONTH(t.transactionDate), t.category.type, SUM(t.amount) " +
            "FROM Transaction t " +
            "WHERE t.wallet.user.id = :userId " +
            "GROUP BY MONTH(t.transactionDate), t.category.type")
    List<Object[]> getMonthlyReport(@Param("userId") Long userId);

    /**
     * UC11: Lấy danh sách giao dịch chi tiêu trong 30 ngày gần nhất để tính toán dự báo.
     */
    @Query("SELECT t FROM Transaction t " +
            "WHERE t.wallet.user.id = :userId AND t.transactionDate >= :startDate " +
            "ORDER BY t.transactionDate ASC")
    List<Transaction> findLast30DaysExpenses(@Param("userId") Long userId,
                                             @Param("startDate") java.time.LocalDate startDate);
}