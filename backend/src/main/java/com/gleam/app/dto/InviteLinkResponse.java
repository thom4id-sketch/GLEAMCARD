package com.gleam.app.dto;

public record InviteLinkResponse(
    Long invitationId,
    String url      // https://liff.line.me/{LIFF_ID_USER}?inv={invitationId}
) {}
