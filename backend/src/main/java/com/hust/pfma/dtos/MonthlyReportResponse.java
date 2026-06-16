package com.hust.pfma.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MonthlyReportResponse {
    private Integer month;
    private String type; // INCOME hoặc EXPENSE
    private Double totalAmount;
}