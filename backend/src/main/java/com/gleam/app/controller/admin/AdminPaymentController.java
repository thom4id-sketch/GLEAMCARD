package com.gleam.app.controller.admin;

import com.gleam.app.dto.payment.PaymentHistoryItem;
import com.gleam.app.dto.payment.ProcessPaymentRequest;
import com.gleam.app.dto.payment.ProcessPaymentResponse;
import com.gleam.app.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPaymentController {

    private final PaymentService paymentService;

    /** POST /api/admin/payments — 決済処理 */
    @PostMapping
    public ResponseEntity<ProcessPaymentResponse> processPayment(
            @Valid @RequestBody ProcessPaymentRequest request) {
        return ResponseEntity.ok(paymentService.processPayment(request));
    }

    /** PUT /api/admin/payments/{id}/cancel — 決済取り消し（最新のみ） */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelPayment(@PathVariable Long id) {
        paymentService.cancelPayment(id);
        return ResponseEntity.ok().build();
    }

    /** GET /api/admin/payments?name=xxx&exact=false&page=0&size=20 — 決済履歴 */
    @GetMapping
    public ResponseEntity<Page<PaymentHistoryItem>> getPayments(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "false") boolean exact,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(paymentService.getPaymentHistory(name, exact, page, size));
    }
}
