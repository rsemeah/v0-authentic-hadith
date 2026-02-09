const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const HEADERS = {
  apikey: ANON_KEY,
  Authorization: `Bearer ${ANON_KEY}`,
};

async function main() {
  // 1. Get all collections - first discover column names
  const schemaResp = await fetch(
    `${SUPABASE_URL}/rest/v1/collections?select=*&limit=1`,
    { headers: HEADERS }
  );
  const schemaData = await schemaResp.json();
  console.log("=== COLLECTIONS TABLE COLUMNS ===");
  if (Array.isArray(schemaData) && schemaData.length > 0) {
    console.log("Columns:", Object.keys(schemaData[0]).join(", "));
    console.log("Sample row:", JSON.stringify(schemaData[0], null, 2));
  } else {
    console.log("Response:", JSON.stringify(schemaData).slice(0, 500));
  }

  const collResp = await fetch(
    `${SUPABASE_URL}/rest/v1/collections?select=*&order=id.asc`,
    { headers: HEADERS }
  );
  const collections = await collResp.json();
  if (!Array.isArray(collections)) {
    console.log("ERROR: collections is not an array:", JSON.stringify(collections).slice(0, 500));
    return;
  }
  console.log(`\n=== ALL ${collections.length} COLLECTIONS ===`);
  for (const c of collections) {
    const name = c.name_en || c.name || c.title || "unknown";
    console.log(`  ${c.slug} (id=${c.id}): ${name} - ${c.total_hadiths} hadiths, ${c.total_books} books`);
  }

  // 2. First discover books table columns
  console.log("\n=== BOOKS TABLE COLUMNS ===");
  const bSchemaResp = await fetch(
    `${SUPABASE_URL}/rest/v1/books?select=*&limit=1`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const bSchema = await bSchemaResp.json();
  if (Array.isArray(bSchema) && bSchema.length > 0) {
    console.log("Columns:", Object.keys(bSchema[0]).join(", "));
    console.log("Sample row:", JSON.stringify(bSchema[0], null, 2));
  }

  // 3. For each collection, query books
  console.log("\n=== BOOKS PER COLLECTION ===");
  for (const c of collections) {
    const name = c.name_en || c.name || c.title || "unknown";
    const booksResp = await fetch(
      `${SUPABASE_URL}/rest/v1/books?collection_id=eq.${c.id}&select=*&order=sort_order.asc&limit=3`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const books = await booksResp.json();
    
    // Get total count
    const countResp = await fetch(
      `${SUPABASE_URL}/rest/v1/books?collection_id=eq.${c.id}&select=id`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const allBooks = await countResp.json();
    const totalBooks = Array.isArray(allBooks) ? allBooks.length : 0;
    
    console.log(`\n  [${c.slug}] "${name}" (id=${c.id}): ${totalBooks} books in DB`);
    if (Array.isArray(books) && books.length > 0) {
      for (const b of books) {
        const bName = b.name_en || b.name_english || b.name || "?";
        console.log(`    #${b.sort_order}: "${bName}" (id=${b.id})`);
      }
    } else {
      console.log(`    NO BOOKS! Response:`, JSON.stringify(books).slice(0, 300));
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
