package com.gleam.app.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
@Getter @Setter
public class AppProperties {

    private Jwt jwt = new Jwt();
    private Line line = new Line();
    private Upload upload = new Upload();
    private Cors cors = new Cors();

    @Getter @Setter
    public static class Jwt {
        private String secret;
        private long expirationMs;
    }

    @Getter @Setter
    public static class Line {
        private String liffIdUser;
        private String liffIdAdmin;
    }

    @Getter @Setter
    public static class Upload {
        private String dir;
    }

    @Getter @Setter
    public static class Cors {
        private java.util.List<String> allowedOrigins = java.util.List.of(
            "http://localhost:5173",
            "http://localhost:3000",
            "https://*.vercel.app",
            "https://liff.line.me",
            "https://miniapp.line.me"
        );
    }

    @Getter @Setter
    public static class Admin {
        /** カンマ区切りの許可会員番号リスト（例: "10001,10002"）。空の場合は全員許可。 */
        private String allowedMemberNos = "";
    }

    private Admin admin = new Admin();
}
