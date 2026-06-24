package com.hust.pfma.dtos;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BudgetRequest {
    private Double amount;
    private Long categoryId;
    private Long userId;
    private LocalDate startDate;
    private LocalDate endDate;
}