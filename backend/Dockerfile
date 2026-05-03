# ビルドステージ（Gradle + JDK 21）
FROM gradle:8.8-jdk21 AS builder
WORKDIR /app
COPY . .
RUN gradle bootJar -x test --no-daemon

# 実行ステージ（JRE のみ、軽量）
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=builder /app/build/libs/gleam-app-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
