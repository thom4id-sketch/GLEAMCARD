package com.gleam.app.service;

import com.gleam.app.config.AppProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class LineMessagingService {

    private static final String MULTICAST_URL = "https://api.line.me/v2/bot/message/multicast";
    private static final int BATCH_SIZE = 500;

    private final WebClient webClient;
    private final AppProperties appProperties;

    public LineMessagingService(WebClient.Builder builder, AppProperties appProperties) {
        this.webClient = builder.build();
        this.appProperties = appProperties;
    }

    /**
     * クーポン配布通知をマルチキャスト送信する。
     * トークンが未設定の場合やエラー時はログのみ出力し、例外を伝播させない。
     */
    public void sendCouponNotification(
            List<String> lineUserIds,
            String couponName,
            String discountDesc,
            LocalDate expiresAt,
            String usageCondition) {

        if (lineUserIds.isEmpty()) return;

        String token = appProperties.getLine().getChannelAccessToken();
        if (token == null || token.isBlank()) {
            log.info("LINE_CHANNEL_ACCESS_TOKEN が未設定のため通知をスキップします");
            return;
        }

        String text = buildMessage(couponName, discountDesc, expiresAt, usageCondition);

        for (List<String> batch : partition(lineUserIds, BATCH_SIZE)) {
            try {
                sendMulticast(token, batch, text);
                log.info("クーポン通知送信完了: {} 件", batch.size());
            } catch (Exception e) {
                log.warn("クーポン通知の送信に失敗しました: {}", e.getMessage());
            }
        }
    }

    private void sendMulticast(String token, List<String> to, String text) {
        Map<String, Object> body = Map.of(
            "to", to,
            "messages", List.of(Map.of("type", "text", "text", text))
        );

        webClient.post()
            .uri(MULTICAST_URL)
            .header("Authorization", "Bearer " + token)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .retrieve()
            .bodyToMono(Void.class)
            .block();
    }

    private String buildMessage(String couponName, String discountDesc, LocalDate expiresAt, String usageCondition) {
        StringBuilder sb = new StringBuilder();
        sb.append("クーポンが届きました！\n\n");
        sb.append("■ ").append(couponName).append("\n");
        sb.append(discountDesc).append("\n");
        if (expiresAt != null) {
            sb.append("有効期限: ").append(expiresAt.toString().replace("-", "/")).append("\n");
        } else {
            sb.append("有効期限: 無期限\n");
        }
        if (usageCondition != null && !usageCondition.isBlank()) {
            sb.append("利用条件: ").append(usageCondition).append("\n");
        }
        sb.append("\nアプリを開いてご確認ください。");
        return sb.toString();
    }

    private static <T> List<List<T>> partition(List<T> list, int size) {
        List<List<T>> result = new ArrayList<>();
        for (int i = 0; i < list.size(); i += size) {
            result.add(list.subList(i, Math.min(i + size, list.size())));
        }
        return result;
    }
}
