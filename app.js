/* ============================================================
   Obsidian Atelier — site logic
   ============================================================ */

/* ---------- Form delivery config ----------
   Inquiries are emailed to RECIPIENT.
   • Preferred: paste a Web3Forms access key (free, get it at https://web3forms.com
     using stockmarkettd@gmail.com). When set, Web3Forms is used.
   • Fallback (no key): FormSubmit.co AJAX endpoint. The very first submission sends
     a one-time activation email to RECIPIENT; click it and all later inquiries arrive. */
const CONFIG = {
  RECIPIENT: 'stockmarkettd@gmail.com',
  WEB3FORMS_ACCESS_KEY: '', // e.g. 'a1b2c3d4-....'
  SUBJECT: 'New Cabinetry Inquiry — Obsidian Atelier'
};

/* ---------- Optional generated imagery ----------
   Drop Higgsfield renders at these paths and they replace the vector renders automatically. */
const STAGE_IMAGES = [
  'assets/stage-1-blueprint.jpg',
  'assets/stage-2-cgi-build.jpg',
  'assets/stage-3-reality.jpg'
];

const STAGES = [
  { label: 'BLUEPRINT', title: 'Holographic CAD Blueprint', text: 'Every panel modelled and dimensioned before a single cut.' },
  { label: '3D BUILD', title: 'CGI Assembly Preview', text: 'Dark oak and titanium frames dry-fitted against laser datum lines.' },
  { label: 'REALITY', title: 'The Finished Space', text: 'Ambient LED channels, touch hardware and honed quartz, delivered.' }
];

/* ============================================================
   Parametric cabinet renderer (SVG, 800×500 elevation)
   ============================================================ */
const LAYOUTS = {
  kitchen: {
    floor: 380,
    panels: [
      ...[0, 1, 2, 3].map(i => ({ x: 90 + i * 95, y: 80, w: 95, h: 120, kind: 'door', hinge: i % 2 ? 'r' : 'l' })),
      ...[0, 1, 2, 3].map(i => ({ x: 90 + i * 95, y: 292, w: 95, h: 88, kind: i === 1 || i === 2 ? 'drawer' : 'door', hinge: i % 2 ? 'r' : 'l' })),
      { x: 520, y: 80, w: 90, h: 300, kind: 'tall', hinge: 'l' },
      { x: 610, y: 80, w: 90, h: 300, kind: 'tall', hinge: 'r' }
    ],
    counters: [{ x: 80, y: 278, w: 400, h: 14 }],
    backsplash: { x: 90, y: 200, w: 380, h: 78 },
    led: [{ x: 92, w: 376, y: 201 }],
    toe: [{ x: 90, w: 380 }, { x: 520, w: 180 }]
  },
  suite: {
    floor: 380,
    panels: [
      ...[0, 1, 2].map(i => ({ x: 80 + i * 213.3, y: 90, w: 213.3, h: 70, kind: 'flap' })),
      ...[0, 1, 2, 3, 4, 5].map(i => ({ x: 80 + i * 106.6, y: 292, w: 106.6, h: 88, kind: i % 2 ? 'drawer' : 'door', hinge: 'l' }))
    ],
    counters: [{ x: 70, y: 278, w: 660, h: 14 }],
    backsplash: { x: 80, y: 160, w: 640, h: 118 },
    led: [{ x: 82, w: 636, y: 161 }],
    toe: [{ x: 80, w: 640 }]
  },
  entry: {
    floor: 380,
    panels: [
      { x: 110, y: 60, w: 100, h: 320, kind: 'tall', hinge: 'l' },
      { x: 210, y: 60, w: 100, h: 320, kind: 'tall', hinge: 'r' },
      ...[0, 1, 2].map(i => ({ x: 320 + i * 73.3, y: 60, w: 73.3, h: 100, kind: 'cubby' })),
      { x: 320, y: 300, w: 220, h: 80, kind: 'drawer' },
      { x: 550, y: 60, w: 130, h: 320, kind: 'tall', hinge: 'r' }
    ],
    counters: [{ x: 316, y: 288, w: 228, h: 12, soft: true }],
    backsplash: { x: 320, y: 160, w: 220, h: 128, hooks: true },
    led: [{ x: 322, w: 216, y: 161 }],
    toe: [{ x: 110, w: 570 }]
  },
  locker: {
    floor: 380,
    panels: [
      ...[0, 1, 2, 3, 4].map(i => ({ x: 120 + i * 112, y: 60, w: 112, h: 70, kind: 'flap' })),
      ...[0, 1, 2, 3, 4].map(i => ({ x: 120 + i * 112, y: 310, w: 112, h: 70, kind: 'drawer' }))
    ],
    counters: [{ x: 116, y: 298, w: 568, h: 12, soft: true }],
    backsplash: { x: 120, y: 130, w: 560, h: 168, hooks: true, dividers: 5 },
    led: [{ x: 122, w: 556, y: 131 }],
    toe: [{ x: 120, w: 560 }]
  }
};

let uidSeq = 0;
function renderCabinet(layoutKey, mode) {
  const L = LAYOUTS[layoutKey];
  const id = 'c' + (uidSeq++);
  const minX = Math.min(...L.panels.map(p => p.x));
  const maxX = Math.max(...L.panels.map(p => p.x + p.w));
  const minY = Math.min(...L.panels.map(p => p.y));
  const svg = [];
  svg.push(`<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${mode} render of ${layoutKey} cabinetry">`);

  if (mode === 'blueprint') {
    svg.push(`<defs>
      <pattern id="${id}g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#1d6fa8" stroke-opacity=".22" stroke-width=".6"/></pattern>
      <pattern id="${id}G" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" stroke="#2aa5ff" stroke-opacity=".28" stroke-width="1"/></pattern>
      <radialGradient id="${id}bg" cx="50%" cy="45%" r="70%"><stop offset="0" stop-color="#062440"/><stop offset="1" stop-color="#020812"/></radialGradient>
      <filter id="${id}glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="800" height="500" fill="url(#${id}bg)"/><rect width="800" height="500" fill="url(#${id}g)"/><rect width="800" height="500" fill="url(#${id}G)"/>`);
    svg.push(`<g filter="url(#${id}glow)" fill="none" stroke="#5ee9ff" stroke-width="1.4" stroke-linejoin="round">`);
    svg.push(`<line class="draw" x1="40" y1="${L.floor}" x2="760" y2="${L.floor}" stroke="#2aa5ff" stroke-dasharray="1200"/>`);
    L.panels.forEach((p, i) => {
      const st = `style="animation-delay:${(i * 0.08).toFixed(2)}s"`;
      svg.push(`<rect class="draw" ${st} x="${p.x + 2}" y="${p.y + 2}" width="${p.w - 4}" height="${p.h - 4}"/>`);
      svg.push(bpDetail(p, st));
    });
    L.counters.forEach(c => svg.push(`<rect class="draw" x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" stroke="#a5f3ff"/>`));
    if (L.backsplash.hooks) svg.push(hooks(L.backsplash, '#5ee9ff'));
    svg.push(`</g>`);
    // dimension lines
    const dimY = minY - 28;
    svg.push(`<g stroke="#2aa5ff" stroke-width="1" fill="#7fdcff" font-family="JetBrains Mono, monospace" font-size="11">
      <line x1="${minX}" y1="${dimY}" x2="${maxX}" y2="${dimY}"/><line x1="${minX}" y1="${dimY - 6}" x2="${minX}" y2="${dimY + 6}"/><line x1="${maxX}" y1="${dimY - 6}" x2="${maxX}" y2="${dimY + 6}"/>
      <text x="${(minX + maxX) / 2}" y="${dimY - 8}" text-anchor="middle" stroke="none">${Math.round((maxX - minX) * 7.4)} mm</text>
      <line x1="${minX - 30}" y1="${minY}" x2="${minX - 30}" y2="${L.floor}"/><line x1="${minX - 36}" y1="${minY}" x2="${minX - 24}" y2="${minY}"/><line x1="${minX - 36}" y1="${L.floor}" x2="${minX - 24}" y2="${L.floor}"/>
      <text transform="translate(${minX - 38} ${(minY + L.floor) / 2}) rotate(-90)" text-anchor="middle" stroke="none">${Math.round((L.floor - minY) * 7.4)} mm</text>
    </g>
    <g font-family="JetBrains Mono, monospace" font-size="10" fill="#5ee9ff">
      <rect x="600" y="410" width="180" height="70" fill="#03101f" fill-opacity=".7" stroke="#2aa5ff" stroke-opacity=".6"/>
      <text x="612" y="430">OBSIDIAN ATELIER</text><text x="612" y="446" fill="#7fa9c9">ELEV. A · ${layoutKey.toUpperCase()}</text><text x="612" y="462" fill="#7fa9c9">SCALE 1:20 · REV 04</text>
      <text x="20" y="490" fill="#2aa5ff" fill-opacity=".7">X:${minX.toFixed(1)} Y:${minY.toFixed(1)} Z:0.000</text>
    </g>`);
  }

  if (mode === 'build') {
    svg.push(`<defs>
      ${grainDef(id)}
      <linearGradient id="${id}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#03060b"/></linearGradient>
      <linearGradient id="${id}metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e5ecf3"/><stop offset=".45" stop-color="#7c8896"/><stop offset="1" stop-color="#c7d0da"/></linearGradient>
      <pattern id="${id}g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#22e6ff" stroke-opacity=".06"/></pattern>
      <filter id="${id}glow"><feGaussianBlur stdDeviation="3"/></filter>
    </defs>
    <rect width="800" height="500" fill="url(#${id}bg)"/><rect width="800" height="500" fill="url(#${id}g)"/>
    <path d="M0 ${L.floor} L800 ${L.floor} L800 500 L0 500Z" fill="#05080d"/>
    <line x1="0" y1="${L.floor}" x2="800" y2="${L.floor}" stroke="#22e6ff" stroke-opacity=".3"/>`);
    L.panels.forEach((p, i) => {
      const state = i % 3; // 0 = finished panel, 1 = metal frame, 2 = floating into place
      if (state === 0) {
        svg.push(`<rect x="${p.x + 2}" y="${p.y + 2}" width="${p.w - 4}" height="${p.h - 4}" fill="url(#${id}w)" stroke="#000" stroke-opacity=".6"/>`);
        svg.push(`<rect x="${p.x + 2}" y="${p.y + 2}" width="${p.w - 4}" height="${p.h - 4}" fill="none" stroke="url(#${id}metal)" stroke-width="1.5"/>`);
      } else if (state === 1) {
        svg.push(`<rect x="${p.x + 3}" y="${p.y + 3}" width="${p.w - 6}" height="${p.h - 6}" fill="#22e6ff" fill-opacity=".05" stroke="url(#${id}metal)" stroke-width="3.5"/>`);
        svg.push(`<path d="M${p.x + 3} ${p.y + 3} L${p.x + p.w - 3} ${p.y + p.h - 3} M${p.x + p.w - 3} ${p.y + 3} L${p.x + 3} ${p.y + p.h - 3}" stroke="#9aa7b5" stroke-opacity=".35" stroke-width="1"/>`);
      } else {
        const off = 26;
        svg.push(`<rect x="${p.x + 2}" y="${p.y + 2}" width="${p.w - 4}" height="${p.h - 4}" fill="none" stroke="#22e6ff" stroke-opacity=".5" stroke-dasharray="4 4"/>`);
        svg.push(`<g class="pulse"><rect x="${p.x + 2 + off * 0.4}" y="${p.y + 2 - off}" width="${p.w - 4}" height="${p.h - 4}" fill="url(#${id}w)" fill-opacity=".9" stroke="url(#${id}metal)" stroke-width="1.5"/></g>`);
        svg.push(`<path d="M${p.x + p.w / 2} ${p.y - off + p.h} v${off}" stroke="#22e6ff" stroke-opacity=".6" stroke-dasharray="2 3"/>`);
      }
      [[p.x, p.y], [p.x + p.w, p.y], [p.x, p.y + p.h], [p.x + p.w, p.y + p.h]].forEach(([x, y]) =>
        svg.push(`<circle cx="${x}" cy="${y}" r="2" fill="#22e6ff"/>`));
    });
    L.counters.forEach(c => svg.push(`<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="#cfd6de" fill-opacity=".25" stroke="#e5ecf3" stroke-opacity=".6" stroke-dasharray="6 3"/>`));
    // laser measurement lines
    const lasers = [minY - 18, L.counters[0].y - 6, L.floor - 6];
    lasers.forEach((y, i) => {
      const col = i === 1 ? '#ff3b6b' : '#22e6ff';
      svg.push(`<line x1="20" y1="${y}" x2="780" y2="${y}" stroke="${col}" stroke-width="3" opacity=".35" filter="url(#${id}glow)"/>`);
      svg.push(`<line class="laser" x1="20" y1="${y}" x2="780" y2="${y}" stroke="${col}" stroke-width="1"/>`);
      svg.push(`<circle cx="20" cy="${y}" r="5" fill="${col}" class="pulse"/>`);
      svg.push(`<text x="772" y="${y - 6}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="10" fill="${col}">${Math.round((L.floor - y) * 7.4)}.0 mm</text>`);
    });
    svg.push(`<line class="laser" x1="${maxX + 20}" y1="20" x2="${maxX + 20}" y2="${L.floor}" stroke="#22e6ff"/>`);
    svg.push(`<g font-family="JetBrains Mono, monospace" font-size="10" fill="#7fdcff"><text x="20" y="490">ASSEMBLY 62% · CNC BATCH 0427-B · Δ 0.21mm</text></g>`);
  }

  if (mode === 'final') {
    svg.push(`<defs>
      ${grainDef(id)}
      <linearGradient id="${id}wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#11161d"/><stop offset="1" stop-color="#0a0d12"/></linearGradient>
      <linearGradient id="${id}q" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".6" stop-color="#d5dbe1"/><stop offset="1" stop-color="#aeb7c1"/></linearGradient>
      <linearGradient id="${id}wash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9fbff" stop-opacity=".85"/><stop offset=".35" stop-color="#22e6ff" stop-opacity=".22"/><stop offset="1" stop-color="#22e6ff" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id}floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151a21"/><stop offset="1" stop-color="#050608"/></linearGradient>
      <linearGradient id="${id}fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <mask id="${id}m"><rect x="0" y="${L.floor}" width="800" height="120" fill="url(#${id}fade)"/></mask>
      <radialGradient id="${id}spot" cx="50%" cy="0%" r="60%"><stop offset="0" stop-color="#fff6e5" stop-opacity=".16"/><stop offset="1" stop-color="#fff6e5" stop-opacity="0"/></radialGradient>
      <filter id="${id}b"><feGaussianBlur stdDeviation="6"/></filter>
      <filter id="${id}b2"><feGaussianBlur stdDeviation="14"/></filter>
    </defs>
    <rect width="800" height="500" fill="url(#${id}wall)"/>
    ${[160, 400, 640].map(x => `<ellipse cx="${x}" cy="0" rx="160" ry="260" fill="url(#${id}spot)"/>`).join('')}
    <rect x="0" y="${L.floor}" width="800" height="${500 - L.floor}" fill="url(#${id}floor)"/>`);
    const B = L.backsplash;
    const cab = [];
    // backsplash: quartz slab with LED wash
    cab.push(`<rect x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}" fill="${B.hooks ? '#141a22' : `url(#${id}q)`}" opacity="${B.hooks ? 1 : 0.9}"/>`);
    if (!B.hooks) cab.push(`<path d="M${B.x + 20} ${B.y + B.h} C ${B.x + 90} ${B.y + 30}, ${B.x + 160} ${B.y + 60}, ${B.x + 240} ${B.y}" stroke="#9aa3ad" stroke-opacity=".5" fill="none"/><path d="M${B.x + 200} ${B.y + B.h} C ${B.x + 260} ${B.y + 50}, ${B.x + 300} ${B.y + 40}, ${B.x + B.w} ${B.y + 10}" stroke="#9aa3ad" stroke-opacity=".35" fill="none"/>`);
    if (B.dividers) for (let i = 1; i < B.dividers; i++) cab.push(`<rect x="${B.x + (B.w / B.dividers) * i - 3}" y="${B.y}" width="6" height="${B.h}" fill="url(#${id}w)"/>`);
    if (B.hooks) cab.push(hooks(B, '#c9d2dc'));
    cab.push(`<rect x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h * 0.75}" fill="url(#${id}wash)"/>`);
    L.panels.forEach(p => {
      if (p.kind === 'cubby') {
        cab.push(`<rect x="${p.x + 1}" y="${p.y + 1}" width="${p.w - 2}" height="${p.h - 2}" fill="#0b0f14" stroke="url(#${id}w)" stroke-width="6"/>`);
        cab.push(`<rect x="${p.x + 6}" y="${p.y + 6}" width="${p.w - 12}" height="4" fill="#bff6ff" opacity=".8" filter="url(#${id}b)"/>`);
        cab.push(`<rect x="${p.x + 14}" y="${p.y + p.h - 34}" width="${p.w - 28}" height="28" rx="3" fill="#2b2f36"/>`);
        return;
      }
      cab.push(`<rect x="${p.x + 1.5}" y="${p.y + 1.5}" width="${p.w - 3}" height="${p.h - 3}" fill="url(#${id}w)"/>`);
      cab.push(`<rect x="${p.x + 1.5}" y="${p.y + 1.5}" width="${p.w - 3}" height="${p.h - 3}" fill="none" stroke="#000" stroke-opacity=".7"/>`);
      cab.push(`<rect x="${p.x + 1.5}" y="${p.y + 1.5}" width="${p.w - 3}" height="2" fill="#fff" opacity=".06"/>`);
      // smart touch hardware: hairline aluminium edge + glowing touch point
      if (p.kind === 'drawer' || p.kind === 'flap') {
        cab.push(`<rect x="${p.x + 10}" y="${p.y + 6}" width="${p.w - 20}" height="1.5" fill="#cfd6de" opacity=".7"/>`);
        cab.push(`<circle cx="${p.x + p.w / 2}" cy="${p.y + 14}" r="2" fill="#22e6ff" class="pulse"/>`);
      } else {
        const hx = p.hinge === 'l' ? p.x + p.w - 8 : p.x + 6;
        const hy = p.kind === 'tall' ? p.y + p.h * 0.42 : (p.y < 200 ? p.y + p.h - 34 : p.y + 8);
        cab.push(`<rect x="${hx}" y="${hy}" width="2" height="26" fill="#cfd6de" opacity=".75"/>`);
        cab.push(`<circle cx="${hx + 1}" cy="${hy + 13}" r="2" fill="#22e6ff" class="pulse"/>`);
      }
      if (p.kind === 'tall') cab.push(`<rect x="${p.x + 1.5}" y="${p.y + 1.5}" width="3" height="${p.h - 3}" fill="#22e6ff" opacity=".25"/>`);
    });
    L.counters.forEach(c => {
      cab.push(`<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="${c.soft ? '#2c3440' : `url(#${id}q)`}"/>`);
      if (c.soft) cab.push(`<rect x="${c.x + 4}" y="${c.y - 10}" width="${c.w - 8}" height="10" rx="5" fill="#3a4350"/>`);
      cab.push(`<rect x="${c.x}" y="${c.y + c.h}" width="${c.w}" height="1" fill="#fff" opacity=".35"/>`);
    });
    // LED channels
    L.led.forEach(l => {
      cab.push(`<rect x="${l.x}" y="${l.y}" width="${l.w}" height="3" fill="#dffcff" filter="url(#${id}b)"/>`);
      cab.push(`<rect x="${l.x}" y="${l.y}" width="${l.w}" height="1.5" fill="#fff"/>`);
    });
    L.toe.forEach(t => {
      cab.push(`<rect x="${t.x}" y="${L.floor - 2}" width="${t.w}" height="4" fill="#22e6ff" opacity=".9" filter="url(#${id}b)"/>`);
      cab.push(`<rect x="${t.x}" y="${L.floor + 2}" width="${t.w}" height="30" fill="#22e6ff" opacity=".18" filter="url(#${id}b2)"/>`);
    });
    const cabStr = cab.join('');
    svg.push(`<g>${cabStr}</g>`);
    svg.push(`<g mask="url(#${id}m)"><g transform="translate(0 ${L.floor * 2}) scale(1 -1)">${cabStr}</g></g>`);
    svg.push(`<rect x="0" y="0" width="800" height="500" fill="url(#${id}spot)" opacity=".4"/>`);
  }

  svg.push(`</svg>`);
  return svg.join('');
}

function bpDetail(p, st) {
  const out = [];
  if (p.kind === 'door' || p.kind === 'tall') {
    const hx = p.hinge === 'l' ? p.x + 2 : p.x + p.w - 2;
    const ox = p.hinge === 'l' ? p.x + p.w - 2 : p.x + 2;
    out.push(`<path class="draw" ${st} d="M${hx} ${p.y + 2} L${ox} ${p.y + p.h / 2} L${hx} ${p.y + p.h - 2}" stroke-dasharray="5 4" stroke-opacity=".55"/>`);
  } else if (p.kind === 'drawer') {
    out.push(`<line class="draw" ${st} x1="${p.x + 2}" y1="${p.y + p.h / 2}" x2="${p.x + p.w - 2}" y2="${p.y + p.h / 2}" stroke-opacity=".7"/>`);
    out.push(`<line x1="${p.x + p.w / 2 - 12}" y1="${p.y + p.h / 4}" x2="${p.x + p.w / 2 + 12}" y2="${p.y + p.h / 4}" stroke-opacity=".9"/>`);
    out.push(`<line x1="${p.x + p.w / 2 - 12}" y1="${p.y + p.h * 0.75}" x2="${p.x + p.w / 2 + 12}" y2="${p.y + p.h * 0.75}" stroke-opacity=".9"/>`);
  } else if (p.kind === 'flap') {
    out.push(`<path class="draw" ${st} d="M${p.x + 2} ${p.y + p.h - 2} L${p.x + p.w / 2} ${p.y + 2} L${p.x + p.w - 2} ${p.y + p.h - 2}" stroke-dasharray="5 4" stroke-opacity=".55"/>`);
  } else if (p.kind === 'cubby') {
    out.push(`<rect x="${p.x + 8}" y="${p.y + 8}" width="${p.w - 16}" height="${p.h - 16}" stroke-opacity=".4"/>`);
  }
  return out.join('');
}

function hooks(B, color) {
  const n = Math.max(3, Math.round(B.w / 60));
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = B.x + (B.w / n) * (i + 0.5);
    s += `<path d="M${x} ${B.y + 30} v14 a6 6 0 0 0 12 0" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;
  }
  return s;
}

function grainDef(id) {
  let lines = '';
  for (let i = 0; i < 14; i++) {
    const y = 4 + i * 9 + (i % 3) * 1.5;
    lines += `<path d="M0 ${y} C 40 ${y - 2}, 80 ${y + 3}, 120 ${y}" stroke="#4a3220" stroke-opacity="${0.25 + (i % 4) * 0.1}" stroke-width="${0.6 + (i % 2) * 0.6}" fill="none"/>`;
  }
  return `<pattern id="${id}w" width="120" height="126" patternUnits="userSpaceOnUse">
    <rect width="120" height="126" fill="#24170e"/>${lines}
    <rect width="120" height="126" fill="#000" opacity=".12"/></pattern>`;
}

/* Use a generated image if present, otherwise keep the vector render */
function withImage(container, svgMarkup, src) {
  container.innerHTML = svgMarkup;
  if (!src) return;
  const img = new Image();
  img.alt = '';
  img.onload = () => { container.innerHTML = ''; container.appendChild(img); };
  img.src = src;
}

/* ============================================================
   Hero: Blueprint → Reality viewer
   ============================================================ */
(function heroViewer() {
  const layers = [...document.querySelectorAll('#stageViewer .stage-layer')];
  const modes = ['blueprint', 'build', 'final'];
  layers.forEach((el, i) => withImage(el, renderCabinet('kitchen', modes[i]), STAGE_IMAGES[i]));

  const scrub = document.getElementById('stageScrub');
  const tabs = [...document.querySelectorAll('.stage-tab')];
  const readout = document.getElementById('stageReadout');
  const caption = document.getElementById('stageCaption');
  const autoState = document.getElementById('autoState');
  let current = -1, auto = true, raf = null, autoTimer = null;

  function apply(v) {
    const t = v / 100; // 0..2
    layers.forEach((el, i) => { el.style.opacity = Math.max(0, 1 - Math.abs(t - i)).toFixed(3); });
    scrub.style.setProperty('--p', (v / 2) + '%');
    const idx = Math.round(t);
    if (idx !== current) {
      current = idx;
      tabs.forEach((b, i) => b.setAttribute('aria-selected', String(i === idx)));
      readout.textContent = `STAGE 0${idx + 1} · ${STAGES[idx].label}`;
      caption.innerHTML = `<div class="font-display text-sm font-semibold">${STAGES[idx].title}</div><div class="text-xs text-slate-400 hidden sm:block">${STAGES[idx].text}</div>`;
    }
  }

  function animateTo(target) {
    cancelAnimationFrame(raf);
    const start = +scrub.value, delta = target - start, t0 = performance.now(), dur = 1100;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      const e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      scrub.value = start + delta * e; apply(+scrub.value);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  function stopAuto() { auto = false; clearInterval(autoTimer); autoState.textContent = 'OFF'; }
  scrub.addEventListener('input', () => { stopAuto(); cancelAnimationFrame(raf); apply(+scrub.value); });
  tabs.forEach(b => b.addEventListener('click', () => { stopAuto(); animateTo(+b.dataset.go * 100); }));

  apply(0);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    autoTimer = setInterval(() => { if (auto) animateTo(((current + 1) % 3) * 100); }, 4200);
  }
})();

/* ============================================================
   Features grid
   ============================================================ */
const FEATURES = [
  { t: 'Touch-to-Open', d: 'Handle-less fronts with servo-assisted push latches. One fingertip, whisper-silent opening.', icon: '<rect x="10" y="6" width="28" height="36" rx="2"/><circle cx="31" cy="24" r="3" class="pulse" fill="#22e6ff"/><circle cx="31" cy="24" r="8" stroke-opacity=".4"/>' },
  { t: 'Concealed LED Channels', d: 'Milled aluminium channels hide 2700–6500K tunable strips under every shelf and toe-kick.', icon: '<rect x="6" y="12" width="36" height="8" rx="1"/><path d="M8 24h32" stroke-width="3" class="pulse"/><path d="M12 30l-3 8M24 30v9M36 30l3 8" stroke-opacity=".5"/>' },
  { t: 'Modular Entry Storage', d: 'Reconfigurable lockers, bench drawers and charging cubbies sized to your family’s daily flow.', icon: '<rect x="6" y="6" width="16" height="36" rx="1"/><rect x="26" y="6" width="16" height="16" rx="1"/><rect x="26" y="26" width="16" height="16" rx="1"/><path d="M18 22v4"/>' },
  { t: 'Titanium Soft-Close', d: 'Aerospace-grade hinges and runners rated to 100,000 cycles with adjustable damping.', icon: '<circle cx="24" cy="24" r="14"/><path d="M24 10v14l9 6"/><circle cx="24" cy="24" r="2" fill="#22e6ff"/>' },
  { t: 'App-Linked Scenes', d: 'Pair lighting and lift mechanisms with HomeKit, Google Home or Control4 for scenes on cue.', icon: '<rect x="14" y="4" width="20" height="40" rx="4"/><path d="M20 36h8"/><path d="M19 16a7 7 0 0 1 10 0M21 20a3.5 3.5 0 0 1 6 0" class="pulse"/>' },
  { t: 'Engineered Quartz & Oak', d: 'Book-matched dark oak veneers paired with honed, stain-proof quartz in 40+ finishes.', icon: '<path d="M6 34l18-10 18 10-18 10z"/><path d="M6 26l18-10 18 10" stroke-opacity=".6"/><path d="M6 18l18-10 18 10" stroke-opacity=".3"/>' }
];
(function features() {
  const grid = document.getElementById('featureGrid');
  grid.innerHTML = FEATURES.map((f, i) => `
    <article class="feature reveal glass rounded-2xl p-7 relative overflow-hidden" style="transition-delay:${i * 0.07}s">
      <div class="halo absolute inset-0 pointer-events-none"></div>
      <div class="relative">
        <div class="w-14 h-14 rounded-xl grid place-items-center bg-cyan-300/[.07] border border-cyan-300/20">
          <svg viewBox="0 0 48 48" class="w-8 h-8" fill="none" stroke="#22e6ff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${f.icon}</svg>
        </div>
        <h3 class="font-display text-xl font-semibold mt-6">${f.t}</h3>
        <p class="text-slate-400 text-sm mt-2 leading-relaxed">${f.d}</p>
        <div class="mt-6 font-mono text-[10px] text-slate-500">SPEC · 0${i + 1}</div>
      </div>
    </article>`).join('');
  grid.querySelectorAll('.feature').forEach(card => card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));
})();

/* ============================================================
   Gallery: before/after compare cards
   ============================================================ */
const PROJECTS = [
  { id: 'meridian', cat: 'kitchen', layout: 'kitchen', name: 'The Meridian Kitchen', meta: 'Dark oak · Calacatta quartz · 3 weeks install' },
  { id: 'monolith', cat: 'entry', layout: 'entry', name: 'Foyer Monolith', meta: 'Smoked oak · Bench storage · Coat wall' },
  { id: 'nocturne', cat: 'kitchen', layout: 'suite', name: 'Nocturne Suite', meta: 'Lift-up flaps · 6m quartz run · Toe-kick LED' },
  { id: 'matrix', cat: 'entry', layout: 'locker', name: 'Mudroom Matrix', meta: '5-bay lockers · Charging cubbies · Drawers' }
];
(function gallery() {
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = PROJECTS.map(p => `
    <figure class="reveal glass rounded-3xl p-3 group" data-cat="${p.cat}">
      <div class="compare aspect-[16/10] rounded-2xl overflow-hidden" style="--split:50%" tabindex="0" role="slider" aria-label="Reveal finished ${p.name}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
        <div class="before absolute inset-0" data-layout="${p.layout}" data-mode="blueprint"></div>
        <div class="after" data-layout="${p.layout}" data-mode="final" data-img="assets/gallery-${p.id}.jpg"></div>
        <div class="handle"></div>
        <span class="absolute top-3 left-3 glass rounded-md px-2 py-1 font-mono text-[10px] text-cyan-200">BLUEPRINT</span>
        <span class="absolute top-3 right-3 glass rounded-md px-2 py-1 font-mono text-[10px] text-white">FINISHED</span>
      </div>
      <figcaption class="flex items-center justify-between px-3 pt-4 pb-2">
        <div><div class="font-display text-lg font-semibold">${p.name}</div><div class="text-xs text-slate-400 mt-0.5">${p.meta}</div></div>
        <span class="font-mono text-[10px] text-neon-cyan uppercase">${p.cat}</span>
      </figcaption>
    </figure>`).join('');

  grid.querySelectorAll('[data-layout]').forEach(el => {
    el.firstChild || withImage(el, renderCabinet(el.dataset.layout, el.dataset.mode), el.dataset.img);
  });

  grid.querySelectorAll('.compare').forEach(c => {
    let dragging = false;
    const set = pct => {
      pct = Math.max(0, Math.min(100, pct));
      c.style.setProperty('--split', pct + '%');
      c.setAttribute('aria-valuenow', Math.round(pct));
    };
    const fromEvent = e => { const r = c.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 100); };
    c.addEventListener('pointerdown', e => { dragging = true; c.setPointerCapture(e.pointerId); fromEvent(e); });
    c.addEventListener('pointermove', e => { if (dragging || e.pointerType === 'mouse') fromEvent(e); });
    c.addEventListener('pointerup', () => { dragging = false; });
    c.addEventListener('keydown', e => {
      const v = parseFloat(c.style.getPropertyValue('--split')) || 50;
      if (e.key === 'ArrowLeft') { set(v - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { set(v + 5); e.preventDefault(); }
    });
  });

  const filters = [...document.querySelectorAll('#galleryFilters .filter')];
  const paint = () => filters.forEach(b => {
    const on = b.getAttribute('aria-pressed') === 'true';
    b.classList.toggle('bg-cyan-300/10', on); b.classList.toggle('border-cyan-300/60', on); b.classList.toggle('text-white', on);
  });
  filters.forEach(b => b.addEventListener('click', () => {
    filters.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    paint();
    grid.querySelectorAll('figure').forEach(f => { f.style.display = b.dataset.f === 'all' || f.dataset.cat === b.dataset.f ? '' : 'none'; });
  }));
  paint();
})();

/* ============================================================
   Contact form
   ============================================================ */
(function contactForm() {
  const form = document.getElementById('contactForm');
  const btn = document.getElementById('submitBtn');
  const errBox = document.getElementById('formError');
  const success = document.getElementById('formSuccess');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const rules = {
    name: v => v.trim().length >= 2,
    email: v => emailRe.test(v.trim()),
    phone: v => !v.trim() || /^[+()\-.\s\d]{7,20}$/.test(v.trim()),
    message: v => v.trim().length >= 10
  };

  function showErr(el, bad) {
    const wrap = el.closest('div, fieldset');
    el.classList.toggle('invalid', bad);
    el.setAttribute('aria-invalid', String(bad));
    wrap.querySelector('.err')?.classList.toggle('hidden', !bad);
  }

  function validate() {
    let ok = true;
    Object.entries(rules).forEach(([n, fn]) => { const el = form.elements[n]; const bad = !fn(el.value); showErr(el, bad); if (bad) ok = false; });
    const typeChosen = !!form.querySelector('input[name="project_type"]:checked');
    form.querySelector('fieldset .err').classList.toggle('hidden', typeChosen);
    if (!typeChosen) ok = false;
    return ok;
  }

  Object.keys(rules).forEach(n => form.elements[n].addEventListener('blur', e => { if (e.target.value) showErr(e.target, !rules[n](e.target.value)); }));
  form.querySelectorAll('input[name="project_type"]').forEach(r => r.addEventListener('change', () => form.querySelector('fieldset .err').classList.add('hidden')));

  function setLoading(on) {
    btn.disabled = on;
    btn.classList.toggle('opacity-70', on);
    btn.querySelector('.label').textContent = on ? 'Transmitting…' : 'Send Inquiry';
    btn.querySelector('.spinner').classList.toggle('hidden', !on);
  }

  async function send(data) {
    const payload = {
      name: data.name, email: data.email, phone: data.phone || '—',
      project_type: data.project_type, message: data.message
    };
    if (CONFIG.WEB3FORMS_ACCESS_KEY) {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: CONFIG.WEB3FORMS_ACCESS_KEY, subject: CONFIG.SUBJECT, from_name: 'Obsidian Atelier Website', replyto: data.email, botcheck: data.botcheck, ...payload })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || `Request failed (${res.status})`);
      return;
    }
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(CONFIG.RECIPIENT)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ _subject: CONFIG.SUBJECT, _template: 'table', _captcha: 'false', _replyto: data.email, _honey: data.botcheck, ...payload })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || String(json.success) !== 'true') throw new Error(json.message || `Request failed (${res.status})`);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errBox.classList.add('hidden');
    if (!validate()) { form.querySelector('.invalid, fieldset .err:not(.hidden)')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    data.botcheck = form.elements.botcheck.checked ? 'on' : '';
    if (data.botcheck) return; // silently drop bots
    setLoading(true);
    try {
      await send(data);
      document.getElementById('successName').textContent = data.name.trim().split(' ')[0];
      form.classList.add('hidden');
      success.classList.remove('hidden');
    } catch (err) {
      errBox.innerHTML = `<strong>Transmission failed.</strong> ${navigator.onLine ? 'Our mail relay didn\'t accept the request' : 'You appear to be offline'} — please try again, or email us directly at <a class="underline" href="mailto:${CONFIG.RECIPIENT}">${CONFIG.RECIPIENT}</a>.`;
      errBox.classList.remove('hidden');
      console.error('[contact]', err);
    } finally {
      setLoading(false);
    }
  });

  document.getElementById('resetForm').addEventListener('click', () => {
    form.reset();
    success.classList.add('hidden');
    form.classList.remove('hidden');
  });
})();

/* ============================================================
   Chrome: nav, reveal, counters
   ============================================================ */
(function chrome() {
  document.getElementById('yr').textContent = new Date().getFullYear();
  const menuBtn = document.getElementById('menuBtn'), menu = document.getElementById('mobileMenu');
  menuBtn.addEventListener('click', () => { const open = menu.classList.toggle('hidden') === false; menuBtn.setAttribute('aria-expanded', String(open)); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.add('hidden')));

  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    const c = en.target.querySelector('[data-count]');
    if (c && !c.dataset.done) {
      c.dataset.done = 1;
      const end = +c.dataset.count, t0 = performance.now();
      const tick = now => { const k = Math.min(1, (now - t0) / 1600); c.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + (k === 1 ? '+' : ''); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }
    io.unobserve(en.target);
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
