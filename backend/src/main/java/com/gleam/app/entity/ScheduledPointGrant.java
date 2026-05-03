package com.gleam.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "scheduled_point_grants")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ScheduledPointGrant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private Integer amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "grant_reason", nullable = false, length = 20)
    private GrantReason grantReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_purchase_id")
    private Purchase relatedPurchase;

    @Column(name = "scheduled_at", nullable = false)
    private OffsetDateTime scheduledAt;

    @Column(name = "executed_at")
    private OffsetDateTime executedAt;

    @Column(name = "is_canceled", nullable = false)
    @Builder.Default
    private Boolean isCanceled = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }

    public enum GrantReason { PURCHASE, FRIEND_REFERRAL }
}
