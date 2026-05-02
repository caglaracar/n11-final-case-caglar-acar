package com.caglar.product.stock;

import com.caglar.common.dto.BaseResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Stock", description = "Servisler arası stok rezervasyon/iade")
public interface IStockApi {

    @Operation(summary = "Stok rezerve et (sipariş oluşturma sırasında)")
    ResponseEntity<BaseResponse<Void>> reserve(@Valid @RequestBody StockOpRequestDto dto);

    @Operation(summary = "Stok iade et (ödeme başarısız / sipariş iptal)")
    ResponseEntity<BaseResponse<Void>> release(@Valid @RequestBody StockOpRequestDto dto);
}
