package com.gleam.app.controller.admin;

import com.gleam.app.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/stores")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStoreController {

    private final StoreRepository storeRepository;

    /** GET /api/admin/stores — 店舗一覧 */
    @GetMapping
    public ResponseEntity<List<StoreDto>> getStores() {
        List<StoreDto> stores = storeRepository.findAll().stream()
            .map(s -> new StoreDto(s.getId(), s.getName()))
            .toList();
        return ResponseEntity.ok(stores);
    }

    public record StoreDto(Long id, String name) {}
}
