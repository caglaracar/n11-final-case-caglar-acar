package com.caglar.stock.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "stocks")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Stock {

    @Id
    private String id;

    @Indexed(unique = true)
    private String productId;

    private int quantity;
}
