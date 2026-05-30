package com.gleam.app.service;

import com.gleam.app.config.AppProperties;
import com.gleam.app.dto.*;
import com.gleam.app.entity.FriendInvitation;
import com.gleam.app.entity.Member;
import com.gleam.app.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gleam.app.entity.PointHistory;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;
    private final CouponRepository couponRepository;
    private final PurchaseRepository purchaseRepository;
    private final PointHistoryRepository pointHistoryRepository;
    private final FriendInvitationRepository friendInvitationRepository;
    private final AppProperties appProperties;

    /** 自分の会員情報を取得 */
    public MemberDto getMe(Long memberId) {
        return MemberDto.from(findMemberById(memberId));
    }

    /** 所持クーポン一覧（未使用のみ） */
    public List<CouponDto> getMyCoupons(Long memberId) {
        Member member = findMemberById(memberId);
        return couponRepository.findByMemberAndIsUsedFalse(member)
            .stream()
            .map(CouponDto::from)
            .toList();
    }

    /** 購入履歴 */
    public List<PurchaseDto> getMyPurchases(Long memberId) {
        Member member = findMemberById(memberId);
        Set<Long> grantedPurchaseIds = pointHistoryRepository
            .findByMemberAndTransactionType(member, PointHistory.TransactionType.GRANT)
            .stream()
            .filter(ph -> ph.getRelatedPurchase() != null)
            .map(ph -> ph.getRelatedPurchase().getId())
            .collect(Collectors.toSet());
        return purchaseRepository.findByMemberOrderByPurchasedAtDesc(member)
            .stream()
            .map(p -> PurchaseDto.from(p, grantedPurchaseIds.contains(p.getId())))
            .toList();
    }

    /** ポイント履歴と現在ポイント */
    public Map<String, Object> getMyPointHistory(Long memberId) {
        Member member = findMemberById(memberId);
        List<PointHistoryDto> history = pointHistoryRepository
            .findByMemberOrderByCreatedAtDesc(member)
            .stream()
            .map(PointHistoryDto::from)
            .toList();
        return Map.of(
            "currentPoints", member.getPoints(),
            "history", history
        );
    }

    /**
     * 友達招待リンクを発行する。
     * 毎回新しい FriendInvitation を作成して返す
     * （1つのリンクで1人まで招待可能）。
     */
    @Transactional
    public InviteLinkResponse issueInviteLink(Long memberId) {
        Member member = findMemberById(memberId);

        FriendInvitation invitation = friendInvitationRepository.save(
            FriendInvitation.builder()
                .inviter(member)
                .status(FriendInvitation.Status.PENDING)
                .build()
        );

        String url = "https://liff.line.me/%s?inv=%d".formatted(
            appProperties.getLine().getLiffIdUser(),
            invitation.getId()
        );

        return new InviteLinkResponse(invitation.getId(), url);
    }

    /**
     * 管理者用：会員番号で会員情報と利用可能クーポンを取得（QRスキャン後）
     */
    public MemberScanDto getByMemberNo(String memberNo) {
        Member member = memberRepository.findByMemberNo(memberNo)
            .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberNo));

        List<CouponDto> availableCoupons = couponRepository
            .findByMemberAndIsUsedFalse(member)
            .stream()
            .map(CouponDto::from)
            .toList();

        return MemberScanDto.from(member, availableCoupons);
    }

    /**
     * 年次ランクリセット（毎年1月1日に実行）。
     * 3年ウィンドウで各会員のランクを再計算し降格を適用する。
     * Platinum 会員は rankKeepUntil 以内であれば降格しない。
     */
    @Transactional
    public void runAnnualRankReset() {
        int currentYear = LocalDate.now().getYear();
        OffsetDateTime windowStart = OffsetDateTime.of(currentYear - 2, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC);
        LocalDate today = LocalDate.now();

        List<Member> members = memberRepository.findAll();
        int downgraded = 0;
        int kept = 0;

        for (Member member : members) {
            Member.Rank oldRank = member.getRank();
            if (oldRank == Member.Rank.REGULAR) continue;

            int rawSum = purchaseRepository.sumCompletedAmountSince(member, windowStart);
            int taxExcluded = rawSum * 10 / 11;
            Member.Rank newRank = Member.Rank.fromThreeYearPurchase(taxExcluded);

            if (newRank.ordinal() >= oldRank.ordinal()) continue; // 降格なし

            // Platinum ランクキープ：キープ期限内なら降格しない
            if (oldRank == Member.Rank.PLATINUM
                    && member.getRankKeepUntil() != null
                    && !today.isAfter(member.getRankKeepUntil())) {
                log.info("ランクキープ適用: memberNo={} keepUntil={}", member.getMemberNo(), member.getRankKeepUntil());
                kept++;
                continue;
            }

            member.setRank(newRank);
            member.setRankExpiresAt(LocalDate.of(currentYear, 12, 31));
            memberRepository.save(member);
            log.info("ランクダウン: memberNo={} {} → {}", member.getMemberNo(), oldRank, newRank);
            downgraded++;
        }
        log.info("年次ランクリセット完了: 降格={} ランクキープ={}", downgraded, kept);
    }

    private Member findMemberById(Long memberId) {
        return memberRepository.findById(memberId)
            .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));
    }
}
