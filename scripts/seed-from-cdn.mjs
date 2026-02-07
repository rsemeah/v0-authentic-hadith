#!/usr/bin/env node

/**
 * Seed all missing hadiths from the fawazahmed0/hadith-api CDN.
 * Runs locally (no Vercel timeout). Uses Supabase JS client.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nqklipakrfuwebkdnhwg.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xa2xpcGFrcmZ1d2Via2RuaHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyODA3NDUsImV4cCI6MjA4Mzg1Njc0NX0.yhIe3hqiLlyF8atvSmNOL3HBq91V9Frw5jYcat-sZxY";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CDN = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

const COLLECTIONS = [
  { slug: "muwatta-malik", eng: "eng-malik", ara: "ara-malik", display: "Muwatta Malik" },
  { slug: "jami-tirmidhi", eng: "eng-tirmidhi", ara: "ara-tirmidhi", display: "Jami at-Tirmidhi" },
  { slug: "sunan-ibn-majah", eng: "eng-ibnmajah", ara: "ara-ibnmajah", display: "Sunan Ibn Majah" },
  { slug: "sunan-abu-dawud", eng: "eng-abudawud", ara: "ara-abudawud", display: "Sunan Abu Dawud" },
  { slug: "sahih-muslim", eng: "eng-muslim", ara: "ara-muslim", display: "Sahih Muslim" },
  { slug: "sunan-nasai", eng: "eng-nasai", ara: "ara-nasai", display: "Sunan an-Nasai" },
  { slug: "sahih-bukhari", eng: "eng-bukhari", ara: "ara-bukhari", display: "Sahih al-Bukhari" },
  { slug: "musnad-ahmad", eng: "eng-ahmad", ara: "ara-ahmad", display: "Musnad Ahmad" },
];

function determineGrade(grades, slug) {
  if (slug === "sahih-bukhari" || slug === "sahih-muslim") return "sahih";
  if (!grades || grades.length === 0) return "hasan";
  for (const g of grades) {
    const gl = g.grade.toLowerCase();
    if (gl.includes("sahih")) return "sahih";
    if (gl.includes("hasan")) return "hasan";
    if (gl.includes("daif") || gl.includes("da'if") || gl.includes("weak")) return "daif";
  }
  return "hasan";
}

function extractNarrator(text) {
  const m = text.match(/^(?:Narrated|It was narrated (?:from|that)|It is narrated on the authority of)\s+([^:]{3,80}):/i);
  if (m) return m[1].replace(/\(.*?\)/g, "").trim();
  return "";
}

async function fetchJSON(url) {
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

async function seedCollection(collConfig) {
  const { slug, eng, ara, display } = collConfig;
  console.log(`\n========== SEEDING: ${display} ==========`);

  // Get collection from DB
  const { data: coll } = await supabase.from("collections").select("id").eq("slug", slug).single();
  if (!coll) { console.log(`  Collection not found: ${slug}`); return; }

  // Get existing hadith numbers
  const { data: existingLinks } = await supabase.from("collection_hadiths").select("hadith_number").eq("collection_id", coll.id);
  const existingNumbers = new Set((existingLinks || []).map(l => l.hadith_number));
  console.log(`  Existing hadiths: ${existingNumbers.size}`);

  let totalInserted = 0;
  let totalSkipped = 0;
  let consecutiveMisses = 0;

  for (let secNum = 1; secNum <= 200; secNum++) {
    // Fetch English section
    const engData = await fetchJSON(`${CDN}/${eng}/${secNum}.min.json`);
    if (!engData) {
      consecutiveMisses++;
      if (consecutiveMisses >= 5) { console.log(`  No more sections after ${secNum - 1}`); break; }
      continue;
    }
    consecutiveMisses = 0;

    if (!engData.hadiths || engData.hadiths.length === 0) continue;

    // Fetch Arabic section
    const araData = await fetchJSON(`${CDN}/${ara}/${secNum}.min.json`);
    const arabicMap = new Map();
    if (araData?.hadiths) {
      for (const h of araData.hadiths) arabicMap.set(h.hadithnumber, h.text);
    }

    // Ensure book exists
    const sectionName = engData.metadata?.section?.[String(secNum)] || `Book ${secNum}`;
    const { data: existingBook } = await supabase.from("books").select("id").eq("collection_id", coll.id).eq("number", secNum).single();

    let bookId;
    if (existingBook) {
      bookId = existingBook.id;
      await supabase.from("books").update({ name_en: sectionName, total_hadiths: engData.hadiths.length }).eq("id", bookId);
    } else {
      const { data: newBook } = await supabase.from("books").insert({
        collection_id: coll.id, name_en: sectionName, name_ar: "", number: secNum,
        total_hadiths: engData.hadiths.length, total_chapters: 1, sort_order: secNum,
      }).select("id").single();
      if (!newBook) { console.log(`  Failed to create book ${secNum}`); continue; }
      bookId = newBook.id;
    }

    // Ensure chapter
    const { data: existingCh } = await supabase.from("chapters").select("id").eq("book_id", bookId).limit(1).single();
    let chapterId;
    if (existingCh) {
      chapterId = existingCh.id;
    } else {
      const { data: newCh } = await supabase.from("chapters").insert({
        book_id: bookId, name_en: sectionName, name_ar: "", number: 1,
        total_hadiths: engData.hadiths.length, sort_order: 1,
      }).select("id").single();
      if (!newCh) { console.log(`  Failed to create chapter for book ${secNum}`); continue; }
      chapterId = newCh.id;
    }

    // Filter existing
    const newHadiths = engData.hadiths.filter(h => !existingNumbers.has(h.hadithnumber));
    totalSkipped += engData.hadiths.length - newHadiths.length;

    if (newHadiths.length === 0) {
      process.stdout.write(".");
      continue;
    }

    // Insert in batches of 50
    for (let i = 0; i < newHadiths.length; i += 50) {
      const batch = newHadiths.slice(i, i + 50);
      const rows = batch.map(h => ({
        hadith_number: h.hadithnumber, book_number: secNum,
        arabic_text: arabicMap.get(h.hadithnumber) || "",
        english_translation: h.text,
        narrator: extractNarrator(h.text),
        grade: determineGrade(h.grades, slug),
        reference: `${display} ${h.hadithnumber}`,
        collection: slug, is_featured: false,
      }));

      const { data: inserted, error } = await supabase.from("hadiths").insert(rows).select("id, hadith_number");
      if (error) { console.log(`  Batch error sec ${secNum}: ${error.message}`); continue; }

      if (inserted?.length > 0) {
        const links = inserted.map(h => ({
          collection_id: coll.id, book_id: bookId, chapter_id: chapterId,
          hadith_id: h.id, hadith_number: h.hadith_number,
        }));
        await supabase.from("collection_hadiths").insert(links);
        totalInserted += inserted.length;
        for (const h of inserted) existingNumbers.add(h.hadith_number);
      }
    }

    process.stdout.write(`[${secNum}:+${newHadiths.length}]`);
  }

  // Update collection total
  const { count } = await supabase.from("collection_hadiths").select("id", { count: "exact", head: true }).eq("collection_id", coll.id);
  if (count !== null) await supabase.from("collections").update({ total_hadiths: count }).eq("id", coll.id);

  console.log(`\n  DONE: +${totalInserted} inserted, ${totalSkipped} skipped, total now: ${count}`);
}

async function main() {
  console.log("Starting full hadith seed from CDN...\n");
  const startTime = Date.now();

  // Seed specific collection if passed as argument, otherwise all
  const targetSlug = process.argv[2];

  if (targetSlug) {
    const config = COLLECTIONS.find(c => c.slug === targetSlug);
    if (!config) { console.log(`Unknown collection: ${targetSlug}`); process.exit(1); }
    await seedCollection(config);
  } else {
    for (const config of COLLECTIONS) {
      await seedCollection(config);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\nAll done in ${elapsed}s`);
}

main().catch(console.error);
