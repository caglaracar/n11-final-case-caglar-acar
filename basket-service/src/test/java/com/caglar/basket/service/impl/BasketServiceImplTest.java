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

    @Mock  BasketRepository basketRepository;
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
    void getMyBasket_returnsExistingBasket() {
        Basket basket = basketWith(List.of(item("p1", 2, 100.0)));
        given(basketRepository.findByAuthId(AUTH_ID)).willReturn(Optional.of(basket));

        BasketResponseDto result = service.getMyBasket(AUTH_ID);

        assertThat(result.items()).hasSize(1);
        assertThat(result.total()).isEqualTo(200.0);
    }

    @Test
    void addItem_createsNewBasketAndAddsItem_whenBasketNotExists() {
        given(basketRepository.findByAuthId(AUTH_ID)).willReturn(Optional.empty());
        given(basketRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        AddToBasketRequestDto req = new AddToBasketRequestDto("p1", "Laptop", 1, 999.0);
        BasketResponseDto result = service.addItem(AUTH_ID, req);

        assertThat(result.items()).hasSize(1);
        assertThat(result.total()).isEqualTo(999.0);
    }

    @Test
    void addItem_mergesQuantity_whenSameProductExists() {
        Basket basket = basketWith(new ArrayList<>(List.of(item("p1", 2, 50.0))));
        given(basketRepository.findByAuthId(AUTH_ID)).willReturn(Optional.of(basket));
        given(basketRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        AddToBasketRequestDto req = new AddToBasketRequestDto("p1", "Laptop", 3, 50.0);
        BasketResponseDto result = service.addItem(AUTH_ID, req);

        assertThat(result.items()).hasSize(1);
        assertThat(result.items().get(0).getQuantity()).isEqualTo(5);
    }

    @Test
    void addItem_addsNewItem_whenDifferentProduct() {
        Basket basket = basketWith(new ArrayList<>(List.of(item("p1", 1, 100.0))));
        given(basketRepository.findByAuthId(AUTH_ID)).willReturn(Optional.of(basket));
        given(basketRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        AddToBasketRequestDto req = new AddToBasketRequestDto("p2", "Klavye", 2, 200.0);
        BasketResponseDto result = service.addItem(AUTH_ID, req);

        assertThat(result.items()).hasSize(2);
    }

    @Test
    void updateItem_changesQuantity() {
        Basket basket = basketWith(new ArrayList<>(List.of(item("p1", 2, 100.0))));
        given(basketRepository.findByAuthId(AUTH_ID)).willReturn(Optional.of(basket));
        given(basketRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        UpdateBasketItemRequestDto req = new UpdateBasketItemRequestDto("p1", 5);
        BasketResponseDto result = service.updateItem(AUTH_ID, req);

        assertThat(result.items().get(0).getQuantity()).isEqualTo(5);
    }

    @Test
    void updateItem_removesItem_whenQuantityZero() {
        Basket basket = basketWith(new ArrayList<>(List.of(item("p1", 2, 100.0))));
        given(basketRepository.findByAuthId(AUTH_ID)).willReturn(Optional.of(basket));
        given(basketRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        UpdateBasketItemRequestDto req = new UpdateBasketItemRequestDto("p1", 0);
        BasketResponseDto result = service.updateItem(AUTH_ID, req);

        assertThat(result.items()).isEmpty();
    }

    @Test
    void removeItem_removesOnlyTargetItem() {
        Basket basket = basketWith(new ArrayList<>(List.of(item("p1", 1, 100.0), item("p2", 2, 50.0))));
        given(basketRepository.findByAuthId(AUTH_ID)).willReturn(Optional.of(basket));
        given(basketRepository.save(any())).willAnswer(inv -> inv.getArgument(0));

        BasketResponseDto result = service.removeItem(AUTH_ID, "p1");

        assertThat(result.items()).hasSize(1);
        assertThat(result.items().get(0).getProductId()).isEqualTo("p2");
    }

    @Test
    void clear_deletesBasket() {
        service.clear(AUTH_ID);
        then(basketRepository).should().deleteByAuthId(AUTH_ID);
    }

    // helpers
    private Basket basketWith(List<BasketItem> items) {
        return Basket.builder().authId(AUTH_ID).items(items).build();
    }

    private BasketItem item(String productId, int qty, double price) {
        return BasketItem.builder().productId(productId).productName("Test").quantity(qty).unitPrice(price).build();
    }
}
