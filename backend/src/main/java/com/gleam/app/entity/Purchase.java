package com.gleam.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "purchases")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(nullable = false)
    private Integer amount;

    @Column(name = "points_used", nullable = false)
    @Builder.Default
    private Integer pointsUsed = 0;

    @Column(name = "points_to_grant", nullable = false)
    @Builder.Default
    private Integer pointsToGrant = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

    @Column(name = "purchased_at", nullable = false)
    private OffsetDateTime purchasedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.COMPLETED;

    @Column(name = "canceled_at")
    private OffsetDateTime canceledAt;

    @PrePersist
    protected void onCreate() {
        if (purchasedAt == null) purchasedAt = OffsetDateTime.now();
    }

    public enum Status { COMPLETED, CANCELED }
}
