package com.caglar.product.repository.search;

import com.caglar.product.entity.Product;
import com.caglar.product.dto.request.ProductSearchFilter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Spring Data MongoDB <i>custom fragment</i>. {@code ProductRepository} bu interface'i de extend eder;
 * Spring Data {@code ProductSearchRepositoryImpl}'i otomatik bağlar.
 */
public interface ProductSearchRepository {

    Page<Product> search(ProductSearchFilter filter, Pageable pageable);
}
