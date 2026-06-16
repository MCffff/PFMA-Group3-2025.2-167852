package com.hust.pfma.controllers;

import com.hust.pfma.dtos.TransactionRequest;
import com.hust.pfma.models.Transaction;
import com.hust.pfma.services.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getTransactionsByUserId(@PathVariable Long userId) {
        // Gọi hàm truy vấn động đã viết trong TransactionRepository
        List<Transaction> transactions = transactionService.getTransactionsByUserId(userId);
        return ResponseEntity.ok(transactions);
    }

    /**
     * UC10: Thêm giao dịch & Tự động trả về Tin nhắn cảnh báo hạn mức ngân sách
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody TransactionRequest request) {
        try {
            Transaction newTransaction = transactionService.createTransaction(request);

            // Hệ thống tự động trả về đối tượng kèm theo thông tin alertMessage (nếu có)
            return ResponseEntity.ok(newTransaction);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}