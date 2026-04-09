// Flight School Jobs -- Web Dashboard Server
// Serves the dashboard UI and API endpoints that read from data files

import express from 'express';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(join(__dirname, 'public')));

// ── Helpers ──────────────────────────────────────────────────

function readFile(rel) {
  const p = join(__dirname, rel);
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf-8');
}

function readYaml(rel) {
  const raw = readFile(rel);
  if (!raw) return null;
  return yaml.load(raw);
}

/** Parse a markdown table into an array of objects */
function parseMarkdownTable(md) {
  if (!md) return [];
  const lines = md.split('\n').filter(l => l.trim().startsWith('|'));
  if (lines.length < 2) return [];

  const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
  // skip separator line (index 1)
  const rows = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = lines[i].split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length === 0 || cells.every(c => c === '')) continue;
    const row = {};
    headers.forEach((h, idx) => { row[h] = cells[idx] || ''; });
    rows.push(row);
  }
  return rows;
}

// ── API Routes ───────────────────────────────────────────────

// Profile & hours
app.get('/api/profile', (_req, res) => {
  const profile = readYaml('config/profile.yml');
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json(profile);
});

// Applications tracker
app.get('/api/tracker', (_req, res) => {
  const md = readFile('data/applications.md');
  const rows = parseMarkdownTable(md);
  res.json(rows);
});

// Budget data
app.get('/api/budget', (_req, res) => {
  const budget = readYaml('data/budget.yml');
  if (!budget) return res.status(404).json({ error: 'Budget not found' });
  res.json(budget);
});

// Schools / portals
app.get('/api/schools', (_req, res) => {
  const portals = readYaml('config/portals.yml');
  if (!portals) return res.status(404).json({ error: 'Portals not found' });
  res.json(portals);
});

// Reports list
app.get('/api/reports', (_req, res) => {
  const dir = join(__dirname, 'reports');
  if (!existsSync(dir)) return res.json([]);
  const files = readdirSync(dir).filter(f => f.endsWith('.md')).sort().reverse();
  const reports = files.map(f => {
    const content = readFileSync(join(dir, f), 'utf-8');
    const titleMatch = content.match(/^#\s+(.+)/m);
    const scoreMatch = content.match(/Overall.*?(\d+\.?\d*)\/5/i);
    const urlMatch = content.match(/\*\*URL:\*\*\s*(.+)/i);
    return {
      file: f,
      title: titleMatch ? titleMatch[1] : f,
      score: scoreMatch ? scoreMatch[1] : null,
      url: urlMatch ? urlMatch[1].trim() : null,
    };
  });
  res.json(reports);
});

// Read a specific report
app.get('/api/reports/:file', (req, res) => {
  const p = join(__dirname, 'reports', req.params.file);
  if (!existsSync(p)) return res.status(404).json({ error: 'Report not found' });
  res.type('text/markdown').send(readFileSync(p, 'utf-8'));
});

// Pipeline
app.get('/api/pipeline', (_req, res) => {
  const md = readFile('data/pipeline.md');
  res.json({ raw: md });
});

// Scan history
app.get('/api/scan-history', (_req, res) => {
  const tsv = readFile('data/scan-history.tsv');
  if (!tsv) return res.json([]);
  const lines = tsv.trim().split('\n');
  if (lines.length < 2) return res.json([]);
  const headers = lines[0].split('\t');
  const rows = lines.slice(1).map(line => {
    const cells = line.split('\t');
    const row = {};
    headers.forEach((h, i) => { row[h] = cells[i] || ''; });
    return row;
  });
  res.json(rows);
});

// Rental rates
app.get('/api/rentals', (_req, res) => {
  const md = readFile('data/rental-rates.md');
  const rows = parseMarkdownTable(md);
  res.json(rows);
});

// Aggregate stats
app.get('/api/stats', (_req, res) => {
  const profile = readYaml('config/profile.yml') || {};
  const budget = readYaml('data/budget.yml') || {};
  const appsMd = readFile('data/applications.md');
  const apps = parseMarkdownTable(appsMd);
  const portals = readYaml('config/portals.yml') || {};

  const hours = profile.current_hours || {};
  const schoolList = portals.tracked_schools || portals.schools || [];
  const totalSchools = schoolList.filter(s => s.enabled !== false).length;

  const statusCounts = {};
  apps.forEach(a => {
    const s = (a.Status || '').trim();
    if (s) statusCounts[s] = (statusCounts[s] || 0) + 1;
  });

  res.json({
    hours: {
      total: hours.total || 0,
      target: (profile.target || {}).total_hours || 1500,
      remaining: (profile.target || {}).hours_remaining || 0,
      pic: hours.pic || 0,
      dual_given: hours.dual_given || 0,
      instrument: hours.instrument || 0,
      cross_country: hours.cross_country || 0,
      night: hours.night || 0,
    },
    budget: {
      starting_cash: budget.starting_cash || 0,
      monthly_bills: budget.monthly_bills || 0,
      months_remaining: budget.budget_months || 0,
      danger_zone: budget.danger_zone || 0,
    },
    applications: {
      total: apps.length,
      by_status: statusCounts,
    },
    schools: {
      total: totalSchools,
    },
    candidate: {
      name: (profile.candidate || {}).full_name || '',
      email: (profile.candidate || {}).email || '',
      phone: (profile.candidate || {}).phone || '',
    },
    updated: new Date().toISOString(),
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback
app.get('/{*splat}', (_req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  Flight School Jobs Dashboard`);
  console.log(`  http://localhost:${PORT}\n`);
});
