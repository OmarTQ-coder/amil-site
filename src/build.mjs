// Builds the amil.sa website into site/docs. Run: node site/src/build.mjs
// Arabic pages live at the root (/, /privacy/, /terms/, /support/); English under /en/.
// The Arabic terms come word for word from docs/terms-ar.md (the owner's text).
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = dirname(fileURLToPath(import.meta.url));
const root = join(src, '..', '..'); // C:\Users\OmarTQ\Projects\aamel
const out = join(src, '..', 'docs'); // GitHub Pages serves this folder
const read = (p) => readFileSync(p, 'utf8');
const write = (p, s) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, s); };

rmSync(out, { recursive: true, force: true });

// Assets: fonts, logos, icons
const fonts = join(root, 'app', 'node_modules', '@expo-google-fonts');
copy(join(fonts, 'ibm-plex-sans-arabic', '400Regular', 'IBMPlexSansArabic_400Regular.ttf'), 'assets/fonts/IBMPlexSansArabic-400.ttf');
copy(join(fonts, 'ibm-plex-sans-arabic', '600SemiBold', 'IBMPlexSansArabic_600SemiBold.ttf'), 'assets/fonts/IBMPlexSansArabic-600.ttf');
copy(join(fonts, 'readex-pro', '600SemiBold', 'ReadexPro_600SemiBold.ttf'), 'assets/fonts/ReadexPro-600.ttf');
const logo = join(root, 'design', 'brand-studio', '07-final', 'logo');
copy(join(logo, 'wordmark-main-primary.svg'), 'assets/wordmark.svg');
// Dark mode: the reversed-on-night file without its background square
write(join(out, 'assets', 'wordmark-dark.svg'),
  read(join(logo, 'wordmark-main-reversed-on-night.svg')).replace(/<rect[^>]*fill="#0B2328"[^>]*\/>/, ''));
copy(join(root, 'app', 'apps', 'customer', 'assets', 'icon.png'), 'assets/icon-customer.png');
copy(join(root, 'app', 'apps', 'provider', 'assets', 'icon.png'), 'assets/icon-partner.png');
copy(join(src, 'site.css'), 'assets/site.css');

function copy(from, to) {
  if (!existsSync(from)) throw new Error('Missing ' + from);
  mkdirSync(dirname(join(out, to)), { recursive: true });
  copyFileSync(from, join(out, to));
}

// Words that change with the language
const L = {
  ar: {
    dir: 'rtl', base: '/', other: 'en', otherLabel: 'English', skip: 'تخطَّ إلى المحتوى',
    nav: { support: 'الدعم', privacy: 'الخصوصية', terms: 'الشروط والأحكام' },
    home: 'عامل، الصفحة الرئيسية',
    legal: 'منصة ربط فقط، لا توفّر العمالة',
    company: 'عامل © 2026. <span class="todo">الاسم النظامي للشركة ورقم السجل التجاري يُضافان عند صدور السجل</span>',
    siteName: 'عامل',
  },
  en: {
    dir: 'ltr', base: '/en/', other: 'ar', otherLabel: 'العربية', skip: 'Skip to content',
    nav: { support: 'Support', privacy: 'Privacy', terms: 'Terms' },
    home: 'Aamel home',
    legal: 'A connecting platform only; it does not supply labour. <span lang="ar" dir="rtl">(منصة ربط فقط، لا توفّر العمالة)</span>',
    company: '© 2026 Aamel (عامل). <span class="todo">Company legal name and Commercial Registration number to be added once issued</span>',
    siteName: 'Aamel',
  },
};

const pages = [
  { slug: '', key: 'home' },
  { slug: 'support/', key: 'support' },
  { slug: 'privacy/', key: 'privacy' },
  { slug: 'terms/', key: 'terms' },
];

const content = {
  ar: {
    home: { title: 'عامل | كم ساعة تحتاج؟', desc: 'احجز شخصًا بالساعة لنقل الأغراض والتنظيف وأعمال الحديقة. السعر يظهر كاملًا قبل التأكيد.', body: read(join(src, 'content', 'ar-home.html')) },
    support: { title: 'الدعم | عامل', desc: 'تواصل مع فريق دعم عامل، وإجابات الأسئلة الشائعة، وطريقة حذف الحساب.', body: read(join(src, 'content', 'ar-support.html')) },
    privacy: { title: 'سياسة الخصوصية | عامل', desc: 'كيف تجمع منصة عامل بياناتك وتستخدمها وتحميها، وحقوقك في نظام حماية البيانات الشخصية.', body: read(join(src, 'content', 'ar-privacy.html')) },
    terms: { title: 'الشروط والأحكام | عامل', desc: 'الشروط والأحكام لاستخدام منصة عامل.', body: termsFromOwnerText() },
  },
  en: {
    home: { title: 'Aamel | How many hours do you need?', desc: 'Book a person by the hour for moving, cleaning and garden work in Saudi Arabia. The full price shows before you confirm.', body: read(join(src, 'content', 'en-home.html')) },
    support: { title: 'Support | Aamel', desc: 'Contact Aamel support, common questions, and how to delete your account.', body: read(join(src, 'content', 'en-support.html')) },
    privacy: { title: 'Privacy Policy | Aamel', desc: 'How Aamel collects, uses and protects your personal data, and your rights under the Saudi Personal Data Protection Law.', body: read(join(src, 'content', 'en-privacy.html')) },
    terms: { title: 'Terms and Conditions | Aamel', desc: 'The terms and conditions for using the Aamel platform (English translation).', body: read(join(src, 'content', 'en-terms.html')) },
  },
};

for (const lang of ['ar', 'en']) {
  for (const p of pages) {
    const c = content[lang][p.key];
    write(join(out, lang === 'ar' ? '' : 'en', p.slug, 'index.html'), page(lang, p, c));
  }
}
write(join(out, '404.html'), notFound());
write(join(out, 'CNAME'), 'amil.sa\n');           // GitHub Pages custom domain
write(join(out, '.nojekyll'), '');
write(join(out, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://amil.sa/sitemap.xml\n');
write(join(out, 'sitemap.xml'), sitemap());
console.log('Built', out);

function page(lang, p, c) {
  const t = L[lang];
  const o = L[t.other];
  const here = t.base + p.slug;
  const there = o.base + p.slug;
  const navLink = (k) => `<a href="${t.base}${k}/"${p.key === k ? ' aria-current="page"' : ''}>${t.nav[k]}</a>`;
  return `<!doctype html>
<html lang="${lang}" dir="${t.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${c.title}</title>
<meta name="description" content="${c.desc}">
<link rel="canonical" href="https://amil.sa${here}">
<link rel="alternate" hreflang="${lang}" href="https://amil.sa${here}">
<link rel="alternate" hreflang="${t.other}" href="https://amil.sa${there}">
<meta name="theme-color" content="#F4EDE1" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0B2328" media="(prefers-color-scheme: dark)">
<meta property="og:title" content="${c.title}">
<meta property="og:description" content="${c.desc}">
<meta property="og:image" content="https://amil.sa/assets/icon-customer.png">
<link rel="icon" href="/assets/icon-customer.png" type="image/png">
<link rel="apple-touch-icon" href="/assets/icon-customer.png">
<link rel="stylesheet" href="/assets/site.css">
</head>
<body>
<a class="skip" href="#main">${t.skip}</a>
<header class="site-head">
  <div class="wrap">
    <a class="brand" href="${t.base}" aria-label="${t.home}">${wordmark(lang)}</a>
    <nav class="nav" aria-label="${lang === 'ar' ? 'القائمة' : 'Main'}">
      ${navLink('support')}
      ${navLink('privacy')}
      ${navLink('terms')}
      <a class="lang" href="${there}" lang="${t.other}" hreflang="${t.other}">${t.otherLabel}</a>
    </nav>
  </div>
</header>
<main id="main">
${c.body.trim()}
</main>
<footer class="site-foot">
  <div class="wrap">
    <div>
      <p class="legal">${t.legal}</p>
      <p>${t.company}</p>
    </div>
    <nav aria-label="${lang === 'ar' ? 'روابط' : 'Links'}">
      <a href="${t.base}support/">${t.nav.support}</a>
      <a href="${t.base}privacy/">${t.nav.privacy}</a>
      <a href="${t.base}terms/">${t.nav.terms}</a>
      <a href="mailto:support@amil.sa" class="ltr">support@amil.sa</a>
    </nav>
  </div>
</footer>
</body>
</html>
`;
}

function wordmark(lang) {
  return `<picture><source srcset="/assets/wordmark-dark.svg" media="(prefers-color-scheme: dark)"><img src="/assets/wordmark.svg" alt="${lang === 'ar' ? 'عامل' : 'Aamel'}" width="77" height="64"></picture>`;
}

function notFound() {
  return `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>الصفحة غير موجودة | عامل</title><link rel="stylesheet" href="/assets/site.css"></head>
<body><main id="main" class="wrap narrow doc">
<a class="brand" href="/">${wordmark('ar')}</a>
<h1 style="margin-top:24px">لم نجد هذه الصفحة</h1>
<p class="intro">قد يكون الرابط قديمًا. <a href="/">ارجع إلى الصفحة الرئيسية</a>.</p>
<p lang="en" dir="ltr">Page not found. <a href="/en/">Go to the home page</a>.</p>
</main></body></html>
`;
}

function sitemap() {
  const urls = [];
  for (const lang of ['ar', 'en']) for (const p of pages) urls.push(`https://amil.sa${L[lang].base}${p.slug}`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`;
}

// docs/terms-ar.md to HTML, keeping the owner's words unchanged.
function termsFromOwnerText() {
  const lines = read(join(root, 'docs', 'terms-ar.md')).split(/\r?\n/).map((s) => s.trim());
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let html = '';
  const toc = [];
  let list = false;
  let title = '';
  let updated = '';
  const close = () => { if (list) { html += '</ul>\n'; list = false; } };
  for (let line of lines) {
    if (!line || line === '⸻') { close(); continue; }
    if (line.startsWith('[ملاحظة')) continue;                 // a note to the owner, not part of the terms
    if (!title) { title = line; continue; }
    if (line.startsWith('آخر تحديث')) { updated = line; continue; }
    const h = line.match(/^(\d+)\.\s+(.+)$/);
    if (h) {
      close();
      toc.push([h[1], h[2]]);
      html += `<h2 id="s${h[1]}">${h[1]}. ${esc(h[2])}</h2>\n`;
      continue;
    }
    if (line.startsWith('* ')) {
      if (!list) { html += '<ul>\n'; list = true; }
      html += `<li>${esc(line.slice(2))}</li>\n`;
      continue;
    }
    close();
    let text = esc(line).replace('سياسة خصوصية مستقلة', '<a href="/privacy/">سياسة خصوصية مستقلة</a>');
    const cls = /[×=]/.test(line) ? ' class="example"' : line.includes('→') ? ' class="flow"' : '';
    html += `<p${cls}>${text}</p>\n`;
  }
  close();
  const tocHtml = `<nav class="toc" aria-label="المحتويات"><ol>${toc.map(([n, t]) => `<li value="${n}"><a href="#s${n}">${esc(t)}</a></li>`).join('')}</ol></nav>`;
  return `<article class="wrap narrow doc">
<h1>${esc(title)}</h1>
<p class="updated">${esc(updated)}</p>
${tocHtml}
${html}</article>`;
}
