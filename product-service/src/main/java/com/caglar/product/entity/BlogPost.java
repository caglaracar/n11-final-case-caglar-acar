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
@Document(collection = "blog_post")
public class BlogPost extends BaseDocument {

    @Indexed
    private String slug;

    private String title;
    private String excerpt;
    private String content;
    private String category;
    private String image;
    private String author;
    /** Dakika cinsinden okuma süresi. */
    private Integer readMinutes;
    /** Yayınlandı mı? Taslakları gizlemek için. */
    @Builder.Default
    private Boolean published = true;
}
