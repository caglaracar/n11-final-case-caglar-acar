package com.caglar.stock.service.impl;

import com.caglar.common.exception.BusinessException;
import com.caglar.stock.dto.request.StockOpRequestDto;
import com.caglar.stock.dto.response.StockResponseDto;
import com.caglar.stock.entity.Stock;
import com.caglar.stock.repository.StockRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class StockServiceImplTest {

    @Mock StockRepository stockRepository;

    @InjectMocks StockServiceImpl service;

    // ─── reserve ─────────────────────────────────────────────────

    @Test
    void reserve_decrementsStock_whenSufficient() {
        given(stockRepository.decrementIfSufficient("p1", 3)).willReturn(stock("p1", 10));

        service.reserve(opRequest(1L, "p1", 3));

        then(stockRepository).should().decrementIfSufficient("p1", 3);
    }

    @Test
    void reserve_rollsBackAndThrows_whenStockInsufficient() {
        given(stockRepository.decrementIfSufficient("p1", 2)).willReturn(stock("p1", 5));
        given(stockRepository.decrementIfSufficient("p2", 1)).willReturn(null);
        given(stockRepository.existsByProductId("p2")).willReturn(true);

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
        given(stockRepository.decrementIfSufficient("p1", 99)).willReturn(null);
        given(stockRepository.existsByProductId("p1")).willReturn(true);

        assertThatThrownBy(() -> service.reserve(opRequest(1L, "p1", 99)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("p1");
    }

    @Test
    void reserve_skipsItem_whenNoStockRecord() {
        given(stockRepository.decrementIfSufficient("unknown", 5)).willReturn(null);
        given(stockRepository.existsByProductId("unknown")).willReturn(false);

        service.reserve(opRequest(1L, "unknown", 5));
    }

    // ─── release ─────────────────────────────────────────────────

    @Test
    void release_incrementsStockForEachItem() {
        service.release(opRequest(1L, "p1", 3));

        then(stockRepository).should().increment("p1", 3);
    }

    // ─── getByProductId ──────────────────────────────────────────

    @Test
    void getByProductId_returnsQuantity_whenStockExists() {
        given(stockRepository.findStockByProductId("p1")).willReturn(stock("p1", 42));

        StockResponseDto result = service.getByProductId("p1");

        assertThat(result.productId()).isEqualTo("p1");
        assertThat(result.quantity()).isEqualTo(42);
    }

    @Test
    void getByProductId_returnsZero_whenNoStockRecord() {
        given(stockRepository.findStockByProductId("unknown")).willReturn(null);

        StockResponseDto result = service.getByProductId("unknown");

        assertThat(result.quantity()).isEqualTo(0);
    }

    // ─── set ─────────────────────────────────────────────────────

    @Test
    void set_upsertsAndReturnsCorrectQuantity() {
        StockResponseDto result = service.set("p1", 100);

        then(stockRepository).should().upsert("p1", 100);
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
