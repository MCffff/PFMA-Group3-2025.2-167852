package com.hust.pfma.repositories;

import com.hust.pfma.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    /**
     * UC05: Lấy danh mục mặc định (user_id IS NULL) HOẶC danh mục do chính user tự tạo
     */
    @Query("SELECT c FROM Category c WHERE c.user.id IS NULL OR c.user.id = :userId")
    List<Category> findByUserIdIsNullOrUserId(@Param("userId") Long userId);

    boolean existsByUserIdAndCategoryNameAndType(Long userId, String categoryName, String type);
}