package com.gleam.app.controller;

import com.gleam.app.dto.auth.AuthResponse;
import com.gleam.app.dto.auth.LineLoginRequest;
import com.gleam.app.dto.auth.RegisterRequest;
import com.gleam.app.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/line
     * LINEアクセストークンでログイン。
     * 未登録の場合は isNewMember=true を返す（フロントは /register へ誘導）。
     */
    @PostMapping("/line")
    public ResponseEntity<AuthResponse> lineLogin(@Valid @RequestBody LineLoginRequest request) {
        AuthResponse response = authService.lineLogin(request.lineAccessToken(), request.liffId());
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/register
     * 新規会員登録。
     * 友達招待経由の場合は invitationId を含めて呼び出す。
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(
            request.lineAccessToken(),
            request.liffId(),
            request.invitationId(),
            request.name(),
            request.nameKana(),
            request.birthday(),
            request.gender()
        );
        return ResponseEntity.ok(response);
    }
}
