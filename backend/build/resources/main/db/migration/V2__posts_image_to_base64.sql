ALTER TABLE posts
    ADD COLUMN image_data         TEXT         NOT NULL DEFAULT '',
    ADD COLUMN image_content_type VARCHAR(50)  NOT NULL DEFAULT 'image/jpeg';

ALTER TABLE posts DROP COLUMN image_path;
