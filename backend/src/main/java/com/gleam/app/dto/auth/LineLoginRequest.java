package com.gleam.app.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LineLoginRequest(
    @NotBlank String lineAccessToken,
    @NotBlank String liffId
) {}
