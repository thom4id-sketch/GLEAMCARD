package com.gleam.app.repository;

import com.gleam.app.entity.FriendInvitation;
import com.gleam.app.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface FriendInvitationRepository extends JpaRepository<FriendInvitation, Long> {
    List<FriendInvitation> findByInviter(Member inviter);

    /**
     * 指定期間内に招待者が獲得した紹介ポイント件数（マルチアカウント対策の月次上限チェック用）。
     * PURCHASED / REWARDED になった件数を返す。
     */
    @Query("SELECT COUNT(i) FROM FriendInvitation i " +
           "WHERE i.inviter = :inviter " +
           "AND i.status IN (com.gleam.app.entity.FriendInvitation.Status.PURCHASED, " +
           "                 com.gleam.app.entity.FriendInvitation.Status.REWARDED) " +
           "AND i.purchasedAt >= :since")
    long countReferralRewardsEarnedSince(@Param("inviter") Member inviter,
                                         @Param("since") OffsetDateTime since);
}
