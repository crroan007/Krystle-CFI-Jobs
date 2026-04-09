// Vercel Serverless API -- all routes handled here
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const ROOT = join(process.cwd());

function readFile(rel) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf-8');
}

function readYaml(rel) {
  const raw = readFile(rel);
  if (!raw) return null;
  return yaml.load(raw);
}

function parseMarkdownTable(md) {
  if (!md) return [];
  const lines = md.split('\n').filter(l => l.trim().startsWith('|'));
  if (lines.length < 2) return [];
  const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
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

function parsePipeline(md) {
  if (!md) return { postings: [] };
  const lines = md.split('\n');
  const postings = [];
  let currentSection = '';
  for (const line of lines) {
    if (line.startsWith('## ') || line.startsWith('### ')) {
      currentSection = line.replace(/^#+\s*/, '').trim();
      continue;
    }
    const match = line.match(/^- \[([ x])\]\s*(https?:\/\/\S+)?\s*\|?\s*(.*)/);
    if (!match) continue;
    const done = match[1] === 'x';
    const url = (match[2] || '').trim();
    const rest = (match[3] || '').trim();
    const parts = rest.split('|').map(p => p.trim());
    postings.push({ done, url, school: parts[0] || '', role: parts[1] || '', detail: parts[2] || '', section: currentSection });
  }
  return { postings };
}

const handlers = {
  profile() {
    return readYaml('config/profile.yml') || { error: 'not found' };
  },
  tracker() {
    return parseMarkdownTable(readFile('data/applications.md'));
  },
  budget() {
    return readYaml('data/budget.yml') || { error: 'not found' };
  },
  schools() {
    return readYaml('config/portals.yml') || { error: 'not found' };
  },
  reports() {
    const dir = join(ROOT, 'reports');
    if (!existsSync(dir)) return [];
    return readdirSync(dir).filter(f => f.endsWith('.md')).sort().reverse().map(f => {
      const content = readFileSync(join(dir, f), 'utf-8');
      const titleMatch = content.match(/^#\s+(.+)/m);
      const scoreMatch = content.match(/Overall.*?(\d+\.?\d*)\/5/i);
      return { file: f, title: titleMatch ? titleMatch[1] : f, score: scoreMatch ? scoreMatch[1] : null };
    });
  },
  pipeline() {
    return parsePipeline(readFile('data/pipeline.md'));
  },
  'scan-history'() {
    const tsv = readFile('data/scan-history.tsv');
    if (!tsv) return [];
    const lines = tsv.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split('\t');
    return lines.slice(1).map(line => {
      const cells = line.split('\t');
      const row = {};
      headers.forEach((h, i) => { row[h] = cells[i] || ''; });
      return row;
    });
  },
  rentals() {
    return parseMarkdownTable(readFile('data/rental-rates.md'));
  },
  stats() {
    const profile = readYaml('config/profile.yml') || {};
    const budget = readYaml('data/budget.yml') || {};
    const apps = parseMarkdownTable(readFile('data/applications.md'));
    const portals = readYaml('config/portals.yml') || {};
    const hours = profile.current_hours || {};
    const schoolList = portals.tracked_schools || portals.schools || [];
    const statusCounts = {};
    apps.forEach(a => { const s = (a.Status || '').trim(); if (s) statusCounts[s] = (statusCounts[s] || 0) + 1; });
    return {
      hours: { total: hours.total || 0, target: (profile.target || {}).total_hours || 1500, remaining: (profile.target || {}).hours_remaining || 0, pic: hours.pic || 0, dual_given: hours.dual_given || 0, instrument: hours.instrument || 0, cross_country: hours.cross_country || 0, night: hours.night || 0 },
      budget: { starting_cash: budget.starting_cash || 0, living_fund: budget.living_fund || 0, flight_fund: budget.flight_fund || 0, monthly_bills: budget.monthly_bills || 0, months_remaining: budget.budget_months || 0, living_runway_months: budget.living_runway_months || 0, danger_zone: budget.danger_zone || 0 },
      applications: { total: apps.length, by_status: statusCounts },
      schools: { total: schoolList.filter(s => s.enabled !== false).length },
      candidate: { name: (profile.candidate || {}).full_name || '', email: (profile.candidate || {}).email || '', phone: (profile.candidate || {}).phone || '' },
      updated: new Date().toISOString(),
    };
  },
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  },
};

export default function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const route = url.pathname.replace('/api/', '').replace(/\/$/, '') || 'health';

  if (handlers[route]) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.end(JSON.stringify(handlers[route]()));
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'not found', route }));
}
