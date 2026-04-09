#!/usr/bin/env node
/**
 * merge-tracker.mjs -- Merge batch tracker additions into applications.md
 *
 * Handles 9-col TSV and pipe-delimited formats.
 * Dedup: school normalized + role fuzzy match + report number match
 * If duplicate with higher score -> update in-place
 *
 * Run: node merge-tracker.mjs [--dry-run] [--verify]
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, renameSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const PROJECT_ROOT = dirname(fileURLToPath(import.meta.url));
const APPS_FILE = join(PROJECT_ROOT, 'data/applications.md');
const ADDITIONS_DIR = join(PROJECT_ROOT, 'batch/tracker-additions');
const MERGED_DIR = join(ADDITIONS_DIR, 'merged');
const DRY_RUN = process.argv.includes('--dry-run');
const VERIFY = process.argv.includes('--verify');

const CANONICAL_STATES = ['Evaluated', 'Applied', 'Contacted', 'Responded', 'Interview', 'Offer', 'Hired', 'Rejected', 'Passed', 'SKIP'];

function validateStatus(status) {
  const clean = status.replace(/\*\*/g, '').trim();
  for (const valid of CANONICAL_STATES) {
    if (valid.toLowerCase() === clean.toLowerCase()) return valid;
  }
  console.warn(`  Non-canonical status "${status}" -> defaulting to "Evaluated"`);
  return 'Evaluated';
}

function normalizeCompany(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function roleFuzzyMatch(a, b) {
  const wordsA = a.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const wordsB = b.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const overlap = wordsA.filter(w => wordsB.some(wb => wb.includes(w) || w.includes(wb)));
  return overlap.length >= 2;
}

function extractReportNum(reportStr) {
  const m = reportStr.match(/\[(\d+)\]/);
  return m ? parseInt(m[1]) : null;
}

function parseScore(s) {
  const m = s.replace(/\*\*/g, '').match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : 0;
}

function parseAppLine(line) {
  const parts = line.split('|').map(s => s.trim());
  if (parts.length < 9) return null;
  const num = parseInt(parts[1]);
  if (isNaN(num) || num === 0) return null;
  return {
    num, date: parts[2], company: parts[3], role: parts[4],
    score: parts[5], status: parts[6], pdf: parts[7], report: parts[8],
    notes: parts[9] || '', raw: line,
  };
}

function parseTsvContent(content, filename) {
  content = content.trim();
  if (!content) return null;

  let parts;

  if (content.startsWith('|')) {
    parts = content.split('|').map(s => s.trim()).filter(Boolean);
    if (parts.length < 8) { console.warn(`  Skipping malformed ${filename}`); return null; }
    return {
      num: parseInt(parts[0]), date: parts[1], company: parts[2], role: parts[3],
      score: parts[4], status: validateStatus(parts[5]),
      pdf: parts[6], report: parts[7], notes: parts[8] || '',
    };
  }

  parts = content.split('\t');
  if (parts.length < 8) { console.warn(`  Skipping malformed TSV ${filename}`); return null; }

  // TSV format: num, date, school, role, status, score, pdf, report, notes
  return {
    num: parseInt(parts[0]), date: parts[1], company: parts[2], role: parts[3],
    status: validateStatus(parts[4]), score: parts[5],
    pdf: parts[6], report: parts[7], notes: parts[8] || '',
  };
}

// ---- Main ----

if (!existsSync(APPS_FILE)) {
  console.log('No applications.md found.');
  process.exit(0);
}

const appContent = readFileSync(APPS_FILE, 'utf-8');
const appLines = appContent.split('\n');
const existingApps = [];
let maxNum = 0;

for (const line of appLines) {
  if (line.startsWith('|') && !line.includes('---') && !line.includes('Company') && !line.includes('Score')) {
    const app = parseAppLine(line);
    if (app) {
      existingApps.push(app);
      if (app.num > maxNum) maxNum = app.num;
    }
  }
}

console.log(`Existing: ${existingApps.length} entries, max #${maxNum}`);

if (!existsSync(ADDITIONS_DIR)) {
  console.log('No tracker-additions directory found.');
  process.exit(0);
}

const tsvFiles = readdirSync(ADDITIONS_DIR).filter(f => f.endsWith('.tsv'));
if (tsvFiles.length === 0) {
  console.log('No pending additions to merge.');
  process.exit(0);
}

tsvFiles.sort((a, b) => {
  const numA = parseInt(a.replace(/\D/g, '')) || 0;
  const numB = parseInt(b.replace(/\D/g, '')) || 0;
  return numA - numB;
});

console.log(`Found ${tsvFiles.length} pending additions`);

let added = 0, updated = 0, skipped = 0;
const newLines = [];

for (const file of tsvFiles) {
  const content = readFileSync(join(ADDITIONS_DIR, file), 'utf-8').trim();
  const addition = parseTsvContent(content, file);
  if (!addition) { skipped++; continue; }

  const reportNum = extractReportNum(addition.report);
  let duplicate = null;

  if (reportNum) {
    duplicate = existingApps.find(app => extractReportNum(app.report) === reportNum);
  }
  if (!duplicate) {
    duplicate = existingApps.find(app => app.num === addition.num);
  }
  if (!duplicate) {
    const normCompany = normalizeCompany(addition.company);
    duplicate = existingApps.find(app =>
      normalizeCompany(app.company) === normCompany && roleFuzzyMatch(addition.role, app.role)
    );
  }

  if (duplicate) {
    const newScore = parseScore(addition.score);
    const oldScore = parseScore(duplicate.score);
    if (newScore > oldScore) {
      console.log(`  Update: #${duplicate.num} ${addition.company} (${oldScore} -> ${newScore})`);
      const lineIdx = appLines.indexOf(duplicate.raw);
      if (lineIdx >= 0) {
        appLines[lineIdx] = `| ${duplicate.num} | ${addition.date} | ${addition.company} | ${addition.role} | ${addition.score} | ${duplicate.status} | ${duplicate.pdf} | ${addition.report} | Re-eval ${addition.date}. ${addition.notes} |`;
        updated++;
      }
    } else {
      console.log(`  Skip: ${addition.company} (existing ${oldScore} >= new ${newScore})`);
      skipped++;
    }
  } else {
    const entryNum = addition.num > maxNum ? addition.num : ++maxNum;
    if (addition.num > maxNum) maxNum = addition.num;
    newLines.push(`| ${entryNum} | ${addition.date} | ${addition.company} | ${addition.role} | ${addition.score} | ${addition.status} | ${addition.pdf} | ${addition.report} | ${addition.notes} |`);
    added++;
    console.log(`  Add #${entryNum}: ${addition.company} -- ${addition.role} (${addition.score})`);
  }
}

if (newLines.length > 0) {
  let insertIdx = -1;
  for (let i = 0; i < appLines.length; i++) {
    if (appLines[i].includes('---') && appLines[i].startsWith('|')) {
      insertIdx = i + 1;
      break;
    }
  }
  if (insertIdx >= 0) appLines.splice(insertIdx, 0, ...newLines);
}

if (!DRY_RUN) {
  writeFileSync(APPS_FILE, appLines.join('\n'));
  if (!existsSync(MERGED_DIR)) mkdirSync(MERGED_DIR, { recursive: true });
  for (const file of tsvFiles) {
    renameSync(join(ADDITIONS_DIR, file), join(MERGED_DIR, file));
  }
  console.log(`Moved ${tsvFiles.length} TSVs to merged/`);
}

console.log(`\nSummary: +${added} added, ${updated} updated, ${skipped} skipped`);
if (DRY_RUN) console.log('(dry-run -- no changes written)');

if (VERIFY && !DRY_RUN) {
  console.log('\n--- Running verification ---');
  const { execSync } = await import('child_process');
  try {
    execSync(`node ${join(PROJECT_ROOT, 'verify-pipeline.mjs')}`, { stdio: 'inherit' });
  } catch (e) {
    process.exit(1);
  }
}
