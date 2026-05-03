package com.gleam.app.dto.payment;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProcessPaymentRequest(
    @NotBlank String memberNo,
    @NotNull Long storeId,
    @NotNull @Min(1) Integer amount,    // 税込金額
    @Min(0) int pointsUsed,
    Long couponId                       // 利用クーポン（任意）
) {}
