CREATE TABLE IF NOT EXISTS stay (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 city_id bigint NOT NULL REFERENCES city(id),
 slug text NOT NULL,
 name text NOT NULL,
 kind text NOT NULL CHECK (kind IN ('hotel','oyo','hostel','room')),
 area text NOT NULL,
 address text NOT NULL,
 phone text NOT NULL CHECK (phone ~ '^\+[0-9]{10,15}$'),
 latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
 longitude double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
 summary text NOT NULL,
 source_url text NOT NULL CHECK (source_url LIKE 'https://%'),
 source_name text NOT NULL,
 coordinate_source_url text NOT NULL CHECK (coordinate_source_url LIKE 'https://%'),
 coordinate_note text NOT NULL,
 checked_at date NOT NULL,
 review_due_at date NOT NULL CHECK (review_due_at > checked_at),
 status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published','archived')),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(city_id,slug)
);
CREATE INDEX IF NOT EXISTS stay_city_status_kind_idx ON stay(city_id,status,kind);
