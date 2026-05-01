package com.caglar.order.dto.response;

import lombok.Builder;

import java.util.List;
import java.util.Map;

@Builder
public record AdminStatsResponseDto(
        long totalOrders,
        long pendingOrders,
        long paidOrders,
        long cancelledOrders,
        double totalRevenue,
        Map<String, Long> ordersByStatus,
        List<MonthlyPoint> revenueByMonth,
        List<OrderResponseDto> recentOrders
) {
    @Builder
    public record MonthlyPoint(int year, int month, double total, long orders) {}
}
