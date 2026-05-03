package com.gleam.app.dto.auth;

import com.gleam.app.dto.MemberDto;

public record AuthResponse(
    String token,       // JWT。isNewMember=trueの場合はnull
    boolean isAdmin,
    boolean isNewMember,// trueの場合、フロントは登録画面へ誘導
    MemberDto member    // isNewMember=trueの場合はnull
) {}
