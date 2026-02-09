const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const HEADERS = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
};

async function main() {
  // 1. Get all collections
  const collResp = await fetch(
    `${SUPABASE_URL}/rest/v1/collections?select=id,name,slug,total_hadiths,total_books&order=id.asc`,
    { headers: HEADERS }
  );
  const collections = await collResp.json();
  console.log("=== ALL COLLECTIONS ===");
  for (const c of collections) {
    console.log(`  ${c.slug} (id=${c.id}): ${c.name} - ${c.total_hadiths} hadiths, ${c.total_books} books`);
  }

  // 2. For each collection, query books the same way the page does
  console.log("\n=== BOOKS PER COLLECTION (using page query) ===");
  for (const c of collections) {
    const booksResp = await fetch(
      `${SUPABASE_URL}/rest/v1/books?collection_id=eq.${c.id}&select=id,name_english,sort_order,total_hadiths&order=sort_order.asc`,
      { headers: HEADERS }
    );
    const books = await booksResp.json();
    console.log(`\n  ${c.slug} (id=${c.id}): ${books.length} books found`);
    if (books.length === 0) {
      // Check if books exist with service role key
      const svcResp = await fetch(
        `${SUPABASE_URL}/rest/v1/books?collection_id=eq.${c.id}&select=id,name_english&limit=3`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const svcBooks = await svcResp.json();
      console.log(`    Service role finds: ${svcBooks.length} books`);
      if (svcBooks.length > 0) console.log(`    Example:`, svcBooks[0]);
    } else {
      // Show first 3 book names
      for (const b of books.slice(0, 3)) {
        console.log(`    Book ${b.sort_order}: ${b.name_english} (${b.total_hadiths} hadiths)`);
      }
      if (books.length > 3) console.log(`    ... and ${books.length - 3} more`);
    }
  }

  // 3. Also check if collection_id column in books matches collection ids
  console.log("\n=== DISTINCT collection_ids IN books TABLE ===");
  const distinctResp = await fetch(
    `${SUPABASE_URL}/rest/v1/books?select=collection_id&limit=10000`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const allBooks = await distinctResp.json();
  const distinctIds = [...new Set(allBooks.map(b => b.collection_id))].sort((a,b) => a - b);
  console.log(`  Distinct collection_ids in books: [${distinctIds.join(", ")}]`);
  console.log(`  Collection ids from collections table: [${collections.map(c => c.id).join(", ")}]`);
  
  // Check for mismatches
  const collIds = new Set(collections.map(c => c.id));
  const orphanedBookIds = distinctIds.filter(id => !collIds.has(id));
  if (orphanedBookIds.length > 0) {
    console.log(`  MISMATCH! Books reference collection_ids not in collections table: [${orphanedBookIds.join(", ")}]`);
  }
  
  const missingBookIds = collections.filter(c => !distinctIds.includes(c.id)).map(c => `${c.slug}(${c.id})`);
  if (missingBookIds.length > 0) {
    console.log(`  MISSING! Collections with NO books: [${missingBookIds.join(", ")}]`);
  }
}

main().catch(console.error);
