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
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    @Autowired private TransactionService transactionService;

    // API lấy toàn bộ danh mục ứng với user
    @GetMapping("/categories/{userId}")
    public ResponseEntity<?> getCategories(@PathVariable Long userId) {
        return ResponseEntity.ok(transactionService.getCategories(userId));
    }

    // API Luồng phụ: Thêm nhanh danh mục
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

    // API Luồng chính: Thêm giao dịch mới
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