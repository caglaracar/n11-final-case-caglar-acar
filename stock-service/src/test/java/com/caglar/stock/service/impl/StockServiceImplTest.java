package com.caglar.stock.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.stock.dto.request.StockOpRequestDto;
import com.caglar.stock.dto.response.StockResponseDto;
import com.caglar.stock.entity.Stock;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class StockServiceImplTest {

    @Mock MongoTemplate mongoTemplate;

    @InjectMocks StockServiceImpl service;

    // ─── reserve ─────────────────────────────────────────────────

    @Test
    void reserve_decrementsStock_whenSufficient() {
        Stock existing = stock("p1", 10);
        given(mongoTemplate.findAndModify(any(Query.class), any(Update.class), eq(Stock.class)))
                .willReturn(existing);

        service.reserve(opRequest(1L, "p1", 3));

        then(mongoTemplate).should().findAndModify(any(Query.class), any(Update.class), eq(Stock.class));
    }

    @Test
    void reserve_rollsBackAndThrows_whenStockInsufficient() {
        // İlk ürün başarılı, ikinci ürün için stok yok → rollback
        Stock existing = stock("p1", 5);
        given(mongoTemplate.findAndModify(any(Query.class), any(Update.class), eq(Stock.class)))
                .willReturn(existing)  // p1 başarılı
                .willReturn(null);     // p2 yetersiz

        StockOpRequestDto req = new StockOpRequestDto(1L, List.of(
                new StockOpRequestDto.Item("p1", 2),
                new StockOpRequestDto.Item("p2", 1)
        ));

        assertThatThrownBy(() -> service.reserve(req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("p2");
    }

    @Test
    void reserve_throwsImmediately_whenSingleItemInsufficient() {
        given(mongoTemplate.findAndModify(any(Query.class), any(Update.class), eq(Stock.class)))
                .willReturn(null);

        assertThatThrownBy(() -> service.reserve(opRequest(1L, "p1", 99)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("p1");
    }

    // ─── release ─────────────────────────────────────────────────

    @Test
    void release_incrementsStockForEachItem() {
        service.release(opRequest(1L, "p1", 3));

        then(mongoTemplate).should().updateFirst(any(Query.class), any(Update.class), eq(Stock.class));
    }

    // ─── getByProductId ──────────────────────────────────────────

    @Test
    void getByProductId_returnsQuantity_whenStockExists() {
        given(mongoTemplate.findOne(any(Query.class), eq(Stock.class)))
                .willReturn(stock("p1", 42));

        StockResponseDto result = service.getByProductId("p1");

        assertThat(result.productId()).isEqualTo("p1");
        assertThat(result.quantity()).isEqualTo(42);
    }

    @Test
    void getByProductId_returnsZero_whenNoStockRecord() {
        given(mongoTemplate.findOne(any(Query.class), eq(Stock.class))).willReturn(null);

        StockResponseDto result = service.getByProductId("unknown");

        assertThat(result.quantity()).isEqualTo(0);
    }

    // ─── set ─────────────────────────────────────────────────────

    @Test
    void set_upsertsStockDocument() {
        service.set("p1", 50);

        then(mongoTemplate).should().upsert(any(Query.class), any(Update.class), eq(Stock.class));
    }

    @Test
    void set_returnsCorrectQuantity() {
        StockResponseDto result = service.set("p1", 100);

        assertThat(result.productId()).isEqualTo("p1");
        assertThat(result.quantity()).isEqualTo(100);
    }

    // ─── helpers ─────────────────────────────────────────────────

    private Stock stock(String productId, int qty) {
        return Stock.builder().productId(productId).quantity(qty).build();
    }

    private StockOpRequestDto opRequest(Long orderId, String productId, int qty) {
        return new StockOpRequestDto(orderId, List.of(new StockOpRequestDto.Item(productId, qty)));
    }
}
