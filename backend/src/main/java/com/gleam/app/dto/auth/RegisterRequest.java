package com.gleam.app.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
    @NotBlank String lineAccessToken,
    @NotBlank String liffId,
    Long invitationId,
    @NotBlank String name,
    @NotBlank String nameKana
) {}
