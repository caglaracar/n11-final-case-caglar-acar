package com.caglar.order.mapper;

import com.caglar.order.dto.response.AdminStatsResponseDto;
import com.caglar.order.dto.response.OrderResponseDto;
import com.caglar.order.repository.OrderStatusCount;
import com.caglar.order.repository.RevenueByMonth;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class AdminStatsMapper {

    private AdminStatsMapper() {}

    public static AdminStatsResponseDto toResponse(long total, long pending, long paid, long cancelled,
                                                   double revenue,
                                                   List<OrderStatusCount> statusCounts,
                                                   List<RevenueByMonth> monthly,
                                                   List<OrderResponseDto> recent) {
        return AdminStatsResponseDto.builder()
                .totalOrders(total)
                .pendingOrders(pending)
                .paidOrders(paid)
                .cancelledOrders(cancelled)
                .totalRevenue(revenue)
                .ordersByStatus(toStatusMap(statusCounts))
                .revenueByMonth(toMonthlyPoints(monthly))
                .recentOrders(recent)
                .build();
    }

    private static Map<String, Long> toStatusMap(List<OrderStatusCount> counts) {
        Map<String, Long> map = new LinkedHashMap<>();
        counts.forEach(c -> map.put(c.getStatus().name(), c.getCount()));
        return map;
    }

    private static List<AdminStatsResponseDto.MonthlyPoint> toMonthlyPoints(List<RevenueByMonth> rows) {
        return rows.stream()
                .map(r -> AdminStatsResponseDto.MonthlyPoint.builder()
                        .year(r.getYear()   == null ? 0    : r.getYear())
                        .month(r.getMonth() == null ? 0    : r.getMonth())
                        .total(r.getTotal() == null ? 0.0  : r.getTotal())
                        .orders(r.getOrders() == null ? 0L : r.getOrders())
                        .build())
                .toList();
    }
}
