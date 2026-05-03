package com.gleam.app.dto.payment;

public record ProcessPaymentResponse(
    Long purchaseId,
    int pointsToGrant,      // 72時間後に付与される予定ポイント
    boolean rankChanged,    // この決済でランクアップしたか
    String newRank          // 現在のランク
) {}
