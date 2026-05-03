package com.gleam.app.service;

import com.gleam.app.dto.coupon.DistributeCouponRequest;
import com.gleam.app.entity.Coupon;
import com.gleam.app.entity.FriendInvitation;
import com.gleam.app.entity.Member;
import com.gleam.app.repository.CouponRepository;
import com.gleam.app.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CouponService {

    private final CouponRepository couponRepository;
    private final MemberRepository memberRepository;

    /**
     * 全会員にクーポンを一括配布する（管理者用）。
     * @return 配布件数
     */
    public int distributeCoupon(DistributeCouponRequest req) {
        Coupon.DiscountType discountType = parseDiscountType(req.discountType());
        String discountDesc = buildDiscountDesc(discountType, req.discountValue());

        List<Member> allMembers = memberRepository.findAll();

        List<Coupon> coupons = allMembers.stream()
            .map(member -> Coupon.builder()
                .member(member)
                .name(req.name())
                .discountType(discountType)
                .discountValue(req.discountValue())
                .discountDesc(discountDesc)
                .couponType(Coupon.CouponType.DISTRIBUTE)
                .isUsed(false)
                .expiresAt(req.expiresAt())
                .build())
            .toList();

        couponRepository.saveAll(coupons);
        return coupons.size();
    }

    /**
     * 新規登録クーポンを付与する。
     * AuthService から呼び出す。
     */
    public void issueWelcomeCoupon(Member member) {
        couponRepository.save(Coupon.builder()
            .member(member)
            .name("新規登録ありがとうクーポン")
            .discountType(Coupon.DiscountType.PERCENT)
            .discountValue(10)
            .discountDesc("お会計から10%OFF")
            .couponType(Coupon.CouponType.NORMAL)
            .isUsed(false)
            .build());
    }

    /**
     * 友達招待クーポンを付与する。
     * AuthService から呼び出す。
     */
    public void issueFriendCoupon(Member invitee, FriendInvitation invitation) {
        couponRepository.save(Coupon.builder()
            .member(invitee)
            .name("お友達紹介限定クーポン")
            .discountType(Coupon.DiscountType.AMOUNT)
            .discountValue(1000)
            .discountDesc("お会計から1,000円引き")
            .couponType(Coupon.CouponType.FRIEND)
            .isUsed(false)
            .invitation(invitation)
            .build());
    }

    private Coupon.DiscountType parseDiscountType(String value) {
        try {
            return Coupon.DiscountType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("discountType は PERCENT または AMOUNT を指定してください");
        }
    }

    private String buildDiscountDesc(Coupon.DiscountType type, int value) {
        return switch (type) {
            case PERCENT -> "お会計から%d%%OFF".formatted(value);
            case AMOUNT  -> "お会計から%,d円引き".formatted(value);
        };
    }
}
