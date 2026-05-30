package com.gleam.app.dto;

import com.gleam.app.entity.Member;

import java.time.LocalDate;

public record MemberDto(
    Long id,
    String memberNo,
    String name,
    String rank,
    double pointRate,
    int points,
    int annualPurchaseAmount,
    LocalDate rankExpiresAt,
    LocalDate pointExpiresAt
) {
    public static MemberDto from(Member member) {
        int expiryYears = member.getRank() == Member.Rank.PLATINUM ? 4 : 3;
        LocalDate pointExpiresAt = member.getLastPurchaseAt() != null
            ? member.getLastPurchaseAt().toLocalDate().plusYears(expiryYears)
            : null;
        return new MemberDto(
            member.getId(),
            member.getMemberNo(),
            member.getName(),
            member.getRank().name(),
            member.getRank().getPointRate(),
            member.getPoints(),
            member.getAnnualPurchaseAmount(),
            member.getRankExpiresAt(),
            pointExpiresAt
        );
    }
}
