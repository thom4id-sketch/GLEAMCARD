package com.gleam.app.dto.coupon;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record DistributeCouponRequest(
    @NotBlank String name,
    @NotNull String discountType,   // PERCENT or AMOUNT
    @NotNull @Min(1) Integer discountValue,
    LocalDate expiresAt             // 任意
) {}
