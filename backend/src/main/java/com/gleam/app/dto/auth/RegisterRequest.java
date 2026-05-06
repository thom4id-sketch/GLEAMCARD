package com.gleam.app.dto.auth;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record RegisterRequest(
    @NotBlank String lineAccessToken,
    @NotBlank String liffId,
    Long invitationId,
    @NotBlank String name,
    @NotBlank String nameKana,
    LocalDate birthday,   // 任意
    String gender         // 任意: MALE / FEMALE / OTHER
) {}
