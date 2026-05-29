package com.gleam.app.repository;

import com.gleam.app.entity.Coupon;
import com.gleam.app.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    List<Coupon> findByMemberAndIsUsedFalse(Member member);
    List<Coupon> findByMember(Member member);

    // 管理者：FRIEND以外のクーポンをクーポン名ごとに集計
    @Query(value = """
        SELECT c.name,
               MIN(c.discount_desc)   AS discount_desc,
               MIN(c.usage_condition) AS usage_condition,
               MIN(CAST(c.expires_at AS TEXT)) AS expires_at,
               COUNT(c.id)            AS total_count,
               COUNT(CASE WHEN c.is_used THEN 1 END) AS used_count,
               MIN(c.created_at)      AS created_at
        FROM coupons c
        WHERE c.coupon_type != 'FRIEND'
        GROUP BY c.name
        ORDER BY MIN(c.created_at) DESC
        """, nativeQuery = true)
    List<Object[]> findDistributedCouponGroups();

    // 管理者：クーポン名で一括削除（FRIENDタイプは除外）
    @Modifying
    @Query(value = "DELETE FROM coupons WHERE name = :name AND coupon_type != 'FRIEND'", nativeQuery = true)
    void deleteByCouponName(@Param("name") String name);
}
