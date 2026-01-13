-- Seed some sample hadiths for testing
INSERT INTO hadiths (arabic_text, english_translation, collection, book_number, hadith_number, reference, grade, narrator, is_featured, featured_date) VALUES
(
  'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
  'Actions are according to intentions, and everyone will get what was intended.',
  'Sahih Bukhari',
  1,
  1,
  'Book 1, Hadith 1',
  'sahih',
  'Umar ibn al-Khattab',
  true,
  CURRENT_DATE
),
(
  'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
  'The best among you are those who learn the Quran and teach it.',
  'Sahih Bukhari',
  66,
  21,
  'Book 66, Hadith 21',
  'sahih',
  'Uthman ibn Affan',
  false,
  NULL
),
(
  'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
  'A Muslim is the one from whose tongue and hands other Muslims are safe.',
  'Sahih Bukhari',
  2,
  10,
  'Book 2, Hadith 10',
  'sahih',
  'Abdullah ibn Amr',
  false,
  NULL
),
(
  'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
  'None of you truly believes until he loves for his brother what he loves for himself.',
  'Sahih Bukhari',
  2,
  13,
  'Book 2, Hadith 13',
  'sahih',
  'Anas ibn Malik',
  false,
  NULL
),
(
  'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
  'Whoever believes in Allah and the Last Day should speak good or remain silent.',
  'Sahih Muslim',
  1,
  47,
  'Book 1, Hadith 47',
  'sahih',
  'Abu Hurairah',
  false,
  NULL
),
(
  'الطُّهُورُ شَطْرُ الإِيمَانِ',
  'Cleanliness is half of faith.',
  'Sahih Muslim',
  2,
  1,
  'Book 2, Hadith 1',
  'sahih',
  'Abu Malik al-Ashari',
  false,
  NULL
)
ON CONFLICT DO NOTHING;
