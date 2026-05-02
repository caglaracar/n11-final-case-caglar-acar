package com.caglar.product.repository.search;

import com.caglar.product.entity.Product;
import com.caglar.product.dto.request.ProductSearchFilter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductSearchRepository {

    Page<Product> search(ProductSearchFilter filter, Pageable pageable);
}
