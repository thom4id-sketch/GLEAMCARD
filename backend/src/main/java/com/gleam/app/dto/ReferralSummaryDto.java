package com.gleam.app.dto;

/** 自分の友達紹介の状況（ダイヤモンド会員ページ用） */
public record ReferralSummaryDto(
    long referralCount,  // 紹介リンク経由で会員登録を完了し、クーポンが付与された人数
    long purchaseCount   // うち、紹介クーポンを利用して購入した人数（キャンセルされた購入は除く）
) {}
