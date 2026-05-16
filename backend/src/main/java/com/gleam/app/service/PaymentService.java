package com.gleam.app.service;

import com.gleam.app.dto.payment.PaymentHistoryItem;
import com.gleam.app.dto.payment.ProcessPaymentRequest;
import com.gleam.app.dto.payment.ProcessPaymentResponse;
import com.gleam.app.entity.*;
import com.gleam.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * 決済処理サービス。
 *
 * 【友達紹介ポイント不正獲得防止】
 * - 紹介ポイントは invitation.canScheduleReferralPoints()（status==REGISTERED）のときのみ発生。
 * - 決済取り消し時、クーポンを未使用に戻しても invitation.status は PURCHASED のまま維持。
 * - 招待者1人につき月 MONTHLY_REFERRAL_LIMIT 件を上限とする。
 */
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private static final int MONTHLY_REFERRAL_LIMIT = 10;

    private final MemberRepository memberRepository;
    private final StoreRepository storeRepository;
    private final CouponRepository couponRepository;
    private final PurchaseRepository purchaseRepository;
    private final ScheduledPointGrantRepository grantRepository;
    private final PointHistoryRepository pointHistoryRepository;
    private final FriendInvitationRepository friendInvitationRepository;

    public ProcessPaymentResponse processPayment(ProcessPaymentRequest req) {
        OffsetDateTime now = OffsetDateTime.now();

        // --- エンティティ取得 ---
        Member member = memberRepository.findByMemberNo(req.memberNo())
            .orElseThrow(() -> new IllegalArgumentException("会員が見つかりません: " + req.memberNo()));
        Store store = storeRepository.findById(req.storeId())
            .orElseThrow(() -> new IllegalArgumentException("店舗が見つかりません: " + req.storeId()));

        // --- バリデーション ---
        if (req.pointsUsed() > member.getPoints()) {
            throw new IllegalArgumentException("利用可能ポイントを超えています");
        }

        Coupon coupon = null;
        if (req.couponId() != null) {
            coupon = couponRepository.findById(req.couponId())
                .orElseThrow(() -> new IllegalArgumentException("クーポンが見つかりません: " + req.couponId()));
            if (coupon.getIsUsed()) {
                throw new IllegalArgumentException("このクーポンは既に使用済みです");
            }
            if (!coupon.getMember().getId().equals(member.getId())) {
                throw new IllegalArgumentException("このクーポンは利用できません");
            }
        }

        // --- 付与ポイント計算（税込み→クーポン割引→税抜き換算の順で算出）---
        // req.amount() は税込み金額
        int discountedTaxIncluded = req.amount();
        if (coupon != null) {
            if (coupon.getDiscountType() == Coupon.DiscountType.PERCENT) {
                discountedTaxIncluded = (int) Math.floor(req.amount() * (100 - coupon.getDiscountValue()) / 100.0);
            } else {
                discountedTaxIncluded = Math.max(0, req.amount() - coupon.getDiscountValue());
            }
        }
        // 税率10%で税抜き換算してポイント計算
        int taxExcludedAmount = (int) Math.floor(discountedTaxIncluded / 1.1);
        int pointsToGrant = (int) Math.floor(taxExcludedAmount * member.getRank().getPointRate());

        // --- Purchase 登録 ---
        Purchase purchase = purchaseRepository.save(Purchase.builder()
            .member(member)
            .store(store)
            .amount(req.amount())
            .pointsUsed(req.pointsUsed())
            .pointsToGrant(pointsToGrant)
            .coupon(coupon)
            .purchasedAt(now)
            .status(Purchase.Status.COMPLETED)
            .build());

        // --- ポイント使用処理 ---
        if (req.pointsUsed() > 0) {
            member.setPoints(member.getPoints() - req.pointsUsed());
            pointHistoryRepository.save(PointHistory.builder()
                .member(member)
                .amount(req.pointsUsed())
                .transactionType(PointHistory.TransactionType.USE)
                .description("商品購入での使用（%s）".formatted(store.getName()))
                .relatedPurchase(purchase)
                .build());
        }

        // --- ポイント付与スケジュール（72時間後）---
        grantRepository.save(ScheduledPointGrant.builder()
            .member(member)
            .amount(pointsToGrant)
            .grantReason(ScheduledPointGrant.GrantReason.PURCHASE)
            .relatedPurchase(purchase)
            .scheduledAt(now.plusHours(72))
            .build());

        // --- クーポン使用処理 ---
        if (coupon != null) {
            coupon.setIsUsed(true);
            coupon.setUsedAt(now);
            couponRepository.save(coupon);

            if (coupon.getCouponType() == Coupon.CouponType.FRIEND
                    && coupon.getInvitation() != null) {
                processFriendReferral(coupon.getInvitation(), purchase, now);
            }
        }

        // --- 年間購入額更新・会員ランク即時チェック ---
        int newAnnualPurchase = member.getAnnualPurchaseAmount() + req.amount();
        member.setAnnualPurchaseAmount(newAnnualPurchase);
        member.setLastPurchaseAt(now);

        Member.Rank oldRank = member.getRank();
        Member.Rank newRank = Member.Rank.fromAnnualPurchase(newAnnualPurchase);
        boolean rankChanged = newRank.ordinal() > oldRank.ordinal();
        if (rankChanged) {
            member.setRank(newRank);
            // ランク有効期限 = 翌年12月31日
            member.setRankExpiresAt(LocalDate.of(LocalDate.now().getYear() + 1, 12, 31));
        }

        memberRepository.save(member);

        return new ProcessPaymentResponse(purchase.getId(), pointsToGrant, rankChanged, newRank.name());
    }

    /**
     * 友達紹介クーポン使用時の処理。
     * invitation.status が REGISTERED のときのみ招待者へポイントをスケジュールする。
     */
    private void processFriendReferral(FriendInvitation invitation, Purchase purchase, OffsetDateTime now) {
        if (!invitation.canScheduleReferralPoints()) return;

        // 月次上限チェック
        OffsetDateTime startOfMonth = now.toLocalDate()
            .withDayOfMonth(1).atStartOfDay().atOffset(now.getOffset());
        long rewardedThisMonth = friendInvitationRepository
            .countReferralRewardsEarnedSince(invitation.getInviter(), startOfMonth);

        if (rewardedThisMonth < MONTHLY_REFERRAL_LIMIT) {
            grantRepository.save(ScheduledPointGrant.builder()
                .member(invitation.getInviter())
                .amount(500)
                .grantReason(ScheduledPointGrant.GrantReason.FRIEND_REFERRAL)
                .relatedPurchase(purchase)
                .scheduledAt(now.plusDays(7))
                .build());
        }

        // status を PURCHASED に更新（決済取り消しがあっても REGISTERED には戻さない）
        invitation.setStatus(FriendInvitation.Status.PURCHASED);
        invitation.setPurchasedAt(now);
        friendInvitationRepository.save(invitation);
    }

    public void cancelPayment(Long purchaseId) {
        Purchase purchase = purchaseRepository.findById(purchaseId)
            .orElseThrow(() -> new IllegalArgumentException("決済が見つかりません: " + purchaseId));

        if (purchase.getStatus() == Purchase.Status.CANCELED) {
            throw new IllegalStateException("この決済は既にキャンセルされています");
        }

        // 最新の完了済み決済のみキャンセル可能
        Purchase latest = purchaseRepository
            .findTopByMemberAndStatusOrderByPurchasedAtDesc(purchase.getMember(), Purchase.Status.COMPLETED)
            .orElseThrow(() -> new IllegalStateException("キャンセル対象の決済が見つかりません"));

        if (!latest.getId().equals(purchaseId)) {
            throw new IllegalStateException("最新の決済のみキャンセル可能です");
        }

        OffsetDateTime now = OffsetDateTime.now();
        Member member = purchase.getMember();

        // 1. ステータス更新
        purchase.setStatus(Purchase.Status.CANCELED);
        purchase.setCanceledAt(now);
        purchaseRepository.save(purchase);

        // 2. ポイント返却
        if (purchase.getPointsUsed() > 0) {
            member.setPoints(member.getPoints() + purchase.getPointsUsed());
            pointHistoryRepository.save(PointHistory.builder()
                .member(member)
                .amount(purchase.getPointsUsed())
                .transactionType(PointHistory.TransactionType.CANCEL)
                .description("決済キャンセルのためポイント返却")
                .relatedPurchase(purchase)
                .build());
        }

        // 3. クーポンを未使用に戻す（invitation.status は維持）
        if (purchase.getCoupon() != null) {
            Coupon coupon = purchase.getCoupon();
            coupon.setIsUsed(false);
            coupon.setUsedAt(null);
            couponRepository.save(coupon);
            // FriendInvitation.status は PURCHASED のまま → 再使用しても紹介ポイント発生しない
        }

        // 4. 未実行のスケジュール付与をキャンセル
        grantRepository.findByRelatedPurchaseAndIsCanceledFalse(purchase).forEach(grant -> {
            if (grant.getExecutedAt() == null) {
                grant.setIsCanceled(true);
                grantRepository.save(grant);
            }
        });

        // 5. 年間購入額を減算（ランクの取り消しは行わない）
        member.setAnnualPurchaseAmount(
            Math.max(0, member.getAnnualPurchaseAmount() - purchase.getAmount())
        );
        memberRepository.save(member);
    }

    @Transactional(readOnly = true)
    public Page<PaymentHistoryItem> getPaymentHistory(String name, boolean exact, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);

        if (name != null && !name.isBlank()) {
            Page<Purchase> result = exact
                ? purchaseRepository.findByMemberNameOrderByPurchasedAtDesc(name, pageable)
                : purchaseRepository.findByMemberNameContainingOrderByPurchasedAtDesc(name, pageable);
            return result.map(PaymentHistoryItem::from);
        }
        return purchaseRepository
            .findAllByOrderByPurchasedAtDesc(pageable)
            .map(PaymentHistoryItem::from);
    }
}
