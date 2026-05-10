package com.gleam.app.dto.auth;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record RegisterRequest(
    @NotBlank String lineIdToken,
    @NotBlank String liffId,
    Long invitationId,
    @NotBlank String name,
    @NotBlank String nameKana,
    LocalDate birthday,
    String gender
) {}
