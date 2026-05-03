package com.gleam.app.repository;

import com.gleam.app.entity.Member;
import com.gleam.app.entity.Purchase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

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
}
