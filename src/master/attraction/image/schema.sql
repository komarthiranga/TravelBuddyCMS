CREATE TABLE IF NOT EXISTS attraction_image (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    attraction_id BIGINT NOT NULL,

    image_url TEXT NOT NULL,
    public_id VARCHAR(300) NOT NULL UNIQUE,
    alt_text VARCHAR(300),

    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_image_attraction
        FOREIGN KEY (attraction_id)
        REFERENCES attraction(id)
        ON DELETE CASCADE,

    CONSTRAINT check_image_display_order
        CHECK (display_order >= 0)
);
