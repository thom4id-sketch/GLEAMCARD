package com.gleam.app.controller.admin;

import com.gleam.app.dto.MemberScanDto;
import com.gleam.app.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/members")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMemberController {

    private final MemberService memberService;

    /** GET /api/admin/members/{memberNo} — QRスキャン後の会員情報取得 */
    @GetMapping("/{memberNo}")
    public ResponseEntity<MemberScanDto> getMemberByNo(@PathVariable String memberNo) {
        return ResponseEntity.ok(memberService.getByMemberNo(memberNo));
    }

}
