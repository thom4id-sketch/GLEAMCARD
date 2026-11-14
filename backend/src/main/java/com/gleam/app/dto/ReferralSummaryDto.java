package com.gleam.app.dto;

/** 自分の友達紹介の状況（ダイヤモンド会員ページ用） */
public record ReferralSummaryDto(
    long referralCount   // 紹介リンク経由で会員登録を完了した人数
) {}
