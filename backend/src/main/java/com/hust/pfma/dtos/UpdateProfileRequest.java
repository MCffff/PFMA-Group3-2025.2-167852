package com.hust.pfma.dtos;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String email;
}
