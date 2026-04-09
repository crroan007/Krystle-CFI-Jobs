#!/usr/bin/env node
/**
 * doctor.mjs -- System diagnostics for flight-school-jobs
 *
 * Checks system health: required files, dependencies, data integrity.
 * Run: node doctor.mjs
 */

import { existsSync, readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const PROJECT_ROOT = dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0, warn = 0;

function check(label, condition) {
  if (condition) { console.log(`  [PASS] ${label}`); pass++; }
  else { console.log(`  [FAIL] ${label}`); fail++; }
}

function warning(label) { console.log(`  [WARN] ${label}`); warn++; }

console.log('Flight School Jobs -- System Diagnostics');
console.log('========================================\n');

// --- Required Files ---
console.log('Required Files:');
const requiredFiles = [
  '.claude/skills/flight-school-jobs/SKILL.md',
  'CLAUDE.md',
  'config/profile.yml',
  'config/portals.yml',
  'modes/_shared.md',
  'modes/_profile.md',
  'modes/scan.md',
  'modes/evaluate.md',
  'modes/pipeline.md',
  'modes/tracker.md',
  'modes/contact.md',
  'modes/pdf.md',
  'modes/apply.md',
  'modes/deep.md',
  'modes/compare.md',
  'modes/budget.md',
  'data/applications.md',
  'data/pipeline.md',
  'data/scan-history.tsv',
  'data/budget.yml',
  'data/rental-rates.md',
  'templates/cv-template.html',
  'templates/states.yml',
  'generate-pdf.mjs',
  'merge-tracker.mjs',
  'verify-pipeline.mjs',
  'dedup-tracker.mjs',
  'package.json',
];

for (const file of requiredFiles) {
  check(file, existsSync(join(PROJECT_ROOT, file)));
}

// --- CV Check ---
console.log('\nResume:');
const cvPath = join(PROJECT_ROOT, 'cv.md');
if (existsSync(cvPath)) {
  const cvContent = readFileSync(cvPath, 'utf-8');
  const cvSize = statSync(cvPath).size;
  check(`cv.md exists (${cvSize} bytes)`, true);
  if (cvSize < 100) warning('cv.md is very small -- may need content');
} else {
  check('cv.md exists', false);
}

// --- Profile Check ---
console.log('\nProfile:');
const profilePath = join(PROJECT_ROOT, 'config/profile.yml');
if (existsSync(profilePath)) {
  const content = readFileSync(profilePath, 'utf-8');
  check('profile.yml has candidate name', content.includes('full_name'));
  check('profile.yml has certifications', content.includes('CFII'));
  check('profile.yml has current hours', content.includes('total:'));
  if (content.includes('full_name: "Krystle"') && !content.match(/full_name: "Krystle \w/)) {
    warning('profile.yml: last name not filled in');
  }
}

// --- Dependencies ---
console.log('\nDependencies:');
const nmPath = join(PROJECT_ROOT, 'node_modules');
check('node_modules exists', existsSync(nmPath));
if (existsSync(nmPath)) {
  check('playwright installed', existsSync(join(nmPath, 'playwright')));
}

try {
  const nodeVer = execSync('node --version', { encoding: 'utf-8' }).trim();
  check(`Node.js ${nodeVer}`, true);
} catch {
  check('Node.js available', false);
}

// --- Data Integrity ---
console.log('\nData Integrity:');
const appsPath = join(PROJECT_ROOT, 'data/applications.md');
if (existsSync(appsPath)) {
  const content = readFileSync(appsPath, 'utf-8');
  const dataLines = content.split('\n').filter(l =>
    l.startsWith('|') && !l.includes('---') && !l.includes('Company')
  );
  const entryCount = dataLines.filter(l => {
    const parts = l.split('|');
    return parts.length >= 9 && !isNaN(parseInt(parts[1]));
  }).length;
  console.log(`  Applications tracked: ${entryCount}`);
}

const histPath = join(PROJECT_ROOT, 'data/scan-history.tsv');
if (existsSync(histPath)) {
  const lines = readFileSync(histPath, 'utf-8').trim().split('\n');
  console.log(`  Scan history entries: ${Math.max(0, lines.length - 1)}`);
}

const pipePath = join(PROJECT_ROOT, 'data/pipeline.md');
if (existsSync(pipePath)) {
  const content = readFileSync(pipePath, 'utf-8');
  const pending = (content.match(/- \[ \]/g) || []).length;
  console.log(`  Pipeline pending: ${pending}`);
}

// --- Portals ---
console.log('\nPortal Configuration:');
const portalsPath = join(PROJECT_ROOT, 'config/portals.yml');
if (existsSync(portalsPath)) {
  const content = readFileSync(portalsPath, 'utf-8');
  const schoolCount = (content.match(/- name:/g) || []).length;
  const enabledCount = (content.match(/enabled: true/g) || []).length;
  console.log(`  Schools configured: ${schoolCount}`);
  console.log(`  Schools enabled: ${enabledCount}`);
}

// --- Summary ---
console.log(`\n========================================`);
console.log(`Results: ${pass} passed, ${fail} failed, ${warn} warnings`);
if (fail > 0) {
  console.log('\nFix failed checks before using the system.');
  process.exit(1);
} else {
  console.log('\nSystem is healthy.');
}
