/* ============================================================
   Kamo Abrahim — site logic
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
  SUBJECT: 'New Cabinetry Inquiry — Kamo Abrahim'
};

/* ---------- Optional generated imagery ----------
   Drop Higgsfield renders at these paths and they replace the vector renders automatically. */
const STAGE_IMAGES = [
  'assets/stage-1-blueprint.jpg',
  'assets/stage-2-cgi-build.jpg',
  'assets/stage-3-reality.jpg'
];

const STAGES = [
  { label: 'DRAWING', title: 'Architectural Drawing', text: 'Hand-drafted in perspective and dimensioned to the millimetre.' },
  { label: 'ON-SITE BUILD', title: 'On-Site Build', text: 'Carcasses set to laser level, oak fronts going on.' },
  { label: 'FINISHED', title: 'The Finished Space', text: 'Dark oak, honed quartz and concealed LED, installed.' }
];

/* ============================================================
   Perspective scene renderer (SVG, 800×500)
   Scenes are modelled in centimetres as real 3D boxes and projected through
   a single camera, so the drawing, the build and the finished room share
   exactly the same geometry.
   ============================================================ */
const CAM = { x: 90, y: 175, z: -170, f: 600 };
const P = (x, y, z) => { const d = Math.max(z - CAM.z, 5); return [400 + CAM.f * (x - CAM.x) / d, 250 - CAM.f * (y - CAM.y) / d]; };
const S = p => P(p[0], p[1], p[2]);
const f1 = n => n.toFixed(1);
const PTS = list => list.map(p => S(p).map(f1).join(',')).join(' ');
const poly = (list, a = '') => `<polygon points="${PTS(list)}" ${a}/>`;
const pline = (list, a = '') => `<polyline points="${PTS(list)}" fill="none" ${a}/>`;
const seg = (a, b, attr = '') => { const [x1, y1] = S(a), [x2, y2] = S(b); return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" ${attr}/>`; };
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scl = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const at = (F, s, t) => add(F.O, add(scl(F.U, s), scl(F.V, t)));
const quad = (F, s0 = 0, t0 = 0, s1 = 1, t1 = 1) => [at(F, s0, t0), at(F, s1, t0), at(F, s1, t1), at(F, s0, t1)];
const pxSize = (cm, z) => cm * CAM.f / (z - CAM.z);
const wallRect = (x0, x1, y0, y1, z = 499.6) => [[x0, y1, z], [x1, y1, z], [x1, y0, z], [x0, y0, z]];
const rightWallRect = (z0, z1, y0, y1, x = 299.6) => [[x, y1, z0], [x, y1, z1], [x, y0, z1], [x, y0, z0]];

function boxFaces(b) {
  const { x0, x1, y0, y1, z0, z1 } = b, f = {};
  f.front = { O: [x0, y1, z0], U: [x1 - x0, 0, 0], V: [0, y0 - y1, 0] };
  if (x1 < CAM.x) f.right = { O: [x1, y1, z0], U: [0, 0, z1 - z0], V: [0, y0 - y1, 0] };
  if (x0 > CAM.x) f.left = { O: [x0, y1, z1], U: [0, 0, z0 - z1], V: [0, y0 - y1, 0] };
  if (y1 < CAM.y) f.top = { O: [x0, y1, z1], U: [x1 - x0, 0, 0], V: [0, 0, z0 - z1] };
  if (y0 > CAM.y) f.bottom = { O: [x0, y0, z0], U: [x1 - x0, 0, 0], V: [0, 0, z1 - z0] };
  return f;
}

function panels(F, rows) {
  const lu = Math.hypot(...F.U), lv = Math.hypot(...F.V), out = [];
  let t = 0;
  rows.forEach(r => {
    const g = r.t === 'open' ? 1.8 : 0.35, gs = g / lu, gt = g / lv;
    for (let i = 0; i < r.n; i++) out.push({ F, t: r.t, i, s0: i / r.n + gs, s1: (i + 1) / r.n - gs, t0: t + gt, t1: t + r.f - gt });
    t += r.f;
  });
  return out.map(p => ({ ...p, A: (s, t) => at(F, p.s0 + (p.s1 - p.s0) * s, p.t0 + (p.t1 - p.t0) * t) }));
}

/* Toe-kicks are generated as recessed boxes under any box flagged `toe` */
function eachBox(sc, fn) {
  sc.boxes.forEach((b, bi) => {
    if (b.toe) fn({ x0: b.x0 + 1, x1: b.x1 - 1, y0: 0, y1: b.y0, z0: b.z0 + 7, z1: b.z1, mat: 'toe', isToe: true }, bi);
    fn(b, bi);
  });
}

const box = o => Object.assign({ mat: 'oak' }, o);
const SCENES = {
  kitchen: {
    label: 'KITCHEN · VIEW A',
    boxes: [
      box({ x0: -300, x1: 150, y0: 10, y1: 86, z0: 440, z1: 500, toe: true, fronts: { face: 'front', rows: [{ f: .3, n: 5, t: 'drawer' }, { f: .7, n: 5, t: 'door' }] } }),
      box({ mat: 'quartz', x0: -300, x1: 152, y0: 86, y1: 92, z0: 436, z1: 500, build: 'template' }),
      box({ x0: -300, x1: -60, y0: 150, y1: 240, z0: 465, z1: 500, led: true, build: 'installed', fronts: { face: 'front', rows: [{ f: 1, n: 3, t: 'door' }] } }),
      box({ mat: 'metal', x0: -55, x1: 45, y0: 168, y1: 240, z0: 450, z1: 500, hood: true }),
      box({ x0: 50, x1: 150, y0: 150, y1: 240, z0: 465, z1: 500, led: true, build: 'missing', fronts: { face: 'front', rows: [{ f: 1, n: 1, t: 'door' }] } }),
      box({ x0: 150, x1: 300, y0: 10, y1: 270, z0: 440, z1: 500, toe: true, fronts: { face: 'front', rows: [{ f: .14, n: 2, t: 'flap' }, { f: .86, n: 2, t: 'door' }] } }),
      box({ x0: -170, x1: 40, y0: 10, y1: 86, z0: 150, z1: 240, toe: true, island: true, fronts: { face: 'front', rows: [{ f: .3, n: 3, t: 'drawer' }, { f: .7, n: 3, t: 'door' }] } }),
      box({ mat: 'quartz', x0: 40, x1: 46, y0: 0, y1: 86, z0: 146, z1: 244 }),
      box({ mat: 'quartz', x0: -176, x1: 46, y0: 86, y1: 92, z0: 146, z1: 244 })
    ],
    backsplash: { x0: -300, x1: 150, y0: 92, y1: 150 },
    cooktop: { x0: -40, x1: 30, z0: 450, z1: 488, y: 92 },
    pendants: [{ x: -125, z: 195 }, { x: -20, z: 195 }],
    window: { z0: 170, z1: 400, y0: 85, y1: 235 },
    outlets: [[-220, 115], [110, 115]],
    dims: [
      { a: [-300, 243, 500], b: [150, 243, 500], off: 14, label: '4500' },
      { a: [150, 270, 440], b: [300, 270, 440], off: -14, label: '1500' },
      { a: [-292, 0, 500], b: [-292, 270, 500], off: -12, label: '2700' }
    ],
    notes: [
      { p: [-200, 151, 466], text: 'CONCEALED LED CHANNEL', dx: 20, dy: -95 },
      { p: [-5, 92, 470], text: 'INDUCTION HOB', dx: 60, dy: -150 },
      { p: [225, 160, 440], text: 'FLOOR-TO-CEILING PANTRY', dx: 40, dy: -105 },
      { p: [43, 45, 200], text: 'QUARTZ WATERFALL 30mm', dx: 60, dy: 8 },
      { p: [-120, 70, 150], text: 'TOUCH-LATCH DRAWERS', dx: 40, dy: 22 }
    ],
    pencil: [
      { p: [-285, 128, 500], text: 'U/C 1500 AFF' },
      { p: [20, 257, 500], text: '℄ HOOD' },
      { p: [-100, 108, 500], text: 'LVL ±0.0' }
    ]
  },
  galley: {
    label: 'GALLEY · VIEW B',
    boxes: [
      box({ x0: -300, x1: -190, y0: 10, y1: 270, z0: 440, z1: 500, toe: true, fronts: { face: 'front', rows: [{ f: .14, n: 1, t: 'flap' }, { f: .86, n: 1, t: 'door' }] } }),
      box({ x0: -190, x1: 300, y0: 10, y1: 86, z0: 440, z1: 500, toe: true, fronts: { face: 'front', rows: [{ f: .3, n: 6, t: 'drawer' }, { f: .7, n: 6, t: 'door' }] } }),
      box({ mat: 'quartz', x0: -190, x1: 300, y0: 86, y1: 92, z0: 436, z1: 500 }),
      box({ x0: -190, x1: 300, y0: 160, y1: 240, z0: 465, z1: 500, led: true, fronts: { face: 'front', rows: [{ f: .5, n: 6, t: 'flap' }, { f: .5, n: 6, t: 'flap' }] } })
    ],
    backsplash: { x0: -190, x1: 300, y0: 92, y1: 160 },
    cooktop: { x0: 10, x1: 80, z0: 450, z1: 488, y: 92 },
    window: { z0: 170, z1: 400, y0: 85, y1: 235 },
    dims: [{ a: [-190, 243, 500], b: [300, 243, 500], off: 14, label: '4900 QUARTZ RUN' }],
    notes: [
      { p: [-100, 210, 465], text: 'LIFT-UP FLAP UPPERS', dx: 20, dy: -70 },
      { p: [150, 60, 440], text: 'TOE-KICK LED', dx: 40, dy: 50 }
    ]
  },
  entry: {
    label: 'FOYER · VIEW C',
    boxes: [
      box({ x0: -300, x1: -80, y0: 10, y1: 270, z0: 440, z1: 500, toe: true, fronts: { face: 'front', rows: [{ f: .15, n: 3, t: 'flap' }, { f: .85, n: 3, t: 'door' }] } }),
      box({ mat: 'slat', x0: -80, x1: 140, y0: 52, y1: 200, z0: 494, z1: 500 }),
      box({ x0: -80, x1: 140, y0: 200, y1: 270, z0: 462, z1: 500, led: true, fronts: { face: 'front', rows: [{ f: 1, n: 3, t: 'open' }] } }),
      box({ x0: -80, x1: 140, y0: 18, y1: 46, z0: 450, z1: 500, float: true, fronts: { face: 'front', rows: [{ f: 1, n: 2, t: 'drawer' }] } }),
      box({ mat: 'cushion', x0: -78, x1: 138, y0: 46, y1: 52, z0: 452, z1: 500 }),
      box({ x0: 140, x1: 300, y0: 10, y1: 270, z0: 440, z1: 500, toe: true, fronts: { face: 'front', rows: [{ f: .15, n: 2, t: 'flap' }, { f: .85, n: 2, t: 'door' }] } })
    ],
    wash: { x0: -80, x1: 140, y0: 120, y1: 200 },
    door: { z0: 170, z1: 280, y1: 215 },
    dims: [{ a: [-300, 0, 440], b: [300, 0, 440], off: -16, label: '6000' }],
    notes: [
      { p: [30, 150, 494], text: 'OAK SLAT COAT WALL', dx: 50, dy: -150 },
      { p: [-40, 35, 450], text: 'FLOATING BENCH + DRAWERS', dx: -110, dy: 28, anchor: 'end' }
    ]
  },
  mudroom: {
    label: 'MUDROOM · VIEW D',
    boxes: [
      box({ x0: -250, x1: 250, y0: 10, y1: 46, z0: 450, z1: 500, toe: true, fronts: { face: 'front', rows: [{ f: 1, n: 5, t: 'drawer' }] } }),
      box({ mat: 'cushion', x0: -248, x1: 248, y0: 46, y1: 52, z0: 452, z1: 500 }),
      box({ x0: -250, x1: 250, y0: 52, y1: 205, z0: 460, z1: 500, hooks: true, fronts: { face: 'front', rows: [{ f: 1, n: 5, t: 'open' }] } }),
      box({ x0: -250, x1: 250, y0: 205, y1: 270, z0: 460, z1: 500, led: true, fronts: { face: 'front', rows: [{ f: 1, n: 5, t: 'flap' }] } })
    ],
    door: { z0: 170, z1: 280, y1: 215 },
    dims: [{ a: [-250, 0, 450], b: [250, 0, 450], off: -16, label: '5000 · 5 BAYS' }],
    notes: [
      { p: [-150, 130, 460], text: 'OPEN LOCKER BAYS', dx: -20, dy: -150, anchor: 'end' },
      { p: [100, 238, 460], text: 'CHARGING CUBBIES', dx: 70, dy: -40 }
    ]
  }
};

const MAT = {
  final: {
    oak: { front: '#4b3321', right: '#33231a', left: '#3e2b1c', top: '#5a4430', bottom: '#2a1d14' },
    slat: { front: '#4b3321', right: '#33231a', left: '#3e2b1c', top: '#5a4430', bottom: '#2a1d14' },
    quartz: { front: '#d3d8dd', right: '#bcc3ca', left: '#c7cdd3', top: '#eceff2', bottom: '#9aa0a6' },
    metal: { front: '#8b9299', right: '#656c73', left: '#757c83', top: '#a5acb3', bottom: '#4d5359' },
    cushion: { front: '#3b4149', right: '#2e333a', left: '#353a41', top: '#59606a', bottom: '#24282d' },
    toe: { front: '#0b0a09', right: '#080707', left: '#090808', top: '#0b0a09', bottom: '#0b0a09' }
  },
  build: {
    ply: { front: '#e0c497', right: '#c4a272', left: '#cdab7a', top: '#eed9b2', bottom: '#b8986a' },
    oak: { front: '#6c4b31', right: '#4f3624', left: '#5b402a', top: '#7a573a', bottom: '#3f2b1c' },
    template: { front: '#d6c3a0', right: '#c2ae8a', left: '#c9b591', top: '#e0cfae', bottom: '#b09d7c' },
    toe: { front: '#9c8460', right: '#86704f', left: '#8e7756', top: '#9c8460', bottom: '#9c8460' }
  }
};

function renderScene(key, mode) {
  const sc = SCENES[key], id = 's' + (uidSeq++);
  const body = mode === 'blueprint' ? drawBlueprint(sc, id) : mode === 'build' ? drawBuild(sc, id) : drawFinal(sc, id);
  return `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${mode} of ${key} cabinetry">${body}</svg>`;
}
let uidSeq = 0;

const ROOM = {
  back: wallRect(-300, 300, 0, 270, 500),
  left: [[-300, 270, -100], [-300, 270, 500], [-300, 0, 500], [-300, 0, -100]],
  right: [[300, 270, 500], [300, 270, -100], [300, 0, -100], [300, 0, 500]],
  floor: [[-300, 0, 500], [300, 0, 500], [300, 0, -100], [-300, 0, -100]],
  ceil: [[-300, 270, -100], [300, 270, -100], [300, 270, 500], [-300, 270, 500]]
};
const DOWNLIGHTS = [-220, -70, 80, 220].map(x => ({ x, z: 390 }));

/* ---------- 1. Architectural drawing ---------- */
function drawBlueprint(sc, id) {
  const o = [], ink = '#eaf4ff', paper = `fill="url(#${id}p)"`;
  o.push(`<defs>
    <radialGradient id="${id}p" gradientUnits="userSpaceOnUse" cx="360" cy="210" r="560"><stop offset="0" stop-color="#1a5fae"/><stop offset="1" stop-color="#0a2c58"/></radialGradient>
    <pattern id="${id}g" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M12 0H0V12" fill="none" stroke="#cfe6ff" stroke-opacity=".06" stroke-width=".5"/></pattern>
    <pattern id="${id}G" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#cfe6ff" stroke-opacity=".1" stroke-width=".7"/></pattern>
    <pattern id="${id}h" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="${ink}" stroke-opacity=".5" stroke-width=".7"/></pattern>
    <filter id="${id}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .09 0"/></filter>
    <filter id="${id}w" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="8" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="2.4" xChannelSelector="R" yChannelSelector="G"/></filter>
  </defs>
  <rect width="800" height="500" fill="url(#${id}p)"/>`);

  const L = [];
  // room shell + perspective floor grid
  L.push(poly(ROOM.back, `${paper} stroke-width="1.4" class="sketch" pathLength="1"`));
  [[[-300, 0, 500], [-300, 0, -100]], [[300, 0, 500], [300, 0, -100]], [[-300, 270, 500], [-300, 270, -100]], [[300, 270, 500], [300, 270, -100]]]
    .forEach(([a, b]) => L.push(seg(a, b, 'stroke-width="1.4" class="sketch" pathLength="1"')));
  for (let x = -300; x <= 300; x += 50) L.push(seg([x, 0, 0], [x, 0, 500], 'stroke-width=".5" stroke-opacity=".18"'));
  for (let z = 0; z <= 500; z += 50) L.push(seg([-300, 0, z], [300, 0, z], 'stroke-width=".5" stroke-opacity=".18"'));
  for (let x = -220; x <= 220; x += 150) L.push(`<circle cx="${f1(P(x, 270, 390)[0])}" cy="${f1(P(x, 270, 390)[1])}" r="3" stroke-width=".7"/>`);
  if (sc.window) {
    const w = sc.window;
    L.push(poly(rightWallRect(w.z0, w.z1, w.y0, w.y1), `${paper} stroke-width="1.2"`));
    L.push(poly(rightWallRect(w.z0 + 4, w.z1 - 4, w.y0 + 4, w.y1 - 4), 'stroke-width=".7"'));
    L.push(seg([299.6, w.y1, (w.z0 + w.z1) / 2], [299.6, w.y0, (w.z0 + w.z1) / 2], 'stroke-width=".7"'));
  }
  if (sc.door) L.push(poly(rightWallRect(sc.door.z0, sc.door.z1, 0, sc.door.y1), `${paper} stroke-width="1.2"`), pline([[299.6, 0, sc.door.z0], [299.6, sc.door.y1 / 2, sc.door.z1], [299.6, sc.door.y1, sc.door.z0]], 'stroke-width=".6" stroke-dasharray="4 3" stroke-opacity=".6"'));
  if (sc.backsplash) { const b = sc.backsplash; L.push(poly(wallRect(b.x0, b.x1, b.y0, b.y1), `fill="url(#${id}h)" stroke="none" opacity=".35"`)); }

  eachBox(sc, (b, bi) => {
    const F = boxFaces(b), delay = `style="animation-delay:${(bi * 0.14).toFixed(2)}s"`;
    Object.entries(F).forEach(([k, f]) => {
      const q = quad(f);
      L.push(poly(q, `${paper} stroke-width="${b.isToe ? .7 : 1.3}" class="sketch" pathLength="1" ${delay}`));
      if (b.mat === 'quartz' && k !== 'bottom') L.push(poly(q, `fill="url(#${id}h)" stroke="none"`));
      if (!b.isToe) quad(f).map(S).forEach((a, i, arr) => {           // draughtsman's overshoot
        const c = arr[(i + 1) % 4], len = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1, ux = (c[0] - a[0]) / len, uy = (c[1] - a[1]) / len;
        L.push(`<line x1="${f1(a[0] - ux * 7)}" y1="${f1(a[1] - uy * 7)}" x2="${f1(c[0] + ux * 7)}" y2="${f1(c[1] + uy * 7)}" stroke-width=".45" stroke-opacity=".35"/>`);
      });
    });
    if (b.fronts && F[b.fronts.face]) panels(F[b.fronts.face], b.fronts.rows).forEach(p => {
      const A = p.A, dash = 'stroke-width=".6" stroke-dasharray="4 3" stroke-opacity=".55"';
      L.push(poly([A(0, 0), A(1, 0), A(1, 1), A(0, 1)], 'stroke-width=".8"'));
      if (p.t === 'door') { const h = p.i % 2; L.push(pline([A(h, 0), A(1 - h, .5), A(h, 1)], dash)); }
      if (p.t === 'flap') L.push(pline([A(0, 1), A(.5, 0), A(1, 1)], dash));
      if (p.t === 'drawer') L.push(seg(A(.38, .2), A(.62, .2), 'stroke-width=".9"'));
      if (p.t === 'open') {
        const inner = [A(.1, .08), A(.9, .08), A(.9, .92), A(.1, .92)];
        L.push(poly(inner, 'stroke-width=".6"'));
        [[0, 0], [1, 0], [1, 1], [0, 1]].forEach(([s, t], j) => L.push(seg(A(s, t), inner[j], 'stroke-width=".5"')));
      }
    });
    if (b.mat === 'slat' && F.front) for (let s = .05; s < 1; s += .05) L.push(seg(at(F.front, s, 0), at(F.front, s, 1), 'stroke-width=".5" stroke-opacity=".7"'));
    if (b.led) { const y = b.y0, z = F.bottom ? b.z0 + 6 : b.z0; L.push(seg([b.x0 + 4, y, z], [b.x1 - 4, y, z], 'stroke-width="1.4" stroke-dasharray="1 3"')); }
  });
  if (sc.cooktop) {
    const c = sc.cooktop;
    L.push(poly([[c.x0, c.y + .1, c.z1], [c.x1, c.y + .1, c.z1], [c.x1, c.y + .1, c.z0], [c.x0, c.y + .1, c.z0]], 'stroke-width=".8"'));
    [-17, 17].forEach(dx => L.push(pline(ring((c.x0 + c.x1) / 2 + dx, c.y + .2, (c.z0 + c.z1) / 2, 10), 'stroke-width=".6"')));
  }
  (sc.pendants || []).forEach(p => {
    L.push(seg([p.x, 270, p.z], [p.x, 168, p.z], 'stroke-width=".7"'));
    const [cx, cy] = P(p.x, 160, p.z);
    L.push(`<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(pxSize(9, p.z))}" fill="url(#${id}p)" stroke-width="1"/>`);
  });
  o.push(`<g filter="url(#${id}w)" stroke="${ink}" fill="none" stroke-linejoin="round" stroke-linecap="round">${L.join('')}</g>`);

  // dimensions & annotations
  const T = [];
  (sc.dims || []).forEach(d => T.push(dimension(d, ink)));
  (sc.notes || []).forEach(n => T.push(note(n, ink)));
  o.push(`<g font-family="'Architects Daughter', cursive" fill="${ink}" stroke="${ink}">${T.join('')}</g>`);

  // sheet border + title block
  o.push(`<rect x="10" y="10" width="780" height="480" fill="none" stroke="${ink}" stroke-opacity=".55" stroke-width="1"/>
    <rect x="14" y="14" width="772" height="472" fill="none" stroke="${ink}" stroke-opacity=".3" stroke-width=".5"/>
    <g font-family="'Architects Daughter', cursive" fill="${ink}">
      <rect x="586" y="410" width="200" height="76" fill="#0b2f5c" fill-opacity=".85" stroke="${ink}" stroke-opacity=".7"/>
      <line x1="586" y1="436" x2="786" y2="436" stroke="${ink}" stroke-opacity=".5"/><line x1="586" y1="461" x2="786" y2="461" stroke="${ink}" stroke-opacity=".5"/><line x1="712" y1="436" x2="712" y2="486" stroke="${ink}" stroke-opacity=".5"/>
      <text x="596" y="429" font-size="15" letter-spacing="1">KAMO ABRAHIM</text>
      <text x="596" y="453" font-size="10" opacity=".85">${sc.label}</text>
      <text x="596" y="478" font-size="10" opacity=".85">FINE WOODWORKING</text>
      <text x="719" y="453" font-size="10" opacity=".85">SCALE NTS</text>
      <text x="719" y="478" font-size="10" opacity=".85">SHEET A-201</text>
    </g>
    <rect width="800" height="500" fill="url(#${id}g)"/><rect width="800" height="500" fill="url(#${id}G)"/>
    <rect width="800" height="500" filter="url(#${id}n)"/>`);
  return o.join('');
}

function ring(cx, y, cz, r, n = 28) { const pts = []; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; pts.push([cx + r * Math.cos(a), y, cz + r * Math.sin(a)]); } return pts; }

function dimension(d, ink) {
  const [ax, ay] = S(d.a), [bx, by] = S(d.b);
  const len = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / len, uy = (by - ay) / len, nx = uy, ny = -ux, o = d.off, sg = Math.sign(o);
  const A = [ax + nx * o, ay + ny * o], B = [bx + nx * o, by + ny * o];
  const ln = (x1, y1, x2, y2, w = .8) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke-width="${w}" fill="none"/>`;
  let s = ln(ax + nx * sg * 3, ay + ny * sg * 3, ax + nx * (o + sg * 5), ay + ny * (o + sg * 5), .6)
        + ln(bx + nx * sg * 3, by + ny * sg * 3, bx + nx * (o + sg * 5), by + ny * (o + sg * 5), .6)
        + ln(A[0], A[1], B[0], B[1]);
  [A, B].forEach(([x, y]) => { const tx = (ux + nx) * 3.5, ty = (uy + ny) * 3.5; s += ln(x - tx, y - ty, x + tx, y + ty, 1.4); });
  let ang = Math.atan2(uy, ux) * 180 / Math.PI; if (ang > 90 || ang < -90) ang += 180;
  const mx = (A[0] + B[0]) / 2 + nx * sg * 6, my = (A[1] + B[1]) / 2 + ny * sg * 6;
  return s + `<text x="${f1(mx)}" y="${f1(my)}" font-size="12" text-anchor="middle" dominant-baseline="middle" stroke="none" transform="rotate(${f1(ang)} ${f1(mx)} ${f1(my)})">${d.label}</text>`;
}

function note(n, ink) {
  const [x, y] = S(n.p), tx = x + n.dx, ty = y + n.dy, end = n.anchor === 'end' || n.dx < 0, land = end ? -12 : 12;
  return `<circle cx="${f1(x)}" cy="${f1(y)}" r="2" stroke="none"/>
    <polyline points="${f1(x)},${f1(y)} ${f1(tx)},${f1(ty)} ${f1(tx + land)},${f1(ty)}" fill="none" stroke-width=".7"/>
    <text x="${f1(tx + land + (end ? -4 : 4))}" y="${f1(ty + 4)}" font-size="11.5" stroke="none" text-anchor="${end ? 'end' : 'start'}">${n.text}</text>`;
}

/* ---------- 2. On-site build ---------- */
function drawBuild(sc, id) {
  const o = [], C = MAT.build;
  o.push(`<defs>
    <linearGradient id="${id}fl" gradientUnits="userSpaceOnUse" x1="0" y1="${f1(P(0, 0, 500)[1])}" x2="0" y2="500"><stop offset="0" stop-color="#8d877f"/><stop offset="1" stop-color="#a9a39a"/></linearGradient>
    <radialGradient id="${id}wl" gradientUnits="userSpaceOnUse" cx="140" cy="60" r="620"><stop offset="0" stop-color="#fff4dc" stop-opacity=".38"/><stop offset=".5" stop-color="#fff4dc" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
    <filter id="${id}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="11"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .17  0 0 0 0 .14  0 0 0 .22 0"/></filter>
    <filter id="${id}b"><feGaussianBlur stdDeviation="2.5"/></filter>
  </defs>`);
  // shell: drywall, concrete, floor protection
  o.push(poly(ROOM.ceil, 'fill="#c3bdb2"'), poly(ROOM.left, 'fill="#cbc5ba"'), poly(ROOM.right, 'fill="#cfc9be"'), poly(ROOM.back, 'fill="#d5cfc4"'), poly(ROOM.floor, `fill="url(#${id}fl)"`));
  [-150, 0, 150].forEach(x => o.push(poly(wallRect(x - 7, x + 7, 0, 270), 'fill="#e6e1d8" opacity=".85"')));
  [[-240, 60], [-90, 200], [60, 40], [210, 215]].forEach(([x, y]) => o.push(poly(wallRect(x - 9, x + 9, y - 5, y + 5), 'fill="#e9e5dc" opacity=".8"')));
  for (let z = 120; z <= 500; z += 120) o.push(poly(rightWallRect(z - 6, z + 6, 0, 270), 'fill="#e2ddd3" opacity=".7"'));
  o.push(poly([[-280, .2, 425], [280, .2, 425], [280, .2, 40], [-280, .2, 40]], 'fill="#c5ad86"'));
  for (let z = 70; z < 425; z += 115) o.push(poly([[-280, .3, z + 3], [280, .3, z + 3], [280, .3, z - 3], [-280, .3, z - 3]], 'fill="#b8c7d6" opacity=".9"'));
  DOWNLIGHTS.forEach(d => { const [cx, cy] = P(d.x, 270, d.z), r = pxSize(7, d.z); o.push(`<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(r)}" ry="${f1(r * .3)}" fill="#3a3632"/>`); });
  if (sc.window) { const w = sc.window; o.push(poly(rightWallRect(w.z0, w.z1, w.y0, w.y1), 'fill="#e8edf2"'), poly(rightWallRect(w.z0 + 3, w.z1 - 3, w.y0 + 3, w.y1 - 3), 'fill="#f6f8fb" opacity=".9"')); }
  (sc.outlets || []).forEach(([x, y]) => o.push(poly(wallRect(x - 4, x + 4, y - 6, y + 6), 'fill="#5a5f66"'), seg([x, y + 7, 499.5], [x, y + 60, 499.5], 'stroke="#c33" stroke-width=".8"')));
  (sc.pencil || []).forEach(n => { const [x, y] = S(n.p); o.push(`<text x="${f1(x)}" y="${f1(y)}" font-family="'Architects Daughter', cursive" font-size="10" fill="#3c3c3c" opacity=".8">${n.text}</text>`); });

  eachBox(sc, b => {
    const F = boxFaces(b);
    const state = b.isToe ? 'toe' : b.build || (b.mat === 'oak' || b.mat === 'slat' ? 'carcass' : 'missing');
    if (state === 'missing') {
      if (b.z1 >= 499) {
        o.push(poly(wallRect(b.x0, b.x1, b.y0, b.y1), 'fill="none" stroke="#4b4b4b" stroke-width=".7" stroke-dasharray="5 3" opacity=".75"'));
        if (b.y0 > 100) o.push(poly(wallRect(b.x0 + 4, b.x1 - 4, b.y1 - 14, b.y1 - 9), 'fill="#9aa1a8"'));
        if (b.hood) o.push(poly(wallRect((b.x0 + b.x1) / 2 - 10, (b.x0 + b.x1) / 2 + 10, b.y1 + 8, b.y1 + 26), 'fill="#2b2b2b"'));
      }
      return;
    }
    const mats = state === 'installed' ? C.oak : state === 'template' ? C.template : state === 'toe' ? C.toe : C.ply;
    Object.entries(F).forEach(([k, f]) => o.push(poly(quad(f), `fill="${mats[k]}" stroke="#8d6d45" stroke-width=".4"`)));
    if (b.fronts && F[b.fronts.face]) panels(F[b.fronts.face], b.fronts.rows).forEach(p => {
      const A = p.A, q = [A(0, 0), A(1, 0), A(1, 1), A(0, 1)];
      if (state === 'installed') {
        o.push(poly(q, 'fill="none" stroke="#1d130b" stroke-width=".8"'));
        if (p.i % 2 === 0) o.push(poly([A(.04, .04), A(.96, .04), A(.96, .7), A(.04, .9)], 'fill="#7fb6e0" opacity=".42"'));
        return;
      }
      if (p.t === 'drawer') {
        o.push(poly(q, 'fill="#3e2c1a"'), poly([A(.03, .12), A(.97, .12), A(.97, 1), A(.03, 1)], 'fill="#d8bb8c" stroke="#9c7b50" stroke-width=".4"'));
        return;
      }
      o.push(poly(q, 'fill="#4a3522"'), poly([A(0, 0), A(.07, .05), A(.07, .9), A(0, 1)], 'fill="#6f5235"'), poly([A(.07, .9), A(1, .9), A(1, 1), A(0, 1)], 'fill="#a07d52"'));
      if (p.t === 'door' && p.t1 - p.t0 > .5) o.push(poly([A(.07, .47), A(1, .47), A(1, .52), A(.07, .52)], 'fill="#b8956a"'));
      if (p.t === 'open') o.push(poly([A(.07, .05), A(.93, .05), A(.93, .9), A(.07, .9)], 'fill="#5c4329"'));
    });
  });
  (sc.pendants || []).forEach(p => o.push(seg([p.x, 270, p.z], [p.x, 238, p.z], 'stroke="#1e1e1e" stroke-width="1"'), seg([p.x + 1.2, 270, p.z], [p.x + 3, 236, p.z], 'stroke="#c33" stroke-width=".8"')));

  // leaning finished fronts waiting to be hung
  [[230, 270], [278, 318]].forEach(([z0, z1]) => {
    const b = { x0: 284, x1: 290, y0: 0, y1: 205, z0, z1 }, F = boxFaces(b);
    Object.entries(F).forEach(([k, f]) => o.push(poly(quad(f), `fill="${C.oak[k]}"`)));
    o.push(poly(quad(F.left, .05, .05, .95, .7), 'fill="#7fb6e0" opacity=".4"'));
  });
  // laser level on tripod + projected lines
  const L = [210, 118, 300];
  [[188, 0, 285], [232, 0, 285], [210, 0, 332]].forEach(f => o.push(seg(L, f, 'stroke="#2b2b2b" stroke-width="1.6"')));
  const lb = { x0: 204, x1: 216, y0: 118, y1: 132, z0: 295, z1: 305 }, LF = boxFaces(lb);
  Object.entries(LF).forEach(([k, f]) => o.push(poly(quad(f), `fill="${k === 'front' ? '#f0b400' : '#c48f00'}"`)));
  const beams = [
    [[-299.5, 150, 500], [299.5, 150, 500]], [[299.5, 150, 500], [299.5, 150, 40]], [[-299.5, 150, 500], [-299.5, 150, 40]],
    [[-5, 0, 499.5], [-5, 270, 499.5]], [[-5, 0, 499.5], [210, 0, 300]]
  ];
  o.push(`<g filter="url(#${id}b)" opacity=".7">${beams.map(([a, b]) => seg(a, b, 'stroke="#ff2b2b" stroke-width="4"')).join('')}</g>`);
  beams.forEach(([a, b]) => o.push(seg(a, b, 'stroke="#ff4d4d" stroke-width="1"')));
  const [lx, ly] = S([210, 125, 300]);
  o.push(`<circle cx="${f1(lx)}" cy="${f1(ly)}" r="3" fill="#ff3b3b"/><circle cx="${f1(lx)}" cy="${f1(ly)}" r="9" fill="#ff3b3b" opacity=".35" filter="url(#${id}b)"/>`);
  // work-light falloff + grit
  o.push(`<rect width="800" height="500" fill="url(#${id}wl)"/><rect width="800" height="500" filter="url(#${id}n)"/>`);
  return o.join('');
}

/* ---------- 3. Finished space ---------- */
function drawFinal(sc, id) {
  const o = [], C = MAT.final, floorTop = P(0, 0, 500)[1];
  const bs = sc.backsplash, wash = sc.wash || bs;
  const washTop = wash ? P(0, wash.y1, 500)[1] : 0, washBot = wash ? P(0, wash.y0, 500)[1] : 0;
  const w = sc.window || { z0: 0, z1: 0, y0: 0, y1: 0 };
  o.push(`<defs>
    <linearGradient id="${id}fl" gradientUnits="userSpaceOnUse" x1="0" y1="${f1(floorTop)}" x2="0" y2="500"><stop offset="0" stop-color="#2e221a"/><stop offset="1" stop-color="#6a4f3a"/></linearGradient>
    <linearGradient id="${id}bw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1f25"/><stop offset="1" stop-color="#262b31"/></linearGradient>
    <linearGradient id="${id}wa" gradientUnits="userSpaceOnUse" x1="0" y1="${f1(washTop)}" x2="0" y2="${f1(washBot)}"><stop offset="0" stop-color="#ffe7bf" stop-opacity=".85"/><stop offset=".35" stop-color="#ffd9a0" stop-opacity=".3"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></linearGradient>
    <linearGradient id="${id}sky" gradientUnits="userSpaceOnUse" x1="0" y1="${f1(P(300, w.y1, (w.z0 + w.z1) / 2)[1])}" x2="0" y2="${f1(P(300, w.y0, (w.z0 + w.z1) / 2)[1])}"><stop offset="0" stop-color="#1c2b4d"/><stop offset=".55" stop-color="#5d5f86"/><stop offset=".85" stop-color="#d98a5f"/><stop offset="1" stop-color="#f0b27a"/></linearGradient>
    <linearGradient id="${id}tg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#22e6ff" stop-opacity="0"/><stop offset="1" stop-color="#7ff0ff" stop-opacity=".55"/></linearGradient>
    <linearGradient id="${id}in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffdca6" stop-opacity=".45"/><stop offset="1" stop-color="#ffdca6" stop-opacity="0"/></linearGradient>
    <radialGradient id="${id}glo"><stop offset="0" stop-color="#ffd8a0" stop-opacity=".55"/><stop offset="1" stop-color="#ffd8a0" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}glb" cx="45%" cy="40%"><stop offset="0" stop-color="#fffaf0"/><stop offset=".6" stop-color="#ffdca8"/><stop offset="1" stop-color="#c88a3e"/></radialGradient>
    <radialGradient id="${id}sc"><stop offset="0" stop-color="#ffe2b5" stop-opacity=".28"/><stop offset="1" stop-color="#ffe2b5" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}vg" cx="50%" cy="45%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
    <filter id="${id}grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .012" numOctaves="3" seed="7" result="n"/><feColorMatrix in="n" values="0 0 0 0 .07  0 0 0 0 .04  0 0 0 0 .02  1.4 0 0 0 -.45" result="g"/><feComposite in="g" in2="SourceGraphic" operator="in" result="gi"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gi"/></feMerge></filter>
    <filter id="${id}b"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="${id}b2"><feGaussianBlur stdDeviation="12"/></filter>
    <filter id="${id}b1"><feGaussianBlur stdDeviation="1.6"/></filter>
  </defs>`);

  // shell
  o.push(poly(ROOM.ceil, 'fill="#121519"'), poly(ROOM.left, 'fill="#1b1f24"'), poly(ROOM.right, 'fill="#1d2126"'), poly(ROOM.back, `fill="url(#${id}bw)"`), poly(ROOM.floor, `fill="url(#${id}fl)"`));
  for (let x = -300, i = 0; x < 300; x += 20, i++) {
    o.push(seg([x, .05, -80], [x, .05, 500], 'stroke="#1a120c" stroke-width=".7" opacity=".55"'));
    for (let z = (i * 97) % 170 - 80; z < 500; z += 170) o.push(seg([x, .05, z], [x + 20, .05, z], 'stroke="#1a120c" stroke-width=".6" opacity=".45"'));
  }
  // downlights: ceiling fixtures + wall scallops
  DOWNLIGHTS.forEach(d => {
    const [cx, cy] = P(d.x, 270, d.z), r = pxSize(7, d.z), [sx, sy] = P(d.x, 205, 499);
    o.push(`<ellipse cx="${f1(sx)}" cy="${f1(sy)}" rx="${f1(pxSize(34, 500))}" ry="${f1(pxSize(75, 500))}" fill="url(#${id}sc)"/>`);
    o.push(`<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(r)}" ry="${f1(r * .3)}" fill="#fff6e2"/><ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(r * 3)}" ry="${f1(r)}" fill="#fff0d0" opacity=".25" filter="url(#${id}b1)"/>`);
  });
  if (sc.window) {
    o.push(poly(rightWallRect(w.z0, w.z1, w.y0, w.y1), 'fill="#0c0e11"'), poly(rightWallRect(w.z0 + 3, w.z1 - 3, w.y0 + 3, w.y1 - 3), `fill="url(#${id}sky)"`));
    const hills = []; for (let z = w.z0 + 3; z <= w.z1 - 3; z += 8) hills.push([299.5, w.y0 + 3 + 26 + 10 * Math.sin(z / 23) + 6 * Math.sin(z / 7), z]);
    o.push(poly([[299.5, w.y0 + 3, w.z0 + 3], ...hills, [299.5, w.y0 + 3, w.z1 - 3]], 'fill="#10131b"'));
    o.push(seg([299.4, w.y1, (w.z0 + w.z1) / 2], [299.4, w.y0, (w.z0 + w.z1) / 2], 'stroke="#0c0e11" stroke-width="3"'));
    o.push(poly([[299, .1, w.z0 + 15], [299, .1, w.z1 - 15], [160, .1, w.z1 - 70], [140, .1, w.z0 - 30]], `fill="#f3a46c" opacity=".1" filter="url(#${id}b2)"`));
  }
  if (sc.door) {
    const d = sc.door;
    o.push(poly(rightWallRect(d.z0 - 4, d.z1 + 4, 0, d.y1 + 4), 'fill="#0e0f11"'));
    o.push(`<g filter="url(#${id}grain)">${poly(rightWallRect(d.z0, d.z1, 0, d.y1, 299.4), `fill="${C.oak.left}"`)}</g>`);
    o.push(seg([299, 70, d.z0 + 12], [299, 160, d.z0 + 12], 'stroke="#b9c0c7" stroke-width="2"'));
  }
  if (bs) {
    o.push(poly(wallRect(bs.x0, bs.x1, bs.y0, bs.y1), 'fill="#dfe3e7"'));
    [0, 2.1, 4.3].forEach(k => { const v = []; for (let x = bs.x0; x <= bs.x1; x += 12) v.push([x, bs.y0 + (bs.y1 - bs.y0) * (.5 + .38 * Math.sin(x / 47 + k)), 499.5]); o.push(pline(v, 'stroke="#98a1ab" stroke-width=".6" opacity=".55"')); });
  }
  if (wash) o.push(poly(wallRect(wash.x0, wash.x1, wash.y0, wash.y1, 499.4), `fill="url(#${id}wa)"`));

  eachBox(sc, b => {
    const F = boxFaces(b), M = C[b.mat] || C.oak, wood = b.mat === 'oak' || b.mat === 'slat';
    if (b.isToe) {
      o.push(poly([[b.x0, .1, b.z0 - 8], [b.x1, .1, b.z0 - 8], [b.x1, .1, b.z0], [b.x0, .1, b.z0]], `fill="#000" opacity=".6" filter="url(#${id}b1)"`));
      o.push(poly([[b.x0, .2, b.z0 - 34], [b.x1, .2, b.z0 - 34], [b.x1, .2, b.z0], [b.x0, .2, b.z0]], `fill="url(#${id}tg)" filter="url(#${id}b)"`));
    }
    if (b.float) o.push(poly([[b.x0, .2, b.z0 - 22], [b.x1, .2, b.z0 - 22], [b.x1, .2, b.z1], [b.x0, .2, b.z1]], `fill="url(#${id}tg)" filter="url(#${id}b)"`));
    if (b.island) o.push(poly([[b.x0 - 10, .1, b.z0 - 12], [b.x1 + 14, .1, b.z0 - 12], [b.x1 + 14, .1, b.z1 + 6], [b.x0 - 10, .1, b.z1 + 6]], `fill="#000" opacity=".45" filter="url(#${id}b)"`));
    const faces = Object.entries(F).map(([k, f]) => poly(quad(f), `fill="${M[k]}"`)).join('');
    o.push(wood ? `<g filter="url(#${id}grain)">${faces}</g>` : faces);
    if (b.isToe) o.push(seg([b.x0, .5, b.z0], [b.x1, .5, b.z0], 'stroke="#9ff4ff" stroke-width="1.2"'));
    if (b.mat === 'quartz') {
      if (F.top) [0, 1.7, 3.9].forEach(k => { const v = []; for (let s = 0; s <= 1.001; s += .04) v.push(at(F.top, s, .5 + .36 * Math.sin(s * 7 + k))); o.push(pline(v, 'stroke="#9aa3ad" stroke-width=".6" opacity=".5"')); });
      o.push(seg(at(F.front, 0, 0), at(F.front, 1, 0), 'stroke="#fff" stroke-width=".8" opacity=".7"'));
    }
    if (b.mat === 'slat' && F.front) for (let s = .05; s < 1; s += .05) o.push(seg(at(F.front, s, 0), at(F.front, s, 1), 'stroke="#140d08" stroke-width="1.3" opacity=".8"'));
    if (b.mat === 'metal' && F.front) o.push(seg(at(F.front, 0, .02), at(F.front, 1, .02), 'stroke="#d5dadf" stroke-width=".8"'));
    if (b.fronts && F[b.fronts.face]) panels(F[b.fronts.face], b.fronts.rows).forEach(p => {
      const A = p.A, q = [A(0, 0), A(1, 0), A(1, 1), A(0, 1)];
      if (p.t === 'open') {
        const inner = [A(.07, .06), A(.93, .06), A(.93, .94), A(.07, .94)];
        o.push(poly(q, 'fill="#120d09"'), poly(inner, 'fill="#21180f"'), poly(inner, `fill="url(#${id}in)"`));
        o.push(seg(A(.08, .05), A(.92, .05), `stroke="#ffe6bd" stroke-width="3" opacity=".7" filter="url(#${id}b1)"`), seg(A(.08, .05), A(.92, .05), 'stroke="#fff4dd" stroke-width="1"'));
        if (b.hooks) [.32, .68].forEach(s => { const [hx, hy] = S(A(s, .32)); o.push(`<circle cx="${f1(hx)}" cy="${f1(hy)}" r="1.8" fill="#c3c9cf"/>`); });
        return;
      }
      o.push(poly(q, 'fill="none" stroke="#0c0704" stroke-width=".9"'));
      if (p.t === 'drawer' || p.t === 'flap') o.push(seg(A(.03, .03), A(.97, .03), 'stroke="#d8c4a4" stroke-width=".8" opacity=".35"'));
      else { const e = p.i % 2 ? 0.015 : 0.985; o.push(seg(A(e, .05), A(e, .95), 'stroke="#e0caa8" stroke-width=".8" opacity=".22"')); }
    });
    if (b.led) {
      const a = F.bottom ? at(F.bottom, .02, .12) : [b.x0 + 2, b.y0 - .3, b.z0 + 3], c = F.bottom ? at(F.bottom, .98, .12) : [b.x1 - 2, b.y0 - .3, b.z0 + 3];
      o.push(seg(a, c, `stroke="#ffe9c6" stroke-width="7" opacity=".55" filter="url(#${id}b)"`), seg(a, c, 'stroke="#fffaf0" stroke-width="1.6"'));
    }
  });
  if (sc.cooktop) {
    const c = sc.cooktop, cx = (c.x0 + c.x1) / 2, cz = (c.z0 + c.z1) / 2;
    o.push(poly([[c.x0, c.y + .1, c.z1], [c.x1, c.y + .1, c.z1], [c.x1, c.y + .1, c.z0], [c.x0, c.y + .1, c.z0]], 'fill="#0a0b0d"'));
    [-17, 17].forEach(dx => o.push(pline(ring(cx + dx, c.y + .2, cz, 10), 'stroke="#3d4147" stroke-width=".8"')));
  }
  (sc.pendants || []).forEach(p => {
    const [gx, gy] = P(p.x, 158, p.z), r = pxSize(9, p.z);
    o.push(`<circle cx="${f1(gx)}" cy="${f1(gy)}" r="${f1(r * 7)}" fill="url(#${id}glo)"/>`);
    o.push(seg([p.x, 270, p.z], [p.x, 167, p.z], 'stroke="#0a0a0a" stroke-width="1"'));
    o.push(`<circle cx="${f1(gx)}" cy="${f1(gy)}" r="${f1(r)}" fill="url(#${id}glb)"/>`);
  });
  o.push(`<rect width="800" height="500" fill="url(#${id}vg)"/>`);
  return o.join('');
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
  layers.forEach((el, i) => withImage(el, renderScene('kitchen', modes[i]), STAGE_IMAGES[i]));

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
  { id: 'nocturne', cat: 'kitchen', layout: 'galley', name: 'Nocturne Suite', meta: 'Lift-up flaps · 6m quartz run · Toe-kick LED' },
  { id: 'matrix', cat: 'entry', layout: 'mudroom', name: 'Mudroom Matrix', meta: '5-bay lockers · Charging cubbies · Drawers' }
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
    el.firstChild || withImage(el, renderScene(el.dataset.layout, el.dataset.mode), el.dataset.img);
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
        body: JSON.stringify({ access_key: CONFIG.WEB3FORMS_ACCESS_KEY, subject: CONFIG.SUBJECT, from_name: 'Kamo Abrahim Website', replyto: data.email, botcheck: data.botcheck, ...payload })
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
      const tick = now => { const k = Math.max(0, Math.min(1, (now - t0) / 1600)); c.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString('en-US') + (k === 1 ? '+' : ''); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }
    io.unobserve(en.target);
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
