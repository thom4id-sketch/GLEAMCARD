package com.gleam.app.dto.coupon;

public record CouponGroupDto(
    String name,
    String discountDesc,
    String usageCondition,
    String expiresAt,
    int totalCount,
    int usedCount,
    String createdAt
) {}
