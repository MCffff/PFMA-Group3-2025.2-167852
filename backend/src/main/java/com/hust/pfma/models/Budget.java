package com.hust.pfma.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "budgets")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Số tiền hạn mức tối đa do người dùng đặt ra (Ví dụ: 2.000.000đ)
    @Column(nullable = false)
    private Double amount;

    // Số tiền thực tế người dùng đã tiêu trong danh mục này (Mặc định ban đầu = 0.0)
    @Column(nullable = false)
    private Double spent = 0.0;

    // Ngày bắt đầu áp dụng hạn mức (Ví dụ: 2026-06-01)
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    // Ngày kết thúc áp dụng hạn mức (Ví dụ: 2026-06-30)
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    // Mối quan hệ: Một ngân sách bắt buộc phải thuộc về một Người dùng (User) cụ thể
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    // Mối quan hệ: Một ngân sách được áp dụng cho một Danh mục (Category) cụ thể (Ví dụ: Ăn uống, Giải trí)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}