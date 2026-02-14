import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('scripts/067-seed-365-sunnah-batch2.sql', 'utf-8');

// Remove "difficulty, " from the INSERT column list
let fixed = content.replace(
  /INSERT INTO sunnah_practices \(title, description, category_id, hadith_ref, difficulty, day_of_year\)/g,
  'INSERT INTO sunnah_practices (title, description, category_id, hadith_ref, day_of_year)'
);

// Remove the difficulty values ('easy', / 'intermediate', / 'advanced', ) from each row
// Pattern: after the hadith_ref string, remove ', 'easy'|'intermediate'|'advanced''
fixed = fixed.replace(/, '(?:easy|intermediate|advanced)',/g, ',');

writeFileSync('scripts/067-seed-365-sunnah-batch2.sql', fixed, 'utf-8');

console.log('[v0] Fixed sunnah batch 2 - removed difficulty column and values');
