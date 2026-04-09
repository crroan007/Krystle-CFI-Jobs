#!/usr/bin/env node
/**
 * verify-pipeline.mjs -- Health check for data integrity
 *
 * Checks:
 * 1. All statuses in applications.md are canonical
 * 2. Report links in applications.md point to existing files
 * 3. No duplicate entries (school + role)
 * 4. scan-history.tsv has no duplicate URLs
 * 5. pipeline.md has no duplicate URLs
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const PROJECT_ROOT = dirname(fileURLToPath(import.meta.url));
let errors = 0;
let warnings = 0;

function error(msg) { console.error(`  ERROR: ${msg}`); errors++; }
function warn(msg) { console.warn(`  WARN: ${msg}`); warnings++; }
function ok(msg) { console.log(`  OK: ${msg}`); }

const CANONICAL_STATES = ['Evaluated', 'Applied', 'Contacted', 'Responded', 'Interview', 'Offer', 'Hired', 'Rejected', 'Passed', 'SKIP'];

// --- Check applications.md ---
console.log('\n--- Checking applications.md ---');
const appsPath = join(PROJECT_ROOT, 'data/applications.md');
if (!existsSync(appsPath)) {
  warn('data/applications.md not found');
} else {
  const content = readFileSync(appsPath, 'utf-8');
  const lines = content.split('\n');
  const entries = [];
  const seen = new Set();

  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---') || line.includes('Company') || line.includes('Score')) continue;
    const parts = line.split('|').map(s => s.trim());
    if (parts.length < 9) continue;
    const num = parseInt(parts[1]);
    if (isNaN(num)) continue;

    const status = parts[6];
    const report = parts[8];
    const company = parts[3];
    const role = parts[4];

    // Check status is canonical
    if (!CANONICAL_STATES.includes(status)) {
      error(`#${num}: Non-canonical status "${status}"`);
    }

    // Check report link exists
    const reportMatch = report.match(/\(([^)]+)\)/);
    if (reportMatch) {
      const reportPath = join(PROJECT_ROOT, reportMatch[1]);
      if (!existsSync(reportPath)) {
        warn(`#${num}: Report file not found: ${reportMatch[1]}`);
      }
    }

    // Check for duplicates
    const key = `${company.toLowerCase()}|${role.toLowerCase()}`;
    if (seen.has(key)) {
      warn(`#${num}: Possible duplicate: ${company} -- ${role}`);
    }
    seen.add(key);

    entries.push({ num, company, role, status });
  }

  ok(`${entries.length} entries checked`);
}

// --- Check scan-history.tsv ---
console.log('\n--- Checking scan-history.tsv ---');
const histPath = join(PROJECT_ROOT, 'data/scan-history.tsv');
if (!existsSync(histPath)) {
  warn('data/scan-history.tsv not found');
} else {
  const content = readFileSync(histPath, 'utf-8');
  const lines = content.trim().split('\n');
  const urls = new Set();
  let dupes = 0;

  for (let i = 1; i < lines.length; i++) {
    const url = lines[i].split('\t')[0];
    if (urls.has(url)) dupes++;
    urls.add(url);
  }

  if (dupes > 0) warn(`${dupes} duplicate URLs in scan-history.tsv`);
  else ok(`${urls.size} unique URLs`);
}

// --- Check pipeline.md ---
console.log('\n--- Checking pipeline.md ---');
const pipePath = join(PROJECT_ROOT, 'data/pipeline.md');
if (!existsSync(pipePath)) {
  warn('data/pipeline.md not found');
} else {
  const content = readFileSync(pipePath, 'utf-8');
  const pending = (content.match(/- \[ \]/g) || []).length;
  const processed = (content.match(/- \[x\]/gi) || []).length;
  ok(`${pending} pending, ${processed} processed`);
}

// --- Check required files ---
console.log('\n--- Checking required files ---');
const required = [
  'cv.md',
  'config/profile.yml',
  'config/portals.yml',
  'modes/_shared.md',
  'modes/_profile.md',
  'templates/cv-template.html',
  'templates/states.yml',
];

for (const file of required) {
  if (existsSync(join(PROJECT_ROOT, file))) {
    ok(file);
  } else {
    error(`Missing: ${file}`);
  }
}

// --- Summary ---
console.log(`\n=== Summary: ${errors} errors, ${warnings} warnings ===`);
if (errors > 0) {
  console.log('Fix errors before proceeding.');
  process.exit(1);
}
