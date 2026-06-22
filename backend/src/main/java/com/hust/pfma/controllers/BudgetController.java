package com.hust.pfma.controllers;

import com.hust.pfma.models.Budget;
import com.hust.pfma.services.BudgetService; // Import Service mới tạo
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "http://localhost:5173")
public class BudgetController {

    @Autowired
    private BudgetService budgetService; // Tiêm duy nhất lớp Service vào đây theo chuẩn kiến trúc

    // API 1: Tạo một hạn mức ngân sách mới thông qua tầng Service
    @PostMapping
    public ResponseEntity<?> createBudget(@RequestBody Budget requestBudget) {
        try {
            Budget savedBudget = budgetService.createBudget(requestBudget);
            return ResponseEntity.ok(savedBudget);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Dữ liệu không hợp lệ: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi hệ thống khi tạo ngân sách: " + e.getMessage());
        }
    }

    // API 2: Lấy danh sách ngân sách của 1 người dùng thông qua tầng Service
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Budget>> getBudgetsByUser(@PathVariable Long userId) {
        List<Budget> userBudgets = budgetService.getBudgetsByUserId(userId);
        return ResponseEntity.ok(userBudgets);
    }
}