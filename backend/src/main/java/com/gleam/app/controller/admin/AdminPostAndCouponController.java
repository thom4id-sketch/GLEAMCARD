package com.gleam.app.controller.admin;

import com.gleam.app.dto.coupon.CouponGroupDto;
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

import java.util.List;
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

    /** PUT /api/admin/posts/{id} — ブログ編集（タイトル・URL・画像を更新） */
    @PutMapping("/posts/{id}")
    public ResponseEntity<PostDto> updatePost(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam(required = false) String linkUrl,
            @RequestParam(name = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(postService.updatePost(id, title, linkUrl, image));
    }

    /** DELETE /api/admin/posts/{id} — ブログ削除 */
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    /** POST /api/admin/coupons/distribute — 全会員にクーポンを一括配布 */
    @PostMapping("/coupons/distribute")
    public ResponseEntity<Map<String, Integer>> distributeCoupon(
            @Valid @RequestBody DistributeCouponRequest request) {
        int count = couponService.distributeCoupon(request);
        return ResponseEntity.ok(Map.of("distributed", count));
    }

    /** GET /api/admin/coupons/history — 配布済みクーポン一覧（クーポン名ごとに集計） */
    @GetMapping("/coupons/history")
    public ResponseEntity<List<CouponGroupDto>> getCouponHistory() {
        return ResponseEntity.ok(couponService.getCouponHistory());
    }

    /** DELETE /api/admin/coupons/by-name/{name} — クーポン名で一括削除 */
    @DeleteMapping("/coupons/by-name/{name}")
    public ResponseEntity<Void> deleteCouponsByName(@PathVariable String name) {
        couponService.deleteCouponsByName(name);
        return ResponseEntity.noContent().build();
    }
}
