package com.gleam.app.dto.post;

import com.gleam.app.entity.Post;

import java.time.OffsetDateTime;

public record PostDto(
    Long id,
    String title,
    String imageUrl,    // /uploads/{filename} 形式
    String linkUrl,
    OffsetDateTime createdAt
) {
    public static PostDto from(Post post) {
        return new PostDto(
            post.getId(),
            post.getTitle(),
            "/uploads/" + post.getImagePath(),
            post.getLinkUrl(),
            post.getCreatedAt()
        );
    }
}
