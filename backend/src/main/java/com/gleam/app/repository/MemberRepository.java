package com.gleam.app.repository;

import com.gleam.app.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByLineUserId(String lineUserId);
    Optional<Member> findByMemberNo(String memberNo);
    boolean existsByLineUserId(String lineUserId);

    // 最後の購入から3年以上経過しているメンバー（ポイント失効対象）
    @Query("SELECT m FROM Member m WHERE m.points > 0 AND m.lastPurchaseAt < :expiryThreshold")
    List<Member> findMembersWithExpiredPoints(OffsetDateTime expiryThreshold);

    // ポイント失効1ヶ月前の通知対象
    @Query("SELECT m FROM Member m WHERE m.points > 0 AND m.lastPurchaseAt BETWEEN :notifyStart AND :notifyEnd")
    List<Member> findMembersForExpiryNotification(OffsetDateTime notifyStart, OffsetDateTime notifyEnd);

    // 次の会員番号を採番（最大値+1、初回は10001）
    @Query(value = "SELECT COALESCE(MAX(member_no::integer), 10000) + 1 FROM members", nativeQuery = true)
    int findNextMemberNo();
}
