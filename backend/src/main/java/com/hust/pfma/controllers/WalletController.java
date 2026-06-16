package com.hust.pfma.controllers;

import com.hust.pfma.models.Wallet;
import com.hust.pfma.services.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/wallets")
@CrossOrigin(origins = "http://localhost:5173") 
public class WalletController {

    private final WalletService walletService;

    // CHUẨN KIẾN TRÚC: Chỉ nạp duy nhất WalletService vào đây để quản lý điều hướng
    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    /**
     * 1. LẤY DANH SÁCH VÍ ĐỘNG THEO TÀI KHOẢN
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Wallet>> getWalletsByUserId(@PathVariable Long userId) {
        List<Wallet> wallets = walletService.findWalletsByUserId(userId);
        return ResponseEntity.ok(wallets);
    }

    /**
     * 2. TẠO VÍ MỚI VÀ GẮN CHẶT VÀO TÀI KHOẢN SỞ HỮU
     */
    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createWallet(@PathVariable Long userId, @RequestBody Wallet wallet) {
        try {
            Wallet savedWallet = walletService.createWallet(userId, wallet);
            return ResponseEntity.ok(savedWallet);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 3. UC04: CHỈNH SỬA THÔNG TIN VÍ TIỀN
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateWallet(@PathVariable Long id, @RequestBody Wallet walletDetails) {
        try {
            // Tạm thời gọi trực tiếp qua service (Bạn bổ sung hàm này trong WalletService nếu cần, hoặc xử lý nhanh)
            Wallet updatedWallet = walletService.updateWallet(id, walletDetails);
            return ResponseEntity.ok(updatedWallet);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 4. UC04: THỰC HIỆN XÓA VÍ
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWallet(@PathVariable Long id) {
        try {
            walletService.deleteWallet(id);
            return ResponseEntity.ok("Xóa ví thành công và hệ thống đã cập nhật lại tổng số dư!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}