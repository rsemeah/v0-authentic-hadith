# Authentic Hadith — Feature Expansion Build Plan

## Current State (as of Feb 14, 2026)

| Area | Now | Target |
|---|---|---|
| Categories | 7 flat | 7-8 parent + 2-level subcategories |
| Tags | 24 | 150-200 with weighted assignment |
| Sunnah practices | 17 | 365 (one per calendar day) |
| Companion stories | 5 companions (22 parts) | ~25-30 companions + 25 prophets |
| Learning path lessons | 26 across 4 paths | Same count, add quiz gates + intro pages |
| Quiz questions | 0 (schema only) | ~104 (4 per lesson) |
| Search RPC | None | Full-text + tag/category/grade filters |

---

## Build Sequence (dependency order)

### Phase 1: Schema + Data Foundation (Claude Code)

**Must happen first — everything else depends on this.**

#### 1A. Hierarchical categories migration

- Alter `categories` table to add `parent_id UUID REFERENCES categories(id)`
- Add `depth INT DEFAULT 0` column
- Seed 7-8 parent categories + 60-80 subcategories (2 levels deep)
- Example: Worship → Prayer → Night Prayer, Tahajjud, Duha
- Example: Character → Patience, Kindness, Gratitude, Humility
- Create `get_category_tree()` RPC that returns nested JSON
- Add indexes on `parent_id` and `depth`

#### 1B. Tag system expansion migration

- Alter `tags` table: add `sensitivity TEXT`, `synonyms TEXT[]`, `arabic_name TEXT`
- Create `tag_suggestions` table (hadith_id, tag_id, confidence, status, reviewed_by)
- Create `hadith_categories` table (hadith_id, primary_category, weight_confidence)
- AI generates 150-200 tags referencing Islamic taxonomies (sunnah.com tag lists, published hadith indices)
- Output: JSON file for admin review before import
- After approval: seed tags into DB
- Batch-tag all 36,246 hadiths with weighted scores
- Auto-approve: safe tags with confidence >= 0.9 on Sahih hadiths
- Everything else: pending admin review
- Trigger: on tag insert → recalculate `hadith_categories.primary_category` via weighted average

#### 1C. Quiz system migration

- Create `quiz_questions` table: question_text, question_type (multiple_choice/true_false/fill_blank), correct_answer, options JSONB, hint_text, explanation, xp_reward, lesson_id
- Create `quiz_attempts` table: user_id, question_id, lesson_id, selected_answer, is_correct, used_hint, xp_earned
- Create `learning_progress` table: user_id, path_id, module_id, lesson_id, status (not_started/in_progress/quiz_pending/completed), quiz_score, quiz_attempts
- Create `can_access_lesson()` RPC — returns false unless previous lesson status = completed
- Create `update_lesson_after_quiz()` RPC — marks completed if score >= 70%, else quiz_pending
- Hint penalty: 30% XP reduction when used_hint = true

#### 1D. Learning path metadata migration

- Create `learning_path_metadata` table: path_id, what_is TEXT, learning_outcomes TEXT[], how_to_use TEXT, progress_tracking_explanation TEXT, estimated_duration TEXT, completion_achievement_id UUID
- Seed metadata for all 4 existing paths
- Create achievements for: each path completion (4) + each module completion (~12-16)
- Wire achievement unlock trigger: when all lessons in module/path are completed → insert achievement

#### 1E. Search RPC

- Create `search_hadith()` function with parameters: query, collection, category, tags[], grade, limit, offset
- Uses `to_tsvector('english', body_en)` with GIN index
- Joins through hadith_tags → tags and hadith_categories for filtering
- Returns: id, body_en, body_ar, collection_name, book_name, grade, relevance score
- Depends on: 1A (categories) and 1B (tags) being complete

---

### Phase 2: Content Generation (Claude Code — AI scripts)

**Runs after Phase 1 schema is applied.**

#### 2A. Tag taxonomy generation script

- Node.js script using AI (Groq/OpenAI)
- Generates 150-200 tags across hierarchical categories
- References Islamic scholarship taxonomies
- Outputs `generated/tag-taxonomy-review.json`
- Admin reviews → renames to `tag-taxonomy-approved.json`
- Import script reads approved file → seeds DB

#### 2B. Hadith batch tagging script

- Processes 50 hadiths per batch
- Assigns 3-7 tags per hadith with relevance_score (1-10) and confidence (0.0-1.0)
- Sensitive topics (fiqh, gender, jihad, interfaith) → auto-flag for review
- Safe + high-confidence on Sahih → auto-approve
- Resume capability (saves progress to file)
- Full run: ~725 batches for 36,246 hadiths

#### 2C. Sunnah expansion (17 → 365)

- AI generates 348 additional sunnah practices
- Each sunnah: title, description, category, difficulty (easy/moderate/advanced), time_of_day (morning/evening/anytime)
- Each linked to 1-3 supporting hadiths from the collection
- day_of_year assignment: 1-365
- Output: SQL seed file for review before applying
- Categories: expand beyond current 6 to match parent categories

#### 2D. Companion stories expansion (5 → ~25-30)

Add companions from these groups:
- **Mothers of the Believers (wives):** Khadijah (exists), Aisha, Hafsa, Umm Salama, Zaynab, Sawda, + others as appropriate
- **Immediate family:** Ali (nephew/son-in-law), Hamza (uncle), Fatimah (daughter), Zayd ibn Harithah (adopted son)
- **Four Caliphs:** Abu Bakr (exists), Umar (exists), Uthman, Ali
- **Ten Promised Paradise:** Sa'd ibn Abi Waqqas, Talha, Zubayr, Abu Ubayda, Abdur-Rahman ibn Awf, Sa'id ibn Zayd
- **Famous early converts:** Bilal (exists), Salman (exists), Ammar ibn Yasir, Sumayyah, Khabbab
- **Honorary:** Al-Qaswa (the Prophet's camel) with a short note

Each companion: 4-5 story parts, same format as existing entries
AI drafts, marked "review needed" — you approve before publish

#### 2E. Stories of the Prophets (25 new entries)

All 25 prophets named in the Quran:
Adam, Idris, Nuh, Hud, Salih, Ibrahim, Lut, Ismail, Ishaq, Yaqub, Yusuf, Ayyub, Shu'ayb, Musa, Harun, Dhul-Kifl, Dawud, Sulayman, Ilyas, Al-Yasa, Yunus, Zakariya, Yahya, Isa, Muhammad (PBUH)

Each prophet: detail page with Quranic references, story parts, key lessons
Add `person_type` column to sahaba table: 'companion' | 'prophet'
Add `story_quran_references` table for verse links
AI drafts all 25, clearly marked for review

#### 2F. Quiz question generation (26 lessons × 4 questions)

- For each lesson: 2 multiple choice, 1 true/false, 1 fill-in-blank
- Each question: hint_text, explanation with hadith reference, xp_reward (10/15/20 by difficulty)
- Output: JSON for review → seed script
- Must reference actual hadiths from the lesson content

---

### Phase 3: API Endpoints (Claude Code)

#### 3A. Advanced search endpoint

- `POST /api/search/advanced` — calls `search_hadith()` RPC
- Input validation with zod
- Pagination response (page, limit, total, totalPages)

#### 3B. Daily sunnah endpoints

- `GET /api/daily-sunnah` — calls `get_todays_sunnah()` RPC, includes supporting hadiths + user completion status
- `POST /api/daily-sunnah/complete` — marks completion, awards 20 XP

#### 3C. Learning progress endpoint

- `POST /api/learning/progress` — actions: start_lesson, complete_quiz
- Enforces `can_access_lesson()` hard block
- Grades quiz, calculates XP (with hint penalty), calls `update_lesson_after_quiz()`
- Returns: score, correct_answers, xp_earned, passed boolean

#### 3D. Tag admin endpoints

- `GET /api/admin/tags/pending` — list pending tag suggestions
- `POST /api/admin/tags/approve` — bulk approve/reject, admin role check
- Auto-inserts approved tags into hadith_tags

#### 3E. Category tree endpoint

- `GET /api/categories/tree` — returns hierarchical category JSON

---

### Phase 4: Frontend (v0.dev)

#### 4A. Learning path landing page

- Dedicated "course intro" screen per path
- Sections: What it is, What you'll learn (outcomes list), How to use, Progress tracking explanation
- Start button → first incomplete lesson
- Module/lesson progress indicators
- Achievement badges display

#### 4B. Quiz UI

- Question card with type-appropriate input (radio buttons / true-false toggle / text input)
- "Need a Hint?" button → reveals hint, marks hint_used
- Submit → grade → show explanation with hadith reference
- Results screen: score, XP earned, pass/fail, "Try Again" if failed

#### 4C. Daily sunnah card

- Shows today's sunnah with supporting hadith(s)
- "Mark as Done" button
- Streak indicator
- Category badge

#### 4D. Stories expansion UI

- Add "Prophets" tab alongside "Companions" on stories page
- Prophet detail pages (same layout as companion stories)
- Quran reference links on story parts

#### 4E. Search filters UI

- Category dropdown (hierarchical — shows parent > child)
- Tag multi-select chips
- Grade filter (Sahih/Hasan/Da'if)
- Collection filter
- Results with relevance highlighting

#### 4F. Admin tag review dashboard

- Table of pending tag suggestions with confidence scores
- Bulk approve/reject actions
- Filter by confidence threshold, sensitivity level

---

## Execution Order (what blocks what)

```
Week 1:  1A (categories) + 1B (tags) + 1C (quiz) + 1D (metadata) + 1E (search)
         ↓
Week 2:  2A (tag taxonomy) → 2B (batch tagging) — sequential, 2A must finish first
         2C (365 sunnah) — parallel
         2D (companions) — parallel
         2E (prophets) — parallel
         2F (quiz questions) — parallel
         ↓
Week 3:  3A-3E (all API endpoints) — depends on Phase 1+2 data being seeded
         ↓
Week 4:  4A-4F (all frontend) — depends on APIs existing
```

## Build Assignment

| Stream | Owner | Files |
|---|---|---|
| 1A-1E Migrations | Claude Code | `supabase/migrations/202602*.sql` |
| 2A-2F Content scripts | Claude Code | `scripts/ai-*.ts`, `scripts/seed-*.sql` |
| 3A-3E API routes | Claude Code | `app/api/**/*.ts` |
| 4A-4F Frontend | v0.dev | Components + pages |

## Open decisions (resolve as we go)

- Exact subcategory list (Claude Code proposes, you approve)
- Which AI provider for content generation (Groq for speed vs OpenAI for quality)
- Whether prophet stories reuse the `sahaba` table (with person_type) or get their own table
- Lunar calendar adjustment for sunnah rotation (deferred to post-v1.1)
