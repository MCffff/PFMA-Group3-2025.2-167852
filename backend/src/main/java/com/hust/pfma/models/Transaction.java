package com.hust.pfma.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double amount; // Số tiền giao dịch (Ví dụ: 50000)

    private String description; // Ghi chú (Ví dụ: "Ăn trưa với nhóm")

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate = LocalDateTime.now();

    // Mối quan hệ: Nhiều giao dịch thuộc về 1 Ví tiền
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user"})
    private Wallet wallet;

    // Mối quan hệ: Nhiều giao dịch thuộc về 1 Danh mục thu chi
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Category category;

    // Dòng tin nhắn cảnh báo
    @Transient
    private String alertMessage;
}