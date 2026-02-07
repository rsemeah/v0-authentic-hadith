-- Enable the http extension for making HTTP requests from Postgres
CREATE EXTENSION IF NOT EXISTS http;

-- Create a function to seed hadiths from CDN
CREATE OR REPLACE FUNCTION seed_collection_from_cdn(
  p_collection_slug TEXT,
  p_eng_edition TEXT,
  p_ara_edition TEXT,
  p_max_section INT DEFAULT 200
) RETURNS TABLE(sections_processed INT, hadiths_inserted INT) AS $$
DECLARE
  v_collection_id UUID;
  v_section INT;
  v_eng_url TEXT;
  v_ara_url TEXT;
  v_eng_resp http_response;
  v_ara_resp http_response;
  v_eng_json JSONB;
  v_ara_json JSONB;
  v_hadith JSONB;
  v_ara_hadith JSONB;
  v_book_id UUID;
  v_chapter_id UUID;
  v_hadith_id UUID;
  v_hadith_number INT;
  v_english_text TEXT;
  v_arabic_text TEXT;
  v_grade TEXT;
  v_narrator TEXT;
  v_section_name TEXT;
  v_sections_done INT := 0;
  v_hadiths_done INT := 0;
  v_consecutive_misses INT := 0;
  v_display_name TEXT;
BEGIN
  -- Get collection ID
  SELECT id INTO v_collection_id FROM collections WHERE slug = p_collection_slug;
  IF v_collection_id IS NULL THEN
    RAISE EXCEPTION 'Collection not found: %', p_collection_slug;
  END IF;

  -- Get display name
  SELECT name_en INTO v_display_name FROM collections WHERE id = v_collection_id;

  FOR v_section IN 1..p_max_section LOOP
    -- Fetch English section from CDN
    v_eng_url := format('https://raw.githubusercontent.com/fawazahmed0/hadith-api/refs/heads/1/editions/%s/%s.json', p_eng_edition, v_section);
    
    BEGIN
      SELECT * INTO v_eng_resp FROM http_get(v_eng_url);
    EXCEPTION WHEN OTHERS THEN
      v_consecutive_misses := v_consecutive_misses + 1;
      IF v_consecutive_misses >= 3 THEN EXIT; END IF;
      CONTINUE;
    END;
    
    IF v_eng_resp.status != 200 THEN
      v_consecutive_misses := v_consecutive_misses + 1;
      IF v_consecutive_misses >= 3 THEN EXIT; END IF;
      CONTINUE;
    END IF;
    
    v_consecutive_misses := 0;
    v_eng_json := v_eng_resp.content::JSONB;

    -- Fetch Arabic section
    v_ara_url := format('https://raw.githubusercontent.com/fawazahmed0/hadith-api/refs/heads/1/editions/%s/%s.json', p_ara_edition, v_section);
    BEGIN
      SELECT * INTO v_ara_resp FROM http_get(v_ara_url);
      IF v_ara_resp.status = 200 THEN
        v_ara_json := v_ara_resp.content::JSONB;
      ELSE
        v_ara_json := '{"hadiths":[]}'::JSONB;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_ara_json := '{"hadiths":[]}'::JSONB;
    END;

    -- Get section name
    v_section_name := COALESCE(
      v_eng_json->'metadata'->'section'->>v_section::TEXT,
      format('Book %s', v_section)
    );

    -- Ensure book exists
    SELECT id INTO v_book_id FROM books 
    WHERE collection_id = v_collection_id AND number = v_section;
    
    IF v_book_id IS NULL THEN
      INSERT INTO books (collection_id, name_en, name_ar, number, total_hadiths, total_chapters, sort_order)
      VALUES (v_collection_id, v_section_name, '', v_section, 
              jsonb_array_length(v_eng_json->'hadiths'), 1, v_section)
      RETURNING id INTO v_book_id;
    END IF;

    -- Ensure chapter exists
    SELECT id INTO v_chapter_id FROM chapters WHERE book_id = v_book_id LIMIT 1;
    
    IF v_chapter_id IS NULL THEN
      INSERT INTO chapters (book_id, name_en, name_ar, number, total_hadiths, sort_order)
      VALUES (v_book_id, v_section_name, '', 1, 
              jsonb_array_length(v_eng_json->'hadiths'), 1)
      RETURNING id INTO v_chapter_id;
    END IF;

    -- Process each hadith
    FOR v_hadith IN SELECT * FROM jsonb_array_elements(v_eng_json->'hadiths') LOOP
      v_hadith_number := (v_hadith->>'hadithnumber')::INT;
      
      -- Skip if already exists
      IF EXISTS (
        SELECT 1 FROM collection_hadiths 
        WHERE collection_id = v_collection_id AND hadith_number = v_hadith_number
      ) THEN
        CONTINUE;
      END IF;

      v_english_text := v_hadith->>'text';
      
      -- Find Arabic text
      v_arabic_text := '';
      SELECT h->>'text' INTO v_arabic_text
      FROM jsonb_array_elements(v_ara_json->'hadiths') h
      WHERE (h->>'hadithnumber')::INT = v_hadith_number
      LIMIT 1;

      -- Determine grade
      IF p_collection_slug IN ('sahih-bukhari', 'sahih-muslim') THEN
        v_grade := 'sahih';
      ELSE
        v_grade := 'hasan'; -- default
        BEGIN
          SELECT CASE 
            WHEN lower(g->>'grade') LIKE '%sahih%' THEN 'sahih'
            WHEN lower(g->>'grade') LIKE '%hasan%' THEN 'hasan'
            WHEN lower(g->>'grade') LIKE '%daif%' OR lower(g->>'grade') LIKE '%weak%' THEN 'daif'
            ELSE 'hasan'
          END INTO v_grade
          FROM jsonb_array_elements(v_hadith->'grades') g
          LIMIT 1;
        EXCEPTION WHEN OTHERS THEN
          v_grade := 'hasan';
        END;
      END IF;

      -- Extract narrator
      v_narrator := '';
      IF v_english_text ~ '^(Narrated|It was narrated)' THEN
        v_narrator := substring(v_english_text FROM '^(?:Narrated|It was narrated (?:from|that))\s+([^:]{3,80}):');
      END IF;

      -- Insert hadith
      INSERT INTO hadiths (hadith_number, book_number, arabic_text, english_translation, narrator, grade, reference, collection, is_featured)
      VALUES (v_hadith_number, v_section, COALESCE(v_arabic_text, ''), v_english_text, COALESCE(v_narrator, ''), v_grade, 
              format('%s %s', v_display_name, v_hadith_number), p_collection_slug, false)
      RETURNING id INTO v_hadith_id;

      -- Link to collection
      INSERT INTO collection_hadiths (collection_id, book_id, chapter_id, hadith_id, hadith_number)
      VALUES (v_collection_id, v_book_id, v_chapter_id, v_hadith_id, v_hadith_number);

      v_hadiths_done := v_hadiths_done + 1;
    END LOOP;

    v_sections_done := v_sections_done + 1;
  END LOOP;

  -- Update collection total
  UPDATE collections SET total_hadiths = (
    SELECT COUNT(*) FROM collection_hadiths WHERE collection_id = v_collection_id
  ) WHERE id = v_collection_id;

  RETURN QUERY SELECT v_sections_done, v_hadiths_done;
END;
$$ LANGUAGE plpgsql;
