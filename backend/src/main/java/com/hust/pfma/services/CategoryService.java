package com.hust.pfma.services;

import com.hust.pfma.dtos.CategoryRequest;
import com.hust.pfma.models.Category;
import com.hust.pfma.models.User;
import com.hust.pfma.repositories.CategoryRepository;
import com.hust.pfma.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. Xem danh sách danh mục
    public List<Category> getCategoriesByUserId(Long userId) {
        return categoryRepository.findByUserIdIsNullOrUserId(userId);
    }

    // 2. LUỒNG CHÍNH: Thêm mới danh mục cá nhân
    public Category createCategory(CategoryRequest request) {
        if (request.getCategoryName() == null || request.getCategoryName().trim().isEmpty()) {
            throw new RuntimeException("Tên danh mục không được để trống!");
        }

        // Kiểm tra xem tên danh mục này user đã tạo chưa
        if (categoryRepository.existsByUserIdAndCategoryNameAndType(request.getUserId(), request.getCategoryName(), request.getType())) {
            throw new RuntimeException("Bạn đã sở hữu danh mục có tên này rồi!");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng hợp lệ!"));

        Category category = new Category();
        category.setCategoryName(request.getCategoryName());
        category.setType(request.getType());
        category.setUser(user); // Thuộc về riêng user này

        return categoryRepository.save(category);
    }

    // 3. LUỒNG RẼ NHÁNH 1: Sửa tên/loại danh mục
    public Category updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục cần sửa!"));

        // Bảo vệ hệ thống: Không cho phép sửa danh mục mặc định của hệ thống
        if (category.getUser() == null) {
            throw new RuntimeException("Không thể chỉnh sửa danh mục mặc định của hệ thống!");
        }

        category.setCategoryName(request.getCategoryName());
        category.setType(request.getType());
        return categoryRepository.save(category);
    }

    // 4. LUỒNG RẼ NHÁNH 2: Xóa danh mục tự tạo
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục cần xóa!"));

        // Bảo vệ hệ thống: Không cho phép xóa danh mục mặc định của hệ thống
        if (category.getUser() == null) {
            throw new RuntimeException("Không thể xóa danh mục mặc định của hệ thống!");
        }
        categoryRepository.deleteById(id);
    }
}