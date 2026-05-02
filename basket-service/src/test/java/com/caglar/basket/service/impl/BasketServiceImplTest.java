package com.caglar.basket.service.impl;

import com.caglar.basket.dto.request.AddToBasketRequestDto;
import com.caglar.basket.dto.request.UpdateBasketItemRequestDto;
import com.caglar.basket.dto.response.BasketResponseDto;
import com.caglar.basket.entity.Basket;
import com.caglar.basket.entity.BasketItem;
import com.caglar.basket.repository.BasketRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class BasketServiceImplTest {

    @Mock BasketRepository basketRepository;
    @InjectMocks BasketServiceImpl service;

    private static final Long AUTH_ID = 1L;

    @Test
    void getMyBasket_returnsEmptyBasket_whenNotExists() {
        given(basketRepository.findByAuthId(AUTH_ID)).willReturn(Optional.empty());

        BasketResponseDto result = service.getMyBasket(AUTH_ID);

        assertThat(result.authId()).isEqualTo(AUTH_ID);
        assertThat(result.items()).isEmpty();
        assertThat(result.total()).isEqualTo(0.0);
    }

    @Test
    void getMyBasket_calculatesTotal_correctly() {
        Basket basket = basketWith(new ArrayList<>(List.of(
                item("p1", 2, 100.0),
                item("p2", 3, 50.0)
        )));
        given(basketRepository.findByAuthId(AUTH_ID)).willReturn(Optional.of(basket));

        BasketResponseDto result = service.getMyBasket(AUTH_ID);

        assertThat(result.total()).isEqualTo(350.0);
        assertThat(result.items()).hasSize(2);
    }

    @Test
    void addItem_createsNewBasket_whenUserHasNoBasket() {
        given(basketRepository.findByAuthId(AUTH_ID)).willReturn(Optional.empty());
        given(basketRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        BasketResponseDto result = service.addItem(AUTH_ID, new AddToBasketRequestDto("p1", "Laptop", 2, 500.0));

        assertThat(result.items()).hasSize(1);
        assertThat(result.items().get(0).getQuantity()).isEqualTo(2);
        assertThat(result.total()).isEqualTo(1000.0);
    }

    @Test
    void addItem_mergesQuantityAndUpdatesPrice_whenProductAlreadyExists() {
        Basket basket = basketWith(new ArrayList<>(List.of(item("p1", 2, 50.0))));
        given(basketRepository.findByAuthId(AUTH_ID)).willReturn(Optional.of(basket));
        given(basketRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        // Aynı ürün farklı fiyatla tekrar eklendi (indirim uygulandı gibi)
        BasketResponseDto result = service.addItem(AUTH_ID, new AddToBasketRequestDto("p1", "Laptop", 3, 45.0));

        assertThat(result.items()).hasSize(1);
        assertThat(result.items().get(0).getQuantity()).isEqualTo(5);
        assertThat(result.items().get(0).getUnitPrice()).isEqualTo(45.0); // fiyat güncellenmeli
    }

    @Test
    void addItem_appendsItem_whenProductIsNew() {
        Basket basket = basketWith(new ArrayList<>(List.of(item("p1", 1, 100.0))));
        given(basketRepository.findByAuthId(AUTH_ID)).willReturn(Optional.of(basket));
        given(basketRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        BasketResponseDto result = service.addItem(AUTH_ID, new AddToBasketRequestDto("p2", "Fare", 1, 200.0));

        assertThat(result.items()).hasSize(2);
        assertThat(result.total()).isEqualTo(300.0);
    }

    @Test
    void updateItem_changesQuantity() {
        Basket basket = basketWith(new ArrayList<>(List.of(item("p1", 2, 100.0))));
        given(basketRepository.findByAuthId(AUTH_ID)).willReturn(Optional.of(basket));
        given(basketRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        BasketResponseDto result = service.updateItem(AUTH_ID, new UpdateBasketItemRequestDto("p1", 5));

        assertThat(result.items().get(0).getQuantity()).isEqualTo(5);
        assertThat(result.total()).isEqualTo(500.0);
    }

    @Test
    void updateItem_removesItem_whenQuantityIsZero() {
        Basket basket = basketWith(new ArrayList<>(List.of(item("p1", 2, 100.0), item("p2", 1, 50.0))));
        given(basketRepository.findByAuthId(AUTH_ID)).willReturn(Optional.of(basket));
        given(basketRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        BasketResponseDto result = service.updateItem(AUTH_ID, new UpdateBasketItemRequestDto("p1", 0));

        assertThat(result.items()).hasSize(1);
        assertThat(result.items().get(0).getProductId()).isEqualTo("p2");
    }

    @Test
    void removeItem_removesOnlyTargetItem_leavesOthersIntact() {
        Basket basket = basketWith(new ArrayList<>(List.of(item("p1", 1, 100.0), item("p2", 2, 50.0))));
        given(basketRepository.findByAuthId(AUTH_ID)).willReturn(Optional.of(basket));
        given(basketRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        BasketResponseDto result = service.removeItem(AUTH_ID, "p1");

        assertThat(result.items()).hasSize(1);
        assertThat(result.items().get(0).getProductId()).isEqualTo("p2");
        assertThat(result.total()).isEqualTo(100.0);
    }

    @Test
    void clear_delegatesToRepository() {
        service.clear(AUTH_ID);
        then(basketRepository).should().deleteByAuthId(AUTH_ID);
    }

    // --- helpers ---

    private Basket basketWith(List<BasketItem> items) {
        return Basket.builder().authId(AUTH_ID).items(items).build();
    }

    private BasketItem item(String productId, int qty, double price) {
        return BasketItem.builder()
                .productId(productId)
                .productName("Test Ürün")
                .quantity(qty)
                .unitPrice(price)
                .build();
    }
}
