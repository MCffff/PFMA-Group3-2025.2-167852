package com.hust.pfma.repositories;

import com.hust.pfma.models.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    List<Wallet> findByUserId(Long userId);

    // Kiểm tra xem user đó đã có cái ví nào trùng tên chưa
    boolean existsByUserIdAndWalletName(Long userId, String walletName);
}