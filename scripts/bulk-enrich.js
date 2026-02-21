const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GROQ_KEY = process.env.GROQ_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !GROQ_KEY) {
  console.log("Missing env vars");
  process.exit(1);
}

const CATEGORY_MAP = {
  "afterlife": "3e74faa4-4ef8-4d48-bcc1-aff0afe114b2",
  "business": "a1b5b335-52f8-4334-98af-0501221c91a4",
  "character": "37c24695-be73-4ca2-9e64-a344faef50f3",
  "community": "2f376b8f-9018-45e9-8b3d-abf52d8efe33",
  "daily-life": "e1f1a80c-b53a-4026-bbe1-c49ec667c961",
  "dawah": "f688b61c-f6cf-4f31-a0b0-eebde5c6c57f",
  "dhikr": "00059e98-e2d4-413d-8a9c-fa4f325a4195",
  "faith": "f01910f6-1351-432f-88cc-0793b969d84a",
  "family": "17cfe241-9f49-4ce4-ad02-a689eb1134f2",
  "fasting": "74abe72e-f5a8-4967-bd2d-20e585148c9a",
  "fitna": "ceb742c5-d9b2-4113-8516-8513ba0c09bf",
  "hajj": "840ca8af-1567-44b9-b60f-a58803258b34",
  "history": "0281c191-19bb-48a4-8abd-3f74fe5e03a0",
  "knowledge": "8134685c-4093-4212-bd9e-1af8a5a5f671",
  "purification": "9ce15dc0-5c08-433e-bc2a-dadac0cc926f",
  "quran": "30eb4a06-9163-408d-9672-608685daf29c",
  "sunnah-acts": "01dfee45-b707-4d8e-99ed-b8fd57e5a629",
  "warfare": "659fd316-685f-42ed-ba01-3b77ea117e85",
  "worship": "e1a09a5f-bbd3-4d4b-ab86-78b9b5ca3d69",
  "zakat": "4a00508a-4ba5-4cf1-85e6-733909de3d0e",
};

const VALID_CATEGORIES = Object.keys(CATEGORY_MAP);

// Tags - fetch dynamically
let TAG_MAP = {};

async function sb(method, path, body, extraHeaders) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": method === "POST" ? "return=representation" : undefined,
    ...extraHeaders,
  };
  Object.keys(headers).forEach(k => headers[k] === undefined && delete headers[k]);
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${method} ${path} failed: ${res.status} ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function callGroq(prompt) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a hadith scholar with expertise in Islamic jurisprudence and classical hadith commentary. Always respond with valid JSON only, no markdown." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1200,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq API error: ${res.status} ${text}`);
  }
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

async function loadTags() {
  const tags = await sb("GET", "tags?select=id,slug&limit=200");
  for (const t of tags) {
    TAG_MAP[t.slug] = t.id;
  }
  console.log(`Loaded ${Object.keys(TAG_MAP).length} tags`);
}

async function getUnenrichedHadiths(limit) {
  // Get hadith IDs that already have enrichment
  const enriched = await sb("GET", "hadith_enrichment?select=hadith_id&limit=50000");
  const enrichedIds = new Set(enriched.map(e => e.hadith_id));

  // Get hadiths that don't have enrichment yet
  const hadiths = await sb("GET", `hadiths?select=id,english_translation,narrator,grade,collection_id&limit=${limit + enrichedIds.size}&order=hadith_number.asc`);
  const unenriched = hadiths.filter(h => !enrichedIds.has(h.id));
  return unenriched.slice(0, limit);
}

function buildPrompt(hadith) {
  const text = (hadith.english_translation || "").slice(0, 1500);
  return `Analyze this hadith and return a JSON object with these exact fields:

{
  "summary_line": "5-12 word summary of core teaching, present-tense",
  "category_slug": "one of: ${VALID_CATEGORIES.join(", ")}",
  "tag_slugs": ["1-4 tag slugs from controlled vocab"],
  "key_teaching_en": "2-4 sentences. First: plain-language explanation. Rest: scholarly context with references to scholars (Ibn Hajar, Al-Nawawi, etc.) or Quran verses. Do NOT repeat the hadith.",
  "key_teaching_ar": "Arabic translation of key_teaching_en. Fluent Modern Standard Arabic.",
  "summary_ar": "3-10 word Arabic translation of summary_line",
  "confidence": 0.85,
  "rationale": "Brief explanation of category/tag choices"
}

Available tag slugs: prayer, fasting, charity, pilgrimage, remembrance, patience, truthfulness, kindness, forgiveness, humility, anger, parents, marriage, children, relatives, neighbors, work, food, speech, cleanliness, greetings, seeking-knowledge, intention, faith, quran, justice, leadership, rights, brotherhood, death, judgment, paradise, hellfire, repentance, gratitude, sincerity, modesty, trust-in-allah, night-prayer, friday-sunnah, dhikr, dua-etiquette, companions, prophets, angels, backbiting, envy, lying, riba, alcohol, hijab, funeral-prayer, eid-prayer, congregational-prayer, travel-prayer, eclipse-prayer, rain-prayer, wudu, ghusl, tayammum

Hadith Text: "${text}"
Narrator: ${hadith.narrator || "Unknown"}
Grade: ${hadith.grade || "Unknown"}`;
}

async function enrichHadith(hadith) {
  const prompt = buildPrompt(hadith);
  const result = await callGroq(prompt);

  // Validate category
  const catSlug = VALID_CATEGORIES.includes(result.category_slug) ? result.category_slug : "daily-life";
  const categoryId = CATEGORY_MAP[catSlug];

  // Insert enrichment
  const enrichment = await sb("POST", "hadith_enrichment", {
    hadith_id: hadith.id,
    summary_line: (result.summary_line || "").slice(0, 80),
    summary_ar: (result.summary_ar || "").slice(0, 120),
    key_teaching_en: (result.key_teaching_en || "").slice(0, 600),
    key_teaching_ar: (result.key_teaching_ar || "").slice(0, 800),
    category_id: categoryId,
    status: "published",
    confidence: Math.min(1, Math.max(0, result.confidence || 0.7)),
    rationale: (result.rationale || "").slice(0, 200),
    suggested_by: "groq-llama-3.3-70b",
    methodology_version: "v1.1",
  });

  // Insert tags
  const tagSlugs = Array.isArray(result.tag_slugs) ? result.tag_slugs.slice(0, 4) : [];
  for (const slug of tagSlugs) {
    const tagId = TAG_MAP[slug];
    if (!tagId) continue;
    try {
      await sb("POST", "hadith_tags", {
        hadith_id: hadith.id,
        tag_id: tagId,
        status: "published",
      });
    } catch (e) {
      // Ignore duplicate tag errors
    }
  }

  return { id: hadith.id, summary: result.summary_line, category: catSlug };
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  await loadTags();

  const BATCH_SIZE = 30; // Groq allows ~30 RPM on free tier
  const TOTAL_TARGET = 200; // Process 200 per script run
  const DELAY_MS = 2200; // ~2.2s between calls to stay under rate limit

  console.log(`Fetching up to ${TOTAL_TARGET} unenriched hadiths...`);
  const hadiths = await getUnenrichedHadiths(TOTAL_TARGET);
  console.log(`Found ${hadiths.length} unenriched hadiths to process`);

  if (hadiths.length === 0) {
    console.log("All hadiths already enriched!");
    return;
  }

  let success = 0;
  let failed = 0;

  for (let i = 0; i < hadiths.length; i++) {
    const h = hadiths[i];
    try {
      const result = await enrichHadith(h);
      success++;
      console.log(`[${i + 1}/${hadiths.length}] OK: "${result.summary}" (${result.category})`);
    } catch (err) {
      failed++;
      console.log(`[${i + 1}/${hadiths.length}] FAIL: ${err.message.slice(0, 100)}`);
    }

    // Rate limit delay
    if (i < hadiths.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\nDone! Success: ${success}, Failed: ${failed}, Total: ${hadiths.length}`);
}

main().catch(err => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
