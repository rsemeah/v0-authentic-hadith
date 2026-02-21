import os
import json
import urllib.request
import urllib.error
import time

SB_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SB_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
GR_KEY = os.environ.get("GROQ_API_KEY")

print(f"ENV: url={bool(SB_URL)} key={bool(SB_KEY)} groq={bool(GR_KEY)}")

CATS = {
    "afterlife":"3e74faa4-4ef8-4d48-bcc1-aff0afe114b2","business":"a1b5b335-52f8-4334-98af-0501221c91a4",
    "character":"37c24695-be73-4ca2-9e64-a344faef50f3","community":"2f376b8f-9018-45e9-8b3d-abf52d8efe33",
    "daily-life":"e1f1a80c-b53a-4026-bbe1-c49ec667c961","dawah":"f688b61c-f6cf-4f31-a0b0-eebde5c6c57f",
    "dhikr":"00059e98-e2d4-413d-8a9c-fa4f325a4195","faith":"f01910f6-1351-432f-88cc-0793b969d84a",
    "family":"17cfe241-9f49-4ce4-ad02-a689eb1134f2","fasting":"74abe72e-f5a8-4967-bd2d-20e585148c9a",
    "fitna":"ceb742c5-d9b2-4113-8516-8513ba0c09bf","hajj":"840ca8af-1567-44b9-b60f-a58803258b34",
    "history":"0281c191-19bb-48a4-8abd-3f74fe5e03a0","knowledge":"8134685c-4093-4212-bd9e-1af8a5a5f671",
    "purification":"9ce15dc0-5c08-433e-bc2a-dadac0cc926f","quran":"30eb4a06-9163-408d-9672-608685daf29c",
    "sunnah-acts":"01dfee45-b707-4d8e-99ed-b8fd57e5a629","warfare":"659fd316-685f-42ed-ba01-3b77ea117e85",
    "worship":"e1a09a5f-bbd3-4d4b-ab86-78b9b5ca3d69","zakat":"4a00508a-4ba5-4cf1-85e6-733909de3d0e"
}
CAT_SLUGS = list(CATS.keys())

def sb_get(path):
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/{path}",
        headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"}
    )
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read())

def sb_post(path, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(
        f"{SB_URL}/rest/v1/{path}",
        data=body, method="POST",
        headers={
            "apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}",
            "Content-Type": "application/json", "Prefer": "return=representation"
        }
    )
    try:
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read())
    except urllib.error.HTTPError as e:
        raise Exception(f"SB POST {e.code}: {e.read().decode()[:150]}")

def call_groq(text, narrator):
    cats_str = ",".join(CAT_SLUGS)
    tags_str = "prayer,fasting,charity,remembrance,patience,truthfulness,kindness,forgiveness,humility,parents,marriage,children,food,speech,cleanliness,seeking-knowledge,intention,faith,quran,justice,rights,brotherhood,death,judgment,paradise,hellfire,repentance,gratitude,sincerity,modesty,trust-in-allah,night-prayer,dhikr,dua-etiquette,companions,prophets,backbiting,envy,lying,wudu,ghusl"
    
    prompt = f"""Analyze this hadith. Return JSON with: summary_line (5-12 words), category_slug (one of: {cats_str}), tag_slugs (1-4 from: {tags_str}), key_teaching_en (2-4 sentences: first accessible then scholarly with scholar refs), key_teaching_ar (Arabic translation), summary_ar (3-10 Arabic words), confidence (0-1), rationale (brief).

Hadith: "{text[:1200]}"
Narrator: {narrator or 'Unknown'}"""

    body = json.dumps({
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "You are a hadith scholar. Respond with valid JSON only."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3, "max_tokens": 1200,
        "response_format": {"type": "json_object"}
    }).encode()

    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=body, method="POST",
        headers={"Authorization": f"Bearer {GR_KEY}", "Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read())
            return json.loads(data["choices"][0]["message"]["content"])
    except urllib.error.HTTPError as e:
        raise Exception(f"Groq {e.code}: {e.read().decode()[:150]}")

def main():
    # Load tags
    tag_rows = sb_get("tags?select=id,slug&limit=200")
    TAG_MAP = {t["slug"]: t["id"] for t in tag_rows}
    print(f"Tags loaded: {len(TAG_MAP)}")

    # Get enriched IDs
    enriched = sb_get("hadith_enrichment?select=hadith_id")
    done = {e["hadith_id"] for e in enriched}
    print(f"Already enriched: {len(done)}")

    # Get hadiths
    hadiths = sb_get("hadiths?select=id,english_translation,narrator,grade&limit=1000&order=hadith_number.asc")
    todo = [h for h in hadiths if h["id"] not in done]
    batch = todo[:20]
    print(f"Processing {len(batch)} of {len(todo)} remaining")

    ok = 0
    fail = 0

    for i, h in enumerate(batch):
        try:
            r = call_groq(h.get("english_translation", ""), h.get("narrator"))
            cat = r.get("category_slug", "daily-life")
            if cat not in CATS:
                cat = "daily-life"

            sb_post("hadith_enrichment", {
                "hadith_id": h["id"],
                "summary_line": (r.get("summary_line") or "")[:80],
                "summary_ar": (r.get("summary_ar") or "")[:120],
                "key_teaching_en": (r.get("key_teaching_en") or "")[:600],
                "key_teaching_ar": (r.get("key_teaching_ar") or "")[:800],
                "category_id": CATS[cat],
                "status": "published",
                "confidence": min(1, max(0, r.get("confidence", 0.7))),
                "rationale": (r.get("rationale") or "")[:200],
                "suggested_by": "groq-llama-3.3-70b",
                "methodology_version": "v1.1"
            })

            tags = (r.get("tag_slugs") or [])[:4]
            for slug in tags:
                if slug in TAG_MAP:
                    try:
                        sb_post("hadith_tags", {"hadith_id": h["id"], "tag_id": TAG_MAP[slug], "status": "published"})
                    except:
                        pass

            ok += 1
            print(f"[{i+1}/{len(batch)}] OK: {(r.get('summary_line') or '')[:60]}")
        except Exception as e:
            fail += 1
            print(f"[{i+1}/{len(batch)}] FAIL: {str(e)[:120]}")

        if i < len(batch) - 1:
            time.sleep(2.5)

    print(f"\nDONE: ok={ok} fail={fail}")

main()
