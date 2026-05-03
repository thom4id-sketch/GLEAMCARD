package com.gleam.app.scheduler;

import com.gleam.app.entity.Member;
import com.gleam.app.entity.PointHistory;
import com.gleam.app.entity.ScheduledPointGrant;
import com.gleam.app.repository.MemberRepository;
import com.gleam.app.repository.PointHistoryRepository;
import com.gleam.app.repository.ScheduledPointGrantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PointScheduler {

    private final ScheduledPointGrantRepository grantRepository;
    private final PointHistoryRepository pointHistoryRepository;
    private final MemberRepository memberRepository;

    /** 毎時0分：ポイント付与スケジュール実行 */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void executeScheduledGrants() {
        List<ScheduledPointGrant> pending = grantRepository.findPendingGrants(OffsetDateTime.now());
        if (pending.isEmpty()) return;

        log.info("Executing {} scheduled point grant(s)", pending.size());

        for (ScheduledPointGrant grant : pending) {
            Member member = grant.getMember();
            member.setPoints(member.getPoints() + grant.getAmount());
            memberRepository.save(member);

            pointHistoryRepository.save(PointHistory.builder()
                .member(member)
                .amount(grant.getAmount())
                .transactionType(PointHistory.TransactionType.GRANT)
                .description(grant.getGrantReason() == ScheduledPointGrant.GrantReason.PURCHASE
                    ? "商品購入ポイント付与"
                    : "お友達紹介特典")
                .relatedPurchase(grant.getRelatedPurchase())
                .relatedGrant(grant)
                .build());

            grant.setExecutedAt(OffsetDateTime.now());
            grantRepository.save(grant);
        }
    }

    /** 毎日00:05：ポイント失効チェック（最終購入から1年経過） */
    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void checkPointExpiry() {
        OffsetDateTime oneYearAgo = OffsetDateTime.now().minusYears(1);
        List<Member> expired = memberRepository.findMembersWithExpiredPoints(oneYearAgo);

        for (Member member : expired) {
            int expiredPoints = member.getPoints();
            if (expiredPoints <= 0) continue;

            pointHistoryRepository.save(PointHistory.builder()
                .member(member)
                .amount(expiredPoints)
                .transactionType(PointHistory.TransactionType.EXPIRE)
                .description("ポイント失効（最終購入から1年経過）")
                .build());

            member.setPoints(0);
            memberRepository.save(member);
            log.info("Expired {} points for member {}", expiredPoints, member.getMemberNo());
        }
    }

    /** 毎年1/1 00:10：会員ランクリセット */
    @Scheduled(cron = "0 10 0 1 1 *")
    @Transactional
    public void resetAnnualRank() {
        LocalDate today = LocalDate.now();

        // rankExpiresAt が今日以前の会員を REGULAR にリセット
        List<Member> members = memberRepository.findAll().stream()
            .filter(m -> m.getRank() != Member.Rank.REGULAR)
            .filter(m -> m.getRankExpiresAt() == null || !m.getRankExpiresAt().isAfter(today))
            .toList();

        for (Member member : members) {
            Member.Rank prevRank = member.getRank();
            member.setRank(Member.Rank.REGULAR);
            member.setAnnualPurchaseAmount(0);
            member.setRankExpiresAt(null);
            memberRepository.save(member);
            log.info("Reset rank {} -> REGULAR for member {}", prevRank, member.getMemberNo());
        }

        log.info("Annual rank reset: {} member(s) affected", members.size());
    }
}
