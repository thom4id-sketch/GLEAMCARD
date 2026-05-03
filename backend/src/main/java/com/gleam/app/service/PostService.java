package com.gleam.app.service;

import com.gleam.app.config.AppProperties;
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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PostService {

    private static final Set<String> ALLOWED_CONTENT_TYPES =
        Set.of("image/jpeg", "image/png", "image/webp");

    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final AppProperties appProperties;

    /** ブログ一覧取得（作成日降順） */
    @Transactional(readOnly = true)
    public Page<PostDto> getPosts(int page, int size) {
        return postRepository
            .findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
            .map(PostDto::from);
    }

    /** ブログ投稿（管理者用）。画像をアップロードディレクトリに保存してDBに登録する。 */
    public PostDto createPost(Long memberId, String title, String linkUrl, MultipartFile image) {
        validateImage(image);

        Member postedBy = memberRepository.findById(memberId)
            .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));

        String filename = saveImage(image);

        Post post = postRepository.save(Post.builder()
            .title(title)
            .imagePath(filename)
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

    /**
     * 画像をアップロードディレクトリに保存し、ファイル名を返す。
     * ファイル名は UUID + 元の拡張子（例: a1b2c3d4.jpg）。
     */
    private String saveImage(MultipartFile image) {
        String originalFilename = image.getOriginalFilename();
        String ext = (originalFilename != null && originalFilename.contains("."))
            ? originalFilename.substring(originalFilename.lastIndexOf('.'))
            : ".jpg";
        String filename = UUID.randomUUID() + ext;

        try {
            Path uploadDir = Paths.get(appProperties.getUpload().getDir());
            Files.createDirectories(uploadDir);
            image.transferTo(uploadDir.resolve(filename));
        } catch (IOException e) {
            throw new RuntimeException("画像の保存に失敗しました", e);
        }

        return filename;
    }
}
