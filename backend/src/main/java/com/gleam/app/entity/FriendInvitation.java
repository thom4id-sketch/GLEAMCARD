package com.gleam.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

/**
 * 友達招待レコード。
 *
 * 【紹介ポイントの不正獲得防止ルール】
 * - 紹介ポイント（招待者への500pt）は1件の招待につき1回のみ付与する。
 * - status が REGISTERED のときにクーポンが使用された場合のみ ScheduledPointGrant を作成し、
 *   status を PURCHASED に更新する。
 * - 購入がキャンセルされクーポンが未使用に戻っても、status は PURCHASED のまま維持する。
 *   そのため、同一クーポンが再利用されても紹介ポイントは発生しない（割引は適用される）。
 * - status が PURCHASED / REWARDED の場合は ScheduledPointGrant を作成しない。
 */
@Entity
@Table(name = "friend_invitations")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class FriendInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inviter_member_id", nullable = false)
    private Member inviter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitee_member_id")
    private Member invitee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "registered_at")
    private OffsetDateTime registeredAt;

    @Column(name = "purchased_at")
    private OffsetDateTime purchasedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }

    /**
     * 紹介ポイントをスケジュール可能かどうかを返す。
     * REGISTERED のとき（＝クーポンが初めて使用された）のみ true。
     */
    public boolean canScheduleReferralPoints() {
        return this.status == Status.REGISTERED;
    }

    public enum Status {
        PENDING,     // 招待リンク発行済み・未登録
        REGISTERED,  // 被招待者が登録済み・クーポン未使用
        PURCHASED,   // クーポン初回使用済み（紹介ポイント付与済みまたは予定）
        REWARDED     // 招待者へのポイント付与完了
    }
}
