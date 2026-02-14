-- Seed sunnah practices days 148-365
-- Continuing from batch 1

DO $$
DECLARE
  cat_prayer uuid;
  cat_eating uuid;
  cat_social uuid;
  cat_dhikr uuid;
  cat_cleanliness uuid;
  cat_character uuid;
  cat_sleep uuid;
  cat_travel uuid;
  cat_worship uuid;
  cat_health uuid;
BEGIN
  SELECT id INTO cat_prayer FROM sunnah_categories WHERE title = 'Prayer';
  SELECT id INTO cat_eating FROM sunnah_categories WHERE title = 'Eating & Drinking';
  SELECT id INTO cat_social FROM sunnah_categories WHERE title = 'Social';
  SELECT id INTO cat_dhikr FROM sunnah_categories WHERE title = 'Dhikr & Dua';
  SELECT id INTO cat_cleanliness FROM sunnah_categories WHERE title = 'Cleanliness';
  SELECT id INTO cat_character FROM sunnah_categories WHERE title = 'Character';
  SELECT id INTO cat_sleep FROM sunnah_categories WHERE title = 'Sleep & Rest';
  SELECT id INTO cat_travel FROM sunnah_categories WHERE title = 'Travel & Journey';
  SELECT id INTO cat_worship FROM sunnah_categories WHERE title = 'Worship & Devotion';
  SELECT id INTO cat_health FROM sunnah_categories WHERE title = 'Health & Wellbeing';

  -- Days 148-177: Prayer & Worship deep dive
  INSERT INTO sunnah_practices (title, description, category_id, hadith_ref, difficulty, day_of_year) VALUES
  ('Pray Salat al-Ishraq', 'Pray two rak''ah after sunrise (about 15-20 min after). The Prophet (PBUH) encouraged this prayer for its immense reward.', cat_prayer, 'Muslim 720', 'intermediate', 148),
  ('Perfect Your Sujud', 'Make your prostration unhurried. The Prophet (PBUH) would remain in sujud long enough to recite lengthy supplications.', cat_prayer, 'Bukhari 821', 'easy', 149),
  ('Pray Behind the Imam Attentively', 'When praying in congregation, follow the imam precisely without rushing ahead.', cat_prayer, 'Bukhari 722', 'easy', 150),
  ('Make Dua Between Adhan and Iqamah', 'Supplication between the call to prayer and the start of prayer is not rejected.', cat_dhikr, 'Abu Dawud 521', 'easy', 151),
  ('Pray Salat al-Tawbah', 'When you commit a sin, perform two rak''ah of repentance prayer and seek Allah''s forgiveness.', cat_prayer, 'Abu Dawud 1521', 'intermediate', 152),
  ('Straighten the Prayer Rows', 'Help straighten the rows before congregational prayer. The Prophet (PBUH) said crooked rows affect the heart.', cat_prayer, 'Muslim 436', 'easy', 153),
  ('Recite Ayat al-Kursi After Salah', 'After every obligatory prayer, recite Ayat al-Kursi. The Prophet (PBUH) said nothing prevents entry to Paradise except death.', cat_dhikr, 'An-Nasa''i', 'easy', 154),
  ('Pray with Khushu (Humility)', 'Focus on the meaning of what you recite and feel the presence of Allah during prayer.', cat_prayer, 'Bukhari 6265', 'intermediate', 155),
  ('Make Istikharah for Decisions', 'Before important decisions, pray two rak''ah of Istikhara and make the prescribed dua.', cat_prayer, 'Bukhari 1166', 'intermediate', 156),
  ('Pray Salat al-Hajah', 'When in need, perform two rak''ah and supplicate to Allah with sincerity.', cat_prayer, 'Tirmidhi 479', 'intermediate', 157),
  ('Attend Jumu''ah Early', 'Go to Friday prayer early. The Prophet (PBUH) said angels record those who come first.', cat_prayer, 'Bukhari 929', 'easy', 158),
  ('Recite Surah Al-Kahf on Friday', 'Read Surah Al-Kahf every Friday. It provides light between two Fridays.', cat_worship, 'Al-Hakim', 'intermediate', 159),
  ('Send Salawat on Friday', 'Increase your prayers upon the Prophet (PBUH) on Friday.', cat_dhikr, 'Abu Dawud 1047', 'easy', 160),
  ('Pray Tahiyyat al-Masjid', 'When entering the mosque, pray two rak''ah before sitting down.', cat_prayer, 'Bukhari 1163', 'easy', 161),
  ('Guard the Five Prayers', 'Be consistent with the five daily prayers at their proper times.', cat_prayer, 'Quran 2:238', 'easy', 162),

  -- Days 163-192: Character & Social virtues
  ('Speak Good or Remain Silent', 'The Prophet (PBUH) said: "Whoever believes in Allah and the Last Day should speak good or remain silent."', cat_character, 'Bukhari 6018', 'easy', 163),
  ('Return Greetings Better', 'When greeted with salam, return it with a better greeting or at least equal.', cat_social, 'Quran 4:86', 'easy', 164),
  ('Visit the Sick Today', 'Make time to visit someone who is ill. The Prophet (PBUH) said you walk in the garden of Paradise when visiting the sick.', cat_social, 'Muslim 2568', 'intermediate', 165),
  ('Control Your Anger', 'When angry, sit down if standing. If still angry, lie down. Seek refuge in Allah from Shaytan.', cat_character, 'Abu Dawud 4782', 'intermediate', 166),
  ('Show Mercy to Animals', 'Be kind to animals. The Prophet (PBUH) told of a person forgiven for giving water to a thirsty dog.', cat_character, 'Bukhari 2466', 'easy', 167),
  ('Reconcile Between People', 'Help resolve disputes between others. This is better than extra prayer and fasting.', cat_social, 'Abu Dawud 4919', 'intermediate', 168),
  ('Be Patient in Hardship', 'Practice patience today. True patience is at the first strike of calamity.', cat_character, 'Bukhari 1283', 'intermediate', 169),
  ('Fulfill Your Promises', 'Keep every promise you make today, no matter how small. Breaking promises is a sign of hypocrisy.', cat_character, 'Bukhari 33', 'easy', 170),
  ('Lower Your Gaze', 'Guard your eyes from what is impermissible. This purifies the heart.', cat_character, 'Quran 24:30', 'intermediate', 171),
  ('Be Generous Today', 'Give something in charity, even if small. The Prophet (PBUH) was the most generous of people.', cat_character, 'Bukhari 6', 'easy', 172),
  ('Honor Your Neighbor', 'Do something kind for your neighbor. The Prophet (PBUH) said Jibreel kept urging about neighbors.', cat_social, 'Bukhari 6014', 'easy', 173),
  ('Avoid Backbiting', 'Guard your tongue from speaking about others in their absence in a way they would dislike.', cat_character, 'Quran 49:12', 'intermediate', 174),
  ('Show Gratitude to People', 'Thank someone who has helped you. The Prophet (PBUH) said: "He who does not thank people does not thank Allah."', cat_social, 'Abu Dawud 4811', 'easy', 175),
  ('Be Humble Today', 'Practice humility in your interactions. Allah elevates those who humble themselves.', cat_character, 'Muslim 2588', 'easy', 176),
  ('Forgive Someone', 'Let go of a grudge you hold. Forgiveness brings peace and is closer to taqwa.', cat_character, 'Quran 2:237', 'intermediate', 177),
  ('Make Someone Smile', 'Your smile in the face of your brother is charity.', cat_social, 'Tirmidhi 1956', 'easy', 178),
  ('Protect the Orphan', 'Support an orphan through charity or kind words. The Prophet (PBUH) and the caretaker of orphans are like this in Paradise.', cat_social, 'Bukhari 5304', 'intermediate', 179),
  ('Avoid Envy', 'Be content with what Allah has given you. Envy eats good deeds like fire eats wood.', cat_character, 'Abu Dawud 4903', 'intermediate', 180),
  ('Honor Your Parents', 'Do an extra act of kindness for your parents today. Paradise lies beneath their feet.', cat_social, 'An-Nasa''i 3104', 'easy', 181),
  ('Be Trustworthy', 'Guard what has been entrusted to you. The Prophet (PBUH) was known as Al-Amin (The Trustworthy).', cat_character, 'Bukhari 33', 'easy', 182),

  -- Days 183-212: Eating, Health & Cleanliness
  ('Eat with Three Fingers', 'The Prophet (PBUH) would eat with three fingers and lick them after eating.', cat_eating, 'Muslim 2032', 'easy', 183),
  ('Sit While Drinking', 'Sit down when drinking water or other beverages, as the Prophet (PBUH) advised.', cat_eating, 'Muslim 2024', 'easy', 184),
  ('Eat What Is Nearest', 'Eat from the side of the plate nearest to you, not from the middle or others'' sides.', cat_eating, 'Bukhari 5376', 'easy', 185),
  ('Avoid Overeating', 'Fill one-third for food, one-third for drink, one-third for air. The Prophet (PBUH) warned against a full stomach.', cat_health, 'Tirmidhi 2380', 'intermediate', 186),
  ('Use Olive Oil', 'Eat olive oil and anoint yourselves with it. The Prophet (PBUH) praised the blessed olive tree.', cat_health, 'Tirmidhi 1851', 'easy', 187),
  ('Eat Dates Today', 'Eat dates, especially in the morning. The Prophet (PBUH) said a house with dates is not hungry.', cat_eating, 'Muslim 2046', 'easy', 188),
  ('Drink Honey Water', 'Use honey as medicine. The Prophet (PBUH) loved honey and recommended it for healing.', cat_health, 'Bukhari 5684', 'easy', 189),
  ('Practice Cupping Awareness', 'Learn about hijama (cupping). The Prophet (PBUH) said it is among the best remedies.', cat_health, 'Bukhari 5697', 'intermediate', 190),
  ('Use Black Seed', 'Black seed is a cure for everything except death, as the Prophet (PBUH) said.', cat_health, 'Bukhari 5688', 'easy', 191),
  ('Fast for Health', 'Consider voluntary fasting. The Prophet (PBUH) said fasting is a shield.', cat_health, 'Bukhari 1894', 'intermediate', 192),
  ('Trim Your Nails', 'Keep your nails trimmed as part of the fitrah (natural disposition).', cat_cleanliness, 'Bukhari 5889', 'easy', 193),
  ('Use Miswak Frequently', 'Use the miswak throughout the day, not just before prayer. It pleases Allah.', cat_cleanliness, 'Bukhari 887', 'easy', 194),
  ('Wash Hands Before Eating', 'Always wash your hands before and after eating.', cat_cleanliness, 'Abu Dawud 3761', 'easy', 195),
  ('Keep Your Clothes Clean', 'The Prophet (PBUH) loved cleanliness. Ensure your clothes are pure and pleasant.', cat_cleanliness, 'Quran 74:4', 'easy', 196),
  ('Apply Perfume', 'Use good fragrance. The Prophet (PBUH) loved perfume and never refused it when offered.', cat_cleanliness, 'Bukhari 2582', 'easy', 197),

  -- Days 198-227: Dhikr & Worship expansion
  ('Say Bismillah Before Everything', 'Begin every action with Bismillah. The Prophet (PBUH) began all his affairs with it.', cat_dhikr, 'Abu Dawud 101', 'easy', 198),
  ('Recite Tasbih After Prayer', 'Say SubhanAllah 33x, Alhamdulillah 33x, Allahu Akbar 34x after each prayer.', cat_dhikr, 'Muslim 595', 'easy', 199),
  ('Make Dua at Tahajjud', 'Wake for the last third of the night and make dua. Allah descends and asks: Who is calling upon Me?', cat_worship, 'Bukhari 1145', 'advanced', 200),
  ('Recite the Morning Adhkar', 'Say the morning remembrances after Fajr. They are a shield for the day.', cat_dhikr, 'Abu Dawud 5067', 'easy', 201),
  ('Recite Evening Adhkar', 'Say the evening remembrances after Asr/Maghrib. They are protection until morning.', cat_dhikr, 'Abu Dawud 5067', 'easy', 202),
  ('Say La ilaha illAllah 100 Times', 'The Prophet (PBUH) said whoever says it 100 times gets reward equal to freeing 10 slaves.', cat_dhikr, 'Bukhari 6403', 'easy', 203),
  ('Make Istighfar 100 Times', 'The Prophet (PBUH) would seek forgiveness more than 100 times a day.', cat_dhikr, 'Bukhari 6307', 'easy', 204),
  ('Read One Juz of Quran', 'Dedicate time today to read a portion of the Quran with reflection.', cat_worship, 'Bukhari 5027', 'intermediate', 205),
  ('Memorize a New Ayah', 'Work on memorizing at least one verse of the Quran today.', cat_worship, 'Bukhari 5027', 'intermediate', 206),
  ('Reflect on a Quran Verse', 'Choose one verse and spend time understanding its tafsir and application.', cat_worship, 'Quran 47:24', 'intermediate', 207),
  ('Fast a White Day', 'Fast the 13th, 14th, or 15th of the lunar month (Ayyam al-Bid).', cat_worship, 'An-Nasa''i 2345', 'intermediate', 208),
  ('Give Secret Charity', 'Give charity without anyone knowing. Secret charity extinguishes the Lord''s anger.', cat_worship, 'Tirmidhi 664', 'easy', 209),
  ('Make Dua for the Ummah', 'Pray for the Muslim ummah today. Dua for your brother in absence is always answered.', cat_dhikr, 'Muslim 2733', 'easy', 210),
  ('Send Salawat 100 Times', 'Send peace and blessings upon the Prophet (PBUH) abundantly today.', cat_dhikr, 'Muslim 408', 'easy', 211),
  ('Read Surah Yasin', 'Read Surah Yasin. It is the heart of the Quran.', cat_worship, 'Tirmidhi 2887', 'intermediate', 212),

  -- Days 213-242: Sleep, Travel & Mixed
  ('Sleep on Your Right Side', 'Lie down on your right side as the Prophet (PBUH) did, placing your right hand under your cheek.', cat_sleep, 'Bukhari 6314', 'easy', 213),
  ('Recite Ayat al-Kursi Before Sleep', 'Reciting Ayat al-Kursi before sleeping gives you a guardian angel all night.', cat_sleep, 'Bukhari 5010', 'easy', 214),
  ('Recite the Three Quls Before Sleep', 'Blow into your palms and recite Al-Ikhlas, Al-Falaq, An-Nas, then wipe over your body.', cat_sleep, 'Bukhari 5017', 'easy', 215),
  ('Make Wudu Before Sleep', 'Perform ablution before going to bed even if not in a state of impurity.', cat_sleep, 'Bukhari 247', 'easy', 216),
  ('Dust Your Bed Before Lying Down', 'Dust off your bed three times before lying down, as the Prophet (PBUH) instructed.', cat_sleep, 'Bukhari 6320', 'easy', 217),
  ('Sleep Early, Wake Early', 'Follow the Prophetic habit of sleeping after Isha and waking before Fajr.', cat_sleep, 'Bukhari 568', 'intermediate', 218),
  ('Say the Travel Dua', 'When beginning a journey, recite the travel supplication.', cat_travel, 'Muslim 1342', 'easy', 219),
  ('Pray Two Rak''ah Before Travel', 'Before departing on a journey, pray two rak''ah at home.', cat_travel, 'Al-Bazzar', 'easy', 220),
  ('Shorten Prayers While Traveling', 'When traveling a qualifying distance, shorten 4-rak''ah prayers to 2.', cat_travel, 'Bukhari 1080', 'intermediate', 221),
  ('Make Dua While Traveling', 'The traveler''s dua is answered. Use your journey to supplicate.', cat_travel, 'Tirmidhi 3437', 'easy', 222),
  ('Return Home Dua', 'Say the prescribed dua when returning from a journey.', cat_travel, 'Bukhari 1797', 'easy', 223),
  ('Bring Gifts When Returning', 'Bring small gifts for family when returning from travel, following the sunnah.', cat_travel, 'Tabarani', 'easy', 224),
  ('Say Dua When Entering Home', 'Mention Allah''s name when entering your home and greet your family with salam.', cat_social, 'Abu Dawud 5096', 'easy', 225),
  ('Say Dua When Leaving Home', 'Recite the dua for leaving the house: Bismillah, tawakkaltu ala Allah...', cat_dhikr, 'Abu Dawud 5095', 'easy', 226),
  ('Say Dua When Entering Masjid', 'Recite the prescribed supplication upon entering the mosque.', cat_prayer, 'Muslim 713', 'easy', 227),
  ('Say Dua When Leaving Masjid', 'Ask Allah from His bounty when leaving the mosque.', cat_prayer, 'Muslim 713', 'easy', 228),
  ('Pray Salat al-Musafir', 'Maintain your prayers while traveling even if shortened. Never abandon salah.', cat_travel, 'Quran 4:101', 'intermediate', 229),
  ('Feed a Traveler', 'If you meet a traveler, offer them food or drink. Hospitality is from the sunnah.', cat_social, 'Bukhari 6019', 'easy', 230),

  -- Days 231-260: Advanced worship and reflection
  ('Practice I''tikaf Intention', 'If possible, spend extra time in the masjid today with the intention of devotion.', cat_worship, 'Bukhari 2025', 'advanced', 231),
  ('Read Tafsir Today', 'Study the explanation of a surah you recite frequently in prayer.', cat_worship, 'Ibn Kathir', 'intermediate', 232),
  ('Learn a Hadith by Heart', 'Memorize one hadith today and reflect on its meaning.', cat_worship, 'Tirmidhi 2658', 'intermediate', 233),
  ('Teach Someone Something', 'Share Islamic knowledge with someone. The best of you are those who learn and teach Quran.', cat_social, 'Bukhari 5027', 'intermediate', 234),
  ('Pray for Your Parents', 'Make specific dua for your parents, living or deceased.', cat_dhikr, 'Quran 17:24', 'easy', 235),
  ('Contemplate Death', 'Remember death frequently. The Prophet (PBUH) said to remember the destroyer of pleasures.', cat_character, 'Tirmidhi 2307', 'intermediate', 236),
  ('Visit a Cemetery', 'Visit a graveyard to remember the hereafter. The Prophet (PBUH) encouraged this.', cat_worship, 'Muslim 976', 'intermediate', 237),
  ('Check Your Intentions', 'Review why you do what you do. Actions are judged by intentions.', cat_character, 'Bukhari 1', 'easy', 238),
  ('Practice Tawakkul', 'Trust in Allah today while taking the means. Tie your camel and trust in Allah.', cat_character, 'Tirmidhi 2517', 'intermediate', 239),
  ('Avoid Extravagance', 'Be moderate in spending. Allah does not love the extravagant.', cat_character, 'Quran 7:31', 'easy', 240),
  ('Give Sadaqah Jariyah', 'Contribute to ongoing charity: knowledge, a well, a tree, or similar lasting benefit.', cat_worship, 'Muslim 1631', 'intermediate', 241),
  ('Make Shukr Sajdah', 'When something good happens, prostrate in gratitude to Allah.', cat_worship, 'Abu Dawud 2774', 'easy', 242),

  -- Days 243-272: Social & Family focus
  ('Play with Children', 'Spend quality time with children. The Prophet (PBUH) would play with Hasan and Husayn.', cat_social, 'Bukhari 5884', 'easy', 243),
  ('Kiss Your Children', 'Show affection to your children. The Prophet (PBUH) kissed his grandchildren.', cat_social, 'Bukhari 5997', 'easy', 244),
  ('Help with Household Work', 'The Prophet (PBUH) would help his wives with housework. Serve your family today.', cat_social, 'Bukhari 676', 'easy', 245),
  ('Be Kind to Your Spouse', 'The best of you are those best to their families, and the Prophet (PBUH) was best to his family.', cat_social, 'Tirmidhi 3895', 'easy', 246),
  ('Maintain Family Ties', 'Reach out to a relative you haven''t spoken to recently.', cat_social, 'Bukhari 5985', 'easy', 247),
  ('Feed the Hungry', 'Provide food to someone in need. Feeding the hungry is among the best deeds.', cat_social, 'Bukhari 12', 'easy', 248),
  ('Spread Salam', 'Greet everyone you meet with Assalamu Alaikum. Spread peace actively.', cat_social, 'Muslim 54', 'easy', 249),
  ('Visit a Friend', 'Visit a friend for the sake of Allah. Allah loves those who love each other for His sake.', cat_social, 'Muslim 2567', 'easy', 250),
  ('Give Sincere Advice', 'Offer genuine nasihah to a brother or sister when appropriate.', cat_social, 'Muslim 55', 'intermediate', 251),
  ('Attend a Knowledge Circle', 'Join a halaqah or Islamic study group. Angels surround gatherings of knowledge.', cat_social, 'Muslim 2699', 'intermediate', 252),
  ('Make Dua for Someone in Absence', 'Pray for a friend without them knowing. An angel says: And for you the same.', cat_dhikr, 'Muslim 2733', 'easy', 253),
  ('Remove Harm from the Path', 'Remove an obstacle from a walkway. It is a branch of faith.', cat_character, 'Muslim 35', 'easy', 254),
  ('Give Water to Someone', 'Offer water to someone thirsty. The best charity is giving water.', cat_social, 'Abu Dawud 1681', 'easy', 255),
  ('Plant a Tree or Seed', 'Plant something beneficial. Every fruit eaten from it is ongoing charity.', cat_character, 'Bukhari 2320', 'easy', 256),
  ('Sponsor Knowledge', 'Support a student of knowledge or donate to an educational cause.', cat_social, 'Tirmidhi 2658', 'intermediate', 257),

  -- Days 258-287: Mixed daily practices
  ('Enter with Right Foot', 'Enter the mosque and your home with the right foot, following the sunnah.', cat_character, 'Bukhari 426', 'easy', 258),
  ('Exit with Left Foot', 'Leave the mosque with the left foot and make the leaving dua.', cat_character, 'Muslim 713', 'easy', 259),
  ('Wear Shoes Starting Right', 'Put on shoes starting with the right foot. Remove starting with the left.', cat_character, 'Bukhari 5856', 'easy', 260),
  ('Say Alhamdulillah After Sneezing', 'Say Alhamdulillah when you sneeze, and Yarhamuk Allah to one who sneezes.', cat_social, 'Bukhari 6224', 'easy', 261),
  ('Cover Your Mouth When Yawning', 'Cover your mouth when yawning, as the Prophet (PBUH) instructed.', cat_character, 'Bukhari 6223', 'easy', 262),
  ('Use Your Right Hand', 'Eat, drink, and give/receive with the right hand.', cat_eating, 'Muslim 2020', 'easy', 263),
  ('Look in the Mirror Dua', 'Say the dua when looking in the mirror: O Allah, beautify my character as You beautified my form.', cat_dhikr, 'Ahmad', 'easy', 264),
  ('Dress Well for Jumu''ah', 'Wear your best clothes and apply fragrance for Friday prayer.', cat_cleanliness, 'Bukhari 883', 'easy', 265),
  ('Take a Bath on Friday', 'The Friday ghusl (bath) is an obligation on every mature person.', cat_cleanliness, 'Bukhari 877', 'easy', 266),
  ('Clip Nails on Friday', 'Trim your nails as part of Friday preparation.', cat_cleanliness, 'Bukhari 5889', 'easy', 267),
  ('Read Surah Al-Mulk Before Sleep', 'This surah intercedes for its reader and protects from punishment of the grave.', cat_sleep, 'Tirmidhi 2891', 'easy', 268),
  ('Recite Last Two Verses of Baqarah', 'Read the last two verses of Surah Al-Baqarah at night. They suffice you.', cat_sleep, 'Bukhari 5009', 'easy', 269),
  ('Make Wudu When Angry', 'If you feel anger rising, make wudu. Water cools the anger from Shaytan.', cat_character, 'Abu Dawud 4784', 'easy', 270),
  ('Pray Two Rak''ah of Gratitude', 'When blessed, pray two rak''ah in gratitude to Allah.', cat_worship, 'Abu Dawud 2774', 'easy', 271),
  ('Review Your Day Before Sleep', 'Before sleeping, account yourself for the day''s deeds. Seek forgiveness for shortcomings.', cat_character, 'Quran 59:18', 'easy', 272),

  -- Days 273-302: Dhikr & Spiritual practices
  ('Say SubhanAllah wa Bihamdihi 100x', 'Whoever says it 100 times, their sins are forgiven even if like sea foam.', cat_dhikr, 'Bukhari 6405', 'easy', 273),
  ('Say La hawla wa la quwwata illa billah', 'This is a treasure of Paradise. Say it frequently throughout the day.', cat_dhikr, 'Bukhari 4205', 'easy', 274),
  ('Recite Surah Al-Ikhlas 3 Times', 'Reading it three times equals the reward of reciting the entire Quran.', cat_dhikr, 'Bukhari 5015', 'easy', 275),
  ('Make Dua at Suhoor Time', 'Wake before Fajr and supplicate. Allah descends to the lowest heaven in the last third.', cat_dhikr, 'Bukhari 1145', 'advanced', 276),
  ('Say the Dua of Yunus', 'La ilaha illa Anta Subhanaka inni kuntu min adh-dhalimin. No Muslim calls with it except that Allah answers.', cat_dhikr, 'Tirmidhi 3505', 'easy', 277),
  ('Praise Allah for Everything', 'Say Alhamdulillah for every situation, good or challenging. Praise is for Allah in all conditions.', cat_dhikr, 'Muslim 2999', 'easy', 278),
  ('Recite Surah Ar-Rahman', 'Read the Surah of the Most Merciful and reflect on Allah''s blessings.', cat_worship, 'Quran 55', 'intermediate', 279),
  ('Do Dhikr While Walking', 'Remember Allah during your commute or walk. Make your movement an act of worship.', cat_dhikr, 'Bukhari 6407', 'easy', 280),
  ('Seek Laylat al-Qadr', 'In the last 10 nights of Ramadan, seek the Night of Power through extra worship.', cat_worship, 'Bukhari 2020', 'advanced', 281),
  ('Fast Mondays and Thursdays', 'The Prophet (PBUH) would fast Mondays and Thursdays when deeds are presented to Allah.', cat_worship, 'An-Nasa''i 2361', 'intermediate', 282),
  ('Give Charity on Friday', 'Combine your Friday worship with sadaqah for multiplied reward.', cat_worship, 'Bukhari 935', 'easy', 283),
  ('Recite the Dua of the Market', 'When entering a marketplace, say La ilaha illAllah wahdahu la sharika lah... for immense reward.', cat_dhikr, 'Tirmidhi 3429', 'easy', 284),
  ('Thank Allah for Sight', 'Reflect on the blessing of eyesight and thank Allah specifically for it.', cat_dhikr, 'Quran 16:78', 'easy', 285),
  ('Thank Allah for Hearing', 'Appreciate the gift of hearing. Use it to listen to Quran and beneficial knowledge.', cat_dhikr, 'Quran 16:78', 'easy', 286),
  ('Ask for Jannah', 'The Prophet (PBUH) said: When you ask Allah, ask for Firdaws (the highest level of Paradise).', cat_dhikr, 'Bukhari 2790', 'easy', 287),

  -- Days 288-317: Cleanliness & Appearance
  ('Use Kohl (Ithmid)', 'Apply kohl in the eyes. The Prophet (PBUH) used ithmid and said it strengthens eyesight.', cat_cleanliness, 'Tirmidhi 1757', 'easy', 288),
  ('Oil Your Hair', 'Apply oil to your hair. The Prophet (PBUH) would oil and comb his hair.', cat_cleanliness, 'Abu Dawud 4159', 'easy', 289),
  ('Keep Your Home Clean', 'Maintain cleanliness in your living space. Allah is pure and loves purity.', cat_cleanliness, 'Tirmidhi 2799', 'easy', 290),
  ('Brush Your Teeth Before Prayer', 'Use miswak before every prayer. If it were not too much, I would have ordered it for every prayer.', cat_cleanliness, 'Bukhari 887', 'easy', 291),
  ('Wear White Clothing', 'The Prophet (PBUH) said: Wear white garments for they are the best of your clothes.', cat_cleanliness, 'Abu Dawud 4061', 'easy', 292),
  ('Perfume Before the Mosque', 'Apply pleasant fragrance before going to the mosque for congregation.', cat_cleanliness, 'Muslim 846', 'easy', 293),

  -- Days 294-323: Mixed worship and daily sunnah
  ('Fast the Day of Arafah', 'Fasting on the Day of Arafah expiates sins of the past and coming year (for non-pilgrims).', cat_worship, 'Muslim 1162', 'intermediate', 294),
  ('Fast Ashura', 'Fast the 10th of Muharram. It expiates the sins of the previous year.', cat_worship, 'Muslim 1162', 'intermediate', 295),
  ('Pray Eid Prayer', 'Attend the Eid prayer and celebration. It is a confirmed sunnah.', cat_prayer, 'Bukhari 956', 'easy', 296),
  ('Sacrifice on Eid al-Adha', 'If able, offer a sacrifice (qurbani) on Eid al-Adha.', cat_worship, 'Bukhari 5553', 'advanced', 297),
  ('Say Takbir in Dhul Hijjah', 'Recite takbirat (Allahu Akbar) frequently in the first 10 days of Dhul Hijjah.', cat_dhikr, 'Bukhari 969', 'easy', 298),
  ('Do Extra Good in Dhul Hijjah', 'The first 10 days of Dhul Hijjah are the best days for good deeds.', cat_worship, 'Bukhari 969', 'intermediate', 299),
  ('Pray Salat al-Tasbeeh', 'A special prayer with 300 tasbih that the Prophet (PBUH) recommended to his uncle.', cat_prayer, 'Abu Dawud 1297', 'advanced', 300),
  ('Make Wudu Perfectly', 'Perform wudu with care, washing each limb thoroughly. Sins fall away with the water.', cat_cleanliness, 'Muslim 244', 'easy', 301),
  ('Pray with a Sutrah', 'Place a barrier (sutrah) in front when praying alone, following the sunnah.', cat_prayer, 'Bukhari 509', 'easy', 302),
  ('Respond to the Adhan', 'Repeat the words of the muadhin, then make the dua after the adhan.', cat_dhikr, 'Muslim 384', 'easy', 303),

  -- Days 304-335: Character refinement
  ('Practice Hayaa (Modesty)', 'Hayaa does not bring except good. Practice modesty in speech, dress, and action.', cat_character, 'Bukhari 6117', 'easy', 304),
  ('Avoid Suspicion', 'Avoid thinking ill of others. Suspicion is the most lying of speech.', cat_character, 'Bukhari 6064', 'intermediate', 305),
  ('Keep Secrets', 'If someone confides in you, guard their secret. Conversations are a trust.', cat_character, 'Abu Dawud 4868', 'easy', 306),
  ('Accept Invitations', 'When invited to a meal, accept the invitation. Refusing without reason is disobedience.', cat_social, 'Bukhari 5177', 'easy', 307),
  ('Pray for the Host', 'When eating at someone''s home, make dua for them.', cat_social, 'Muslim 2042', 'easy', 308),
  ('Return Borrowed Items', 'Return what you have borrowed promptly and in good condition.', cat_character, 'Abu Dawud 3565', 'easy', 309),
  ('Be Just in Judgment', 'If asked to judge between people, be fair even against yourself or your relatives.', cat_character, 'Quran 4:135', 'intermediate', 310),
  ('Avoid Wasting Water', 'Use water sparingly even at a flowing river. The Prophet (PBUH) forbade waste even in wudu.', cat_character, 'Ahmad', 'easy', 311),
  ('Say Good Things About the Dead', 'Speak well of the deceased. Do not mention their faults.', cat_social, 'Bukhari 1393', 'easy', 312),
  ('Accompany Your Guest', 'Walk your guest to the door when they leave, showing respect and care.', cat_social, 'Ibn Majah', 'easy', 313),

  -- Days 314-345: More practices
  ('Fast Six Days of Shawwal', 'Fasting six days of Shawwal after Ramadan is like fasting the entire year.', cat_worship, 'Muslim 1164', 'intermediate', 314),
  ('Pray Salat al-Awwabin', 'Pray six rak''ah between Maghrib and Isha. The prayer of the oft-repenting.', cat_prayer, 'Tirmidhi 435', 'intermediate', 315),
  ('Read Quran After Fajr', 'The morning Quran is witnessed by angels. Read after Fajr before the day begins.', cat_worship, 'Quran 17:78', 'easy', 316),
  ('Seek Knowledge Daily', 'Learn something new about your deen every day. Seeking knowledge is an obligation.', cat_worship, 'Ibn Majah 224', 'easy', 317),
  ('Do Dhikr Before Sleep', 'Say SubhanAllah 33x, Alhamdulillah 33x, Allahu Akbar 34x before sleeping.', cat_sleep, 'Bukhari 5362', 'easy', 318),
  ('Make Tawbah Today', 'Turn to Allah in sincere repentance. Allah loves those who repent.', cat_worship, 'Quran 2:222', 'easy', 319),
  ('Share a Hadith', 'Convey from me even if one verse. Share beneficial knowledge with others today.', cat_social, 'Bukhari 3461', 'easy', 320),
  ('Smile at Everyone', 'Make it a point to smile genuinely at every person you encounter today.', cat_character, 'Tirmidhi 1956', 'easy', 321),
  ('Give Priority to Others', 'Practice ithar -- preferring others over yourself. Even in small things.', cat_character, 'Quran 59:9', 'intermediate', 322),
  ('Write Down Your Blessings', 'List five blessings and thank Allah for each specifically.', cat_dhikr, 'Quran 14:7', 'easy', 323),
  ('Make Tawaf of Gratitude', 'If near a mosque, pray extra rak''ah purely as gratitude for life''s blessings.', cat_worship, 'Bukhari 1130', 'easy', 324),
  ('Say the Shahada with Reflection', 'Say La ilaha illAllah Muhammadur Rasulullah slowly, reflecting on every word.', cat_dhikr, 'Muslim 26', 'easy', 325),

  -- Days 326-365: Final stretch
  ('Ask Allah for Good Character', 'The Prophet (PBUH) would make dua: O Allah, guide me to the best of manners.', cat_dhikr, 'Muslim 771', 'easy', 326),
  ('Be Content with Allah''s Decree', 'Practice ridha (contentment) with whatever Allah has decreed today.', cat_character, 'Muslim 2999', 'intermediate', 327),
  ('Think Good of Allah', 'Have husn al-dhann (positive opinion) of Allah. He is as His servant thinks of Him.', cat_character, 'Bukhari 7405', 'easy', 328),
  ('Strive for Ihsan', 'Worship Allah as though you see Him. If you cannot, know that He sees you.', cat_worship, 'Bukhari 50', 'advanced', 329),
  ('Revive a Forgotten Sunnah', 'Practice a sunnah that is commonly neglected. Reviving a sunnah has immense reward.', cat_worship, 'Tirmidhi 677', 'intermediate', 330),
  ('Make Dua with Certainty', 'When supplicating, be certain Allah will answer. Do not say "if You will."', cat_dhikr, 'Bukhari 6338', 'easy', 331),
  ('Pray for the Prophet (PBUH)', 'Spend extra time today sending salawat upon the Prophet with deep love and reverence.', cat_dhikr, 'Quran 33:56', 'easy', 332),
  ('Clean a Public Space', 'Clean a shared space as an act of faith. Removing harm from the path is charity.', cat_character, 'Muslim 35', 'easy', 333),
  ('Teach a Child the Fatiha', 'Help a child learn or perfect Surah Al-Fatiha.', cat_social, 'Bukhari 5027', 'easy', 334),
  ('Fast for Allah Alone', 'Keep your fast purely for Allah today, free from showing off or seeking praise.', cat_worship, 'Bukhari 1904', 'intermediate', 335),
  ('Reflect on Your Mortality', 'The clever person is the one who controls himself and works for what comes after death.', cat_character, 'Tirmidhi 2459', 'intermediate', 336),
  ('Make Peace Before Sleeping', 'Resolve any conflict before the day ends. Do not sleep while harboring a grudge.', cat_character, 'Muslim 2565', 'intermediate', 337),
  ('Pray for Guidance', 'Ask Allah to keep you on the straight path. The Prophet (PBUH) often asked for guidance.', cat_dhikr, 'Muslim 2654', 'easy', 338),
  ('Show Kindness to Workers', 'Pay workers their wages promptly and treat those who serve you with dignity.', cat_social, 'Ibn Majah 2443', 'easy', 339),
  ('Seek Forgiveness at Asr', 'The Prophet (PBUH) would seek forgiveness in the evening time.', cat_dhikr, 'Bukhari 6307', 'easy', 340),
  ('Practice Contentment', 'Be rich through contentment of the heart, not accumulation of wealth.', cat_character, 'Bukhari 6446', 'easy', 341),
  ('Make the Night Prayer', 'Even if two rak''ah, pray some portion of the night. It is the honor of the believer.', cat_worship, 'Al-Hakim', 'intermediate', 342),
  ('Renew Your Niyyah', 'Before every deed today, consciously renew your intention for Allah alone.', cat_character, 'Bukhari 1', 'easy', 343),
  ('Supplicate at Rain', 'When it rains, make dua. It is a time when supplication is answered.', cat_dhikr, 'Abu Dawud 5099', 'easy', 344),
  ('Be the First to Say Salam', 'The better of two people is the one who greets first.', cat_social, 'Muslim 2560', 'easy', 345),
  ('Read Surah As-Sajdah Before Sleep', 'The Prophet (PBUH) would not sleep until reading Surah As-Sajdah and Al-Mulk.', cat_sleep, 'Tirmidhi 2892', 'easy', 346),
  ('Avoid Idle Talk', 'Guard against unnecessary speech. Part of a person''s Islam being good is leaving what doesn''t concern them.', cat_character, 'Tirmidhi 2317', 'intermediate', 347),
  ('Make Istighfar at Suhoor', 'The time of suhoor (pre-dawn) is when Allah forgives those who seek forgiveness.', cat_dhikr, 'Quran 3:17', 'intermediate', 348),
  ('Do Good Silently', 'Perform a good deed today that nobody knows about except Allah.', cat_character, 'Bukhari 660', 'easy', 349),
  ('Ask for Afiyah (Wellbeing)', 'The Prophet (PBUH) said: Ask Allah for wellbeing, for no one is given anything better after certainty.', cat_dhikr, 'Tirmidhi 3558', 'easy', 350),
  ('Express Love to Family', 'Tell your family members you love them. The Prophet (PBUH) expressed love openly.', cat_social, 'Bukhari 5997', 'easy', 351),
  ('Walk to the Mosque', 'Walk to the prayer, as every step raises a degree and erases a sin.', cat_prayer, 'Bukhari 647', 'easy', 352),
  ('Review Surah Al-Fatiha Meaning', 'Reflect deeply on Al-Fatiha, the opening we recite in every rak''ah.', cat_worship, 'Quran 1:1-7', 'easy', 353),
  ('Say Alhamdulillah 100 Times', 'Fill the scales of good deeds with praise. Alhamdulillah fills the scales.', cat_dhikr, 'Muslim 223', 'easy', 354),
  ('Practice Sabr with Family', 'Be extra patient with family members. The biggest tests of patience are at home.', cat_character, 'Tirmidhi 2007', 'intermediate', 355),
  ('Prepare for Ramadan', 'Begin preparing spiritually for Ramadan well in advance.', cat_worship, 'An-Nasa''i 2106', 'easy', 356),
  ('Reflect on Last Year', 'Take time to reflect on your spiritual growth over the past year.', cat_character, 'Quran 59:18', 'easy', 357),
  ('Set Spiritual Goals', 'Write down three spiritual goals for the coming period.', cat_character, 'Bukhari 1', 'easy', 358),
  ('Thank Allah for Islam', 'Reflect on the greatest blessing: being guided to Islam.', cat_dhikr, 'Quran 3:103', 'easy', 359),
  ('Make a Comprehensive Dua', 'Make a long, detailed supplication covering all aspects of your life and akhirah.', cat_dhikr, 'Abu Dawud 1479', 'easy', 360),
  ('Review Your Good Deeds', 'Reflect on your recent good deeds. Thank Allah for enabling them.', cat_character, 'Quran 59:18', 'easy', 361),
  ('Commit to a Daily Sunnah', 'Choose one sunnah to commit to practicing every single day going forward.', cat_character, 'Muslim 783', 'easy', 362),
  ('End the Year with Tawbah', 'Make sincere repentance for any sins of the past year.', cat_worship, 'Quran 66:8', 'easy', 363),
  ('Make Dua for Next Year', 'Ask Allah to bless the coming year with goodness, knowledge, and closeness to Him.', cat_dhikr, 'Quran 2:201', 'easy', 364),
  ('Renew Your Shahada', 'Begin the cycle anew by renewing your testimony of faith with full conviction and love.', cat_worship, 'Muslim 26', 'easy', 365);
END $$;
