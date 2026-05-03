package com.gleam.app.dto;

import com.gleam.app.entity.Purchase;

import java.time.OffsetDateTime;

public record PurchaseDto(
    Long id,
    String storeName,
    int amount,
    int pointsUsed,
    int pointsToGrant,
    boolean couponUsed,
    OffsetDateTime purchasedAt,
    String status,
    boolean pointsGranted
) {
    public static PurchaseDto from(Purchase purchase, boolean pointsGranted) {
        return new PurchaseDto(
            purchase.getId(),
            purchase.getStore().getName(),
            purchase.getAmount(),
            purchase.getPointsUsed(),
            purchase.getPointsToGrant(),
            purchase.getCoupon() != null,
            purchase.getPurchasedAt(),
            purchase.getStatus().name(),
            pointsGranted
        );
    }
}
