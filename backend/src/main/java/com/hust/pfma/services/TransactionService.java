package com.hust.pfma.services;

import com.hust.pfma.dtos.TransactionRequest;
import com.hust.pfma.models.*;
import com.hust.pfma.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BudgetRepository budgetRepository; // Đã nối dây kết nối với kho Ngân sách ở Bước 2

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @Transactional
    public Transaction createTransaction(TransactionRequest request) {
        // 1. Kiểm tra xem Ví và Danh mục có tồn tại trong DB không
        Wallet wallet = walletRepository.findById(request.getWalletId())
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy ví!"));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy danh mục!"));

        // 2. Khởi tạo đối tượng Giao dịch mới
        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setWallet(wallet);
        transaction.setCategory(category);

        // Lấy đích danh userId từ request
        // Thay vì lấy gián tiếp qua wallet.getUser() để tránh lệch pha chủ sở hữu ví.
        User currentUser = new User();
        currentUser.setId(request.getUserId());
        transaction.setUser(currentUser);

        transaction.setTransactionDate(java.time.LocalDateTime.now()); // Tự động lấy ngày giờ nạp giao dịch

        // 3. Thay đổi số dư ví tiền
        if ("EXPENSE".equalsIgnoreCase(category.getType())) {
            wallet.setBalance(wallet.getBalance() - request.getAmount());

            // A. Tìm xem danh mục này có đang áp dụng ngân sách nào trong tháng hiện tại không
            LocalDate today = LocalDate.now();
            Optional<Budget> budgetOpt = budgetRepository
                    .findByUserIdAndCategoryIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            request.getUserId(), category.getId(), today, today // ĐỒNG BỘ: Dùng request.getUserId() luôn cho chuẩn bài ngân sách
                    );

            // B. Nếu tìm thấy Ngân sách, tiến hành cộng dồn tiền đã tiêu và kiểm tra hạn mức
            if (budgetOpt.isPresent()) {
                Budget budget = budgetOpt.get();

                // Phòng thủ: Nếu spent hoặc amount dính lỗi null dưới DB thì gán bằng 0 để tránh sập NullPointerException
                double currentSpent = budget.getSpent() != null ? budget.getSpent() : 0.0;
                double budgetAmount = budget.getAmount() != null ? budget.getAmount() : 1.0;

                // Cộng dồn số tiền vừa tiêu vào ngân sách
                budget.setSpent(currentSpent + request.getAmount());
                budgetRepository.save(budget); // Lưu số tiền đã tiêu mới vào MySQL

                // C. Tính phần trăm để bắn Cảnh báo
                double percentage = (budget.getSpent() / budgetAmount) * 100;

                if (percentage >= 100) {
                    transaction.setAlertMessage("DANGER: Bạn đã tiêu quá 100% hạn mức của danh mục '" + category.getName() + "' tháng này!");
                } else if (percentage >= 80) {
                    transaction.setAlertMessage("WARNING: Bạn đã chi tiêu vượt quá 80% hạn mức của danh mục '" + category.getName() + "' tháng này!");
                }
            }

        } else if ("INCOME".equalsIgnoreCase(category.getType())) {
            wallet.setBalance(wallet.getBalance() + request.getAmount());
        }

        // 4. Lưu lại số dư ví mới và thông tin giao dịch vào MySQL
        walletRepository.save(wallet);
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserId(userId);
    }
}