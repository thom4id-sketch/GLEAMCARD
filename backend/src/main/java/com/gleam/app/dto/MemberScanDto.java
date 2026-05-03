package com.gleam.app.dto;

import com.gleam.app.entity.Member;

import java.util.List;

/** 管理者がQRコードをスキャンした後に返す会員情報 */
public record MemberScanDto(
    Long id,
    String memberNo,
    String name,
    String rank,
    double pointRate,
    int points,
    List<CouponDto> availableCoupons  // 未使用クーポン一覧（決済画面での選択用）
) {
    public static MemberScanDto from(Member member, List<CouponDto> availableCoupons) {
        return new MemberScanDto(
            member.getId(),
            member.getMemberNo(),
            member.getName(),
            member.getRank().name(),
            member.getRank().getPointRate(),
            member.getPoints(),
            availableCoupons
        );
    }
}
