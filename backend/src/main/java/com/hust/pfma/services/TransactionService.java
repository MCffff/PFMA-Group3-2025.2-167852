package com.hust.pfma.services;

import com.hust.pfma.dtos.CategoryRequest;
import com.hust.pfma.dtos.DashboardResponse;
import com.hust.pfma.dtos.TransactionRequest;
import com.hust.pfma.models.*;
import com.hust.pfma.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
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
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    // Lấy danh sách danh mục ứng với User (Mặc định hệ thống + Tự tạo nhanh)
    public List<Category> getCategories(Long userId) {
        return categoryRepository.findByUserIdIsNullOrUserId(userId);
    }

    // LUỒNG THAY THẾ: Thêm nhanh danh mục mới
    public Category createCategoryQuick(CategoryRequest request) {
        if (request.getCategoryName() == null || request.getCategoryName().trim().isEmpty()) {
            throw new RuntimeException("Tên danh mục không được để trống!");
        }
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        Category category = new Category();
        category.setCategoryName(request.getCategoryName());
        category.setType(request.getType());
        category.setUser(user);
        return categoryRepository.save(category);
    }

    // LUỒNG CHÍNH: Thêm giao dịch (Đồng bộ logic ví, kiểm tra ngân sách hợp lệ)
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
        transaction.setType(request.getType());

        //Bốc trực tiếp User sở hữu chiếc ví này gán vào Giao dịch
        transaction.setUser(wallet.getUser());

        // ĐỒNG BỘ: Gán ngày giao dịch từ request (hoặc dùng LocalDate.now() nếu request bị null)
        transaction.setTransactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDate.now());

        // 3. Thay đổi số dư ví tiền & Kiểm tra Ngân sách hạn mức
        if ("EXPENSE".equalsIgnoreCase(category.getType())) {
            if (wallet.getBalance() < request.getAmount()) {
                throw new RuntimeException("Số dư trong ví không đủ để thực hiện giao dịch chi tiêu này!");
            }
            wallet.setBalance(wallet.getBalance() - request.getAmount());

            // A. Tìm xem danh mục này có đang áp dụng ngân sách nào trong tháng hiện tại không
            LocalDate today = LocalDate.now();
            Optional<Budget> budgetOpt = budgetRepository
                    .findByUserIdAndCategoryIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            wallet.getUser().getId(), category.getId(), today, today
                    );

            // B. Nếu tìm thấy Ngân sách, tiến hành cộng dồn tiền đã tiêu và kiểm tra hạn mức
            if (budgetOpt.isPresent()) {
                Budget budget = budgetOpt.get();

                // Phòng thủ: Tránh lỗi NullPointerException
                double currentSpent = budget.getSpent() != null ? budget.getSpent() : 0.0;
                double budgetAmount = budget.getAmount() != null ? budget.getAmount() : 1.0;

                // Cộng dồn số tiền vừa tiêu vào ngân sách
                budget.setSpent(currentSpent + request.getAmount());
                budgetRepository.save(budget); // Lưu số tiền đã tiêu mới vào MySQL

                // C. Tính phần trăm để bắn Cảnh báo
                double percentage = (budget.getSpent() / budgetAmount) * 100;
                System.out.println("Ngân sách danh mục " + category.getCategoryName() + " đã tiêu: " + percentage + "%");
            }

        } else if ("INCOME".equalsIgnoreCase(category.getType())) {
            wallet.setBalance(wallet.getBalance() + request.getAmount());
        }

        // 4. Lưu lại số dư ví mới và thông tin giao dịch vào MySQL
        walletRepository.save(wallet);
        return transactionRepository.save(transaction);
    }

    // Lấy lịch sử giao dịch động theo UserId (Đã gọi hàm Repo sửa đổi bắc cầu)
    public List<Transaction> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    public List<Transaction> getTransactionHistoryByUserId(Long userId) {
        // Gọi xuống Repository để lấy danh sách giao dịch, sắp xếp hoặc trả về trực tiếp
        return transactionRepository.findByUserId(userId);
    }

    public DashboardResponse getDashboardStats(Long userId) {
        LocalDate now = LocalDate.now();
        LocalDate startDate = now.withDayOfMonth(1); // Ngày đầu tháng hiện tại
        LocalDate endDate = now.withDayOfMonth(now.lengthOfMonth()); // Ngày cuối tháng hiện tại

        // 1. Lấy toàn bộ giao dịch trong tháng của user này
        List<Transaction> transactions = transactionRepository
                .findByUserIdAndTransactionDateBetween(userId, startDate, endDate);

        double totalIncome = 0.0;
        double totalExpense = 0.0;
        java.util.Map<String, Double> categoryMap = new java.util.HashMap<>();

        // 2. Phân loại cộng dồn Thu/Chi và nhóm theo Danh mục
        for (Transaction t : transactions) {
            if ("INCOME".equalsIgnoreCase(t.getType())) {
                totalIncome += t.getAmount();
            } else if ("EXPENSE".equalsIgnoreCase(t.getType())) {
                totalExpense += t.getAmount();

                // Nhóm số tiền tiêu theo tên danh mục
                String catName = t.getCategory() != null ? t.getCategory().getCategoryName() : "Khác";
                categoryMap.put(catName, categoryMap.getOrDefault(catName, 0.0) + t.getAmount());
            }
        }

        // 3. Đóng gói danh sách thống kê danh mục
        List<DashboardResponse.CategoryStat> catStats = new java.util.ArrayList<>();
        for (Map.Entry<String, Double> entry : categoryMap.entrySet()) {
            DashboardResponse.CategoryStat stat = new DashboardResponse.CategoryStat();
            stat.setCategoryName(entry.getKey());
            stat.setTotalAmount(entry.getValue());
            stat.setPercentage(totalExpense > 0 ? (entry.getValue() / totalExpense) * 100 : 0.0);
            catStats.add(stat);
        }

        // 4. Tạo đối tượng phản hồi tổng quan
        DashboardResponse response = new DashboardResponse();
        response.setTotalIncome(totalIncome);
        response.setTotalExpense(totalExpense);
        response.setNetBalance(totalIncome - totalExpense);
        response.setCategoryStats(catStats);

        return response;
    }
}