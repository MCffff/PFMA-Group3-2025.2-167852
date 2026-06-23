package com.hust.pfma.dtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class TransactionRequest {
    private Double amount;
    private String type;
    private Long categoryId;
    private Long walletId;
    private LocalDate transactionDate;
    private String description;
}