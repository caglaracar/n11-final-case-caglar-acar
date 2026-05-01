package com.caglar.basket.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Basket {
    private Long authId;
    @Builder.Default
    private List<BasketItem> items = new ArrayList<>();
    private Long updatedAt;

    public Double total() {
        return items.stream()
                .mapToDouble(item -> (item.getUnitPrice() == null ? 0d : item.getUnitPrice()) * item.getQuantity())
                .sum();
    }

    public void addOrMergeItem(BasketItem incoming) {
        items.stream()
                .filter(item -> item.getProductId().equals(incoming.getProductId()))
                .findFirst()
                .ifPresentOrElse(
                        existing -> {
                            existing.setQuantity(existing.getQuantity() + incoming.getQuantity());
                            existing.setUnitPrice(incoming.getUnitPrice());
                        },
                        () -> items.add(incoming));
    }

    public void changeQuantity(String productId, int quantity) {
        if (quantity == 0) {
            removeItem(productId);
            return;
        }
        items.stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .ifPresent(item -> item.setQuantity(quantity));
    }

    public boolean removeItem(String productId) {
        return items.removeIf(item -> item.getProductId().equals(productId));
    }
}
