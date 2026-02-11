-- 013: My Hadith database functions

-- 1. Generate share token function
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'base64');
END;
$$ LANGUAGE plpgsql;

-- 2. Create note version on update
CREATE OR REPLACE FUNCTION create_note_version()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.notes IS DISTINCT FROM NEW.notes THEN
    INSERT INTO hadith_note_versions (saved_hadith_id, notes, notes_html, version, created_by)
    VALUES (OLD.id, OLD.notes, OLD.notes_html, OLD.version, auth.uid());
    
    NEW.version = OLD.version + 1;
    NEW.last_edited_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_note_update ON saved_hadiths;
CREATE TRIGGER on_note_update
  BEFORE UPDATE ON saved_hadiths
  FOR EACH ROW
  EXECUTE FUNCTION create_note_version();

-- 3. Track folder share views
CREATE OR REPLACE FUNCTION track_folder_view(p_share_token TEXT, p_viewer_ip TEXT)
RETURNS void AS $$
DECLARE
  v_folder_id UUID;
BEGIN
  SELECT id INTO v_folder_id 
  FROM hadith_folders 
  WHERE share_token = p_share_token;
  
  IF v_folder_id IS NOT NULL THEN
    INSERT INTO folder_shares (folder_id, share_token, views, last_viewed_at, viewer_ip)
    VALUES (v_folder_id, p_share_token, 1, NOW(), p_viewer_ip)
    ON CONFLICT (folder_id, share_token) 
    DO UPDATE SET 
      views = folder_shares.views + 1,
      last_viewed_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
