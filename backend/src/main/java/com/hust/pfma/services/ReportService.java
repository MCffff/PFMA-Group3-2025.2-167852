package com.hust.pfma.services;

import com.hust.pfma.dtos.CategoryReportResponse;
import com.hust.pfma.dtos.MonthlyReportResponse;
import com.hust.pfma.repositories.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private TransactionRepository transactionRepository;

    // Xử lý dữ liệu thống kê theo danh mục
    public List<CategoryReportResponse> getCategoryReport(Long userId) {
        List<Object[]> rawData = transactionRepository.sumExpenseByCategory(userId);
        List<CategoryReportResponse> report = new ArrayList<>();

        for (Object[] row : rawData) {
            String name = (String) row[0];
            Double total = (Double) row[1];
            report.add(new CategoryReportResponse(name, total));
        }
        return report;
    }

    // Xử lý dữ liệu thống kê theo tháng
    public List<MonthlyReportResponse> getMonthlyReport(Long userId) {
        List<Object[]> rawData = transactionRepository.getMonthlyReport(userId);
        List<MonthlyReportResponse> report = new ArrayList<>();

        for (Object[] row : rawData) {
            Integer month = (Integer) row[0];
            String type = (String) row[1];
            Double total = (Double) row[2];
            report.add(new MonthlyReportResponse(month, type, total));
        }
        return report;
    }
}