package com.gleam.app.controller.admin;

import com.gleam.app.dto.AdminMemberSummaryDto;
import com.gleam.app.dto.MemberScanDto;
import com.gleam.app.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/members")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMemberController {

    private final MemberService memberService;

    /** GET /api/admin/members?name=xxx&exact=false&page=0&size=50 — 会員一覧（決済履歴の入口） */
    @GetMapping
    public ResponseEntity<Page<AdminMemberSummaryDto>> searchMembers(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "false") boolean exact,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(memberService.searchMembers(name, exact, page, size));
    }

    /** GET /api/admin/members/id/{id} — 会員IDで会員サマリを取得 */
    @GetMapping("/id/{id}")
    public ResponseEntity<AdminMemberSummaryDto> getMemberById(@PathVariable Long id) {
        return ResponseEntity.ok(memberService.getAdminMemberSummary(id));
    }

    /** PUT /api/admin/members/id/{id}/diamond — ダイヤモンド会員にする */
    @PutMapping("/id/{id}/diamond")
    public ResponseEntity<AdminMemberSummaryDto> setDiamond(@PathVariable Long id) {
        return ResponseEntity.ok(memberService.setDiamond(id));
    }

    /** DELETE /api/admin/members/id/{id}/diamond — ダイヤモンド会員を解除（適正ランクへ戻す） */
    @DeleteMapping("/id/{id}/diamond")
    public ResponseEntity<AdminMemberSummaryDto> clearDiamond(@PathVariable Long id) {
        return ResponseEntity.ok(memberService.clearDiamond(id));
    }

    /** GET /api/admin/members/{memberNo} — QRスキャン後の会員情報取得 */
    @GetMapping("/{memberNo}")
    public ResponseEntity<MemberScanDto> getMemberByNo(@PathVariable String memberNo) {
        return ResponseEntity.ok(memberService.getByMemberNo(memberNo));
    }

}
