package com.gleam.app.dto;

import com.gleam.app.entity.Member;
import com.gleam.app.repository.PurchaseRepository.MemberPurchaseSummary;

import java.time.OffsetDateTime;

/** 管理者向け会員一覧（決済履歴の入口）に表示する会員サマリ */
public record AdminMemberSummaryDto(
    Long id,
    String memberNo,
    String name,
    String nameKana,
    String rank,
    int points,
    long purchaseCount,      // 完了済み購入回数
    long totalAmount,        // 完了済み税込み累計購入額
    OffsetDateTime lastPurchaseAt  // 最新の購入履歴日時（取り消し分も含む）。履歴が無ければ null
) {
    public static AdminMemberSummaryDto from(Member member, MemberPurchaseSummary summary) {
        return new AdminMemberSummaryDto(
            member.getId(),
            member.getMemberNo(),
            member.getName(),
            member.getNameKana(),
            member.getRank().name(),
            member.getPoints(),
            summary != null && summary.getPurchaseCount() != null ? summary.getPurchaseCount() : 0L,
            summary != null && summary.getTotalAmount() != null ? summary.getTotalAmount() : 0L,
            summary != null ? summary.getLatestPurchasedAt() : null
        );
    }
}
