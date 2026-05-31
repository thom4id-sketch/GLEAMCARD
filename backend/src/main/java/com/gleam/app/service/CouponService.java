package com.gleam.app.service;

import com.gleam.app.dto.coupon.CouponGroupDto;
import com.gleam.app.dto.coupon.DistributeCouponRequest;
import com.gleam.app.dto.coupon.TargetCountRequest;
import com.gleam.app.entity.Coupon;
import com.gleam.app.entity.FriendInvitation;
import com.gleam.app.entity.Member;
import com.gleam.app.repository.CouponRepository;
import com.gleam.app.repository.MemberRepository;
import com.gleam.app.repository.PurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class CouponService {

    private final CouponRepository couponRepository;
    private final MemberRepository memberRepository;
    private final PurchaseRepository purchaseRepository;
    private final LineMessagingService lineMessagingService;

    /**
     * 全会員にクーポンを一括配布する（管理者用）。
     * @return 配布件数
     */
    public int distributeCoupon(DistributeCouponRequest req) {
        Coupon.DiscountType discountType = parseDiscountType(req.discountType());
        String discountDesc = buildDiscountDesc(discountType, req.discountValue());

        List<Member> allMembers = filterMembers(
            req.targetRanks(), req.targetGenders(),
            req.targetAgeMin(), req.targetAgeMax(), req.targetHasPurchase());

        List<Coupon> coupons = allMembers.stream()
            .map(member -> Coupon.builder()
                .member(member)
                .name(req.name())
                .discountType(discountType)
                .discountValue(req.discountValue())
                .discountDesc(discountDesc)
                .couponType(Coupon.CouponType.DISTRIBUTE)
                .isUsed(false)
                .usageCondition(req.usageCondition())
                .expiresAt(req.expiresAt())
                .build())
            .toList();

        couponRepository.saveAll(coupons);

        // DBコミット後にLINE通知（コミット前に送ると整合性が取れないため）
        List<String> lineUserIds = allMembers.stream()
            .map(Member::getLineUserId)
            .toList();
        String finalDiscountDesc = discountDesc;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                lineMessagingService.sendCouponNotification(
                    lineUserIds,
                    req.name(),
                    finalDiscountDesc,
                    req.expiresAt(),
                    req.usageCondition()
                );
            }
        });

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

    @Transactional(readOnly = true)
    public List<CouponGroupDto> getCouponHistory() {
        return couponRepository.findDistributedCouponGroups().stream()
            .map(row -> new CouponGroupDto(
                (String) row[0],
                (String) row[1],
                (String) row[2],
                row[3] != null ? row[3].toString() : null,
                ((Number) row[4]).intValue(),
                ((Number) row[5]).intValue(),
                row[6] != null ? row[6].toString() : null
            ))
            .toList();
    }

    public void deleteCouponsByName(String name) {
        // purchases.coupon_id の参照をNULLにしてから削除（外部キー制約回避）
        purchaseRepository.nullifyCouponReferencesByName(name);
        couponRepository.deleteByCouponName(name);
    }

    /** ターゲット条件に合致する会員数を返す（配布前プレビュー用）。 */
    @Transactional(readOnly = true)
    public int countTargetMembers(TargetCountRequest req) {
        return filterMembers(
            req.targetRanks(), req.targetGenders(),
            req.targetAgeMin(), req.targetAgeMax(), req.targetHasPurchase()).size();
    }

    private List<Member> filterMembers(
            List<String> targetRanks, List<String> targetGenders,
            Integer targetAgeMin, Integer targetAgeMax, Boolean targetHasPurchase) {
        LocalDate today = LocalDate.now();
        Set<String> ranks   = (targetRanks   != null && !targetRanks.isEmpty())   ? Set.copyOf(targetRanks)   : null;
        Set<String> genders = (targetGenders != null && !targetGenders.isEmpty())  ? Set.copyOf(targetGenders) : null;
        Set<Long> purchasedIds = Boolean.TRUE.equals(targetHasPurchase)
            ? purchaseRepository.findMemberIdsWithCompletedPurchase()
            : null;
        return memberRepository.findAll().stream()
            .filter(m -> ranks == null || ranks.contains(m.getRank().name()))
            .filter(m -> genders == null || (m.getGender() != null && genders.contains(m.getGender())))
            .filter(m -> targetAgeMin == null || (m.getBirthday() != null && calcAge(m.getBirthday(), today) >= targetAgeMin))
            .filter(m -> targetAgeMax == null || (m.getBirthday() != null && calcAge(m.getBirthday(), today) <= targetAgeMax))
            .filter(m -> purchasedIds == null || purchasedIds.contains(m.getId()))
            .toList();
    }

    private int calcAge(LocalDate birthday, LocalDate today) {
        return today.getYear() - birthday.getYear()
            - (today.getDayOfYear() < birthday.getDayOfYear() ? 1 : 0);
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
