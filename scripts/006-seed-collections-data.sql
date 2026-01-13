-- Insert sample collections
INSERT INTO collections (name_en, name_ar, slug, description_en, total_hadiths, total_books, scholar, scholar_dates, is_featured, grade_distribution) VALUES
('Sahih al-Bukhari', 'صحيح البخاري', 'sahih-bukhari', 'The most authentic collection of Hadith, compiled by Imam Muhammad ibn Ismail al-Bukhari. It contains 7,275 hadith with repetitions, or approximately 2,602 without.', 7275, 97, 'Imam Bukhari', '810-870 CE', true, '{"sahih": 7275, "hasan": 0, "daif": 0}'),
('Sahih Muslim', 'صحيح مسلم', 'sahih-muslim', 'The second most authentic collection of Hadith, compiled by Imam Muslim ibn al-Hajjaj. Known for its excellent arrangement and lack of repetition.', 5362, 56, 'Imam Muslim', '815-875 CE', true, '{"sahih": 5362, "hasan": 0, "daif": 0}'),
('Sunan Abu Dawud', 'سنن أبي داود', 'sunan-abu-dawud', 'One of the six major hadith collections, focusing primarily on legal hadiths. Compiled by Imam Abu Dawud Sulayman ibn al-Ash''ath.', 5274, 43, 'Imam Abu Dawud', '817-889 CE', true, '{"sahih": 3500, "hasan": 1500, "daif": 274}'),
('Jami at-Tirmidhi', 'جامع الترمذي', 'jami-tirmidhi', 'Also known as Sunan at-Tirmidhi, this collection is notable for including gradings of hadith. Compiled by Imam at-Tirmidhi.', 3956, 50, 'Imam Tirmidhi', '824-892 CE', false, '{"sahih": 2800, "hasan": 900, "daif": 256}'),
('Sunan an-Nasai', 'سنن النسائي', 'sunan-nasai', 'Known for its strict authentication criteria, this collection was compiled by Imam an-Nasa''i. It focuses heavily on fiqh-related narrations.', 5761, 52, 'Imam an-Nasai', '829-915 CE', false, '{"sahih": 4500, "hasan": 1000, "daif": 261}'),
('Sunan Ibn Majah', 'سنن ابن ماجه', 'sunan-ibn-majah', 'The sixth of the canonical hadith collections, compiled by Imam Ibn Majah. Contains some unique narrations not found elsewhere.', 4341, 37, 'Imam Ibn Majah', '824-887 CE', false, '{"sahih": 3000, "hasan": 800, "daif": 541}'),
('Muwatta Malik', 'موطأ مالك', 'muwatta-malik', 'The earliest written collection of hadith, compiled by Imam Malik ibn Anas. Combines hadith with Medinan juristic practice.', 1832, 61, 'Imam Malik', '711-795 CE', false, '{"sahih": 1600, "hasan": 200, "daif": 32}'),
('Musnad Ahmad', 'مسند أحمد', 'musnad-ahmad', 'One of the largest hadith collections, organized by narrator. Compiled by Imam Ahmad ibn Hanbal.', 27647, 9, 'Imam Ahmad', '780-855 CE', false, '{"sahih": 20000, "hasan": 5000, "daif": 2647}')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample books for Sahih Bukhari
INSERT INTO books (collection_id, number, name_en, name_ar, total_hadiths, total_chapters, sort_order)
SELECT c.id, b.number, b.name_en, b.name_ar, b.total_hadiths, b.total_chapters, b.sort_order
FROM collections c,
(VALUES
  (1, 'Revelation', 'بدء الوحي', 7, 6, 1),
  (2, 'Belief (Faith)', 'الإيمان', 51, 42, 2),
  (3, 'Knowledge', 'العلم', 76, 53, 3),
  (4, 'Ablution (Wudu)', 'الوضوء', 113, 75, 4),
  (5, 'Bathing (Ghusl)', 'الغسل', 46, 28, 5),
  (6, 'Menstrual Periods', 'الحيض', 32, 30, 6),
  (7, 'Tayammum', 'التيمم', 15, 9, 7),
  (8, 'Prayer', 'الصلاة', 172, 172, 8),
  (9, 'Times of Prayer', 'مواقيت الصلاة', 83, 41, 9),
  (10, 'Call to Prayer', 'الأذان', 168, 163, 10),
  (11, 'Friday Prayer', 'الجمعة', 64, 40, 11),
  (12, 'Fear Prayer', 'صلاة الخوف', 6, 5, 12)
) AS b(number, name_en, name_ar, total_hadiths, total_chapters, sort_order)
WHERE c.slug = 'sahih-bukhari'
ON CONFLICT DO NOTHING;

-- Insert sample chapters for Book 1 (Revelation)
INSERT INTO chapters (book_id, number, name_en, name_ar, total_hadiths, sort_order)
SELECT b.id, ch.number, ch.name_en, ch.name_ar, ch.total_hadiths, ch.sort_order
FROM books b
JOIN collections c ON b.collection_id = c.id,
(VALUES
  (1, 'How the Divine Revelation started', 'كيف كان بدء الوحي', 3, 1),
  (2, 'The first revelation to the Prophet', 'أول ما نزل من الوحي', 1, 2),
  (3, 'The Prophet''s pause in revelation', 'فترة الوحي', 1, 3),
  (4, 'Gabriel came to the Prophet', 'مجيء جبريل إلى النبي', 1, 4),
  (5, 'The questioning by Heraclius', 'سؤال هرقل', 1, 5),
  (6, 'The reward of belief', 'ثواب الإيمان', 1, 6)
) AS ch(number, name_en, name_ar, total_hadiths, sort_order)
WHERE c.slug = 'sahih-bukhari' AND b.number = 1
ON CONFLICT DO NOTHING;

-- Insert sample chapters for Book 2 (Belief)
INSERT INTO chapters (book_id, number, name_en, name_ar, total_hadiths, sort_order)
SELECT b.id, ch.number, ch.name_en, ch.name_ar, ch.total_hadiths, ch.sort_order
FROM books b
JOIN collections c ON b.collection_id = c.id,
(VALUES
  (1, 'Your invocation means your faith', 'الإيمان وقول النبي بني الإسلام', 3, 1),
  (2, 'Matters of faith', 'أمور من الإيمان', 2, 2),
  (3, 'A Muslim is one who avoids harming others', 'المسلم من سلم المسلمون', 1, 3),
  (4, 'Whose Islam is the best', 'أي الإسلام أفضل', 1, 4),
  (5, 'Feeding others is part of Islam', 'إطعام الطعام من الإسلام', 2, 5),
  (6, 'To like for others what one likes for oneself', 'من الإيمان أن يحب لأخيه', 1, 6),
  (7, 'Love of the Prophet', 'حب الرسول من الإيمان', 2, 7),
  (8, 'Sweetness of faith', 'حلاوة الإيمان', 1, 8)
) AS ch(number, name_en, name_ar, total_hadiths, sort_order)
WHERE c.slug = 'sahih-bukhari' AND b.number = 2
ON CONFLICT DO NOTHING;

-- Insert sample topics
INSERT INTO topics (name_en, name_ar) VALUES
('Prayer', 'الصلاة'),
('Faith', 'الإيمان'),
('Fasting', 'الصيام'),
('Charity', 'الزكاة'),
('Hajj', 'الحج'),
('Knowledge', 'العلم'),
('Purification', 'الطهارة'),
('Marriage', 'النكاح'),
('Business', 'البيوع'),
('Manners', 'الآداب')
ON CONFLICT (name_en) DO NOTHING;

-- Link some hadiths to collections (for the sample hadiths we created earlier)
INSERT INTO collection_hadiths (collection_id, hadith_id, book_id, chapter_id, hadith_number)
SELECT 
  c.id as collection_id,
  h.id as hadith_id,
  b.id as book_id,
  ch.id as chapter_id,
  1 as hadith_number
FROM collections c
CROSS JOIN hadiths h
LEFT JOIN books b ON b.collection_id = c.id AND b.number = 1
LEFT JOIN chapters ch ON ch.book_id = b.id AND ch.number = 1
WHERE c.slug = 'sahih-bukhari'
AND h.collection = 'Sahih al-Bukhari'
LIMIT 5
ON CONFLICT DO NOTHING;
