package com.gleam.app.service;

import com.gleam.app.dto.MemberDto;
import com.gleam.app.dto.auth.AuthResponse;
import com.gleam.app.entity.FriendInvitation;
import com.gleam.app.entity.Member;
import com.gleam.app.repository.FriendInvitationRepository;
import com.gleam.app.repository.MemberRepository;
import com.gleam.app.security.JwtTokenProvider;
import com.gleam.app.security.LineTokenVerifier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final LineTokenVerifier lineTokenVerifier;
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;
    private final FriendInvitationRepository friendInvitationRepository;
    private final CouponService couponService;

    /**
     * LINEログイン。
     * - 登録済み：JWT発行
     * - 未登録  ：isNewMember=true（フロントが /register へ誘導）
     */
    public AuthResponse lineLogin(String lineAccessToken, String liffId) {
        LineTokenVerifier.LineUserInfo userInfo = lineTokenVerifier.verify(lineAccessToken);
        boolean isAdmin = lineTokenVerifier.isAdminLiff(liffId);

        return memberRepository.findByLineUserId(userInfo.userId())
            .map(member -> {
                String token = jwtTokenProvider.generateToken(member.getId(), member.getLineUserId(), isAdmin);
                return new AuthResponse(token, isAdmin, false, MemberDto.from(member));
            })
            .orElse(new AuthResponse(null, false, true, null));
    }

    /**
     * 新規会員登録。
     * - 会員番号採番（10001〜）
     * - 新規登録クーポン付与
     * - 友達招待経由の場合：招待クーポン付与 + FriendInvitation更新
     */
    public AuthResponse register(String lineAccessToken, String liffId, Long invitationId,
                                 String name, String nameKana) {
        LineTokenVerifier.LineUserInfo userInfo = lineTokenVerifier.verify(lineAccessToken);
        boolean isAdmin = lineTokenVerifier.isAdminLiff(liffId);

        if (memberRepository.existsByLineUserId(userInfo.userId())) {
            throw new IllegalStateException("Already registered");
        }

        // 会員登録
        Member member = memberRepository.save(Member.builder()
            .lineUserId(userInfo.userId())
            .memberNo(String.valueOf(memberRepository.findNextMemberNo()))
            .name(name)
            .nameKana(nameKana)
            .rank(Member.Rank.REGULAR)
            .points(0)
            .annualPurchaseAmount(0)
            .build());

        // 新規登録クーポン付与
        couponService.issueWelcomeCoupon(member);

        // 友達招待経由の場合
        if (invitationId != null) {
            friendInvitationRepository.findById(invitationId).ifPresent(invitation -> {
                if (invitation.getStatus() != FriendInvitation.Status.PENDING) return;

                // 招待クーポン付与
                couponService.issueFriendCoupon(member, invitation);

                // 招待ステータス更新
                invitation.setInvitee(member);
                invitation.setStatus(FriendInvitation.Status.REGISTERED);
                invitation.setRegisteredAt(OffsetDateTime.now());
                friendInvitationRepository.save(invitation);
            });
        }

        String token = jwtTokenProvider.generateToken(member.getId(), member.getLineUserId(), isAdmin);
        return new AuthResponse(token, isAdmin, false, MemberDto.from(member));
    }
}
