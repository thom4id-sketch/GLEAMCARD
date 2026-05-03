package com.gleam.app.dto.payment;

import com.gleam.app.entity.Purchase;

import java.time.OffsetDateTime;

/** 管理者向け決済履歴（会員情報付き） */
public record PaymentHistoryItem(
    Long id,
    String memberNo,
    String memberName,
    String storeName,
    int amount,
    int pointsUsed,
    int pointsToGrant,
    boolean couponUsed,
    OffsetDateTime purchasedAt,
    String status
) {
    public static PaymentHistoryItem from(Purchase purchase) {
        return new PaymentHistoryItem(
            purchase.getId(),
            purchase.getMember().getMemberNo(),
            purchase.getMember().getName(),
            purchase.getStore().getName(),
            purchase.getAmount(),
            purchase.getPointsUsed(),
            purchase.getPointsToGrant(),
            purchase.getCoupon() != null,
            purchase.getPurchasedAt(),
            purchase.getStatus().name()
        );
    }
}
