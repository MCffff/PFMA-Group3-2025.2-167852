package com.hust.pfma.controllers;

import com.hust.pfma.models.Budget;
import com.hust.pfma.repositories.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "http://localhost:5173") // Cho phép Frontend React bên port 5173 gọi sang
public class BudgetController {

    @Autowired
    private BudgetRepository budgetRepository;

    // API 1: Tạo một hạn mức ngân sách mới (POST http://localhost:8080/api/budgets)
    @PostMapping
    public ResponseEntity<Budget> createBudget(@RequestBody Budget requestBudget) {
        // Sử dụng hàm .save() có sẵn của JPA để lưu thẳng xuống MySQL
        Budget savedBudget = budgetRepository.save(requestBudget);
        return ResponseEntity.ok(savedBudget);
    }

    // API 2: Lấy danh sách toàn bộ ngân sách của 1 người dùng (GET http://localhost:8080/api/budgets/user/{userId})
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Budget>> getBudgetsByUser(@PathVariable Long userId) {
        List<Budget> userBudgets = budgetRepository.findByUserId(userId);
        return ResponseEntity.ok(userBudgets);
    }
}