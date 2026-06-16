package com.hust.pfma.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategoryReportResponse {
    private String categoryName;
    private Double totalAmount;
}