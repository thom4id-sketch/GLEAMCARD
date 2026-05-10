package com.gleam.app.security;

import com.gleam.app.config.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class LineTokenVerifier {

    private final AppProperties appProperties;
    private final WebClient webClient = WebClient.create("https://api.line.me");

    public record LineUserInfo(String userId, String displayName) {}

    /**
     * LINEアクセストークンを検証し、ユーザー情報を返す。
     * 失敗時は IllegalArgumentException をスロー。
     */
    public LineUserInfo verify(String accessToken) {
        try {
            // トークン検証
            webClient.get()
                .uri("/oauth2/v2.1/verify?access_token={token}", accessToken)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            // プロフィール取得
            Map<?, ?> profile = webClient.get()
                .uri("/v2/profile")
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (profile == null) throw new IllegalArgumentException("Failed to fetch LINE profile");

            return new LineUserInfo(
                (String) profile.get("userId"),
                (String) profile.get("displayName")
            );
        } catch (WebClientResponseException e) {
            log.warn("LINE token verification failed: status={} body={}",
                e.getStatusCode(), e.getResponseBodyAsString());
            throw new IllegalArgumentException("Invalid LINE access token");
        }
    }

    /**
     * 管理者用LIFF IDかどうかを判定する。
     */
    public boolean isAdminLiff(String liffId) {
        return appProperties.getLine().getLiffIdAdmin().equals(liffId);
    }
}
