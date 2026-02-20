-- Check what categories exist
SELECT id, name, slug FROM categories ORDER BY name;

-- Check what tags exist per category  
SELECT c.slug as category_slug, c.name as category_name, t.slug as tag_slug, t.name as tag_name
FROM tags t
JOIN categories c ON t.category_id = c.id
ORDER BY c.name, t.name
LIMIT 200;

-- Check current hadith_tag_weights count
SELECT COUNT(*) as total_weights FROM hadith_tag_weights;

-- Check hadiths count
SELECT COUNT(*) as total_hadiths FROM hadiths WHERE english_translation IS NOT NULL AND english_translation != '';
