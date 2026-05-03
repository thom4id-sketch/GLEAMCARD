package com.gleam.app.controller.admin;

import com.gleam.app.dto.coupon.DistributeCouponRequest;
import com.gleam.app.dto.post.PostDto;
import com.gleam.app.service.CouponService;
import com.gleam.app.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPostAndCouponController {

    private final PostService postService;
    private final CouponService couponService;

    /** POST /api/admin/posts — ブログ投稿（multipart/form-data） */
    @PostMapping("/posts")
    public ResponseEntity<PostDto> createPost(
            @AuthenticationPrincipal Long memberId,
            @RequestParam String title,
            @RequestParam(required = false) String linkUrl,
            @RequestParam("image") MultipartFile image) {
        return ResponseEntity.ok(postService.createPost(memberId, title, linkUrl, image));
    }

    /** POST /api/admin/coupons/distribute — 全会員にクーポンを一括配布 */
    @PostMapping("/coupons/distribute")
    public ResponseEntity<Map<String, Integer>> distributeCoupon(
            @Valid @RequestBody DistributeCouponRequest request) {
        int count = couponService.distributeCoupon(request);
        return ResponseEntity.ok(Map.of("distributed", count));
    }
}
