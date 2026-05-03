package com.gleam.app.controller;

import com.gleam.app.dto.*;
import com.gleam.app.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class UserController {

    private final MemberService memberService;

    /** GET /api/me — 自分の会員情報 */
    @GetMapping
    public ResponseEntity<MemberDto> getMe(@AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(memberService.getMe(memberId));
    }

    /** GET /api/me/coupons — 所持クーポン一覧（未使用） */
    @GetMapping("/coupons")
    public ResponseEntity<List<CouponDto>> getMyCoupons(@AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(memberService.getMyCoupons(memberId));
    }

    /** GET /api/me/purchases — 購入履歴 */
    @GetMapping("/purchases")
    public ResponseEntity<List<PurchaseDto>> getMyPurchases(@AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(memberService.getMyPurchases(memberId));
    }

    /** GET /api/me/points — ポイント履歴と現在ポイント */
    @GetMapping("/points")
    public ResponseEntity<Map<String, Object>> getMyPointHistory(@AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(memberService.getMyPointHistory(memberId));
    }

    /** GET /api/me/invite-link — 友達招待リンク発行 */
    @GetMapping("/invite-link")
    public ResponseEntity<InviteLinkResponse> getInviteLink(@AuthenticationPrincipal Long memberId) {
        return ResponseEntity.ok(memberService.issueInviteLink(memberId));
    }
}
