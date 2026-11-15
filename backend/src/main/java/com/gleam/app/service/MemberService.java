package com.gleam.app.service;

import com.gleam.app.config.AppProperties;
import com.gleam.app.dto.*;
import com.gleam.app.entity.FriendInvitation;
import com.gleam.app.entity.Member;
import com.gleam.app.repository.*;
import com.gleam.app.repository.PurchaseRepository.MemberPurchaseSummary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gleam.app.entity.PointHistory;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Comparator;
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
     * 管理者用：会員一覧（決済履歴の入口）。
     * 名前で検索（exact=true で完全一致、false で部分一致）し、
     * 購入履歴テーブル上の最新購入日時が新しい順（履歴の無い会員は末尾、同順は会員番号順）に返す。
     * 並び順の基準が購入履歴の実レコードなので、会員側の lastPurchaseAt が未設定でも正しく並ぶ。
     */
    public Page<AdminMemberSummaryDto> searchMembers(String name, boolean exact, List<String> ranks,
                                                     int page, int size) {
        List<Member> members;
        if (name != null && !name.isBlank()) {
            members = exact
                ? memberRepository.findByName(name)
                : memberRepository.findByNameContaining(name);
        } else {
            members = memberRepository.findAll();
        }

        // ランク絞り込み（未指定なら全ランク。不正な値は無視）
        Set<Member.Rank> rankFilter = parseRanks(ranks);
        if (!rankFilter.isEmpty()) {
            members = members.stream().filter(m -> rankFilter.contains(m.getRank())).toList();
        }

        Map<Long, MemberPurchaseSummary> summaries = summarizePurchases(
            members.stream().map(Member::getId).toList());

        Comparator<AdminMemberSummaryDto> byLatestPurchaseDesc = Comparator.comparing(
            AdminMemberSummaryDto::lastPurchaseAt,
            Comparator.nullsLast(Comparator.<OffsetDateTime>reverseOrder()));
        List<AdminMemberSummaryDto> sorted = members.stream()
            .map(m -> AdminMemberSummaryDto.from(m, summaries.get(m.getId())))
            .sorted(byLatestPurchaseDesc.thenComparing(AdminMemberSummaryDto::memberNo))
            .toList();

        PageRequest pageable = PageRequest.of(page, size);
        int from = (int) Math.min(pageable.getOffset(), sorted.size());
        int to = Math.min(from + size, sorted.size());
        return new PageImpl<>(sorted.subList(from, to), pageable, sorted.size());
    }

    private Set<Member.Rank> parseRanks(List<String> ranks) {
        if (ranks == null) return Set.of();
        return ranks.stream()
            .filter(r -> r != null && !r.isBlank())
            .map(r -> {
                try { return Member.Rank.valueOf(r.trim().toUpperCase()); }
                catch (IllegalArgumentException e) { return null; }
            })
            .filter(java.util.Objects::nonNull)
            .collect(Collectors.toSet());
    }

    /** 管理者用：会員IDで会員サマリを1件取得（会員別決済履歴画面のヘッダー用） */
    public AdminMemberSummaryDto getAdminMemberSummary(Long memberId) {
        Member member = findMemberById(memberId);
        Map<Long, MemberPurchaseSummary> summaries = summarizePurchases(List.of(memberId));
        return AdminMemberSummaryDto.from(member, summaries.get(memberId));
    }

    /**
     * 管理者用：会員をダイヤモンド会員にする。
     * ダイヤモンドは購入額では到達できず、この操作でのみ付与される。
     */
    @Transactional
    public AdminMemberSummaryDto setDiamond(Long memberId) {
        Member member = findMemberById(memberId);
        if (!member.isDiamond()) {
            member.setRank(Member.Rank.DIAMOND);
            member.setRankExpiresAt(null);
            member.setRankKeepUntil(null);
            memberRepository.save(member);
            log.info("ダイヤモンド会員に変更: memberNo={}", member.getMemberNo());
        }
        return getAdminMemberSummary(memberId);
    }

    /**
     * 管理者用：ダイヤモンド会員を解除し、3年間の購入実績に基づく適正ランクへ戻す。
     */
    @Transactional
    public AdminMemberSummaryDto clearDiamond(Long memberId) {
        Member member = findMemberById(memberId);
        if (member.isDiamond()) {
            int currentYear = LocalDate.now().getYear();
            OffsetDateTime windowStart = OffsetDateTime.of(currentYear - 2, 1, 1, 0, 0, 0, 0, ZoneOffset.UTC);
            int rawSum = purchaseRepository.sumCompletedAmountSince(member, windowStart);
            int taxExcluded = rawSum * 10 / 11;
            Member.Rank properRank = Member.Rank.fromThreeYearPurchase(taxExcluded);

            member.setRank(properRank);
            member.setAnnualPurchaseAmount(taxExcluded);
            member.setRankExpiresAt(properRank == Member.Rank.REGULAR ? null : LocalDate.of(currentYear, 12, 31));
            memberRepository.save(member);
            log.info("ダイヤモンド会員を解除: memberNo={} → {}", member.getMemberNo(), properRank);
        }
        return getAdminMemberSummary(memberId);
    }

    /**
     * 会員の友達紹介状況（紹介リンク経由で登録完了した人数と、うちクーポンを利用して購入した人数）。
     * 会員本人の画面と、管理者の会員別画面の両方から使う。
     */
    public ReferralSummaryDto getMyReferralSummary(Long memberId) {
        Member member = findMemberById(memberId);
        long referralCount = friendInvitationRepository
            .countByInviterAndStatusNot(member, FriendInvitation.Status.PENDING);
        long purchaseCount = friendInvitationRepository
            .countByInviterAndCouponPurchaseIsNotNull(member);
        return new ReferralSummaryDto(referralCount, purchaseCount);
    }

    private Map<Long, MemberPurchaseSummary> summarizePurchases(List<Long> memberIds) {
        if (memberIds.isEmpty()) return Map.of();
        return purchaseRepository.summarizeByMemberIds(memberIds)
            .stream()
            .collect(Collectors.toMap(MemberPurchaseSummary::getMemberId, s -> s));
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
            // REGULAR は降格先が無く、DIAMOND は管理者操作でのみ変更するためスキップ
            if (oldRank == Member.Rank.REGULAR || oldRank == Member.Rank.DIAMOND) continue;

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
