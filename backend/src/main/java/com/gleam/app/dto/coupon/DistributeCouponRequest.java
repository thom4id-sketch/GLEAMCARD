package com.gleam.app.dto.coupon;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record DistributeCouponRequest(
    @NotBlank String name,
    @NotNull String discountType,   // PERCENT or AMOUNT
    @NotNull @Min(1) Integer discountValue,
    LocalDate expiresAt,            // 任意

    // ── ターゲティング（すべて任意。未指定の場合は全会員対象）──
    List<String> targetRanks,       // ["REGULAR","SILVER","GOLD","PLATINUM"]
    List<String> targetGenders,     // ["MALE","FEMALE","OTHER"]
    Integer targetAgeMin,           // 以上
    Integer targetAgeMax,           // 以下
    Boolean targetHasPurchase,      // true: キャンセルなし購入履歴が1件以上ある会員のみ
    @jakarta.validation.constraints.Size(max = 15) String usageCondition  // 任意・15文字以内
) {}
