package com.hust.pfma.services;

import com.hust.pfma.dtos.WalletRequest;
import com.hust.pfma.models.User;
import com.hust.pfma.models.Wallet;
import com.hust.pfma.repositories.UserRepository;
import com.hust.pfma.repositories.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private UserRepository userRepository;

    // Lấy tất cả ví của 1 User
    public List<Wallet> getWalletsByUserId(Long userId) {
        return walletRepository.findByUserId(userId);
    }

    // LUỒNG CHÍNH: Thêm ví mới
    public Wallet createWallet(WalletRequest request) {
        // Kiểm tra dữ liệu hợp lệ cơ bản
        if (request.getWalletName() == null || request.getWalletName().trim().isEmpty()) {
            throw new RuntimeException("Tên ví không được để trống!");
        }
        if (request.getBalance() == null || request.getBalance() < 0) {
            throw new RuntimeException("Số dư ban đầu không được âm!");
        }

        // Kiểm tra trùng tên ví của chính User đó
        if (walletRepository.existsByUserIdAndWalletName(request.getUserId(), request.getWalletName())) {
            throw new RuntimeException("Tên ví này đã tồn tại, vui lòng chọn tên khác!");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        Wallet wallet = new Wallet();
        wallet.setWalletName(request.getWalletName());
        wallet.setBalance(request.getBalance());
        wallet.setDescription(request.getDescription());
        wallet.setUser(user);

        return walletRepository.save(wallet);
    }

    // LUỒNG RẼ NHÁNH 1: Sửa thông tin ví
    public Wallet updateWallet(Long walletId, WalletRequest request) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ví cần sửa!"));

        if (request.getWalletName() == null || request.getWalletName().trim().isEmpty()) {
            throw new RuntimeException("Tên ví không được để trống!");
        }

        // Nếu đổi tên ví mới, kiểm tra xem có trùng với ví khác cùng user không
        if (!wallet.getWalletName().equals(request.getWalletName()) &&
                walletRepository.existsByUserIdAndWalletName(wallet.getUser().getId(), request.getWalletName())) {
            throw new RuntimeException("Tên ví này đã tồn tại!");
        }

        wallet.setWalletName(request.getWalletName());
        wallet.setBalance(request.getBalance());
        wallet.setDescription(request.getDescription());

        return walletRepository.save(wallet);
    }

    // LUỒNG RẼ NHÁNH 2: Xóa ví
    public void deleteWallet(Long walletId) {
        if (!walletRepository.existsById(walletId)) {
            throw new RuntimeException("Ví không tồn tại hoặc đã bị xóa trước đó!");
        }
        walletRepository.deleteById(walletId);
    }
}