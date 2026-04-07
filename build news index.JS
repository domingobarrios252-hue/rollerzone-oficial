/**
 * build-news-index.js
 * ============================================================
 * Script de build para Netlify.
 * Genera /noticias/index.json y /patrocinadores/index.json
 * leyendo los archivos Markdown creados por Netlify CMS.
 *
 * USO:
 *   node build-news-index.js
 *
 * Añadir en netlify.toml o package.json como parte del build:
 *   command = "node build-news-index.js && <tu comando de build>"
 * ============================================================
 */

const fs   = require('fs');
const path = require('path');

/* ── Parsea front-matter YAML simple ─── */
function parseFrontMatter(raw) {
  const meta = {};
  let body = raw;
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (match) {
    match[1].split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx === -1) return;
      let key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      // Booleans
      if (val === 'true')  val = true;
      if (val === 'false') val = false;
      meta[key] = val;
    });
    body = match[2];
  }
  return { meta, body };
}

/* ── Genera slug desde nombre de archivo ─ */
function fileToSlug(filename) {
  // e.g. "2025-07-14-espana-arrasa.md" → "2025-07-14-espana-arrasa"
  return path.basename(filename, '.md');
}

/* ── Extrae excerpt del body si no existe en meta ─ */
function extractExcerpt(body, maxLen = 200) {
  const txt = body
    .replace(/#{1,6}\s[^\n]+/g, '')
    .replace(/[*_`>]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();
  return txt.length > maxLen ? txt.slice(0, maxLen).replace(/\s\w+$/, '') + '…' : txt;
}

/* ── Procesa una carpeta de colección ─── */
function processCollection(folder) {
  const dir = path.join(__dirname, folder);
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  Carpeta no encontrada: ${folder}`);
    return [];
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  const items = [];

  files.forEach(file => {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const { meta, body } = parseFrontMatter(raw);
    const slug = fileToSlug(file);

    // Para noticias: asegurar excerpt
    if (!meta.excerpt && body) {
      meta.excerpt = extractExcerpt(body);
    }

    items.push({
      slug,
      body,          // body completo para página individual
      ...meta
    });
  });

  return items;
}

/* ── Main ──────────────────────────────── */
function build() {
  console.log('🔨 Generando índices JSON...');

  // Noticias
  const noticias = processCollection('noticias');
  noticias.sort((a, b) => new Date(b.date) - new Date(a.date));

  // No incluir body en el índice de portada (ahorra peso)
  const noticiasSinBody = noticias.map(({ body, ...rest }) => rest);
  fs.writeFileSync(
    path.join(__dirname, 'noticias', 'index.json'),
    JSON.stringify(noticiasSinBody, null, 2)
  );
  console.log(`✅ noticias/index.json — ${noticias.length} noticias`);

  // Guardar también cada noticia como JSON individual (para noticia.html)
  noticias.forEach(n => {
    fs.writeFileSync(
      path.join(__dirname, 'noticias', n.slug + '.json'),
      JSON.stringify(n, null, 2)
    );
  });
  console.log(`✅ noticias/*.json — archivos individuales generados`);

  // Patrocinadores
  const sponsors = processCollection('patrocinadores');
  fs.writeFileSync(
    path.join(__dirname, 'patrocinadores', 'index.json'),
    JSON.stringify(sponsors, null, 2)
  );
  console.log(`✅ patrocinadores/index.json — ${sponsors.length} patrocinadores`);

  console.log('🎉 Build completado.');
}

build();