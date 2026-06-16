package com.hust.pfma.services;

import com.hust.pfma.models.Wallet;
import com.hust.pfma.models.User;
import com.hust.pfma.repositories.UserRepository;
import com.hust.pfma.repositories.WalletRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    // Áp dụng chuẩn Constructor Injection
    public WalletService(WalletRepository walletRepository, UserRepository userRepository) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
    }

    public List<Wallet> findWalletsByUserId(Long userId) {
        // Kiểm tra xem user có tồn tại không trước khi lôi ví
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("Lỗi: Không tìm thấy tài khoản người dùng hợp lệ!");
        }
        return walletRepository.findByUserId(userId);
    }

    /**
     * GẮN CHỦ SỞ HỮU ĐỘNG: Tạo ví mới và liên kết trực tiếp với tài khoản người dùng
     */
    public Wallet createWallet(Long userId, Wallet wallet) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Lỗi: Người dùng không tồn tại!"));

        wallet.setUser(user); // Khử hardcode: Ép gán hộ khẩu người sở hữu vào ví tiền này
        return walletRepository.save(wallet);
    }

    /**
     * CẬP NHẬT THÔNG TIN VÍ TIỀN
     */
    public Wallet updateWallet(Long id, Wallet walletDetails) {
        Wallet wallet = walletRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy ví cần sửa!"));

        wallet.setName(walletDetails.getName());
        wallet.setBalance(walletDetails.getBalance());
        return walletRepository.save(wallet);
    }

    /**
     * XÓA VÍ KHỎI HỆ THỐNG
     */
    public void deleteWallet(Long id) {
        Wallet wallet = walletRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy ví cần xóa!"));
        walletRepository.delete(wallet);
    }
}