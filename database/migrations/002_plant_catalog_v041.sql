BEGIN;

ALTER TABLE plant_species
    ADD COLUMN IF NOT EXISTS display_order SMALLINT;

ALTER TABLE plant_species
    ADD COLUMN IF NOT EXISTS final_unlock_only BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE plant_species
SET is_active = FALSE
WHERE code IN ('marigold', 'magnolia', 'peony', 'lotus');

CREATE INDEX IF NOT EXISTS idx_plant_species_display_order
    ON plant_species(display_order)
    WHERE is_active = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_plant_species_single_final_unlock
    ON plant_species(final_unlock_only)
    WHERE final_unlock_only = TRUE;

COMMIT;

-- 接著執行 seeds/001_current_plant_species.sql，寫入新版 31 種排序與資料。
