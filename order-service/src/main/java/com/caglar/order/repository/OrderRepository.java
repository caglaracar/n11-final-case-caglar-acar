package com.caglar.order.repository;

import com.caglar.common.repository.BaseRepository;
import com.caglar.order.entity.Order;
import com.caglar.order.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends BaseRepository<Order, Long> {

    @EntityGraph(attributePaths = "items")
    Optional<Order> findById(Long id);

    @EntityGraph(attributePaths = "items")
    Page<Order> findByAuthId(Long authId, Pageable pageable);

    @EntityGraph(attributePaths = "items")
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    long countByStatus(OrderStatus status);

    @Query("select coalesce(sum(o.totalAmount), 0) from Order o where o.status in :statuses")
    Double sumRevenueByStatuses(@Param("statuses") List<OrderStatus> statuses);

    @Query("select o.status as status, count(o) as count from Order o group by o.status")
    List<OrderStatusCount> countByStatusGrouped();

    long countByAuthId(Long authId);

    @Query(value = """
            SELECT CAST(EXTRACT(YEAR  FROM to_timestamp(o.created_at / 1000)) AS INTEGER) AS year,
                   CAST(EXTRACT(MONTH FROM to_timestamp(o.created_at / 1000)) AS INTEGER) AS month,
                   COALESCE(SUM(o.total_amount), 0) AS total,
                   COUNT(o.id) AS orders
            FROM tbl_order o
            WHERE o.status = 'PAID'
              AND to_timestamp(o.created_at / 1000) >= NOW() - INTERVAL '12 months'
            GROUP BY year, month
            ORDER BY year, month
            """, nativeQuery = true)
    List<RevenueByMonth> revenueByMonth();
}
