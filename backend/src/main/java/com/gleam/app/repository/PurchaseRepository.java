package com.gleam.app.repository;

import com.gleam.app.entity.Member;
import com.gleam.app.entity.Purchase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findByMemberOrderByPurchasedAtDesc(Member member);
    Page<Purchase> findAllByOrderByPurchasedAtDesc(Pageable pageable);
    Page<Purchase> findByMemberOrderByPurchasedAtDesc(Member member, Pageable pageable);

    // 名前検索（完全一致）
    Page<Purchase> findByMemberNameOrderByPurchasedAtDesc(String name, Pageable pageable);

    // 名前検索（部分一致）
    Page<Purchase> findByMemberNameContainingOrderByPurchasedAtDesc(String name, Pageable pageable);

    // 決済取り消し可否チェック用（最新の完了済み決済を取得）
    Optional<Purchase> findTopByMemberAndStatusOrderByPurchasedAtDesc(Member member, Purchase.Status status);

    // 3年ローリングウィンドウ用：指定日以降の完了済み税込み購入額合計
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Purchase p WHERE p.member = :member AND p.purchasedAt >= :since AND p.status = 'COMPLETED'")
    int sumCompletedAmountSince(@Param("member") Member member, @Param("since") OffsetDateTime since);

    // 購入経験者フィルタ用：完了済み購入が1件以上ある会員IDセット
    @Query("SELECT DISTINCT p.member.id FROM Purchase p WHERE p.status = 'COMPLETED'")
    java.util.Set<Long> findMemberIdsWithCompletedPurchase();
}
