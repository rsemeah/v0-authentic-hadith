-- Seed books for all collections that are currently missing book data
-- Each collection gets a representative set of books with chapters and sample hadiths

-- =============================================
-- SAHIH MUSLIM (a92595fc-3d1f-4f42-af45-02ae1c7ff42a)
-- =============================================
INSERT INTO books (id, collection_id, name_en, name_ar, number, total_hadiths, total_chapters)
VALUES
  (gen_random_uuid(), 'a92595fc-3d1f-4f42-af45-02ae1c7ff42a', 'Faith (Kitab Al-Iman)', 'كتاب الإيمان', 1, 285, 92),
  (gen_random_uuid(), 'a92595fc-3d1f-4f42-af45-02ae1c7ff42a', 'Purification (Kitab Al-Taharah)', 'كتاب الطهارة', 2, 132, 36),
  (gen_random_uuid(), 'a92595fc-3d1f-4f42-af45-02ae1c7ff42a', 'Menstruation (Kitab Al-Haid)', 'كتاب الحيض', 3, 58, 15),
  (gen_random_uuid(), 'a92595fc-3d1f-4f42-af45-02ae1c7ff42a', 'Prayer (Kitab Al-Salat)', 'كتاب الصلاة', 4, 268, 54),
  (gen_random_uuid(), 'a92595fc-3d1f-4f42-af45-02ae1c7ff42a', 'Mosques and Places of Prayer', 'كتاب المساجد ومواضع الصلاة', 5, 313, 53),
  (gen_random_uuid(), 'a92595fc-3d1f-4f42-af45-02ae1c7ff42a', 'Prayer of Travellers', 'كتاب صلاة المسافرين', 6, 311, 56),
  (gen_random_uuid(), 'a92595fc-3d1f-4f42-af45-02ae1c7ff42a', 'Friday Prayer', 'كتاب الجمعة', 7, 67, 17),
  (gen_random_uuid(), 'a92595fc-3d1f-4f42-af45-02ae1c7ff42a', 'Two Eid Prayers', 'كتاب صلاة العيدين', 8, 28, 6),
  (gen_random_uuid(), 'a92595fc-3d1f-4f42-af45-02ae1c7ff42a', 'Prayer for Rain (Istisqa)', 'كتاب صلاة الاستسقاء', 9, 15, 3),
  (gen_random_uuid(), 'a92595fc-3d1f-4f42-af45-02ae1c7ff42a', 'Eclipse Prayer', 'كتاب الكسوف', 10, 29, 6)
ON CONFLICT DO NOTHING;

-- =============================================
-- JAMI AT-TIRMIDHI (d795faaa-5827-4374-bf9b-0d5f9f401660)
-- =============================================
INSERT INTO books (id, collection_id, name_en, name_ar, number, total_hadiths, total_chapters)
VALUES
  (gen_random_uuid(), 'd795faaa-5827-4374-bf9b-0d5f9f401660', 'Purification', 'كتاب الطهارة', 1, 148, 112),
  (gen_random_uuid(), 'd795faaa-5827-4374-bf9b-0d5f9f401660', 'Prayer', 'كتاب الصلاة', 2, 263, 213),
  (gen_random_uuid(), 'd795faaa-5827-4374-bf9b-0d5f9f401660', 'Witr Prayer', 'أبواب الوتر', 3, 30, 21),
  (gen_random_uuid(), 'd795faaa-5827-4374-bf9b-0d5f9f401660', 'Friday Prayer', 'أبواب الجمعة', 4, 80, 79),
  (gen_random_uuid(), 'd795faaa-5827-4374-bf9b-0d5f9f401660', 'Two Eid Prayers', 'أبواب العيدين', 5, 12, 11),
  (gen_random_uuid(), 'd795faaa-5827-4374-bf9b-0d5f9f401660', 'Travelling', 'أبواب السفر', 6, 49, 48),
  (gen_random_uuid(), 'd795faaa-5827-4374-bf9b-0d5f9f401660', 'Zakat', 'أبواب الزكاة', 7, 40, 38),
  (gen_random_uuid(), 'd795faaa-5827-4374-bf9b-0d5f9f401660', 'Fasting', 'أبواب الصوم', 8, 83, 82),
  (gen_random_uuid(), 'd795faaa-5827-4374-bf9b-0d5f9f401660', 'Hajj', 'أبواب الحج', 9, 119, 116),
  (gen_random_uuid(), 'd795faaa-5827-4374-bf9b-0d5f9f401660', 'Funerals', 'أبواب الجنائز', 10, 76, 75)
ON CONFLICT DO NOTHING;

-- =============================================
-- SUNAN ABU DAWUD (c451c818-70d0-40ae-9b5e-438259a520f9)
-- =============================================
INSERT INTO books (id, collection_id, name_en, name_ar, number, total_hadiths, total_chapters)
VALUES
  (gen_random_uuid(), 'c451c818-70d0-40ae-9b5e-438259a520f9', 'Purification (Kitab Al-Taharah)', 'كتاب الطهارة', 1, 390, 143),
  (gen_random_uuid(), 'c451c818-70d0-40ae-9b5e-438259a520f9', 'Prayer (Kitab Al-Salat)', 'كتاب الصلاة', 2, 653, 366),
  (gen_random_uuid(), 'c451c818-70d0-40ae-9b5e-438259a520f9', 'Detailed Rules of Law', 'كتاب الصلاة تفريع', 3, 26, 18),
  (gen_random_uuid(), 'c451c818-70d0-40ae-9b5e-438259a520f9', 'Zakat (Kitab Al-Zakat)', 'كتاب الزكاة', 4, 149, 46),
  (gen_random_uuid(), 'c451c818-70d0-40ae-9b5e-438259a520f9', 'Fasting (Kitab Al-Siyam)', 'كتاب الصوم', 5, 164, 80),
  (gen_random_uuid(), 'c451c818-70d0-40ae-9b5e-438259a520f9', 'Hajj Rituals', 'كتاب المناسك', 6, 213, 100),
  (gen_random_uuid(), 'c451c818-70d0-40ae-9b5e-438259a520f9', 'Marriage (Kitab Al-Nikah)', 'كتاب النكاح', 7, 128, 50),
  (gen_random_uuid(), 'c451c818-70d0-40ae-9b5e-438259a520f9', 'Divorce (Kitab Al-Talaq)', 'كتاب الطلاق', 8, 85, 50),
  (gen_random_uuid(), 'c451c818-70d0-40ae-9b5e-438259a520f9', 'Jihad (Kitab Al-Jihad)', 'كتاب الجهاد', 9, 188, 182),
  (gen_random_uuid(), 'c451c818-70d0-40ae-9b5e-438259a520f9', 'Sacrifice (Kitab Al-Dahaya)', 'كتاب الأضاحي', 10, 26, 12)
ON CONFLICT DO NOTHING;

-- =============================================
-- SUNAN AN-NASAI (2210bf89-c2ec-4532-8023-bfef81793b80)
-- =============================================
INSERT INTO books (id, collection_id, name_en, name_ar, number, total_hadiths, total_chapters)
VALUES
  (gen_random_uuid(), '2210bf89-c2ec-4532-8023-bfef81793b80', 'Purification', 'كتاب الطهارة', 1, 326, 191),
  (gen_random_uuid(), '2210bf89-c2ec-4532-8023-bfef81793b80', 'Water', 'كتاب المياه', 2, 30, 9),
  (gen_random_uuid(), '2210bf89-c2ec-4532-8023-bfef81793b80', 'Menstruation and Postnatal Bleeding', 'كتاب الحيض والاستحاضة', 3, 41, 23),
  (gen_random_uuid(), '2210bf89-c2ec-4532-8023-bfef81793b80', 'Ghusl and Tayammum', 'كتاب الغسل والتيمم', 4, 73, 34),
  (gen_random_uuid(), '2210bf89-c2ec-4532-8023-bfef81793b80', 'Prayer', 'كتاب الصلاة', 5, 70, 43),
  (gen_random_uuid(), '2210bf89-c2ec-4532-8023-bfef81793b80', 'Times of Prayer', 'كتاب المواقيت', 6, 166, 57),
  (gen_random_uuid(), '2210bf89-c2ec-4532-8023-bfef81793b80', 'Adhan (Call to Prayer)', 'كتاب الأذان', 7, 75, 40),
  (gen_random_uuid(), '2210bf89-c2ec-4532-8023-bfef81793b80', 'The Mosques', 'كتاب المساجد', 8, 42, 22),
  (gen_random_uuid(), '2210bf89-c2ec-4532-8023-bfef81793b80', 'The Qiblah', 'كتاب القبلة', 9, 25, 14),
  (gen_random_uuid(), '2210bf89-c2ec-4532-8023-bfef81793b80', 'The Imam', 'كتاب الإمامة', 10, 80, 63)
ON CONFLICT DO NOTHING;

-- =============================================
-- SUNAN IBN MAJAH (d1a2a0b3-6d3b-4fb4-a822-e3dc469f00ef)
-- =============================================
INSERT INTO books (id, collection_id, name_en, name_ar, number, total_hadiths, total_chapters)
VALUES
  (gen_random_uuid(), 'd1a2a0b3-6d3b-4fb4-a822-e3dc469f00ef', 'The Book of Purification', 'كتاب الطهارة وسننها', 1, 179, 139),
  (gen_random_uuid(), 'd1a2a0b3-6d3b-4fb4-a822-e3dc469f00ef', 'The Book of Prayer', 'كتاب الصلاة', 2, 24, 17),
  (gen_random_uuid(), 'd1a2a0b3-6d3b-4fb4-a822-e3dc469f00ef', 'The Book of Adhan', 'كتاب الأذان والسنة فيها', 3, 30, 9),
  (gen_random_uuid(), 'd1a2a0b3-6d3b-4fb4-a822-e3dc469f00ef', 'The Book of the Mosques', 'أبواب المساجد والجماعات', 4, 59, 19),
  (gen_random_uuid(), 'd1a2a0b3-6d3b-4fb4-a822-e3dc469f00ef', 'Establishing Prayer', 'إقامة الصلاة والسنة فيها', 5, 462, 205),
  (gen_random_uuid(), 'd1a2a0b3-6d3b-4fb4-a822-e3dc469f00ef', 'The Chapters on Funerals', 'أبواب الجنائز', 6, 108, 65),
  (gen_random_uuid(), 'd1a2a0b3-6d3b-4fb4-a822-e3dc469f00ef', 'The Book of Fasting', 'كتاب الصيام', 7, 95, 68),
  (gen_random_uuid(), 'd1a2a0b3-6d3b-4fb4-a822-e3dc469f00ef', 'The Book of Zakat', 'كتاب الزكاة', 8, 81, 28),
  (gen_random_uuid(), 'd1a2a0b3-6d3b-4fb4-a822-e3dc469f00ef', 'The Chapters on Hajj', 'أبواب المناسك', 9, 162, 109),
  (gen_random_uuid(), 'd1a2a0b3-6d3b-4fb4-a822-e3dc469f00ef', 'The Book of Marriage', 'كتاب النكاح', 10, 80, 63)
ON CONFLICT DO NOTHING;

-- =============================================
-- MUWATTA MALIK (0c488ec7-9a30-43ac-ad8b-945c27477a6f)
-- =============================================
INSERT INTO books (id, collection_id, name_en, name_ar, number, total_hadiths, total_chapters)
VALUES
  (gen_random_uuid(), '0c488ec7-9a30-43ac-ad8b-945c27477a6f', 'Times of Prayer', 'كتاب وقوت الصلاة', 1, 28, 9),
  (gen_random_uuid(), '0c488ec7-9a30-43ac-ad8b-945c27477a6f', 'Purity', 'كتاب الطهارة', 2, 119, 31),
  (gen_random_uuid(), '0c488ec7-9a30-43ac-ad8b-945c27477a6f', 'Prayer', 'كتاب الصلاة', 3, 65, 22),
  (gen_random_uuid(), '0c488ec7-9a30-43ac-ad8b-945c27477a6f', 'Forgetfulness in Prayer', 'كتاب السهو', 4, 19, 7),
  (gen_random_uuid(), '0c488ec7-9a30-43ac-ad8b-945c27477a6f', 'Friday Prayer', 'كتاب الجمعة', 5, 21, 8),
  (gen_random_uuid(), '0c488ec7-9a30-43ac-ad8b-945c27477a6f', 'Prayer in Ramadan', 'كتاب الصلاة في رمضان', 6, 10, 3),
  (gen_random_uuid(), '0c488ec7-9a30-43ac-ad8b-945c27477a6f', 'Tahajjud', 'كتاب صلاة الليل', 7, 18, 7),
  (gen_random_uuid(), '0c488ec7-9a30-43ac-ad8b-945c27477a6f', 'Prayer of the Traveller', 'كتاب قصر الصلاة في السفر', 8, 67, 24),
  (gen_random_uuid(), '0c488ec7-9a30-43ac-ad8b-945c27477a6f', 'Two Eids', 'كتاب العيدين', 9, 10, 5),
  (gen_random_uuid(), '0c488ec7-9a30-43ac-ad8b-945c27477a6f', 'The Quran', 'كتاب القرآن', 10, 34, 12)
ON CONFLICT DO NOTHING;

-- =============================================
-- MUSNAD AHMAD (4927ccfa-82e0-444d-bc2e-07621803e596)
-- =============================================
INSERT INTO books (id, collection_id, name_en, name_ar, number, total_hadiths, total_chapters)
VALUES
  (gen_random_uuid(), '4927ccfa-82e0-444d-bc2e-07621803e596', 'Musnad of the Ten Promised Paradise', 'مسند العشرة المبشرين بالجنة', 1, 1573, 1),
  (gen_random_uuid(), '4927ccfa-82e0-444d-bc2e-07621803e596', 'Musnad of Umar ibn Al-Khattab', 'مسند عمر بن الخطاب', 2, 371, 1),
  (gen_random_uuid(), '4927ccfa-82e0-444d-bc2e-07621803e596', 'Musnad of Uthman ibn Affan', 'مسند عثمان بن عفان', 3, 210, 1),
  (gen_random_uuid(), '4927ccfa-82e0-444d-bc2e-07621803e596', 'Musnad of Ali ibn Abi Talib', 'مسند علي بن أبي طالب', 4, 1361, 1),
  (gen_random_uuid(), '4927ccfa-82e0-444d-bc2e-07621803e596', 'Musnad of Abdullah ibn Masud', 'مسند عبد الله بن مسعود', 5, 960, 1),
  (gen_random_uuid(), '4927ccfa-82e0-444d-bc2e-07621803e596', 'Musnad of Abdullah ibn Umar', 'مسند عبد الله بن عمر', 6, 2148, 1),
  (gen_random_uuid(), '4927ccfa-82e0-444d-bc2e-07621803e596', 'Musnad of Abu Hurairah', 'مسند أبي هريرة', 7, 3870, 1),
  (gen_random_uuid(), '4927ccfa-82e0-444d-bc2e-07621803e596', 'Musnad of Anas ibn Malik', 'مسند أنس بن مالك', 8, 2286, 1),
  (gen_random_uuid(), '4927ccfa-82e0-444d-bc2e-07621803e596', 'Musnad of Abu Said Al-Khudri', 'مسند أبي سعيد الخدري', 9, 970, 1)
ON CONFLICT DO NOTHING;

-- Now seed chapters for a few books in each collection so the book reader works
-- We'll add chapters for the first 2 books of each newly-seeded collection

-- Chapters for Sahih Muslim - Book 1 (Faith)
INSERT INTO chapters (id, book_id, name_en, name_ar, number, total_hadiths)
SELECT gen_random_uuid(), b.id, ch.name_en, ch.name_ar, ch.num, ch.cnt
FROM books b
CROSS JOIN (VALUES
  ('The first of what was revealed', 'أول ما نزل', 1, 5),
  ('Islam and its pillars', 'الإسلام وأركانه', 2, 8),
  ('Explanation of Faith (Iman)', 'بيان الإيمان', 3, 12),
  ('Sincerity of religion', 'الإخلاص في الدين', 4, 6),
  ('Order to fight people until they say La ilaha illallah', 'الأمر بقتال الناس حتى يقولوا لا إله إلا الله', 5, 7)
) AS ch(name_en, name_ar, num, cnt)
WHERE b.collection_id = 'a92595fc-3d1f-4f42-af45-02ae1c7ff42a' AND b.number = 1
ON CONFLICT DO NOTHING;

-- Chapters for Sahih Muslim - Book 2 (Purification)
INSERT INTO chapters (id, book_id, name_en, name_ar, number, total_hadiths)
SELECT gen_random_uuid(), b.id, ch.name_en, ch.name_ar, ch.num, ch.cnt
FROM books b
CROSS JOIN (VALUES
  ('Obligation of purification for prayer', 'وجوب الطهارة للصلاة', 1, 6),
  ('Virtues of ablution', 'فضل الوضوء', 2, 9),
  ('Wiping over leather socks', 'المسح على الخفين', 3, 5),
  ('Miswak', 'السواك', 4, 4),
  ('Characteristics of Fitrah', 'خصال الفطرة', 5, 7)
) AS ch(name_en, name_ar, num, cnt)
WHERE b.collection_id = 'a92595fc-3d1f-4f42-af45-02ae1c7ff42a' AND b.number = 2
ON CONFLICT DO NOTHING;

-- Chapters for Jami at-Tirmidhi - Book 1 (Purification)
INSERT INTO chapters (id, book_id, name_en, name_ar, number, total_hadiths)
SELECT gen_random_uuid(), b.id, ch.name_en, ch.name_ar, ch.num, ch.cnt
FROM books b
CROSS JOIN (VALUES
  ('What has been related about water', 'ما جاء في الماء', 1, 5),
  ('Ablution - washing each body part once', 'الوضوء مرة مرة', 2, 3),
  ('Ablution - washing each body part twice', 'الوضوء مرتين مرتين', 3, 3),
  ('Ablution - washing each body part thrice', 'الوضوء ثلاثا ثلاثا', 4, 4),
  ('Starting ablution with the right side', 'البداءة باليمنى في الوضوء', 5, 3)
) AS ch(name_en, name_ar, num, cnt)
WHERE b.collection_id = 'd795faaa-5827-4374-bf9b-0d5f9f401660' AND b.number = 1
ON CONFLICT DO NOTHING;

-- Chapters for Jami at-Tirmidhi - Book 2 (Prayer)
INSERT INTO chapters (id, book_id, name_en, name_ar, number, total_hadiths)
SELECT gen_random_uuid(), b.id, ch.name_en, ch.name_ar, ch.num, ch.cnt
FROM books b
CROSS JOIN (VALUES
  ('The beginning of prayer times', 'ما جاء في مواقيت الصلاة', 1, 6),
  ('Time of Dhuhr prayer', 'ما جاء في وقت الظهر', 2, 4),
  ('Time of Asr prayer', 'ما جاء في وقت العصر', 3, 5),
  ('Time of Maghrib prayer', 'ما جاء في وقت المغرب', 4, 4),
  ('Time of Isha prayer', 'ما جاء في وقت العشاء', 5, 5)
) AS ch(name_en, name_ar, num, cnt)
WHERE b.collection_id = 'd795faaa-5827-4374-bf9b-0d5f9f401660' AND b.number = 2
ON CONFLICT DO NOTHING;

-- Chapters for Sunan Abu Dawud - Book 1 (Purification)
INSERT INTO chapters (id, book_id, name_en, name_ar, number, total_hadiths)
SELECT gen_random_uuid(), b.id, ch.name_en, ch.name_ar, ch.num, ch.cnt
FROM books b
CROSS JOIN (VALUES
  ('Regarding the purity of water', 'ما جاء في طهور الماء', 1, 7),
  ('What comes in contact with water', 'ما يقع في الماء', 2, 4),
  ('Ablution from containers made of animal skins', 'الوضوء بسؤر الكلب', 3, 3),
  ('What comes after urination', 'الاستبراء من البول', 4, 6),
  ('Places for relieving oneself', 'أين يتوضأ', 5, 5)
) AS ch(name_en, name_ar, num, cnt)
WHERE b.collection_id = 'c451c818-70d0-40ae-9b5e-438259a520f9' AND b.number = 1
ON CONFLICT DO NOTHING;

-- Chapters for Sunan an-Nasai - Book 1 (Purification)
INSERT INTO chapters (id, book_id, name_en, name_ar, number, total_hadiths)
SELECT gen_random_uuid(), b.id, ch.name_en, ch.name_ar, ch.num, ch.cnt
FROM books b
CROSS JOIN (VALUES
  ('The nature of pure water', 'ذكر الماء الطهور', 1, 4),
  ('Water left over by cats', 'سؤر الهر', 2, 3),
  ('Miswak', 'السواك', 3, 8),
  ('Obligation of ablution', 'إيجاب الوضوء', 4, 5),
  ('Washing the hands before putting them in the vessel', 'غسل اليدين قبل إدخالهما الإناء', 5, 4)
) AS ch(name_en, name_ar, num, cnt)
WHERE b.collection_id = '2210bf89-c2ec-4532-8023-bfef81793b80' AND b.number = 1
ON CONFLICT DO NOTHING;

-- Chapters for Sunan Ibn Majah - Book 1 (Purification)
INSERT INTO chapters (id, book_id, name_en, name_ar, number, total_hadiths)
SELECT gen_random_uuid(), b.id, ch.name_en, ch.name_ar, ch.num, ch.cnt
FROM books b
CROSS JOIN (VALUES
  ('What has been narrated about purity of water', 'ما جاء في طهور الماء', 1, 5),
  ('Containers', 'الأواني', 2, 3),
  ('Miswak', 'السواك', 3, 6),
  ('Rinsing the mouth and nose', 'المضمضة والاستنشاق', 4, 4),
  ('Washing the face', 'غسل الوجه', 5, 3)
) AS ch(name_en, name_ar, num, cnt)
WHERE b.collection_id = 'd1a2a0b3-6d3b-4fb4-a822-e3dc469f00ef' AND b.number = 1
ON CONFLICT DO NOTHING;

-- Chapters for Muwatta Malik - Book 1 (Times of Prayer)
INSERT INTO chapters (id, book_id, name_en, name_ar, number, total_hadiths)
SELECT gen_random_uuid(), b.id, ch.name_en, ch.name_ar, ch.num, ch.cnt
FROM books b
CROSS JOIN (VALUES
  ('Times of prayer', 'وقوت الصلاة', 1, 7),
  ('Prohibition of praying after Subh and Asr', 'النهي عن الصلاة بعد الصبح وبعد العصر', 2, 5),
  ('What has come about sleeping through the prayer', 'ما جاء في النوم عن الصلاة', 3, 4),
  ('Hastening to break the fast', 'تعجيل الفطر', 4, 3),
  ('The call to prayer', 'النداء للصلاة', 5, 6)
) AS ch(name_en, name_ar, num, cnt)
WHERE b.collection_id = '0c488ec7-9a30-43ac-ad8b-945c27477a6f' AND b.number = 1
ON CONFLICT DO NOTHING;

-- Seed a few sample hadiths for Tirmidhi Book 1, Chapter 1
INSERT INTO hadiths (id, hadith_number, text_en, text_ar, narrator_en, narrator_ar, grade, chapter_id)
SELECT 
  gen_random_uuid(),
  h.num,
  h.text_en,
  h.text_ar,
  h.narrator_en,
  h.narrator_ar,
  h.grade,
  c.id
FROM chapters c
JOIN books b ON c.book_id = b.id
CROSS JOIN (VALUES
  (1, 'Abu Said Al-Khudri narrated that the Messenger of Allah (peace be upon him) said: "Water is pure, nothing makes it impure."', 'عن أبي سعيد الخدري قال: قال رسول الله صلى الله عليه وسلم: «إن الماء طهور لا ينجسه شيء»', 'Abu Said Al-Khudri', 'أبو سعيد الخدري', 'sahih'),
  (2, 'Abu Umamah Al-Bahili narrated that the Messenger of Allah (peace be upon him) said: "Water is not made impure by anything except that which changes its smell, taste, or color."', 'عن أبي أمامة الباهلي قال: قال رسول الله صلى الله عليه وسلم: «إن الماء لا ينجسه شيء إلا ما غلب على ريحه وطعمه ولونه»', 'Abu Umamah Al-Bahili', 'أبو أمامة الباهلي', 'hasan'),
  (3, 'Ibn Abbas narrated that the Prophet (peace be upon him) said: "Water is purifying and nothing makes it impure."', 'عن ابن عباس أن النبي صلى الله عليه وسلم قال: «الماء طهور لا ينجسه شيء»', 'Ibn Abbas', 'ابن عباس', 'sahih')
) AS h(num, text_en, text_ar, narrator_en, narrator_ar, grade)
WHERE b.collection_id = 'd795faaa-5827-4374-bf9b-0d5f9f401660' AND b.number = 1 AND c.number = 1
ON CONFLICT DO NOTHING;

-- Also link these hadiths to the collection via collection_hadiths
INSERT INTO collection_hadiths (collection_id, hadith_id, hadith_number_in_collection)
SELECT 'd795faaa-5827-4374-bf9b-0d5f9f401660', h.id, h.hadith_number
FROM hadiths h
JOIN chapters c ON h.chapter_id = c.id
JOIN books b ON c.book_id = b.id
WHERE b.collection_id = 'd795faaa-5827-4374-bf9b-0d5f9f401660'
ON CONFLICT DO NOTHING;
