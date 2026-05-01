package com.caglar.basket.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BasketItem {
    private String productId;
    private String productName;
    private Integer quantity;
    private Double unitPrice;
}
