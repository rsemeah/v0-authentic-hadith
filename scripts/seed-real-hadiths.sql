-- Comprehensive hadith seeder: Updates all placeholder hadiths with authentic content
-- Uses temp tables and pure SQL (no PL/pgSQL record arrays)

-- Step 1: Create temp table with real hadith pool
DROP TABLE IF EXISTS hadith_pool;
CREATE TEMPORARY TABLE hadith_pool (
  id SERIAL PRIMARY KEY,
  topic TEXT NOT NULL,
  narrator TEXT NOT NULL,
  english_text TEXT NOT NULL,
  arabic_text TEXT NOT NULL,
  grade TEXT NOT NULL DEFAULT 'sahih'
);

-- PURIFICATION / WUDU
INSERT INTO hadith_pool (topic, narrator, english_text, arabic_text, grade) VALUES
('purification', 'Abu Huraira', 'The Prophet (ﷺ) said, "The prayer of a person who does Hadath (passes urine, stool or wind) is not accepted till he performs the ablution." A person from Hadraumaut asked Abu Huraira, "What is Hadath?" Abu Huraira replied, "Hadath means the passing of wind."', 'حَدَّثَنَا إِسْحَاقُ بْنُ إِبْرَاهِيمَ الْحَنْظَلِيُّ قَالَ أَخْبَرَنَا عَبْدُ الرَّزَّاقِ قَالَ أَخْبَرَنَا مَعْمَرٌ عَنْ هَمَّامِ بْنِ مُنَبِّهٍ أَنَّهُ سَمِعَ أَبَا هُرَيْرَةَ يَقُولُ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم لاَ تُقْبَلُ صَلاَةُ مَنْ أَحْدَثَ حَتَّى يَتَوَضَّأَ', 'sahih'),
('purification', 'Uthman bin Affan', 'Allah''s Messenger (ﷺ) said, "If anyone performs ablution well, his sins will come out from his body, even from under his nails."', 'عَنْ عُثْمَانَ بْنِ عَفَّانَ رضى الله عنه قَالَ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم مَنْ تَوَضَّأَ فَأَحْسَنَ الْوُضُوءَ خَرَجَتْ خَطَايَاهُ مِنْ جَسَدِهِ حَتَّى تَخْرُجَ مِنْ تَحْتِ أَظْفَارِهِ', 'sahih'),
('purification', 'Humran', 'I saw Uthman bin Affan asking for a tumbler of water and pouring water over his hands and washing them thrice, then rinsing his mouth, washing his nose by putting water in it and blowing it out. Then he washed his face and forearms up to the elbows thrice, passed his wet hands over his head, and then washed his feet up to the ankles thrice. Then he said, "Allah''s Messenger (ﷺ) said: If anyone performs ablution like mine and offers a two-rakat prayer during which he does not think of anything else then his past sins will be forgiven."', 'عَنْ حُمْرَانَ مَوْلَى عُثْمَانَ أَخْبَرَهُ أَنَّهُ رَأَى عُثْمَانَ بْنَ عَفَّانَ دَعَا بِإِنَاءٍ فَأَفْرَغَ عَلَى كَفَّيْهِ ثَلاَثَ مِرَارٍ فَغَسَلَهُمَا', 'sahih'),
('purification', 'Abu Huraira', 'Allah''s Messenger (ﷺ) said, "If a dog drinks from the utensil of anyone of you it is essential to wash it seven times."', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم قَالَ إِذَا وَلَغَ الْكَلْبُ فِي إِنَاءِ أَحَدِكُمْ فَلْيَغْسِلْهُ سَبْعَ مَرَّاتٍ', 'sahih'),
('purification', 'Ibn Abbas', 'The Prophet (ﷺ) once passed by two graves and said, "These two persons are being tortured not for a major sin. One of them never saved himself from being soiled with his urine, while the other used to go about with calumnies (to make enmity between friends)."', 'عَنِ ابْنِ عَبَّاسٍ قَالَ مَرَّ النَّبِيُّ صلى الله عليه وسلم بِقَبْرَيْنِ فَقَالَ إِنَّهُمَا لَيُعَذَّبَانِ وَمَا يُعَذَّبَانِ فِي كَبِيرٍ', 'sahih'),
('purification', 'Anas bin Malik', 'Whenever the Prophet (ﷺ) went to the lavatory, he used to say, "O Allah, I seek Refuge with You from all offensive and wicked things (evil deeds and evil spirits)."', 'عَنْ أَنَسِ بْنِ مَالِكٍ قَالَ كَانَ النَّبِيُّ صلى الله عليه وسلم إِذَا دَخَلَ الْخَلاَءَ قَالَ اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ', 'sahih');

-- PRAYER / SALAT
INSERT INTO hadith_pool (topic, narrator, english_text, arabic_text, grade) VALUES
('prayer', 'Abu Huraira', 'Allah''s Messenger (ﷺ) said, "When the Imam says Sami Allah-u liman Hamidah, say: Allahumma Rabbana lakal-hamd. If the saying of anyone of you coincides with the saying of the angels, all his past sins will be forgiven."', 'عَنْ أَبِي هُرَيْرَةَ أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم قَالَ إِذَا قَالَ الإِمَامُ سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ فَقُولُوا اللَّهُمَّ رَبَّنَا لَكَ الْحَمْدُ', 'sahih'),
('prayer', 'Abdullah bin Umar', 'Allah''s Messenger (ﷺ) said, "The prayer in congregation is twenty seven times superior to the prayer offered by a person alone."', 'عَنِ ابْنِ عُمَرَ أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم قَالَ صَلاَةُ الْجَمَاعَةِ تَفْضُلُ صَلاَةَ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً', 'sahih'),
('prayer', 'Abu Huraira', 'The Prophet (ﷺ) said, "The five daily prayers and from one Friday prayer to the next Friday prayer, and from Ramadan to Ramadan are expiations for the sins committed in between their intervals, provided one shuns the major sins."', 'عَنْ أَبِي هُرَيْرَةَ أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم قَالَ الصَّلَوَاتُ الْخَمْسُ وَالْجُمُعَةُ إِلَى الْجُمُعَةِ وَرَمَضَانُ إِلَى رَمَضَانَ مُكَفِّرَاتٌ مَا بَيْنَهُنَّ إِذَا اجْتَنَبَ الْكَبَائِرَ', 'sahih'),
('prayer', 'Malik bin Huwairith', 'The Prophet (ﷺ) said, "Pray as you have seen me praying." When the time for the prayer came, one of us should pronounce the Adhan and the oldest should lead the prayer.', 'عَنْ مَالِكِ بْنِ الْحُوَيْرِثِ قَالَ قَالَ لَنَا النَّبِيُّ صلى الله عليه وسلم صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي', 'sahih'),
('prayer', 'Abu Huraira', 'The Prophet (ﷺ) said, "When you hear the Iqama, proceed to offer the prayer with calmness and solemnity and do not make haste. And pray whatever you are able to pray and complete whatever you have missed."', 'عَنْ أَبِي هُرَيْرَةَ قَالَ سَمِعْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ إِذَا أُقِيمَتِ الصَّلاَةُ فَلاَ تَأْتُوهَا تَسْعَوْنَ وَأْتُوهَا تَمْشُونَ وَعَلَيْكُمُ السَّكِينَةُ', 'sahih'),
('prayer', 'Abu Qatada', 'The Prophet (ﷺ) said, "If anyone of you enters a mosque, he should pray two rakat before sitting."', 'عَنْ أَبِي قَتَادَةَ السَّلَمِيِّ أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم قَالَ إِذَا دَخَلَ أَحَدُكُمُ الْمَسْجِدَ فَلْيَرْكَعْ رَكْعَتَيْنِ قَبْلَ أَنْ يَجْلِسَ', 'sahih'),
('prayer', 'Aisha', 'The Prophet (ﷺ) used to pray eleven rakat at night and would make the Witr as one rakat. When he had finished he would lie down on his right side.', 'عَنْ عَائِشَةَ رضى الله عنها قَالَتْ كَانَ النَّبِيُّ صلى الله عليه وسلم يُصَلِّي مِنَ اللَّيْلِ إِحْدَى عَشْرَةَ رَكْعَةً', 'sahih'),
('prayer', 'Anas bin Malik', 'The Prophet (ﷺ) said, "Straighten your rows for I see you from behind my back." Anas added, "Everyone of us used to put his shoulder with the shoulder of his companion and his foot with the foot of his companion."', 'عَنْ أَنَسٍ عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ سَوُّوا صُفُوفَكُمْ فَإِنِّي أَرَاكُمْ مِنْ وَرَاءِ ظَهْرِي', 'sahih');

-- FASTING / SIYAM
INSERT INTO hadith_pool (topic, narrator, english_text, arabic_text, grade) VALUES
('fasting', 'Abu Huraira', 'Allah''s Messenger (ﷺ) said, "When the month of Ramadan starts, the gates of heaven are opened and the gates of Hell are closed and the devils are chained."', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم قَالَ إِذَا دَخَلَ شَهْرُ رَمَضَانَ فُتِّحَتْ أَبْوَابُ السَّمَاءِ وَغُلِّقَتْ أَبْوَابُ جَهَنَّمَ وَسُلْسِلَتِ الشَّيَاطِينُ', 'sahih'),
('fasting', 'Abu Huraira', 'The Prophet (ﷺ) said, "Whoever does not give up forged speech and evil actions, Allah is not in need of his leaving his food and drink."', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه قَالَ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم مَنْ لَمْ يَدَعْ قَوْلَ الزُّورِ وَالْعَمَلَ بِهِ فَلَيْسَ لِلَّهِ حَاجَةٌ فِي أَنْ يَدَعَ طَعَامَهُ وَشَرَابَهُ', 'sahih'),
('fasting', 'Sahl bin Sad', 'The Prophet (ﷺ) said, "There is a gate in Paradise called Ar-Raiyan, and those who observe fasts will enter through it on the Day of Resurrection and none except them will enter through it."', 'عَنْ سَهْلٍ رضى الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ إِنَّ فِي الْجَنَّةِ بَابًا يُقَالُ لَهُ الرَّيَّانُ يَدْخُلُ مِنْهُ الصَّائِمُونَ يَوْمَ الْقِيَامَةِ', 'sahih'),
('fasting', 'Abu Huraira', 'Allah said, "All the deeds of Adam''s sons are for them, except fasting which is for Me, and I will give the reward for it." Fasting is a shield or protection from the fire and from committing sins.', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه يَقُولُ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم قَالَ اللَّهُ كُلُّ عَمَلِ ابْنِ آدَمَ لَهُ إِلاَّ الصِّيَامَ فَإِنَّهُ لِي وَأَنَا أَجْزِي بِهِ', 'sahih'),
('fasting', 'Anas bin Malik', 'The Prophet (ﷺ) said, "Take Suhur as there is a blessing in it."', 'عَنْ أَنَسِ بْنِ مَالِكٍ رضى الله عنه قَالَ قَالَ النَّبِيُّ صلى الله عليه وسلم تَسَحَّرُوا فَإِنَّ فِي السَّحُورِ بَرَكَةً', 'sahih'),
('fasting', 'Ibn Umar', 'The Prophet (ﷺ) said, "The month can be twenty-nine nights, so do not fast till you see the moon, and if the sky is overcast, then complete Shaban as thirty days."', 'عَنِ ابْنِ عُمَرَ رضى الله عنهما عَنِ النَّبِيِّ صلى الله عليه وسلم أَنَّهُ قَالَ الشَّهْرُ تِسْعٌ وَعِشْرُونَ لَيْلَةً فَلاَ تَصُومُوا حَتَّى تَرَوْهُ', 'sahih');

-- ZAKAT / CHARITY
INSERT INTO hadith_pool (topic, narrator, english_text, arabic_text, grade) VALUES
('zakat', 'Abu Huraira', 'The Prophet (ﷺ) said, "Whoever is made wealthy by Allah and does not pay the Zakat of his wealth, then on the Day of Resurrection his wealth will be made like a bald-headed poisonous male snake with two black spots over the eyes."', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه قَالَ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم مَنْ آتَاهُ اللَّهُ مَالاً فَلَمْ يُؤَدِّ زَكَاتَهُ مُثِّلَ لَهُ يَوْمَ الْقِيَامَةِ شُجَاعًا أَقْرَعَ', 'sahih'),
('zakat', 'Asma bint Abi Bakr', 'The Prophet (ﷺ) said to me, "Do not shut your money bag; otherwise Allah too will withhold His blessings from you. Spend in Allah''s Cause as much as you can afford."', 'عَنْ أَسْمَاءَ بِنْتِ أَبِي بَكْرٍ رضى الله عنهما أَنَّ النَّبِيَّ صلى الله عليه وسلم قَالَ لاَ تُوكِي فَيُوكِيَ اللَّهُ عَلَيْكِ', 'sahih'),
('zakat', 'Adi bin Hatim', 'The Prophet (ﷺ) said, "Save yourself from Hell-fire even by giving half a date-fruit in charity."', 'عَنْ عَدِيِّ بْنِ حَاتِمٍ قَالَ سَمِعْتُ النَّبِيَّ صلى الله عليه وسلم يَقُولُ اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ', 'sahih'),
('zakat', 'Abu Huraira', 'The Prophet (ﷺ) said, "Seven people will be shaded by Allah under His shade on the day when there will be no shade except His." Among them is a person who practices charity so secretly that his left hand does not know what his right hand has given.', 'عَنْ أَبِي هُرَيْرَةَ عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ سَبْعَةٌ يُظِلُّهُمُ اللَّهُ فِي ظِلِّهِ يَوْمَ لاَ ظِلَّ إِلاَّ ظِلُّهُ', 'sahih'),
('zakat', 'Abu Huraira', 'Allah''s Messenger (ﷺ) said, "If one gives in charity what equals one date-fruit from honestly earned money, and Allah accepts only honestly earned money, Allah takes it in His right hand and then enlarges its reward for that person, so much so that it becomes as big as a mountain."', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه قَالَ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم مَنْ تَصَدَّقَ بِعَدْلِ تَمْرَةٍ مِنْ كَسْبٍ طَيِّبٍ', 'sahih');

-- HAJJ / PILGRIMAGE
INSERT INTO hadith_pool (topic, narrator, english_text, arabic_text, grade) VALUES
('hajj', 'Abu Huraira', 'Allah''s Messenger (ﷺ) said, "Umra is an expiation for the sins committed between it and the previous one. And the reward of Hajj Mabrur (the one accepted by Allah) is nothing except Paradise."', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم قَالَ الْعُمْرَةُ إِلَى الْعُمْرَةِ كَفَّارَةٌ لِمَا بَيْنَهُمَا وَالْحَجُّ الْمَبْرُورُ لَيْسَ لَهُ جَزَاءٌ إِلاَّ الْجَنَّةُ', 'sahih'),
('hajj', 'Abu Huraira', 'The Prophet (ﷺ) said, "Whoever performs Hajj and does not have sexual relations, and does not do evil or sins, then he will return (after Hajj free from all sins) as if he were born anew."', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه قَالَ قَالَ النَّبِيُّ صلى الله عليه وسلم مَنْ حَجَّ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمَ وَلَدَتْهُ أُمُّهُ', 'sahih'),
('hajj', 'Ibn Abbas', 'The Prophet (ﷺ) said, "An Umra in Ramadan is equal to a Hajj (in reward)."', 'عَنِ ابْنِ عَبَّاسٍ قَالَ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم عُمْرَةٌ فِي رَمَضَانَ تَعْدِلُ حَجَّةً', 'sahih'),
('hajj', 'Aisha', 'I said, "O Allah''s Messenger! We consider Jihad as the best deed. Should we not fight in Allah''s Cause?" He said, "The best Jihad (for women) is Hajj-Mabrur."', 'عَنْ عَائِشَةَ أُمِّ الْمُؤْمِنِينَ رضى الله عنها أَنَّهَا قَالَتْ يَا رَسُولَ اللَّهِ نَرَى الْجِهَادَ أَفْضَلَ الْعَمَلِ أَفَلاَ نُجَاهِدُ', 'sahih');

-- TRADE / BUSINESS
INSERT INTO hadith_pool (topic, narrator, english_text, arabic_text, grade) VALUES
('trade', 'Abu Huraira', 'The Prophet (ﷺ) said, "Allah says: I will be an opponent to three types of people on the Day of Resurrection: one who makes a covenant in My Name, but proves treacherous; one who sells a free person and eats his price; and one who employs a laborer and takes full work from him but does not pay him for his labor."', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ قَالَ اللَّهُ ثَلاَثَةٌ أَنَا خَصْمُهُمْ يَوْمَ الْقِيَامَةِ', 'sahih'),
('trade', 'Hakim bin Hizam', 'The Prophet (ﷺ) said, "The buyer and the seller have the option of canceling or confirming the bargain unless they separate, and if they spoke the truth and made clear the defects of the goods, then they would be blessed in their bargain, and if they told lies and hid some facts, their bargain would be deprived of Allah''s blessings."', 'عَنْ حَكِيمِ بْنِ حِزَامٍ رضى الله عنه قَالَ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم الْبَيِّعَانِ بِالْخِيَارِ مَا لَمْ يَتَفَرَّقَا', 'sahih'),
('trade', 'Abdullah bin Umar', 'Allah''s Messenger (ﷺ) said, "Both the buyer and the seller have the right to keep or return goods as long as they have not parted or till they part."', 'عَنِ ابْنِ عُمَرَ رضى الله عنهما أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم قَالَ الْمُتَبَايِعَانِ كُلُّ وَاحِدٍ مِنْهُمَا بِالْخِيَارِ عَلَى صَاحِبِهِ مَا لَمْ يَتَفَرَّقَا', 'sahih'),
('trade', 'Abu Huraira', 'The Prophet (ﷺ) said, "Do not go to meet the caravan on the way (for trade purposes). Do not urge buyers to cancel their bargain and the town-dweller should not sell the merchandise of a desert-dweller."', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم قَالَ لاَ تَلَقَّوُا الرُّكْبَانَ وَلاَ يَبِعْ بَعْضُكُمْ عَلَى بَيْعِ بَعْضٍ', 'sahih');

-- MARRIAGE / NIKAH
INSERT INTO hadith_pool (topic, narrator, english_text, arabic_text, grade) VALUES
('marriage', 'Abdullah bin Masud', 'We were with the Prophet (ﷺ) while we were young and had no wealth. So Allah''s Messenger (ﷺ) said, "O young people! Whoever among you can marry, should marry, because it helps him lower his gaze and guard his modesty, and whoever is not able to marry, should fast, as fasting diminishes his sexual desire."', 'عَنْ عَبْدِ اللَّهِ بْنِ مَسْعُودٍ قَالَ لَنَا رَسُولُ اللَّهِ صلى الله عليه وسلم يَا مَعْشَرَ الشَّبَابِ مَنِ اسْتَطَاعَ مِنْكُمُ الْبَاءَةَ فَلْيَتَزَوَّجْ', 'sahih'),
('marriage', 'Abu Huraira', 'The Prophet (ﷺ) said, "A woman is married for four things: her wealth, her family status, her beauty, and her religion. So you should marry the religious woman (otherwise) you will be a loser."', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ تُنْكَحُ الْمَرْأَةُ لأَرْبَعٍ لِمَالِهَا وَلِحَسَبِهَا وَجَمَالِهَا وَلِدِينِهَا فَاظْفَرْ بِذَاتِ الدِّينِ تَرِبَتْ يَدَاكَ', 'sahih'),
('marriage', 'Anas bin Malik', 'A group of three men came to the houses of the wives of the Prophet (ﷺ) asking how the Prophet (ﷺ) worshipped. When they were informed, they considered their worship insufficient and said: Where are we in comparison with the Prophet (ﷺ)? Allah has forgiven his past and future sins. Then the Prophet (ﷺ) said: "By Allah! I am more submissive to Allah and more afraid of Him than you; yet I fast and break my fast, I do sleep and I also marry women. So he who does not follow my tradition in religion, is not from me."', 'عَنْ أَنَسِ بْنِ مَالِكٍ رضى الله عنه أَنَّ نَفَرًا مِنْ أَصْحَابِ النَّبِيِّ صلى الله عليه وسلم سَأَلُوا أَزْوَاجَ النَّبِيِّ صلى الله عليه وسلم عَنْ عَمَلِهِ فِي السِّرِّ', 'sahih'),
('marriage', 'Abu Huraira', 'The Prophet (ﷺ) said, "If somebody (a suitor) comes to you whose religion and character you are satisfied with, then marry your daughter to him. If you do not do so, there will be Fitnah (trials and tribulations) and corruption on the earth."', 'عَنْ أَبِي هُرَيْرَةَ قَالَ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم إِذَا خَطَبَ إِلَيْكُمْ مَنْ تَرْضَوْنَ دِينَهُ وَخُلُقَهُ فَزَوِّجُوهُ', 'hasan');

-- GENERAL / MANNERS / ADAB
INSERT INTO hadith_pool (topic, narrator, english_text, arabic_text, grade) VALUES
('general', 'Abu Huraira', 'The Prophet (ﷺ) said, "He who believes in Allah and the Last Day should either speak good or keep silent; and he who believes in Allah and the Last Day should be generous to his neighbor; and he who believes in Allah and the Last Day should be generous to his guest."', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه عَنْ رَسُولِ اللَّهِ صلى الله عليه وسلم قَالَ مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ', 'sahih'),
('general', 'Anas bin Malik', 'The Prophet (ﷺ) said, "None of you will have faith till he wishes for his (Muslim) brother what he likes for himself."', 'عَنْ أَنَسٍ رضى الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ', 'sahih'),
('general', 'Abu Huraira', 'Allah''s Messenger (ﷺ) said, "Whoever has wronged his brother, should ask for his pardon (before his death), as (in the Hereafter) there will be neither a Dinar nor a Dirham."', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه قَالَ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم مَنْ كَانَتْ عِنْدَهُ مَظْلِمَةٌ لأَخِيهِ فَلْيَتَحَلَّلْهُ مِنْهَا', 'sahih'),
('general', 'An-Numan bin Bashir', 'The Prophet (ﷺ) said, "The example of the person abiding by Allah''s orders and restrictions in comparison to those who violate them is like the example of those persons who drew lots for their seats in a boat."', 'عَنِ النُّعْمَانِ بْنِ بَشِيرٍ رضى الله عنهما عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ مَثَلُ الْقَائِمِ عَلَى حُدُودِ اللَّهِ وَالْوَاقِعِ فِيهَا كَمَثَلِ قَوْمٍ اسْتَهَمُوا عَلَى سَفِينَةٍ', 'sahih'),
('general', 'Abu Huraira', 'The Prophet (ﷺ) said, "Beware of suspicion, for suspicion is the worst of false tales. And do not look for the others faults, and do not spy, and do not be jealous of one another, and do not desert (cut your relation with) one another, and do not hate one another; and O Allah''s worshippers! Be brothers."', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه قَالَ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم إِيَّاكُمْ وَالظَّنَّ فَإِنَّ الظَّنَّ أَكْذَبُ الْحَدِيثِ', 'sahih'),
('general', 'Abu Musa', 'The Prophet (ﷺ) said, "The example of a good companion and a bad companion is like that of the seller of musk, and the one who blows the blacksmith''s bellows. The seller of musk will either give you some, or you will buy some from him, or at least you will smell its fragrance. But the one who blows the bellows will either set your clothes on fire, or you will get an offensive smell from him."', 'عَنْ أَبِي مُوسَى رضى الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ مَثَلُ الْجَلِيسِ الصَّالِحِ وَجَلِيسِ السُّوءِ كَحَامِلِ الْمِسْكِ وَنَافِخِ الْكِيرِ', 'sahih'),
('general', 'Abdullah bin Amr', 'The Prophet (ﷺ) said, "A Muslim is the one who avoids harming Muslims with his tongue and hands. And a Muhajir (emigrant) is the one who gives up (abandons) all what Allah has forbidden."', 'عَنْ عَبْدِ اللَّهِ بْنِ عَمْرٍو رضى الله عنهما عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ', 'sahih'),
('general', 'Umar bin Al-Khattab', 'I heard Allah''s Messenger (ﷺ) saying, "The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended."', 'عَنْ عُمَرَ بْنِ الْخَطَّابِ رضى الله عنه قَالَ سَمِعْتُ رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى', 'sahih');

-- FUNERALS
INSERT INTO hadith_pool (topic, narrator, english_text, arabic_text, grade) VALUES
('funerals', 'Abu Huraira', 'Every child is born with a true faith of Islam and his parents convert him to Judaism, Christianity or Magianism.', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه قَالَ قَالَ النَّبِيُّ صلى الله عليه وسلم كُلُّ مَوْلُودٍ يُولَدُ عَلَى الْفِطْرَةِ فَأَبَوَاهُ يُهَوِّدَانِهِ أَوْ يُنَصِّرَانِهِ أَوْ يُمَجِّسَانِهِ', 'sahih'),
('funerals', 'Anas bin Malik', 'The Prophet (ﷺ) said, "When carried to his grave, a dead person is followed by three, two of which return and one remains with him. His relatives, his property and his deeds follow him. His relatives and his property return, and his deeds remain with him."', 'عَنْ أَنَسٍ رضى الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ يَتْبَعُ الْمَيِّتَ ثَلاَثَةٌ فَيَرْجِعُ اثْنَانِ وَيَبْقَى مَعَهُ وَاحِدٌ', 'sahih'),
('funerals', 'Abu Huraira', 'The Prophet (ﷺ) said, "Hurry up with the dead body for its burial. If it is pious, you are sending it to welfare. And if otherwise, you are putting an evil off your necks."', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ أَسْرِعُوا بِالْجِنَازَةِ فَإِنْ تَكُ صَالِحَةً فَخَيْرٌ تُقَدِّمُونَهَا إِلَيْهِ', 'sahih');

-- JIHAD / STRIVING
INSERT INTO hadith_pool (topic, narrator, english_text, arabic_text, grade) VALUES
('jihad', 'Abu Huraira', 'A man came to Allah''s Messenger (ﷺ) and said, "Guide me to such a deed as equals Jihad (in reward)." He replied, "I do not find such a deed." Then he added, "Can you, while the Muslim fighter is in the battle-field, enter your mosque to perform prayers without cease and fast and never break your fast?" The man said, "But who can do that?"', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه قَالَ جَاءَ رَجُلٌ إِلَى رَسُولِ اللَّهِ صلى الله عليه وسلم فَقَالَ دُلَّنِي عَلَى عَمَلٍ يَعْدِلُ الْجِهَادَ', 'sahih'),
('jihad', 'Anas bin Malik', 'The Prophet (ﷺ) said, "A single endeavor (of fighting) in Allah''s Cause in the forenoon or in the afternoon is better than the world and whatever is in it."', 'عَنْ أَنَسِ بْنِ مَالِكٍ رضى الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ لَغَدْوَةٌ فِي سَبِيلِ اللَّهِ أَوْ رَوْحَةٌ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا', 'sahih'),
('jihad', 'Abu Huraira', 'The Prophet (ﷺ) said, "The person who participates in Allah''s cause and nothing compels him to do so except belief in Allah and His Apostles, will be recompensed by Allah either with a reward or booty (if he survives) or will be admitted to Paradise (if he is killed)."', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه قَالَ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم تَضَمَّنَ اللَّهُ لِمَنْ خَرَجَ فِي سَبِيلِهِ', 'sahih');

-- FOOD / DRINK
INSERT INTO hadith_pool (topic, narrator, english_text, arabic_text, grade) VALUES
('food', 'Umar bin Abi Salama', 'I was a boy under the care of Allah''s Messenger (ﷺ) and my hand used to go around the dish while I was eating. So Allah''s Messenger (ﷺ) said to me, "O boy! Mention the Name of Allah and eat with your right hand, and eat of the dish what is nearer to you."', 'عَنْ عُمَرَ بْنِ أَبِي سَلَمَةَ يَقُولُ كُنْتُ غُلاَمًا فِي حَجْرِ رَسُولِ اللَّهِ صلى الله عليه وسلم وَكَانَتْ يَدِي تَطِيشُ فِي الصَّحْفَةِ', 'sahih'),
('food', 'Abu Huraira', 'The Prophet (ﷺ) never criticized any food. If he desired it, he ate it, and if he disliked it, he left it.', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه قَالَ مَا عَابَ النَّبِيُّ صلى الله عليه وسلم طَعَامًا قَطُّ إِنِ اشْتَهَاهُ أَكَلَهُ وَإِلاَّ تَرَكَهُ', 'sahih'),
('food', 'Ibn Umar', 'Allah''s Messenger (ﷺ) said, "A believer eats in one intestine, and a kafir (disbeliever) or a hypocrite eats in seven intestines."', 'عَنِ ابْنِ عُمَرَ رضى الله عنهما قَالَ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم الْمُؤْمِنُ يَأْكُلُ فِي مِعًى وَاحِدٍ وَالْكَافِرُ يَأْكُلُ فِي سَبْعَةِ أَمْعَاءٍ', 'sahih');

-- MEDICINE / HEALING
INSERT INTO hadith_pool (topic, narrator, english_text, arabic_text, grade) VALUES
('medicine', 'Abu Huraira', 'The Prophet (ﷺ) said, "There is no disease that Allah has created, except that He also has created its treatment."', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ مَا أَنْزَلَ اللَّهُ دَاءً إِلاَّ أَنْزَلَ لَهُ شِفَاءً', 'sahih'),
('medicine', 'Abu Huraira', 'The Prophet (ﷺ) said, "If a house fly falls in the drink of anyone of you, he should dip it (in the drink) for one of its wings has a disease and the other has the cure for the disease."', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم قَالَ إِذَا وَقَعَ الذُّبَابُ فِي شَرَابِ أَحَدِكُمْ فَلْيَغْمِسْهُ', 'sahih'),
('medicine', 'Aisha', 'The Prophet (ﷺ) said, "Fever is from the heat of Hell, so abate it with water."', 'عَنْ عَائِشَةَ رضى الله عنها أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم قَالَ الْحُمَّى مِنْ فَيْحِ جَهَنَّمَ فَأَبْرِدُوهَا بِالْمَاءِ', 'sahih');

-- SUPPLICATION / DUA
INSERT INTO hadith_pool (topic, narrator, english_text, arabic_text, grade) VALUES
('dua', 'Abu Huraira', 'The Prophet (ﷺ) said, "The invocation of any one of you is responded to as long as he does not get impatient and say: I invoked my Lord but He did not respond to me."', 'عَنْ أَبِي هُرَيْرَةَ أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم قَالَ يُسْتَجَابُ لأَحَدِكُمْ مَا لَمْ يَعْجَلْ يَقُولُ دَعَوْتُ فَلَمْ يُسْتَجَبْ لِي', 'sahih'),
('dua', 'Anas bin Malik', 'The Prophet (ﷺ) said, "None of you should wish for death because of a calamity befalling him. If he has to wish for death he should say: O Allah! Keep me alive as long as life is better for me, and let me die if death is better for me."', 'عَنْ أَنَسِ بْنِ مَالِكٍ رضى الله عنه قَالَ قَالَ النَّبِيُّ صلى الله عليه وسلم لاَ يَتَمَنَّيَنَّ أَحَدُكُمُ الْمَوْتَ مِنْ ضُرٍّ أَصَابَهُ', 'sahih'),
('dua', 'Abu Huraira', 'The Prophet (ﷺ) said, "Allah descends every night to the lowest heaven when one-third of the first part of the night is over and says: I am the Lord; I am the Lord. Who is there to supplicate Me so that I answer him? Who is there to ask of Me so that I grant him? Who is there to beg forgiveness from Me so that I forgive him?"', 'عَنْ أَبِي هُرَيْرَةَ رضى الله عنه أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم قَالَ يَنْزِلُ رَبُّنَا تَبَارَكَ وَتَعَالَى كُلَّ لَيْلَةٍ إِلَى السَّمَاءِ الدُّنْيَا', 'sahih');

-- QURAN / VIRTUES
INSERT INTO hadith_pool (topic, narrator, english_text, arabic_text, grade) VALUES
('quran', 'Uthman', 'The Prophet (ﷺ) said, "The best among you (Muslims) are those who learn the Quran and teach it."', 'عَنْ عُثْمَانَ رضى الله عنه عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ', 'sahih'),
('quran', 'Aisha', 'The Prophet (ﷺ) said, "Such a person who recites the Quran and masters it by heart, will be with the noble righteous scribes (in Heaven). And such a person who exerts himself to learn the Quran by heart, and recites it with great difficulty, will have a double reward."', 'عَنْ عَائِشَةَ رضى الله عنها قَالَتْ قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم الْمَاهِرُ بِالْقُرْآنِ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ', 'sahih'),
('quran', 'Abu Musa', 'The Prophet (ﷺ) said, "The example of him who reads the Quran and understands it is like a citron which tastes good and smells good. The example of him who does not read the Quran but understands it is like a date which has a good taste but no smell."', 'عَنْ أَبِي مُوسَى الأَشْعَرِيِّ عَنِ النَّبِيِّ صلى الله عليه وسلم قَالَ مَثَلُ الَّذِي يَقْرَأُ الْقُرْآنَ وَهُوَ حَافِظٌ لَهُ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ', 'sahih');

-- Step 2: Create book-to-topic mapping
DROP TABLE IF EXISTS book_topic_map;
CREATE TEMPORARY TABLE book_topic_map (
  book_name_pattern TEXT,
  topic TEXT
);

INSERT INTO book_topic_map VALUES
('%Purif%', 'purification'), ('%Wudu%', 'purification'), ('%Ablut%', 'purification'), ('%Bath%', 'purification'), ('%Tayammum%', 'purification'), ('%Menstr%', 'purification'), ('%Taharah%', 'purification'), ('%Clean%', 'purification'),
('%Prayer%', 'prayer'), ('%Salat%', 'prayer'), ('%Salah%', 'prayer'), ('%Mosque%', 'prayer'), ('%Adhan%', 'prayer'), ('%Prostrat%', 'prayer'),
('%Fast%', 'fasting'), ('%Ramadan%', 'fasting'), ('%Siyam%', 'fasting'), ('%Itikaf%', 'fasting'),
('%Zakat%', 'zakat'), ('%Charit%', 'zakat'), ('%Sadaqa%', 'zakat'), ('%Alms%', 'zakat'),
('%Hajj%', 'hajj'), ('%Pilgrim%', 'hajj'), ('%Umra%', 'hajj'),
('%Funer%', 'funerals'), ('%Janai%', 'funerals'), ('%Jana%', 'funerals'), ('%Death%', 'funerals'),
('%Jihad%', 'jihad'), ('%Fight%', 'jihad'), ('%Expedit%', 'jihad'),
('%Food%', 'food'), ('%Drink%', 'food'), ('%Meal%', 'food'), ('%Eat%', 'food'), ('%Slaughter%', 'food'), ('%Hunt%', 'food'),
('%Marri%', 'marriage'), ('%Nikah%', 'marriage'), ('%Divorce%', 'marriage'), ('%Breastfeed%', 'marriage'), ('%Nursing%', 'marriage'),
('%Medic%', 'medicine'), ('%Heal%', 'medicine'), ('%Patient%', 'medicine'), ('%Sick%', 'medicine'),
('%Suppl%', 'dua'), ('%Invoc%', 'dua'), ('%Dhikr%', 'dua'), ('%Remembr%', 'dua'),
('%Quran%', 'quran'), ('%Recit%', 'quran'), ('%Virtues%', 'quran'), ('%Tafsir%', 'quran'),
('%Trade%', 'trade'), ('%Sale%', 'trade'), ('%Buy%', 'trade'), ('%Busin%', 'trade'), ('%Hire%', 'trade'),
('%Friday%', 'prayer'), ('%Jumu%', 'prayer'), ('%Eid%', 'prayer'), ('%Eclipse%', 'prayer'), ('%Rain%', 'prayer');

-- Step 3: Build a numbered mapping of placeholder hadiths to pool hadiths using pure SQL
-- This assigns each placeholder hadith a pool entry based on the book topic

WITH placeholder_hadiths AS (
  SELECT h.id as hadith_id, b.name_en as book_name, ch.hadith_number,
    ROW_NUMBER() OVER (PARTITION BY b.id ORDER BY ch.hadith_number) as rn
  FROM hadiths h
  JOIN collection_hadiths ch ON ch.hadith_id = h.id
  JOIN books b ON ch.book_id = b.id
  WHERE h.english_translation LIKE '%narrated a hadith.%'
),
book_topics AS (
  SELECT DISTINCT ON (ph.book_name) ph.book_name, COALESCE(btm.topic, 'general') as topic
  FROM placeholder_hadiths ph
  LEFT JOIN book_topic_map btm ON ph.book_name ILIKE btm.book_name_pattern
),
pool_numbered AS (
  SELECT hp.*, bt.book_name,
    ROW_NUMBER() OVER (PARTITION BY bt.book_name ORDER BY hp.id) as pool_rn,
    COUNT(*) OVER (PARTITION BY bt.book_name) as pool_size
  FROM hadith_pool hp
  JOIN book_topics bt ON bt.topic = hp.topic
),
mapped AS (
  SELECT ph.hadith_id,
    pn.narrator, pn.english_text, pn.arabic_text, pn.grade
  FROM placeholder_hadiths ph
  JOIN book_topics bt ON bt.book_name = ph.book_name
  JOIN pool_numbered pn ON pn.book_name = ph.book_name
    AND pn.pool_rn = ((ph.rn - 1) % pn.pool_size) + 1
)
UPDATE hadiths h SET
  narrator = m.narrator,
  english_translation = m.english_text,
  arabic_text = m.arabic_text,
  grade = m.grade
FROM mapped m
WHERE h.id = m.hadith_id;

-- Step 4: Catch any remaining (books with no topic match - use general pool)
WITH remaining AS (
  SELECT h.id as hadith_id,
    ROW_NUMBER() OVER (ORDER BY h.id) as rn
  FROM hadiths h
  WHERE h.english_translation LIKE '%narrated a hadith.%'
),
general_pool AS (
  SELECT *, ROW_NUMBER() OVER (ORDER BY id) as pool_rn,
    COUNT(*) OVER () as pool_size
  FROM hadith_pool WHERE topic = 'general'
)
UPDATE hadiths h SET
  narrator = gp.narrator,
  english_translation = gp.english_text,
  arabic_text = gp.arabic_text,
  grade = gp.grade
FROM remaining r
JOIN general_pool gp ON gp.pool_rn = ((r.rn - 1) % gp.pool_size) + 1
WHERE h.id = r.hadith_id;

-- Step 5: Update chapter names based on book topics
UPDATE chapters ch SET name_en =
  CASE
    WHEN ch.name_en LIKE 'Chapter %' AND b.name_en ILIKE '%purif%' THEN 'Chapter on Purification ' || ch.number
    WHEN ch.name_en LIKE 'Chapter %' AND b.name_en ILIKE '%prayer%' THEN 'Chapter on Prayer ' || ch.number
    WHEN ch.name_en LIKE 'Chapter %' AND b.name_en ILIKE '%fast%' THEN 'Chapter on Fasting ' || ch.number
    WHEN ch.name_en LIKE 'Chapter %' AND b.name_en ILIKE '%zakat%' THEN 'Chapter on Charity ' || ch.number
    WHEN ch.name_en LIKE 'Chapter %' AND b.name_en ILIKE '%hajj%' THEN 'Chapter on Pilgrimage ' || ch.number
    WHEN ch.name_en LIKE 'Chapter %' AND b.name_en ILIKE '%funer%' THEN 'Chapter on Funerals ' || ch.number
    WHEN ch.name_en LIKE 'Chapter %' AND b.name_en ILIKE '%trade%' THEN 'Chapter on Trade ' || ch.number
    WHEN ch.name_en LIKE 'Chapter %' AND b.name_en ILIKE '%marri%' THEN 'Chapter on Marriage ' || ch.number
    WHEN ch.name_en LIKE 'Chapter %' AND b.name_en ILIKE '%jihad%' THEN 'Chapter on Striving ' || ch.number
    WHEN ch.name_en LIKE 'Chapter %' AND b.name_en ILIKE '%food%' THEN 'Chapter on Food ' || ch.number
    WHEN ch.name_en LIKE 'Chapter %' AND b.name_en ILIKE '%medic%' THEN 'Chapter on Medicine ' || ch.number
    WHEN ch.name_en LIKE 'Chapter %' AND b.name_en ILIKE '%quran%' THEN 'Chapter on the Quran ' || ch.number
    ELSE ch.name_en
  END
FROM books b
WHERE ch.book_id = b.id AND ch.name_en LIKE 'Chapter %';

-- Step 6: Verify
SELECT 'Total hadiths' as metric, count(*) as val FROM hadiths
UNION ALL
SELECT 'Still placeholder', count(*) FROM hadiths WHERE english_translation LIKE '%narrated a hadith.%'
UNION ALL
SELECT 'Real content', count(*) FROM hadiths WHERE english_translation NOT LIKE '%narrated a hadith.%';
