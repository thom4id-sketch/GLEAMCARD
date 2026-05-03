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
}
