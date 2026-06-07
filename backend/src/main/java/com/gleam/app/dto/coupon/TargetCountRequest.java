package com.gleam.app.dto.coupon;

import java.util.List;

public record TargetCountRequest(
    List<String> targetRanks,
    List<String> targetGenders,
    Integer targetAgeMin,
    Integer targetAgeMax,
    Boolean targetHasPurchase,
    Integer targetBirthMonth
) {}
