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

    // マジックバイト: Content-Type ヘッダーの偽装を検出する
    private static final byte[] MAGIC_JPEG = {(byte)0xFF, (byte)0xD8, (byte)0xFF};
    private static final byte[] MAGIC_PNG  = {(byte)0x89, 0x50, 0x4E, 0x47};
    // WebP = "RIFF" + 4bytes + "WEBP"
    private static final byte[] MAGIC_WEBP_RIFF = {0x52, 0x49, 0x46, 0x46};
    private static final byte[] MAGIC_WEBP_MARK = {0x57, 0x45, 0x42, 0x50};

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

    public PostDto updatePost(Long postId, String title, String linkUrl, MultipartFile image) {
        Post post = postRepository.findById(postId)
            .orElseThrow(() -> new IllegalArgumentException("Post not found: " + postId));

        post.setTitle(title);
        post.setLinkUrl(linkUrl);

        if (image != null && !image.isEmpty()) {
            validateImage(image);
            try {
                post.setImageData(Base64.getEncoder().encodeToString(image.getBytes()));
                post.setImageContentType(image.getContentType());
            } catch (IOException e) {
                throw new RuntimeException("画像の読み込みに失敗しました", e);
            }
        }

        return PostDto.from(postRepository.save(post));
    }

    public void deletePost(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new IllegalArgumentException("Post not found: " + postId);
        }
        postRepository.deleteById(postId);
    }

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("画像ファイルが必要です");
        }
        String contentType = image.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("対応していない画像形式です（JPEG/PNG/WebP）");
        }
        try {
            byte[] header = image.getBytes();
            if (!matchesMagic(header, contentType)) {
                throw new IllegalArgumentException("ファイルの内容が宣言された形式と一致しません");
            }
        } catch (IOException e) {
            throw new RuntimeException("画像の検証に失敗しました", e);
        }
    }

    private boolean matchesMagic(byte[] data, String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> startsWith(data, MAGIC_JPEG);
            case "image/png"  -> startsWith(data, MAGIC_PNG);
            case "image/webp" -> startsWith(data, MAGIC_WEBP_RIFF)
                                 && data.length >= 12
                                 && startsWith(data, MAGIC_WEBP_MARK, 8);
            default -> false;
        };
    }

    private static boolean startsWith(byte[] data, byte[] magic) {
        return startsWith(data, magic, 0);
    }

    private static boolean startsWith(byte[] data, byte[] magic, int offset) {
        if (data.length < offset + magic.length) return false;
        for (int i = 0; i < magic.length; i++) {
            if (data[offset + i] != magic[i]) return false;
        }
        return true;
    }
}
