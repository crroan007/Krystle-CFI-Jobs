// Flight School Jobs -- Dashboard Client
// Fetches data from API and renders the dashboard

(async function () {
  'use strict';

  // ── Helpers ──────────────────────────────────────────

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function fmt(n) { return Number(n).toLocaleString(); }
  function money(n) { return '$' + Number(n).toLocaleString(); }
  function pct(n, d) { return Math.round((n / d) * 100); }

  function scoreClass(score) {
    const n = parseFloat(score);
    if (n >= 4.0) return 'score-high';
    if (n >= 3.0) return 'score-mid';
    return 'score-low';
  }

  function statusClass(status) {
    return 'status status-' + (status || '').toLowerCase().replace(/\s+/g, '');
  }

  async function fetchJSON(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  }

  // ── Load Data ────────────────────────────────────────

  const [stats, budget, schools, reports, pipeline, tracker] = await Promise.all([
    fetchJSON('/api/stats'),
    fetchJSON('/api/budget'),
    fetchJSON('/api/schools'),
    fetchJSON('/api/reports'),
    fetchJSON('/api/pipeline'),
    fetchJSON('/api/tracker'),
  ]);

  // ── Header ───────────────────────────────────────────

  if (stats) {
    $('#header-subtitle').textContent = `${stats.candidate.name} -- CFII Command Center`;
    $('#last-updated').textContent = `Updated ${new Date(stats.updated).toLocaleString()}`;
  }

  // ── Active Job Postings ──────────────────────────────

  if (pipeline && pipeline.postings) {
    // Separate into categories
    const verified = [];
    const confirm = [];
    const cold = [];
    const applied = [];
    const notPursuing = [];

    pipeline.postings.forEach(p => {
      if (!p.school) return;
      const sec = p.section.toLowerCase();
      const det = (p.detail || '').toLowerCase();
      const role = (p.role || '').toLowerCase();

      // Extract Part 61/141 tag
      if (role.includes('part 141/61') || role.includes('part 61/141')) p.partType = '141/61';
      else if (role.includes('part 141')) p.partType = '141';
      else if (role.includes('part 61')) p.partType = '61';
      else if (det.includes('part 141/61') || det.includes('part 61/141')) p.partType = '141/61';
      else if (det.includes('part 141')) p.partType = '141';
      else if (det.includes('part 61')) p.partType = '61';

      if (sec.includes('not pursuing') || sec.includes('not returning') || sec.includes('processed')) {
        notPursuing.push(p);
      } else if (det.includes('applied') || (p.done && sec.includes('verified'))) {
        applied.push(p);
      } else if (sec.includes('verified')) {
        verified.push(p);
      } else if (sec.includes('likely')) {
        confirm.push(p);
      } else if (sec.includes('cold') && sec.includes('141')) {
        p._sub = '141';
        cold.push(p);
      } else if (sec.includes('cold')) {
        cold.push(p);
      }
    });

    const liveCount = verified.length + confirm.length;
    $('#postings-count').textContent = `${liveCount} live, ${cold.length} outreach`;

    function renderPosting(p, tierLabel, tierClass, cardClass, actionClass, actionText) {
      const linkUrl = p.url || '';
      const phoneMatch = p.school.match(/\(([\d\-\s]+)\)/);

      let actionHtml;
      if (actionClass === 'action-applied') {
        actionHtml = `<span class="posting-action action-applied">${actionText}</span>`;
      } else if (linkUrl) {
        actionHtml = `<a href="${linkUrl}" target="_blank" class="posting-action ${actionClass}">${actionText}</a>`;
      } else if (phoneMatch) {
        actionHtml = `<a href="tel:${phoneMatch[1].replace(/[^\d]/g, '')}" class="posting-action ${actionClass}">${actionText}</a>`;
      } else {
        actionHtml = `<span class="posting-action ${actionClass}">${actionText}</span>`;
      }

      const partBadge = p.partType
        ? `<span class="part-badge part-${p.partType.replace('/', '')}">${p.partType.includes('/') ? 'Part 141/61' : 'Part ' + p.partType}</span>`
        : '';

      return `<div class="posting-card ${cardClass}">
        <span class="posting-tier ${tierClass}">${tierLabel}</span>
        <div class="posting-info">
          <div class="posting-school">${p.school} ${partBadge}</div>
          <div class="posting-role">${p.role}</div>
          ${p.detail ? `<div class="posting-detail">${p.detail}</div>` : ''}
        </div>
        ${actionHtml}
      </div>`;
    }

    let html = '';

    if (applied.length) {
      html += '<div class="posting-section-label">Already Applied</div>';
      html += applied.map(p => renderPosting(p, 'Applied', 'tier-applied', 'posting-applied', 'action-applied', 'Applied')).join('');
    }
    if (verified.length) {
      html += '<div class="posting-section-label">Verified Openings -- Apply Now</div>';
      html += verified.map(p => renderPosting(p, 'Verified', 'tier-verified', 'posting-verified', 'action-apply', 'Apply Now')).join('');
    }
    if (confirm.length) {
      html += '<div class="posting-section-label">Likely Hiring -- Call to Confirm</div>';
      html += confirm.map(p => renderPosting(p, 'Confirm', 'tier-likely', 'posting-likely', 'action-call', 'Call')).join('');
    }
    const cold141 = cold.filter(p => p._sub === '141' || p.partType === '141' || p.partType === '141/61');
    const cold61 = cold.filter(p => !cold141.includes(p));

    if (cold141.length) {
      html += '<div class="posting-section-label">Cold Outreach -- Part 141 Schools</div>';
      html += cold141.map(p => renderPosting(p, 'Outreach', 'tier-cold', 'posting-cold', 'action-call', 'Call')).join('');
    }
    if (cold61.length) {
      html += '<div class="posting-section-label">Cold Outreach -- Part 61 Schools</div>';
      html += cold61.map(p => renderPosting(p, 'Outreach', 'tier-cold', 'posting-cold', 'action-call', 'Call')).join('');
    }

    $('#postings-list').innerHTML = html || '<div class="empty-state">No postings in pipeline yet.</div>';
  }

  // ── Hero: Hours ──────────────────────────────────────

  if (stats && stats.hours) {
    const h = stats.hours;
    const p = pct(h.total, h.target);
    $('#hours-display').textContent = `${fmt(h.total)} / ${fmt(h.target)}`;
    $('#hours-bar').style.width = p + '%';
    $('#hours-remaining').textContent = `${fmt(h.remaining)} hours remaining`;
    $('#hours-pct').textContent = p + '%';

    // Hour breakdown grid
    const items = [
      { label: 'PIC', val: h.pic },
      { label: 'Dual Given', val: h.dual_given },
      { label: 'Instrument', val: h.instrument },
      { label: 'Cross-Country', val: h.cross_country },
      { label: 'Night', val: h.night },
      { label: 'Total', val: h.total },
    ];
    $('#hour-grid').innerHTML = items.map(i => `
      <div class="hour-item">
        <div class="hour-val">${fmt(i.val)}</div>
        <div class="hour-label">${i.label}</div>
      </div>
    `).join('');
  }

  // ── Hero: Living Fund + Flight Fund ─────────────────

  if (stats && stats.budget) {
    const b = stats.budget;
    const livingFund = b.living_fund || b.starting_cash;
    const flightFund = b.flight_fund || 0;
    const livingMonths = Math.floor(livingFund / b.monthly_bills);
    const livingPct = Math.min(100, pct(livingFund, b.starting_cash));

    $('#living-display').textContent = money(livingFund);
    $('#living-bar').style.width = livingPct + '%';
    $('#living-bills').textContent = `${money(b.monthly_bills)}/mo bills`;
    $('#living-months').textContent = `~${livingMonths} months runway`;

    // Flight Fund
    const rentalRate = 75;
    const rentalHrs = Math.floor(flightFund / rentalRate);
    const flightPct = Math.min(100, pct(flightFund, b.starting_cash));

    $('#flight-display').textContent = money(flightFund);
    $('#flight-bar').style.width = flightPct + '%';
    $('#flight-hours').textContent = `${fmt(rentalHrs)} rental hrs @ $${rentalRate}`;
    $('#flight-pct').textContent = 'earmarked';
  }

  // ── Quick Stats ──────────────────────────────────────

  if (stats) {
    $('#stat-apps').textContent = stats.applications.total;
    $('#stat-schools').textContent = stats.schools.total;
    $('#stat-interviews').textContent = stats.applications.by_status['Interview'] || 0;
  }
  if (reports) {
    $('#stat-reports').textContent = reports.length;
  }

  // ── Applications Table ───────────────────────────────

  if (tracker && tracker.length > 0) {
    $('#apps-body').innerHTML = tracker.map(row => {
      const score = row['Score'] || '';
      const status = row['Status'] || '';
      return `<tr>
        <td>${row['#'] || ''}</td>
        <td>${row['Date'] || ''}</td>
        <td><strong>${row['Company'] || ''}</strong></td>
        <td>${row['Role'] || ''}</td>
        <td><span class="${statusClass(status)}">${status}</span></td>
        <td><span class="score ${scoreClass(score)}">${score}</span></td>
        <td>${row['Report'] || ''}</td>
        <td>${row['Notes'] || ''}</td>
      </tr>`;
    }).join('');
  }

  // ── Budget Scenarios ─────────────────────────────────

  if (budget && budget.scenarios) {
    const best = budget.scenarios.reduce((a, b) =>
      (b.ending_cash || 0) > (a.ending_cash || 0) ? b : a
    );
    const worst = budget.scenarios.reduce((a, b) =>
      (b.ending_cash || Infinity) < (a.ending_cash || Infinity) ? b : a
    );

    $('#scenarios-body').innerHTML = budget.scenarios.map(s => {
      let cls = '';
      if (s.name === best.name) cls = 'scenario-best';
      else if (s.name === worst.name) cls = 'scenario-worst';
      return `<tr class="${cls}">
        <td><strong>${s.name}</strong></td>
        <td>${money(s.monthly_net)}/mo</td>
        <td>${s.months_to_300_hours || s.months_to_330_hours || '--'} mo</td>
        <td><strong>${money(s.ending_cash)}</strong></td>
        <td>${s.projected_atp_date || '--'}</td>
        <td>${s.verdict || ''}</td>
      </tr>`;
    }).join('');
  }

  // ── Schools Directory ────────────────────────────────

  let allSchools = [];
  const schoolArray = schools ? (schools.tracked_schools || schools.schools || []) : [];
  if (schoolArray.length > 0) {
    allSchools = schoolArray.filter(s => s.enabled !== false);
    renderSchools(allSchools);
    $('#schools-count').textContent = allSchools.length + ' schools';

    // Filters
    $$('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const maxDist = parseInt(btn.dataset.filter);
        if (isNaN(maxDist)) {
          renderSchools(allSchools);
        } else {
          renderSchools(allSchools.filter(s => (s.distance_min || 99) <= maxDist));
        }
      });
    });
  }

  function renderSchools(list) {
    if (list.length === 0) {
      $('#schools-grid').innerHTML = '<div class="empty-state">No schools match this filter.</div>';
      return;
    }
    $('#schools-grid').innerHTML = list.map(s => {
      const tags = [];
      if (s.airport) tags.push(`<span class="school-tag airport">${s.airport}</span>`);
      if (s.distance_min) tags.push(`<span class="school-tag distance">${s.distance_min} min</span>`);
      if (s.pay) tags.push(`<span class="school-tag pay">${s.pay}</span>`);
      if (s.type) tags.push(`<span class="school-tag">${s.type}</span>`);

      const contacts = [];
      if (s.phone) contacts.push(s.phone);
      if (s.email) contacts.push(`<a href="mailto:${s.email}">${s.email}</a>`);
      if (s.careers_url) contacts.push(`<a href="${s.careers_url}" target="_blank">Careers page</a>`);

      return `<div class="school-card" data-dist="${s.distance_min || 99}">
        <div class="school-name">${s.name || 'Unknown'}</div>
        <div class="school-meta">${tags.join('')}</div>
        ${s.fleet ? `<div style="font-size:12px;color:var(--gray-600)">Fleet: ${Array.isArray(s.fleet) ? s.fleet.join(', ') : s.fleet}</div>` : ''}
        ${s.notes ? `<div style="font-size:12px;color:var(--gray-600);font-style:italic">${s.notes}</div>` : ''}
        <div class="school-contact">${contacts.join(' &middot; ')}</div>
      </div>`;
    }).join('');
  }

  // ── Reports ──────────────────────────────────────────

  if (reports && reports.length > 0) {
    $('#reports-list').innerHTML = reports.map(r => {
      const sc = r.score ? parseFloat(r.score) : null;
      return `<div class="report-item">
        <div class="report-score ${sc ? scoreClass(sc) : ''}">${sc ? sc.toFixed(1) : '--'}</div>
        <div class="report-info">
          <div class="report-title">${r.title}</div>
          <div class="report-file">${r.file}</div>
        </div>
      </div>`;
    }).join('');
  }

  // ── Auto-refresh every 60 seconds ────────────────────
  setInterval(() => location.reload(), 60000);

})();
