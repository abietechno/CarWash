// Gambar pratinjau link landing (og:image, 1200x630) per bahasa -> backend/public/og/washwuzz-{id,ms,en}.png.
// Jalankan dari root repo: node tools/og-image/make-og.mjs  (Node 22.18+, pakai Edge/Chrome headless).
// Teksnya harus sama dengan landing.meta.image_alt di backend/lang/{id,ms,en}/landing.php.
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { carSvg } from '../../dash-admin/src/lib/carSvg.ts';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const OUT = join(ROOT, 'backend/public/og');
const LOGO = pathToFileURL(join(ROOT, 'backend/public/logo-white.png')).href;
const BROWSER = process.env.BROWSER ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

const COPY = {
  id: {
    title: 'Bisnis cuci mobil &amp; motor, online dalam 5 menit.',
    sub: 'Situs sendiri, reservasi, antrian live, kasir, dan laporan uang.',
    cta: 'Daftar gratis di',
    size: 66,
  },
  ms: {
    title: 'Perniagaan cuci kereta &amp; motosikal, dalam talian dalam 5 minit.',
    sub: 'Laman sendiri, tempahan, giliran langsung, juruwang dan laporan kewangan.',
    cta: 'Daftar percuma di',
    size: 56,
  },
  en: {
    title: 'Your car &amp; motorbike wash, online in 5 minutes.',
    sub: 'Your own site, bookings, a live queue, a cashier and money reports.',
    cta: 'Sign up free at',
    size: 66,
  },
};

// Jalur bay seperti papan antrian situs tenant: aspal, garis kuning putus-putus, kendaraan tampak atas.
const LANES = [
  { ticket: 'A-001', type: 'compact', color: 'white', shift: 0 },
  { ticket: 'A-002', type: 'motor_matic', color: 'red', shift: 70 },
  { ticket: 'A-003', type: 'medium', color: 'yellow', shift: 24 },
];

const page = (lang, c) => `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Inter:wght@500;600;700&display=block" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body { position: relative; background: #1a5fe0; color: #fff; font-family: Inter, sans-serif; }
  .copy { position: absolute; left: 72px; top: 62px; width: 610px; }
  .brand { display: flex; align-items: center; gap: 14px; }
  .brand img { height: 52px; }
  .brand span { font: 800 40px/1 'Bricolage Grotesque', sans-serif; letter-spacing: -0.02em; }
  h1 { margin-top: 40px; font: 800 ${c.size}px/1.04 'Bricolage Grotesque', sans-serif; letter-spacing: -0.025em; }
  .sub { margin-top: 22px; max-width: 560px; font: 500 26px/1.35 Inter, sans-serif; color: #e3ecff; }
  .cta { position: absolute; left: 72px; bottom: 58px; display: inline-flex; gap: 10px; padding: 17px 28px; border-radius: 16px;
         background: #fff; color: #0b1a2e; font: 600 24px/1 Inter, sans-serif; }
  .cta b { font-weight: 700; color: #1a5fe0; }
  .lanes { position: absolute; top: 58px; right: -90px; width: 560px; display: flex; flex-direction: column; gap: 24px; transform: rotate(-6deg); }
  .lane { position: relative; height: 150px; border-radius: 26px; box-shadow: 0 18px 40px rgba(6, 16, 31, 0.35);
          background:
            repeating-linear-gradient(90deg, #facc15 0 16px, transparent 16px 30px) top 12px left 0 / 100% 4px no-repeat,
            repeating-linear-gradient(90deg, #facc15 0 16px, transparent 16px 30px) bottom 12px left 0 / 100% 4px no-repeat,
            #3a4250; }
  .lane svg { position: absolute; top: 14px; left: 120px; height: 122px; width: 244px; }
  .ticket { position: absolute; left: 22px; top: 50%; transform: translateY(-50%); padding: 9px 12px; border-radius: 10px;
            background: #fff; color: #0b1a2e; font: 700 20px/1 Inter, sans-serif; }
</style>
</head>
<body>
  <div class="copy">
    <div class="brand"><img src="${LOGO}" alt=""><span>WashWuzz</span></div>
    <h1>${c.title}</h1>
    <p class="sub">${c.sub}</p>
  </div>
  <div class="cta">${c.cta} <b>washwuzz.cloudbizz.my.id</b></div>
  <div class="lanes">
    ${LANES.map((l) => `<div class="lane" style="margin-left:${l.shift}px"><span class="ticket">${l.ticket}</span>${carSvg(l.type, l.color)}</div>`).join('\n    ')}
  </div>
</body>
</html>`;

mkdirSync(OUT, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'washwuzz-og-'));
try {
  for (const [lang, c] of Object.entries(COPY)) {
    const html = join(work, `og-${lang}.html`);
    const png = join(OUT, `washwuzz-${lang}.png`);
    writeFileSync(html, page(lang, c));
    // virtual-time-budget memberi waktu font Google termuat sebelum screenshot.
    spawnSync(BROWSER, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--no-first-run',
      `--user-data-dir=${join(work, 'profile')}`, '--window-size=1200,630', '--virtual-time-budget=8000',
      `--screenshot=${png}`, pathToFileURL(html).href,
    ], { timeout: 60000 });
    console.log('wrote', png);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
