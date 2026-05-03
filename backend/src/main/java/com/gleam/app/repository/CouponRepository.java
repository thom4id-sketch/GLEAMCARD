package com.gleam.app.repository;

import com.gleam.app.entity.Coupon;
import com.gleam.app.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    List<Coupon> findByMemberAndIsUsedFalse(Member member);
    List<Coupon> findByMember(Member member);
}
