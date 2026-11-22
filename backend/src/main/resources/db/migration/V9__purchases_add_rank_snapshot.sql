-- 購入でランクが上がった場合に、上がる前のランク情報を記録する（決済取り消し時に元へ戻すため）。
-- ランクが変わらなかった購入はすべて NULL。
ALTER TABLE purchases
    ADD COLUMN rank_before                 VARCHAR(20),
    ADD COLUMN rank_after                  VARCHAR(20),
    ADD COLUMN rank_expires_at_before      DATE,
    ADD COLUMN rank_keep_until_before      DATE;
