package com.gleam.app.service;

import com.gleam.app.dto.post.PostDto;
import com.gleam.app.entity.Member;
import com.gleam.app.entity.Post;
import com.gleam.app.repository.MemberRepository;
import com.gleam.app.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class PostService {

    private static final Set<String> ALLOWED_CONTENT_TYPES =
        Set.of("image/jpeg", "image/png", "image/webp");

    private final PostRepository postRepository;
    private final MemberRepository memberRepository;

    @Transactional(readOnly = true)
    public Page<PostDto> getPosts(int page, int size) {
        return postRepository
            .findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
            .map(PostDto::from);
    }

    public PostDto createPost(Long memberId, String title, String linkUrl, MultipartFile image) {
        validateImage(image);

        Member postedBy = memberRepository.findById(memberId)
            .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));

        String contentType = image.getContentType();
        String base64;
        try {
            base64 = Base64.getEncoder().encodeToString(image.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("画像の読み込みに失敗しました", e);
        }

        Post post = postRepository.save(Post.builder()
            .title(title)
            .imageData(base64)
            .imageContentType(contentType)
            .linkUrl(linkUrl)
            .postedBy(postedBy)
            .build());

        return PostDto.from(post);
    }

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("画像ファイルが必要です");
        }
        String contentType = image.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("対応していない画像形式です（JPEG/PNG/WebP）");
        }
    }
}
