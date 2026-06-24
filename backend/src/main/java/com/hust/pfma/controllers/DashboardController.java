package com.hust.pfma.controllers;

import com.hust.pfma.dtos.DashboardResponse;
import com.hust.pfma.services.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final TransactionService transactionService;

    public DashboardController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // Lấy số liệu tổng quan tháng hiện tại của User
    @GetMapping("/user/{userId}")
    public ResponseEntity<DashboardResponse> getDashboardStats(@PathVariable Long userId) {
        return ResponseEntity.ok(transactionService.getDashboardStats(userId));
    }
}