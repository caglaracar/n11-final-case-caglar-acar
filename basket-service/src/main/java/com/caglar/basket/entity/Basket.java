package com.caglar.basket.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "baskets")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Basket {

    @Id
    private String id;

    @Indexed(unique = true)
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
