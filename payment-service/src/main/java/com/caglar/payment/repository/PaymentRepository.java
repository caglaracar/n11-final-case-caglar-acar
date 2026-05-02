package com.caglar.payment.repository;

import com.caglar.common.repository.BaseRepository;
import com.caglar.payment.entity.Payment;

import java.util.Optional;

public interface PaymentRepository extends BaseRepository<Payment, Long> {

    Optional<Payment> findByIyzicoToken(String iyzicoToken);

    Optional<Payment> findFirstByOrderIdOrderByIdDesc(Long orderId);
}
