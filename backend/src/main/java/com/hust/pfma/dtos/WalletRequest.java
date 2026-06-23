package com.hust.pfma.dtos;

import lombok.Data;

@Data
public class WalletRequest {
    private Long userId;
    private String walletName;
    private Double balance;
    private String description;
}