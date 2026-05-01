package com.caglar.product.helper;

import com.caglar.product.entity.Product;
import com.caglar.product.dto.request.ProductSearchFilter;
import com.caglar.product.service.SearchStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

/** Arama metriklerini Redis'e yazan side-effect; sadece sorgu varsa ve ilk sayfada çalışır. */
@Component
@RequiredArgsConstructor
public class SearchStatsRecorder {

    private final SearchStatsService searchStatsService;

    public void recordIfNeeded(ProductSearchFilter filter, Page<Product> page) {
        if (!filter.hasQ() || page.getNumber() != 0) {
            return;
        }
        searchStatsService.recordTerm(filter.q());
        searchStatsService.recordProductHits(page.getContent().stream().map(Product::getId).toList());
    }
}
