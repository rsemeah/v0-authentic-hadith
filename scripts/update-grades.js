var SB = "https://nqklipakrfuwebkdnhwg.supabase.co";
var KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
var H = { "apikey": KEY, "Authorization": "Bearer " + KEY, "Content-Type": "application/json" };

async function countGrade(collId, gradeVal) {
  var r = await fetch(SB + "/rest/v1/rpc/count_hadiths_by_grade", {
    method: "POST", headers: H,
    body: JSON.stringify({ coll_id: collId, grade_val: gradeVal })
  });
  if (r.ok) return await r.json();
  // fallback: use hadiths table with collection field  
  return -1;
}

async function countByCollection(slug, gradeVal) {
  var r = await fetch(SB + "/rest/v1/hadiths?collection=eq." + slug + "&grade=eq." + gradeVal + "&select=id", {
    headers: { ...H, "Prefer": "count=exact", "Range": "0-0" }
  });
  var c = r.headers.get("content-range");
  return c ? parseInt(c.split("/")[1]) : 0;
}

async function main() {
  var cr = await fetch(SB + "/rest/v1/collections?select=id,slug&order=slug", { headers: H });
  var colls = await cr.json();
  
  for (var i = 0; i < colls.length; i++) {
    var c = colls[i];
    var sahih = await countByCollection(c.slug, "sahih");
    var hasan = await countByCollection(c.slug, "hasan");
    var daif = await countByCollection(c.slug, "daif");
    
    var dist = { sahih: sahih, hasan: hasan, daif: daif };
    await fetch(SB + "/rest/v1/collections?id=eq." + c.id, {
      method: "PATCH", headers: H,
      body: JSON.stringify({ grade_distribution: dist })
    });
    console.log(c.slug + ": sahih=" + sahih + " hasan=" + hasan + " daif=" + daif);
  }
  console.log("Done");
}

main().catch(console.error);
