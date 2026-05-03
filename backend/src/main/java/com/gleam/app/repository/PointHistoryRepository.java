package com.gleam.app.repository;

import com.gleam.app.entity.Member;
import com.gleam.app.entity.PointHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PointHistoryRepository extends JpaRepository<PointHistory, Long> {
    List<PointHistory> findByMemberOrderByCreatedAtDesc(Member member);
}
