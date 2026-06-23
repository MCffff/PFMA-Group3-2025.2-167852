package com.hust.pfma.controllers;

import com.hust.pfma.dtos.CategoryRequest;
import com.hust.pfma.dtos.TransactionRequest;
import com.hust.pfma.services.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TransactionController {

    @Autowired private TransactionService transactionService;

    // 1. API lấy toàn bộ danh mục ứng với user (Dùng cho dropdown trang giao dịch)
    @GetMapping("/categories/{userId}")
    public ResponseEntity<?> getCategories(@PathVariable Long userId) {
        return ResponseEntity.ok(transactionService.getCategories(userId));
    }

    // API lấy lịch sử giao dịch ứng với user
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getTransactionHistory(@PathVariable Long userId) {
        try {
            // Gọi xuống service bốc danh sách lịch sử lên
            return ResponseEntity.ok(transactionService.getTransactionHistoryByUserId(userId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    // 3. API Luồng phụ: Thêm nhanh danh mục
    @PostMapping("/categories")
    public ResponseEntity<?> createCategoryQuick(@RequestBody CategoryRequest request) {
        try {
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Thêm danh mục mới thành công!",
                    "data", transactionService.createCategoryQuick(request)
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    // 4. API Luồng chính: Thêm giao dịch mới
    @PostMapping
    public ResponseEntity<?> createTransaction(@RequestBody TransactionRequest request) {
        try {
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Thêm giao dịch thành công!",
                    "data", transactionService.createTransaction(request)
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}