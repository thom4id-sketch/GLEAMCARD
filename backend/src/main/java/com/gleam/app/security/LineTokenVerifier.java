package com.gleam.app.security;

import com.gleam.app.config.AppProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class LineTokenVerifier {

    private final AppProperties appProperties;
    private final WebClient webClient = WebClient.create("https://api.line.me");

    public record LineUserInfo(String userId) {}

    /**
     * LINE IDトークンを検証してユーザーIDを返す。
     * POST /oauth2/v2.1/verify に id_token + client_id を送る方式。
     * LINE Mini App チャンネルでも動作し、profile スコープ同意は不要。
     */
    public LineUserInfo verifyIdToken(String idToken, String liffId) {
        String channelId = liffId.split("-")[0];

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("id_token", idToken);
        form.add("client_id", channelId);

        try {
            Map<?, ?> claims = webClient.post()
                .uri("/oauth2/v2.1/verify")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .bodyValue(form)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (claims == null || claims.get("sub") == null) {
                throw new IllegalArgumentException("LINE ID token verification returned no subject");
            }

            return new LineUserInfo((String) claims.get("sub"));
        } catch (WebClientResponseException e) {
            log.warn("LINE ID token verification failed: status={} body={}",
                e.getStatusCode(), e.getResponseBodyAsString());
            throw new IllegalArgumentException("Invalid LINE ID token");
        }
    }

    public boolean isAdminLiff(String liffId) {
        return appProperties.getLine().getLiffIdAdmin().equals(liffId);
    }
}
