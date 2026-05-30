package com.gleam.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "members")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "line_user_id", unique = true, nullable = false, length = 50)
    private String lineUserId;

    @Column(name = "member_no", unique = true, nullable = false, length = 20)
    private String memberNo;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "name_kana", nullable = false, length = 100)
    private String nameKana;

    @Column(name = "birthday")
    private LocalDate birthday;

    @Column(name = "gender", length = 20)
    private String gender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Rank rank = Rank.REGULAR;

    @Column(nullable = false)
    @Builder.Default
    private Integer points = 0;

    @Column(name = "annual_purchase_amount", nullable = false)
    @Builder.Default
    private Integer annualPurchaseAmount = 0;

    @Column(name = "rank_expires_at")
    private LocalDate rankExpiresAt;

    @Column(name = "rank_keep_until")
    private LocalDate rankKeepUntil;

    @Column(name = "last_purchase_at")
    private OffsetDateTime lastPurchaseAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    public enum Rank {
        REGULAR, SILVER, GOLD, PLATINUM;

        public double getPointRate() {
            return switch (this) {
                case PLATINUM -> 0.10;
                case GOLD     -> 0.10;
                case SILVER   -> 0.08;
                default       -> 0.05;
            };
        }

        /** 3年間累計購入額（税抜き）でランクを判定。 */
        public static Rank fromThreeYearPurchase(int taxExcludedAmount) {
            if (taxExcludedAmount >= 1_500_000) return PLATINUM;
            if (taxExcludedAmount >= 1_000_000) return GOLD;
            if (taxExcludedAmount >= 300_000)   return SILVER;
            return REGULAR;
        }
    }
}
