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
    LocalDate rankExpiresAt
) {
    public static MemberDto from(Member member) {
        return new MemberDto(
            member.getId(),
            member.getMemberNo(),
            member.getName(),
            member.getRank().name(),
            member.getRank().getPointRate(),
            member.getPoints(),
            member.getAnnualPurchaseAmount(),
            member.getRankExpiresAt()
        );
    }
}
