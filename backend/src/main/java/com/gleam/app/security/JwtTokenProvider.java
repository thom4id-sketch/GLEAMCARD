package com.gleam.app.security;

import com.gleam.app.config.AppProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtTokenProvider {

    private final AppProperties appProperties;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(
            appProperties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(Long memberId, String lineUserId, boolean isAdmin) {
        return Jwts.builder()
            .subject(memberId.toString())
            .claim("lineUserId", lineUserId)
            .claim("isAdmin", isAdmin)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + appProperties.getJwt().getExpirationMs()))
            .signWith(getSigningKey())
            .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    public Long getMemberIdFromToken(String token) {
        return Long.parseLong(parseClaims(token).getSubject());
    }

    public boolean isAdminToken(String token) {
        return Boolean.TRUE.equals(parseClaims(token).get("isAdmin", Boolean.class));
    }
}
