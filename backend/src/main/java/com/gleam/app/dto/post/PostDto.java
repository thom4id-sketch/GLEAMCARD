package com.gleam.app.dto.post;

import com.gleam.app.entity.Post;

import java.time.OffsetDateTime;

public record PostDto(
    Long id,
    String title,
    String imageData,   // data:{contentType};base64,{base64} 形式
    String linkUrl,
    OffsetDateTime createdAt,
    boolean isPinned
) {
    public static PostDto from(Post post) {
        return new PostDto(
            post.getId(),
            post.getTitle(),
            "data:" + post.getImageContentType() + ";base64," + post.getImageData(),
            post.getLinkUrl(),
            post.getCreatedAt(),
            Boolean.TRUE.equals(post.getIsPinned())
        );
    }
}
