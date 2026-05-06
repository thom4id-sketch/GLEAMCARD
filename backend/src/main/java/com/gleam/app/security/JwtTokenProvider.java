package com.gleam.app.security;

import com.gleam.app.config.AppProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
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

    private static final String WEAK_DEFAULT_SECRET =
        "local-dev-secret-change-this-in-production-must-be-32-chars";
    private static final int MIN_SECRET_LENGTH = 32;

    private final AppProperties appProperties;

    @PostConstruct
    public void validateJwtSecret() {
        String secret = appProperties.getJwt().getSecret();
        if (secret == null || secret.length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException(
                "JWT_SECRET must be at least " + MIN_SECRET_LENGTH + " characters");
        }
        if (secret.equals(WEAK_DEFAULT_SECRET)) {
            log.warn("[SECURITY] デフォルトのJWT秘密鍵が使われています。本番環境では JWT_SECRET 環境変数を設定してください。");
        }
    }

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
            .signWith(getSigningKey(), Jwts.SIG.HS256)
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
