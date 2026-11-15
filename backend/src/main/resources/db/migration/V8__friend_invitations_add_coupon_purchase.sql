-- 紹介クーポンが実際に利用された購入を招待レコード（＝招待者の会員IDに紐づく）へ記録する。
-- NULL     : クーポン未利用、または利用した購入がキャンセルされた（購入人数に数えない）
-- NOT NULL : クーポンを利用した有効な購入がある（購入人数に数える）
ALTER TABLE friend_invitations
    ADD COLUMN coupon_purchase_id BIGINT REFERENCES purchases(id);

-- 既存データの移行：紹介クーポンを利用した完了済み（未キャンセル）の購入を紐づける
UPDATE friend_invitations fi
SET coupon_purchase_id = p.id
FROM coupons c
JOIN purchases p ON p.coupon_id = c.id
WHERE c.invitation_id = fi.id
  AND c.coupon_type = 'FRIEND'
  AND c.is_used = TRUE
  AND p.status = 'COMPLETED';
