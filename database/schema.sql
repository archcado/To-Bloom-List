BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(320) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plant_species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    display_order SMALLINT NOT NULL CHECK (display_order BETWEEN 1 AND 31),
    final_unlock_only BOOLEAN NOT NULL DEFAULT FALSE,
    common_name VARCHAR(100) NOT NULL,
    scientific_name VARCHAR(150),
    color_hint VARCHAR(50),
    flower_language VARCHAR(255),
    image_base_path VARCHAR(500) NOT NULL,
    asset_status VARCHAR(20) NOT NULL DEFAULT 'planned'
        CHECK (asset_status IN ('ready', 'planned')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plant_species_id UUID REFERENCES plant_species(id),
    client_reference VARCHAR(100),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed', 'cancelled')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    due_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, client_reference),
    CHECK (scheduled_end IS NULL OR scheduled_start IS NULL OR scheduled_end > scheduled_start)
);

CREATE TABLE IF NOT EXISTS user_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plant_species_id UUID NOT NULL REFERENCES plant_species(id),
    unlocked_by_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    bloom_count INTEGER NOT NULL DEFAULT 0 CHECK (bloom_count >= 0),
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, plant_species_id)
);

CREATE TABLE IF NOT EXISTS task_completion_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_key UUID NOT NULL UNIQUE,
    source VARCHAR(30) NOT NULL DEFAULT 'web'
        CHECK (source IN ('web', 'google_calendar', 'n8n', 'system')),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_goal_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_date DATE NOT NULL,
    required_completion_count INTEGER NOT NULL DEFAULT 4
        CHECK (required_completion_count > 0),
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    claimed_at TIMESTAMPTZ,
    UNIQUE (user_id, reward_date)
);

CREATE TABLE IF NOT EXISTS seed_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reward_id UUID NOT NULL UNIQUE REFERENCES daily_goal_rewards(id) ON DELETE CASCADE,
    selection_seed VARCHAR(255) NOT NULL,
    selected_species_id UUID REFERENCES plant_species(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    selected_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS seed_offer_candidates (
    seed_offer_id UUID NOT NULL REFERENCES seed_offers(id) ON DELETE CASCADE,
    plant_species_id UUID NOT NULL REFERENCES plant_species(id),
    position SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 3),
    PRIMARY KEY (seed_offer_id, plant_species_id),
    UNIQUE (seed_offer_id, position)
);

ALTER TABLE user_collections
    ADD COLUMN IF NOT EXISTS unlocked_by_reward_id UUID
        REFERENCES daily_goal_rewards(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS calendar_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(30) NOT NULL DEFAULT 'google',
    external_calendar_id VARCHAR(255) NOT NULL,
    credential_reference VARCHAR(255) NOT NULL,
    sync_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_calendar_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL UNIQUE REFERENCES tasks(id) ON DELETE CASCADE,
    calendar_connection_id UUID NOT NULL REFERENCES calendar_connections(id) ON DELETE CASCADE,
    external_event_id VARCHAR(255) NOT NULL,
    sync_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (sync_status IN ('pending', 'synced', 'failed', 'conflict')),
    last_synced_at TIMESTAMPTZ,
    sync_error TEXT,
    UNIQUE (calendar_connection_id, external_event_id)
);

CREATE TABLE IF NOT EXISTS automation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    aggregate_id UUID NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_plant_species_display_order
    ON plant_species(display_order)
    WHERE is_active = TRUE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_plant_species_single_final_unlock
    ON plant_species(final_unlock_only)
    WHERE final_unlock_only = TRUE;
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_daily_goal_rewards_user_date
    ON daily_goal_rewards(user_id, reward_date DESC);
CREATE INDEX IF NOT EXISTS idx_automation_events_pending
    ON automation_events(status, available_at)
    WHERE status IN ('pending', 'failed');

COMMIT;
