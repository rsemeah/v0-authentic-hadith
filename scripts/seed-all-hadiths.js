const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const COLLECTION_MAP = {
  "sahih-bukhari": "bukhari",
  "sahih-muslim": "muslim",
  "sunan-abu-dawud": "abudawud",
  "jami-tirmidhi": "tirmidhi",
  "sunan-nasai": "nasai",
  "sunan-ibn-majah": "ibnmajah",
  "muwatta-malik": "malik",
  "musnad-ahmad": "ahmad",
};

const COLLECTION_DISPLAY = {
  bukhari: "Sahih al-Bukhari",
  muslim: "Sahih Muslim",
  abudawud: "Sunan Abu Dawud",
  tirmidhi: "Jami` at-Tirmidhi",
  nasai: "Sunan an-Nasa'i",
  ibnmajah: "Sunan Ibn Majah",
  malik: "Muwatta Malik",
  ahmad: "Musnad Ahmad",
};

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseHadithsFromHtml(html, sunnahSlug) {
  const hadiths = [];
  const chapters = [];
  const collDisplay = COLLECTION_DISPLAY[sunnahSlug] || sunnahSlug;

  // Strategy 1: Parse by actualHadithContainer class (sunnah.com SSR structure)
  const sections = html.split(/class="actualHadithContainer"/);

  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];

    // Get hadith number
    let hadithNum = 0;
    const refMatch = section.match(
      new RegExp(escapeRegex(collDisplay) + "\\s+(\\d+)", "i")
    );
    if (refMatch) {
      hadithNum = parseInt(refMatch[1]);
    }
    if (!hadithNum) {
      const inBookMatch = section.match(/In-book reference[^:]*:[^,]*Hadith\s+(\d+)/i);
      if (inBookMatch) hadithNum = parseInt(inBookMatch[1]);
    }
    if (!hadithNum) {
      const anyRefMatch = section.match(/Hadith\s+(\d+)/i);
      if (anyRefMatch) hadithNum = parseInt(anyRefMatch[1]);
    }
    if (!hadithNum || hadiths.find((h) => h.hadithNumber === hadithNum)) continue;

    // Extract English text
    let englishText = "";
    const engMatch =
      section.match(/class="[^"]*english_hadith_full[^"]*"[^>]*>([\s\S]*?)<\/div/i) ||
      section.match(/class="[^"]*text_details[^"]*"[^>]*>([\s\S]*?)<\/div/i) ||
      section.match(/class="[^"]*hadithText[^"]*"[^>]*>([\s\S]*?)<\/div/i);
    if (engMatch) {
      englishText = engMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }

    // Get narration header
    const narrHeaderMatch = section.match(
      /class="[^"]*hadithNarrated[^"]*"[^>]*>([\s\S]*?)<\/div/i
    );
    if (narrHeaderMatch) {
      const narrText = narrHeaderMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (narrText && !englishText.startsWith(narrText)) {
        englishText = narrText + " " + englishText;
      }
    }

    // Extract Arabic text
    let arabicText = "";
    const arMatch =
      section.match(/class="[^"]*arabic_hadith_full[^"]*"[^>]*>([\s\S]*?)<\/div/i) ||
      section.match(/class="[^"]*arabictext[^"]*"[^>]*>([\s\S]*?)<\/div/i);
    if (arMatch) {
      arabicText = arMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }

    // Narrator extraction
    let narrator = "";
    const narrMatch = englishText.match(
      /^(?:Narrated|It is narrated on the authority of|It was narrated (?:from|that)|reported on the authority of)\s+([^:]+?)(?:\s*:|\s+that\b)/i
    );
    if (narrMatch) {
      narrator = narrMatch[1].replace(/\(.*?\)/g, "").trim().substring(0, 80);
    }

    // Grade
    let grade = "";
    const gradeMatch = section.match(
      /class="[^"]*hadith[-_]?[Gg]rade[^"]*"[^>]*>([\s\S]*?)<\/t/i
    );
    if (gradeMatch) {
      const g = gradeMatch[1].replace(/<[^>]+>/g, "").toLowerCase().trim();
      if (g.includes("sahih")) grade = "sahih";
      else if (g.includes("hasan")) grade = "hasan";
      else if (g.includes("da") || g.includes("weak")) grade = "daif";
    }

    if (englishText.length > 15 || arabicText.length > 15) {
      hadiths.push({
        hadithNumber: hadithNum,
        arabicText,
        englishText: englishText.substring(0, 10000),
        narrator,
        grade: grade || (sunnahSlug === "bukhari" || sunnahSlug === "muslim" ? "sahih" : "hasan"),
        reference: collDisplay + " " + hadithNum,
      });
    }
  }

  // Strategy 2: Fallback - parse from plain text patterns
  if (hadiths.length === 0) {
    const refPattern = new RegExp(escapeRegex(collDisplay) + "\\s+(\\d+)", "gi");
    const allRefs = [];
    let rMatch;
    while ((rMatch = refPattern.exec(html)) !== null) {
      const num = parseInt(rMatch[1]);
      if (!allRefs.find((r) => r.num === num)) {
        allRefs.push({ num, index: rMatch.index });
      }
    }

    for (let i = 0; i < allRefs.length; i++) {
      const ref = allRefs[i];
      const nextRef = allRefs[i + 1];
      const startIdx = Math.max(0, ref.index - 500);
      const endIdx = nextRef ? nextRef.index : Math.min(html.length, ref.index + 10000);
      const block = html.substring(startIdx, endIdx);

      let englishText = "";
      const narrTextMatch = block.match(
        /(?:Narrated\s+[^\n:]+:\s*\n?)([\s\S]*?)(?=\n\s*(?:[\u0600-\u06FF]|Reference|Report|Grade|$))/i
      );
      if (narrTextMatch) {
        englishText = narrTextMatch[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      }

      let arabicText = "";
      const arabicMatch = block.match(
        /([\u0600-\u06FF][\u0600-\u06FF\s\u064B-\u065F\u0670\u0640\u060C.:\-()]+[\u0600-\u06FF])/g
      );
      if (arabicMatch) {
        arabicText = arabicMatch.reduce((a, b) => (a.length > b.length ? a : b), "").trim();
      }

      let narrator = "";
      const narratorMatch = englishText.match(
        /^(?:Narrated|It is narrated)\s+([^:]+?)(?:\s*:)/i
      );
      if (narratorMatch) {
        narrator = narratorMatch[1].replace(/\(.*?\)/g, "").trim().substring(0, 80);
      }

      if (englishText.length > 20 || arabicText.length > 20) {
        hadiths.push({
          hadithNumber: ref.num,
          arabicText,
          englishText: englishText.substring(0, 10000),
          narrator,
          grade: sunnahSlug === "bukhari" || sunnahSlug === "muslim" ? "sahih" : "hasan",
          reference: collDisplay + " " + ref.num,
        });
      }
    }
  }

  // Parse chapter headings
  const chapterPattern =
    /class="[^"]*(?:chapter_title|chapterTitle|englishchapter)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|span)/gi;
  let cm;
  let chapterNum = 0;
  while ((cm = chapterPattern.exec(html)) !== null) {
    chapterNum++;
    const name = cm[1].replace(/<[^>]+>/g, "").trim();
    if (name && name.length > 2) {
      chapters.push({ number: chapterNum, nameEn: name, nameAr: "" });
    }
  }

  return { hadiths, chapters };
}

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; HadithApp/1.0; educational-project)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
      if (resp.ok) return await resp.text();
      if (resp.status === 429) {
        console.log("  Rate limited, waiting " + ((attempt + 1) * 5) + "s...");
        await new Promise((r) => setTimeout(r, (attempt + 1) * 5000));
        continue;
      }
      console.log("  HTTP " + resp.status + " for " + url);
      return null;
    } catch (e) {
      console.log("  Fetch error (attempt " + (attempt + 1) + "): " + e);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  return null;
}

async function seedBook(collectionSlug, sunnahSlug, bookNumber, bookId) {
  const url = "https://sunnah.com/" + sunnahSlug + "/" + bookNumber;
  console.log("\nFetching " + url + "...");

  const html = await fetchWithRetry(url);
  if (!html) {
    console.log("  SKIP: Could not fetch " + url);
    return { seeded: 0, total: 0 };
  }

  console.log("  Got " + html.length + " bytes of HTML");
  const { hadiths: parsed, chapters: parsedChapters } = parseHadithsFromHtml(html, sunnahSlug);
  console.log("  Parsed " + parsed.length + " hadiths and " + parsedChapters.length + " chapters");

  if (parsed.length === 0) {
    console.log("  SKIP: No hadiths parsed from HTML");
    return { seeded: 0, total: 0 };
  }

  // Update chapter names
  if (parsedChapters.length > 0) {
    for (const ch of parsedChapters) {
      const updateObj = { name_en: ch.nameEn };
      if (ch.nameAr) updateObj.name_ar = ch.nameAr;
      await supabase
        .from("chapters")
        .update(updateObj)
        .eq("book_id", bookId)
        .eq("number", ch.number);
    }
    console.log("  Updated " + parsedChapters.length + " chapter names");
  }

  // Get existing hadith links for this book
  const { data: links } = await supabase
    .from("collection_hadiths")
    .select("hadith_id, hadith_number")
    .eq("book_id", bookId)
    .order("hadith_number");

  if (!links || links.length === 0) {
    console.log("  SKIP: No hadith links found for book");
    return { seeded: 0, total: 0 };
  }

  // Create map: hadith_number -> hadith_id
  const linkMap = new Map();
  for (const link of links) {
    linkMap.set(link.hadith_number, link.hadith_id);
  }

  let updated = 0;
  // Batch updates for efficiency
  const batchSize = 50;
  const updateBatch = [];
  
  for (const h of parsed) {
    const hadithId = linkMap.get(h.hadithNumber);
    if (!hadithId) continue;

    const updateData = {};
    if (h.englishText) updateData.english_translation = h.englishText;
    if (h.arabicText) updateData.arabic_text = h.arabicText;
    if (h.narrator) updateData.narrator = h.narrator;
    if (h.grade) updateData.grade = h.grade;
    if (h.reference) updateData.reference = h.reference;

    if (Object.keys(updateData).length > 0) {
      updateBatch.push({ id: hadithId, ...updateData });
    }
  }

  // Execute updates in batches
  for (let i = 0; i < updateBatch.length; i += batchSize) {
    const batch = updateBatch.slice(i, i + batchSize);
    const promises = batch.map((item) => {
      const { id, ...data } = item;
      return supabase.from("hadiths").update(data).eq("id", id);
    });
    const results = await Promise.all(promises);
    updated += results.filter((r) => !r.error).length;
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      console.log("  " + errors.length + " errors in batch: " + errors[0].error.message);
    }
  }

  console.log("  Updated " + updated + "/" + parsed.length + " hadiths");
  return { seeded: updated, total: parsed.length };
}

async function main() {
  console.log("=== Hadith Database Seeder ===\n");

  const { data: collections } = await supabase
    .from("collections")
    .select("id, slug, name_en")
    .order("name_en");

  if (!collections) {
    console.error("Failed to fetch collections");
    return;
  }

  let totalSeeded = 0;
  let totalBooks = 0;

  for (const collection of collections) {
    const sunnahSlug = COLLECTION_MAP[collection.slug];
    if (!sunnahSlug) {
      console.log("\nSKIP collection: " + collection.name_en + " (no sunnah.com mapping)");
      continue;
    }

    console.log("\n" + "=".repeat(50));
    console.log("Collection: " + collection.name_en + " (" + sunnahSlug + ")");
    console.log("=".repeat(50));

    const { data: books } = await supabase
      .from("books")
      .select("id, number, name_en, total_hadiths")
      .eq("collection_id", collection.id)
      .order("number");

    if (!books) continue;

    for (const book of books) {
      // Check if already has real content
      const { data: sampleLinks } = await supabase
        .from("collection_hadiths")
        .select("hadith_id")
        .eq("book_id", book.id)
        .limit(1);

      if (sampleLinks && sampleLinks.length > 0) {
        const { data: sample } = await supabase
          .from("hadiths")
          .select("english_translation")
          .eq("id", sampleLinks[0].hadith_id)
          .single();

        const isPlaceholder =
          !sample?.english_translation ||
          sample.english_translation.includes("narrated a hadith.") ||
          sample.english_translation.includes("[Content pending") ||
          sample.english_translation.length < 80;

        if (!isPlaceholder) {
          console.log("\n  SKIP Book " + book.number + ": " + book.name_en + " (already seeded)");
          continue;
        }
      }

      console.log("\n  Book " + book.number + ": " + book.name_en + " (" + book.total_hadiths + " hadiths)");
      const result = await seedBook(collection.slug, sunnahSlug, book.number, book.id);
      totalSeeded += result.seeded;
      totalBooks++;

      // Rate limit: wait 1.5 seconds between books
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("DONE: Seeded " + totalSeeded + " hadiths across " + totalBooks + " books");
  console.log("=".repeat(50));
}

main().catch(console.error);
