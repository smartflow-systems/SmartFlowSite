/* Build: reads content and generates static pages, RSS, sitemap */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { marked } from "marked";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const BLOG_DIR = path.join(CONTENT, "posts");
const UPD_DIR = path.join(CONTENT, "updates");
const DIST_BLOG = path.join(ROOT, "blog");

function readJSON(fp, fallback = []) {
  try { return JSON.parse(fs.readFileSync(fp, "utf8")); } catch { return fallback; }
}
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function parseMD(md) {
  // front-matter: ---\nkey: value\n---
  let fm = {};
  let body = md;
  const m = md.match(/^---\n([\s\S]*?)\n---\n?/);
  if (m) {
    const lines = m[1].split("\n");
    for (const line of lines) {
      const i = line.indexOf(":");
      if (i > -1) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
    body = md.slice(m[0].length);
  }
  return { fm, html: marked.parse(body) };
}
function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
function readMDDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const { fm, html } = parseMD(raw);
      const title = fm.title || f.replace(/\.md$/, "");
      const date = fm.date || new Date().toISOString().slice(0, 10);
      const tags = (fm.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
      const slug = fm.slug || slugify(title);
      const excerpt = fm.excerpt || html.replace(/<[^>]+>/g, " ").slice(0, 180).trim() + "…";
      return { title, date, tags, slug, html, excerpt };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function templatePage({ title, body, description = "", extraHead = "" }) {
  const css = "styles.css";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${description.replace(/"/g, "&quot;")}">
<link rel="icon" href="/assets/favicon.svg">
<link rel="stylesheet" href="/${css}">
${extraHead}
</head>
<body>
<header class="nav">
  <div class="brand"><img class="logo" src="/assets/smartflow-logo.png" alt=""><span>SmartFlow Systems</span></div>
  <nav>
    <a href="/index.html#projects">Projects</a>
    <a href="/pricing.html">Pricing</a>
    <a href="/blog/index.html">Blog</a>
    <a href="/updates.html">Updates</a>
    <a href="/contact.html">Contact</a>
  </nav>
</header>
${body}
<footer class="footer">
  <div>© <span id="year"></span> SmartFlow Systems — Gareth Bowers</div>
  <div class="links"><a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a></div>
</footer>
<script>document.getElementById('year').textContent = new Date().getFullYear()</script>
</body>
</html>`;
}

function writeFileSafe(fp, content) {
  ensureDir(path.dirname(fp));
  fs.writeFileSync(fp, content);
}

/* Build blog list + individual posts */
function buildBlog() {
  const posts = readMDDir(BLOG_DIR);
  // index
  const items = posts
    .map(
      (p) => `<article class="card" style="padding:16px">
  <h3 style="margin:0"><a href="/blog/${p.slug}.html">${p.title}</a></h3>
  <div style="color:#cbbf9b;font-size:12px">${p.date} · ${p.tags.join(", ")}</div>
  <p>${p.excerpt}</p>
</article>`
    )
    .join("\n");
  const indexHTML = templatePage({
    title: "Blog — SmartFlow Systems",
    description: "Tutorials, launches, and growth notes.",
    body: `<section class="section"><h1 class="section-title">Blog</h1><div class="grid">${items || "<p>No posts yet.</p>"}</div></section>`,
  });
  writeFileSafe(path.join(DIST_BLOG, "index.html"), indexHTML);

  // posts
  for (const p of posts) {
    const postHTML = templatePage({
      title: `${p.title} — SmartFlow Blog`,
      description: p.excerpt,
      extraHead: `<meta property="og:title" content="${p.title}"><meta property="og:description" content="${p.excerpt}">`,
      body: `<main class="section" style="max-width:900px;margin:0 auto">
  <h1 class="section-title">${p.title}</h1>
  <div style="color:#cbbf9b;margin:6px 0 16px">${p.date} · ${p.tags.join(", ")}</div>
  <article class="card" style="padding:16px">${p.html}</article>
  <p style="margin-top:16px"><a class="btn btn-ghost" href="/blog/index.html">← Back to Blog</a></p>
</main>`,
    });
    writeFileSafe(path.join(DIST_BLOG, `${p.slug}.html`), postHTML);
  }
  return posts;
}

/* Build updates/changelog */
function buildUpdates() {
  const ups = readMDDir(UPD_DIR);
  const body = `<section class="section"><h1 class="section-title">Updates & Changelog</h1>
${ups
  .map(
    (u) => `<article class="card" style="padding:16px">
  <h3 style="margin:0">${u.title}</h3>
  <div style="color:#cbbf9b;font-size:12px">${u.date}</div>
  <div style="margin-top:10px">${u.html}</div>
</article>`
  )
  .join("\n")}
</section>`;
  const html = templatePage({ title: "Updates — SmartFlow Systems", description: "Latest product changes and releases.", body });
  writeFileSafe(path.join(ROOT, "updates.html"), html);
  return ups;
}

/* Read projects for RSS/links */
function readProjects() {
  const file = path.join(ROOT, "data", "projects.json");
  return readJSON(file, []);
}

/* RSS & sitemap */
function buildRSS(posts) {
  const site = "https://smartflowsite.example"; // replace after deploy
  const items = posts
    .slice(0, 15)
    .map(
      (p) => `<item>
<title>${p.title}</title>
<link>${site}/blog/${p.slug}.html</link>
<guid>${site}/blog/${p.slug}.html</guid>
<pubDate>${new Date(p.date).toUTCString()}</pubDate>
<description><![CDATA[${p.excerpt}]]></description>
</item>`
    )
    .join("\n");
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>SmartFlow Systems Blog</title>
<link>${site}</link>
<description>Tutorials, launches, growth notes.</description>
${items}
</channel></rss>`;
  writeFileSafe(path.join(ROOT, "rss.xml"), rss);
}

function buildSitemap() {
  const site = "https://smartflowsite.example"; // replace after deploy
  const base = [
    "/index.html",
    "/pricing.html",
    "/contact.html",
    "/updates.html",
    "/privacy.html",
    "/terms.html"
  ];
  const posts = fs.existsSync(DIST_BLOG)
    ? fs.readdirSync(DIST_BLOG).filter((f) => f.endsWith(".html")).map((f) => `/blog/${f}`)
    : [];
  const urls = base.concat(posts);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${site}${u}</loc></url>`).join("\n")}
</urlset>`;
  writeFileSafe(path.join(ROOT, "sitemap.xml"), xml);
}

/* Build flow */
ensureDir(DIST_BLOG);
const posts = buildBlog();
const ups = buildUpdates();
buildRSS(posts);
buildSitemap();
console.log(`Built: ${posts.length} posts, ${ups.length} updates.`);