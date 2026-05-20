package com.hust.pfma.dtos;

import lombok.Data;

@Data
public class TransactionRequest {
    private Double amount;
    private String description;
    private Long walletId;
    private Long categoryId;
}