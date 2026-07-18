INSERT INTO plant_species (code, common_name, flower_language, image_base_path)
VALUES
    ('daisy', '雛菊', '純真與希望', '/assets/images/plant-stages/daisy'),
    ('lily', '百合', '純潔與祝福', '/assets/images/plant-stages/lily')
ON CONFLICT (code) DO UPDATE SET
    common_name = EXCLUDED.common_name,
    flower_language = EXCLUDED.flower_language,
    image_base_path = EXCLUDED.image_base_path;

