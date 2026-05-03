package com.gleam.app.repository;

import com.gleam.app.entity.Purchase;
import com.gleam.app.entity.ScheduledPointGrant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface ScheduledPointGrantRepository extends JpaRepository<ScheduledPointGrant, Long> {

    @Query("SELECT g FROM ScheduledPointGrant g WHERE g.scheduledAt <= :now AND g.executedAt IS NULL AND g.isCanceled = false")
    List<ScheduledPointGrant> findPendingGrants(@Param("now") OffsetDateTime now);

    List<ScheduledPointGrant> findByRelatedPurchaseAndIsCanceledFalse(Purchase purchase);
}
