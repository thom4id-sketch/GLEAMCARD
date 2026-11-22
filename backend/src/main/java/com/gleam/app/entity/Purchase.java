package com.gleam.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
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

    /*
     * この購入でランクが上がった場合のみ記録する、上がる前のランク情報（決済取り消し時に元へ戻す）。
     * ランクが変わらなかった購入ではすべて null。
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "rank_before", length = 20)
    private Member.Rank rankBefore;

    /** この購入で上がった後のランク（取り消し時、現在のランクがこれと一致する場合のみ元へ戻す） */
    @Enumerated(EnumType.STRING)
    @Column(name = "rank_after", length = 20)
    private Member.Rank rankAfter;

    @Column(name = "rank_expires_at_before")
    private LocalDate rankExpiresAtBefore;

    @Column(name = "rank_keep_until_before")
    private LocalDate rankKeepUntilBefore;

    /** この購入でランクが上がったかどうか */
    public boolean causedRankUp() {
        return rankBefore != null && rankAfter != null;
    }

    @PrePersist
    protected void onCreate() {
        if (purchasedAt == null) purchasedAt = OffsetDateTime.now();
    }

    public enum Status { COMPLETED, CANCELED }
}
