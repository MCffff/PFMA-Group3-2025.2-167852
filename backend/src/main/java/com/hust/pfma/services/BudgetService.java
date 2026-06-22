package com.hust.pfma.services;

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
    public Budget createBudget(Budget requestBudget) {
        // 1. Kiểm tra dữ liệu đầu vào an toàn
        if (requestBudget.getUser() == null || requestBudget.getUser().getId() == null) {
            throw new IllegalArgumentException("Thiếu thông tin User ID để liên kết ngân sách!");
        }
        if (requestBudget.getCategory() == null || requestBudget.getCategory().getId() == null) {
            throw new IllegalArgumentException("Thiếu thông tin Category ID cho hạn mức này!");
        }

        // 2. Tìm kiếm thực thể thật từ MySQL dưới sự quản lý của Hibernate EntityManager
        User user = userRepository.findById(requestBudget.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hợp lệ"));

        Category category = categoryRepository.findById(requestBudget.getCategory().getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục chi tiêu hợp lệ"));

        // 3. Thực hiện ánh xạ vật lý (Mapping) để loại bỏ hoàn toàn lỗi gán NULL user_id trong Database
        requestBudget.setUser(user);
        requestBudget.setCategory(category);

        // 4. Lưu thực thể hoàn chỉnh xuống MySQL thông qua Repository
        return budgetRepository.save(requestBudget);
    }

    /**
     * Lấy danh sách ngân sách cô lập riêng biệt theo từng cá nhân
     */
    public List<Budget> getBudgetsByUserId(Long userId) {
        return budgetRepository.findByUserId(userId);
    }
}