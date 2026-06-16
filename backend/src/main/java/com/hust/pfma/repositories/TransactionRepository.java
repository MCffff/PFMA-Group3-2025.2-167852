package com.hust.pfma.repositories;

import com.hust.pfma.models.Transaction;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Thống kê 1: Tính tổng tiền chi tiêu của từng Danh mục
    @Query("SELECT t.category.name, SUM(t.amount) " +
            "FROM Transaction t " +
            "WHERE t.wallet.user.id = :userId AND t.category.type = 'EXPENSE' " +
            "GROUP BY t.category.name")
    List<Object[]> sumExpenseByCategory(@Param("userId") Long userId);

    // Thống kê 2: Tính tổng Thu nhập vs Chi tiêu theo từng Tháng
    @Query("SELECT MONTH(t.transactionDate), t.category.type, SUM(t.amount) " +
            "FROM Transaction t " +
            "WHERE t.wallet.user.id = :userId " +
            "GROUP BY MONTH(t.transactionDate), t.category.type")
    List<Object[]> getMonthlyReport(@Param("userId") Long userId);
}