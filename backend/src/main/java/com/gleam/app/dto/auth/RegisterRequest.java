package com.gleam.app.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
    @NotBlank String lineAccessToken,
    @NotBlank String liffId,
    Long invitationId   // 友達招待経由の場合に設定。通常登録はnull
) {}
