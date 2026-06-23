package com.hust.pfma.controllers;

import com.hust.pfma.dtos.WalletRequest;
import com.hust.pfma.models.Wallet;
import com.hust.pfma.services.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map; // Dùng Map để cấu trúc JSON Object đồng bộ cho Front-end

@RestController
@RequestMapping("/api/wallets")
@CrossOrigin(origins = "http://localhost:5173")
public class WalletController {

    private final WalletService walletService;

    // CHUẨN KIẾN TRÚC: Constructor Injection gọn gàng, sạch sẽ
    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    /**
     * 1. LẤY DANH SÁCH VÍ ĐỘNG THEO TÀI KHOẢN
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Wallet>> getWalletsByUserId(@PathVariable Long userId) {
        // Đồng bộ gọi findWalletsByUserId hoặc getWalletsByUserId tùy tên hàm trong Service của ông
        List<Wallet> wallets = walletService.getWalletsByUserId(userId);
        return ResponseEntity.ok(wallets);
    }

    /**
     * 2. LUỒNG CHÍNH UC04: TẠO VÍ MỚI
     */
    @PostMapping
    public ResponseEntity<?> createWallet(@RequestBody WalletRequest request) {
        try {
            Wallet savedWallet = walletService.createWallet(request);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Thêm ví thành công!",
                    "data", savedWallet
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * 3. UC04: CHỈNH SỬA THÔNG TIN VÍ TIỀN
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateWallet(@PathVariable Long id, @RequestBody WalletRequest request) {
        try {
            Wallet updatedWallet = walletService.updateWallet(id, request);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Cập nhật ví thành công!",
                    "data", updatedWallet
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * 4. UC04: THỰC HIỆN XÓA VÍ
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWallet(@PathVariable Long id) {
        try {
            walletService.deleteWallet(id);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Xóa ví thành công và hệ thống đã cập nhật lại tổng số dư!"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        }
    }
}