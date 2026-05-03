package com.gleam.app.service;

import com.gleam.app.config.AppProperties;
import com.gleam.app.dto.*;
import com.gleam.app.entity.FriendInvitation;
import com.gleam.app.entity.Member;
import com.gleam.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gleam.app.entity.PointHistory;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
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

    private Member findMemberById(Long memberId) {
        return memberRepository.findById(memberId)
            .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));
    }
}
