package com.hust.pfma.dtos;
import lombok.Data;

@Data
public class CategoryRequest {
    private Long userId;
    private String categoryName;
    private String type;
}