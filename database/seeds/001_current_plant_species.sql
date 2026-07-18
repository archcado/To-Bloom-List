INSERT INTO plant_species
    (display_order, code, common_name, scientific_name, color_hint, flower_language, image_base_path, asset_status, is_active)
VALUES
    (1, 'daisy', '雛菊', 'Bellis perennis', '白色', '純真與希望', '/assets/images/plant-stages/daisy', 'ready', TRUE),
    (2, 'babys-breath', '滿天星', 'Gypsophila paniculata', '白色', '陪伴與守護', '/assets/images/plant-stages/babys-breath', 'planned', TRUE),
    (3, 'jasmine', '茉莉花', 'Jasminum sambac', '白色', '親切與純真', '/assets/images/plant-stages/jasmine', 'planned', TRUE),
    (4, 'lily-of-the-valley', '鈴蘭', 'Convallaria majalis', '白色', '幸福歸來', '/assets/images/plant-stages/lily-of-the-valley', 'planned', TRUE),
    (5, 'gardenia', '梔子花', 'Gardenia jasminoides', '白色', '喜悅與守候', '/assets/images/plant-stages/gardenia', 'planned', TRUE),
    (6, 'freesia', '小蒼蘭', 'Freesia refracta', '黃色', '信任與純真', '/assets/images/plant-stages/freesia', 'planned', TRUE),
    (7, 'carnation', '康乃馨', 'Dianthus caryophyllus', '粉紅色', '感謝與關懷', '/assets/images/plant-stages/carnation', 'planned', TRUE),
    (8, 'tulip', '鬱金香', 'Tulipa gesneriana', '紅色', '體貼與告白', '/assets/images/plant-stages/tulip', 'planned', TRUE),
    (9, 'balloon-flower', '桔梗', 'Platycodon grandiflorus', '藍紫色', '真誠與永恆的愛', '/assets/images/plant-stages/balloon-flower', 'planned', TRUE),
    (10, 'calla-lily', '海芋', 'Zantedeschia aethiopica', '乳白色', '純潔與堅定的幸福', '/assets/images/plant-stages/calla-lily', 'planned', TRUE),
    (11, 'star-of-bethlehem', '伯利恆之星', 'Ornithogalum umbellatum', '白色', '希望、純潔與和好', '/assets/images/plant-stages/star-of-bethlehem', 'planned', TRUE),
    (12, 'forget-me-not', '勿忘我', 'Myosotis sylvatica', '藍色', '記憶與思念', '/assets/images/plant-stages/forget-me-not', 'planned', TRUE),
    (13, 'violet', '紫羅蘭', 'Viola odorata', '紫色', '謙遜與真誠', '/assets/images/plant-stages/violet', 'planned', TRUE),
    (14, 'bluebell', '藍鈴花', 'Hyacinthoides non-scripta', '藍紫色', '恆常與感謝', '/assets/images/plant-stages/bluebell', 'planned', TRUE),
    (15, 'iris', '鳶尾花', 'Iris germanica', '藍紫色', '消息與勇氣', '/assets/images/plant-stages/iris', 'planned', TRUE),
    (16, 'lavender', '薰衣草', 'Lavandula angustifolia', '紫色', '等待與寧靜', '/assets/images/plant-stages/lavender', 'planned', TRUE),
    (17, 'morning-glory', '牽牛花', 'Ipomoea nil', '藍紫色', '短暫而真摯', '/assets/images/plant-stages/morning-glory', 'planned', TRUE),
    (18, 'cosmos', '波斯菊', 'Cosmos bipinnatus', '粉白色', '和諧與自由', '/assets/images/plant-stages/cosmos', 'planned', TRUE),
    (19, 'hydrangea', '繡球花', 'Hydrangea macrophylla', '藍色', '理解與團聚', '/assets/images/plant-stages/hydrangea', 'planned', TRUE),
    (20, 'camellia', '山茶花', 'Camellia japonica', '紅色', '含蓄的美', '/assets/images/plant-stages/camellia', 'planned', TRUE),
    (21, 'cherry-blossom', '櫻花', 'Prunus serrulata', '淡粉色', '新生與珍惜', '/assets/images/plant-stages/cherry-blossom', 'planned', TRUE),
    (22, 'rose', '玫瑰', 'Rosa hybrida', '粉紅色', '真摯的愛', '/assets/images/plant-stages/rose', 'planned', TRUE),
    (23, 'lily', '百合', 'Lilium candidum', '白色', '純潔與祝福', '/assets/images/plant-stages/lily', 'ready', TRUE),
    (24, 'orchid', '蝴蝶蘭', 'Phalaenopsis aphrodite', '白色', '幸福與優雅', '/assets/images/plant-stages/orchid', 'planned', TRUE),
    (25, 'wisteria', '紫藤', 'Wisteria sinensis', '淡紫色', '長久與歡迎', '/assets/images/plant-stages/wisteria', 'planned', TRUE),
    (26, 'anemone', '銀蓮花', 'Anemone coronaria', '紫紅色', '期待與勇敢', '/assets/images/plant-stages/anemone', 'planned', TRUE),
    (27, 'hibiscus', '扶桑花', 'Hibiscus rosa-sinensis', '珊瑚紅', '熱情與纖細', '/assets/images/plant-stages/hibiscus', 'planned', TRUE),
    (28, 'sunflower', '向日葵', 'Helianthus annuus', '黃色', '仰慕與光明', '/assets/images/plant-stages/sunflower', 'planned', TRUE),
    (29, 'dandelion', '蒲公英', 'Taraxacum officinale', '黃色', '旅程與自由', '/assets/images/plant-stages/dandelion', 'planned', TRUE),
    (30, 'poppy', '罌粟花', 'Papaver somniferum', '紫紅色', '夢境、安慰與遺忘', '/assets/images/plant-stages/poppy', 'planned', TRUE),
    (31, 'water-lily', '睡蓮', 'Nymphaea alba', '乳白色', '希望、重生與新的開始', '/assets/images/plant-stages/water-lily', 'planned', TRUE)
ON CONFLICT (code) DO UPDATE SET
    display_order = EXCLUDED.display_order,
    common_name = EXCLUDED.common_name,
    scientific_name = EXCLUDED.scientific_name,
    color_hint = EXCLUDED.color_hint,
    flower_language = EXCLUDED.flower_language,
    image_base_path = EXCLUDED.image_base_path,
    asset_status = EXCLUDED.asset_status,
    is_active = EXCLUDED.is_active;

UPDATE plant_species
SET is_active = FALSE
WHERE code IN ('marigold', 'magnolia', 'peony', 'lotus');

UPDATE plant_species
SET final_unlock_only = (code = 'water-lily')
WHERE is_active = TRUE;
