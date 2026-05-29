package com.gleam.app.dto;

import com.gleam.app.entity.Coupon;

import java.time.LocalDate;

public record CouponDto(
    Long id,
    String name,
    String discountType,
    int discountValue,
    String discountDesc,
    String couponType,
    String usageCondition,
    LocalDate expiresAt
) {
    public static CouponDto from(Coupon coupon) {
        return new CouponDto(
            coupon.getId(),
            coupon.getName(),
            coupon.getDiscountType().name(),
            coupon.getDiscountValue(),
            coupon.getDiscountDesc(),
            coupon.getCouponType().name(),
            coupon.getUsageCondition(),
            coupon.getExpiresAt()
        );
    }
}
