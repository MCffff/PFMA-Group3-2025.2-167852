package com.hust.pfma.controllers;

import com.hust.pfma.dtos.CategoryReportResponse;
import com.hust.pfma.dtos.MonthlyReportResponse;
import com.hust.pfma.services.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // API 1: Lấy số liệu biểu đồ tròn
    @GetMapping("/category/{userId}")
    public ResponseEntity<List<CategoryReportResponse>> getCategoryReport(@PathVariable Long userId) {
        return ResponseEntity.ok(reportService.getCategoryReport(userId));
    }

    // API 2: Lấy số liệu biểu đồ cột 
    @GetMapping("/monthly/{userId}")
    public ResponseEntity<List<MonthlyReportResponse>> getMonthlyReport(@PathVariable Long userId) {
        return ResponseEntity.ok(reportService.getMonthlyReport(userId));
    }
}
