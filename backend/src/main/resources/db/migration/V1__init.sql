-- 店舗
CREATE TABLE stores (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 会員
CREATE TABLE members (
    id                     BIGSERIAL PRIMARY KEY,
    line_user_id           VARCHAR(50)  UNIQUE NOT NULL,
    member_no              VARCHAR(20)  UNIQUE NOT NULL,
    name                   VARCHAR(100) NOT NULL,
    rank                   VARCHAR(20)  NOT NULL DEFAULT 'REGULAR',
    points                 INTEGER      NOT NULL DEFAULT 0,
    annual_purchase_amount INTEGER      NOT NULL DEFAULT 0,
    rank_expires_at        DATE,
    last_purchase_at       TIMESTAMP WITH TIME ZONE,
    created_at             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ブログ投稿
CREATE TABLE posts (
    id         BIGSERIAL PRIMARY KEY,
    title      VARCHAR(200) NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    link_url   VARCHAR(500),
    posted_by  BIGINT REFERENCES members(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 友達招待
CREATE TABLE friend_invitations (
    id                BIGSERIAL PRIMARY KEY,
    inviter_member_id BIGINT NOT NULL REFERENCES members(id),
    invitee_member_id BIGINT REFERENCES members(id),
    status            VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    registered_at     TIMESTAMP WITH TIME ZONE,
    purchased_at      TIMESTAMP WITH TIME ZONE
);

-- クーポン
CREATE TABLE coupons (
    id             BIGSERIAL PRIMARY KEY,
    member_id      BIGINT       NOT NULL REFERENCES members(id),
    name           VARCHAR(100) NOT NULL,
    discount_type  VARCHAR(20)  NOT NULL,
    discount_value INTEGER      NOT NULL,
    discount_desc  VARCHAR(100) NOT NULL,
    coupon_type    VARCHAR(20)  NOT NULL,
    is_used        BOOLEAN      NOT NULL DEFAULT FALSE,
    invitation_id  BIGINT REFERENCES friend_invitations(id),
    expires_at     DATE,
    used_at        TIMESTAMP WITH TIME ZONE,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 購入履歴
CREATE TABLE purchases (
    id              BIGSERIAL PRIMARY KEY,
    member_id       BIGINT  NOT NULL REFERENCES members(id),
    store_id        BIGINT  NOT NULL REFERENCES stores(id),
    amount          INTEGER NOT NULL,
    points_used     INTEGER NOT NULL DEFAULT 0,
    points_to_grant INTEGER NOT NULL DEFAULT 0,
    coupon_id       BIGINT REFERENCES coupons(id),
    purchased_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    status          VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    canceled_at     TIMESTAMP WITH TIME ZONE
);

-- ポイント付与スケジュール
CREATE TABLE scheduled_point_grants (
    id                  BIGSERIAL PRIMARY KEY,
    member_id           BIGINT      NOT NULL REFERENCES members(id),
    amount              INTEGER     NOT NULL,
    grant_reason        VARCHAR(20) NOT NULL,
    related_purchase_id BIGINT REFERENCES purchases(id),
    scheduled_at        TIMESTAMP WITH TIME ZONE NOT NULL,
    executed_at         TIMESTAMP WITH TIME ZONE,
    is_canceled         BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ポイント履歴
CREATE TABLE point_histories (
    id                  BIGSERIAL PRIMARY KEY,
    member_id           BIGINT       NOT NULL REFERENCES members(id),
    amount              INTEGER      NOT NULL,
    transaction_type    VARCHAR(20)  NOT NULL,
    description         VARCHAR(200) NOT NULL,
    related_purchase_id BIGINT REFERENCES purchases(id),
    related_grant_id    BIGINT REFERENCES scheduled_point_grants(id),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_members_line_user_id      ON members(line_user_id);
CREATE INDEX idx_purchases_member_id       ON purchases(member_id);
CREATE INDEX idx_coupons_member_id         ON coupons(member_id);
CREATE INDEX idx_point_histories_member_id ON point_histories(member_id);
CREATE INDEX idx_friend_inv_inviter        ON friend_invitations(inviter_member_id);
CREATE INDEX idx_scheduled_grants_pending  ON scheduled_point_grants(scheduled_at)
    WHERE executed_at IS NULL AND is_canceled = FALSE;

-- 初期データ：店舗
INSERT INTO stores (name) VALUES ('渋谷本店');
