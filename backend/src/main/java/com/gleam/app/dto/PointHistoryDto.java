package com.gleam.app.dto;

import com.gleam.app.entity.PointHistory;

import java.time.OffsetDateTime;

public record PointHistoryDto(
    Long id,
    int amount,
    String transactionType,
    String description,
    OffsetDateTime createdAt
) {
    public static PointHistoryDto from(PointHistory ph) {
        return new PointHistoryDto(
            ph.getId(),
            ph.getAmount(),
            ph.getTransactionType().name(),
            ph.getDescription(),
            ph.getCreatedAt()
        );
    }
}
