package com.caglar.product.entity;

import com.caglar.common.entity.BaseDocument;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "review")
public class Review extends BaseDocument {

    @Indexed
    private String productId;

    @Indexed
    private Long authorAuthId;

    private String authorName;

    /** 1-5 yıldız. */
    private Integer rating;

    private String title;

    private String comment;
}
