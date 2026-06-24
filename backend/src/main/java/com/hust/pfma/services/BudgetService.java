package com.hust.pfma.services;

import com.hust.pfma.dtos.BudgetRequest;
import com.hust.pfma.models.Budget;
import com.hust.pfma.models.User;
import com.hust.pfma.models.Category;
import com.hust.pfma.repositories.BudgetRepository;
import com.hust.pfma.repositories.UserRepository;
import com.hust.pfma.repositories.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * UC08: Logic xử lý tạo mới hạn mức chi tiêu gắn chặt vào tài khoản người dùng
     */
    public Budget createBudget(com.hust.pfma.dtos.BudgetRequest request) {
        // 1. Kiểm tra dữ liệu đầu vào an toàn từ DTO
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("Thiếu thông tin User ID để liên kết ngân sách!");
        }
        if (request.getCategoryId() == null) {
            throw new IllegalArgumentException("Thiếu thông tin Category ID cho hạn mức này!");
        }

        // 2. Tìm kiếm thực thể thật từ MySQL dưới sự quản lý của Hibernate EntityManager
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hợp lệ"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục chi tiêu hợp lệ"));

        // 3. Khởi tạo thực thể mới và thực hiện ánh xạ vật lý (Mapping)
        Budget budget = new Budget();
        budget.setAmount(request.getAmount());
        budget.setStartDate(request.getStartDate());
        budget.setEndDate(request.getEndDate());
        budget.setSpent(0.0);

        budget.setUser(user);
        budget.setCategory(category);

        // 4. Lưu thực thể hoàn chỉnh xuống MySQL thông qua Repository
        return budgetRepository.save(budget);
    }

    /**
     * Lấy danh sách ngân sách cô lập riêng biệt theo từng cá nhân
     */
    public List<Budget> getBudgetsByUserId(Long userId) {
        return budgetRepository.findByUserId(userId);
    }

    // LUỒNG RẼ NHÁNH 1: Chỉnh sửa số tiền hạn mức ngân sách
    public Budget updateBudget(Long id, BudgetRequest request) {
        // Tìm xem ngân sách có tồn tại không
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngân sách hạn mức cần chỉnh sửa!"));

        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new RuntimeException("Số tiền hạn mức ngân sách phải lớn hơn 0đ!");
        }

        // Chỉ cập nhật lại số tiền hạn mức mới, giữ nguyên số tiền đã tiêu (spent)
        budget.setAmount(request.getAmount());

        return budgetRepository.save(budget);
    }

    // LUỒNG RẼ NHÁNH 2: Xóa hẳn một hạn mức ngân sách
    public void deleteBudget(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ngân sách hạn mức cần xóa!"));

        budgetRepository.delete(budget);
    }
}