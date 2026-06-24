package com.hust.pfma.dtos;

import lombok.Data;
import java.util.List;

@Data
public class DashboardResponse {
    private Double totalIncome;
    private Double totalExpense;
    private Double netBalance;

    // Danh sách thống kê chi tiết theo từng danh mục
    private List<CategoryStat> categoryStats;

    @Data
    public static class CategoryStat {
        private String categoryName;
        private Double totalAmount;
        private Double percentage;
    }
}