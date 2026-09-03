CREATE TABLE IF NOT EXISTS attraction (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    short_name VARCHAR(150) NOT NULL,
    full_name VARCHAR(300) NOT NULL,
    slug VARCHAR(350) NOT NULL UNIQUE,

    address TEXT NOT NULL,

    city_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,

    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),

    entry_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency_code VARCHAR(3) NOT NULL DEFAULT 'INR',

    opening_time TIME,
    closing_time TIME,

    best_time_to_visit VARCHAR(300),
    travel_modes TEXT[] NOT NULL DEFAULT '{}',

    short_description VARCHAR(500) NOT NULL,
    full_description TEXT,
    instructions TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_attraction_city
        FOREIGN KEY (city_id)
        REFERENCES city(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_attraction_category
        FOREIGN KEY (category_id)
        REFERENCES category(id)
        ON DELETE RESTRICT,

    CONSTRAINT check_entry_fee
        CHECK (entry_fee >= 0),

    CONSTRAINT check_attraction_status
        CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED'))
);
