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
        private java.util.List<String> allowedOrigins =
            java.util.List.of("http://localhost:5173", "http://localhost:3000");
    }
}
