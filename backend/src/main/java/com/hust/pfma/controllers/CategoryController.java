package com.hust.pfma.controllers;

import com.hust.pfma.dtos.CategoryRequest;
import com.hust.pfma.models.Category;
import com.hust.pfma.services.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Lấy danh sách danh mục áp dụng cho User cụ thể
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Category>> getCategories(@PathVariable Long userId) {
        return ResponseEntity.ok(categoryService.getCategoriesByUserId(userId));
    }

    // API Luồng chính: Tạo danh mục tự chọn mới
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody CategoryRequest request) {
        try {
            Category savedCategory = categoryService.createCategory(request);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Thêm danh mục mới thành công!",
                    "data", savedCategory
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    // API Luồng rẽ nhánh 1: Chỉnh sửa danh mục tự tạo
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody CategoryRequest request) {
        try {
            Category updatedCategory = categoryService.updateCategory(id, request);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Cập nhật danh mục thành công!",
                    "data", updatedCategory
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    // API Luồng rẽ nhánh 2: Xóa danh mục
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Xóa danh mục thành công!"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}