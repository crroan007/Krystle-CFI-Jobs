#!/usr/bin/env node
/**
 * dedup-tracker.mjs -- Remove duplicate entries from applications.md
 *
 * Duplicates: same school (normalized) + same role (fuzzy match)
 * Keeps the entry with the higher score.
 *
 * Run: node dedup-tracker.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const PROJECT_ROOT = dirname(fileURLToPath(import.meta.url));
const APPS_FILE = join(PROJECT_ROOT, 'data/applications.md');
const DRY_RUN = process.argv.includes('--dry-run');

function normalizeCompany(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseScore(s) {
  const m = s.replace(/\*\*/g, '').match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : 0;
}

if (!existsSync(APPS_FILE)) {
  console.log('No applications.md found.');
  process.exit(0);
}

const content = readFileSync(APPS_FILE, 'utf-8');
const lines = content.split('\n');
const seen = new Map(); // key -> { lineIdx, score }
let removed = 0;
const toRemove = new Set();

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.startsWith('|') || line.includes('---') || line.includes('Company')) continue;

  const parts = line.split('|').map(s => s.trim());
  if (parts.length < 9) continue;
  const num = parseInt(parts[1]);
  if (isNaN(num)) continue;

  const key = normalizeCompany(parts[3]) + '|' + parts[4].toLowerCase().trim();
  const score = parseScore(parts[5]);

  if (seen.has(key)) {
    const existing = seen.get(key);
    if (score > existing.score) {
      // Remove the older one, keep this one
      toRemove.add(existing.lineIdx);
      seen.set(key, { lineIdx: i, score });
      console.log(`  Remove #${existing.num} (${existing.score}), keep newer #${num} (${score}): ${parts[3]}`);
    } else {
      // Remove this one
      toRemove.add(i);
      console.log(`  Remove #${num} (${score}), keep existing (${existing.score}): ${parts[3]}`);
    }
    removed++;
  } else {
    seen.set(key, { lineIdx: i, score, num });
  }
}

if (removed === 0) {
  console.log('No duplicates found.');
  process.exit(0);
}

const newLines = lines.filter((_, i) => !toRemove.has(i));

if (!DRY_RUN) {
  writeFileSync(APPS_FILE, newLines.join('\n'));
  console.log(`\nRemoved ${removed} duplicates.`);
} else {
  console.log(`\nWould remove ${removed} duplicates (dry-run).`);
}
