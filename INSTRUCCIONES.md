# 📋 INSTRUCCIONES DE IMPLEMENTACIÓN — RollerZone CMS
## Sistema completo de revista dinámica con Netlify CMS

---

## ÍNDICE DE ARCHIVOS ENTREGADOS

```
rollerzone/
├── config.yml                          → Reemplaza tu /admin/config.yml actual
├── netlify.toml                        → Añadir en la raíz del proyecto
├── build-news-index.js                 → Script de build (raíz del proyecto)
├── js/
│   └── cms-loader.js                   → Motor dinámico de noticias y patrocinadores
├── noticias/
│   └── 2025-07-14-espana-arrasa...md   → Ejemplo de noticia
├── patrocinadores/
│   ├── rollerblade-pro.md              → Ejemplo patrocinador oro
│   └── speedgear-espana.md             → Ejemplo patrocinador plata
└── INSTRUCCIONES.md                    → Este archivo
```

---

## PASO 1 — CONFIG.YML

Reemplaza `/admin/config.yml` con el archivo `config.yml` entregado.
Añade la colección **patrocinadores** y mejora la de **noticias** con más campos.

---

## PASO 2 — NETLIFY.toml

Crea o reemplaza `netlify.toml` en la raíz:
```toml
[build]
  command = "node build-news-index.js"
  publish = "."

[[redirects]]
  from = "/admin"
  to = "/admin/index.html"
  status = 200
```

---

## PASO 3 — SCRIPT DE BUILD

Copia `build-news-index.js` a la raíz del proyecto.
Este script genera automáticamente:
- `/noticias/index.json` — lista de todas las noticias (sin body)
- `/noticias/[slug].json` — cada noticia individual con su contenido
- `/patrocinadores/index.json` — lista de patrocinadores

Se ejecuta en cada deploy de Netlify.

---

## PASO 4 — CAMBIOS EN index.html

### 4a. Añadir CSS de patrocinadores (antes del cierre </style>)

```css
/* ===================================================
   PATROCINADORES — Sistema dinámico CMS
   =================================================== */
.sponsors-section {
  background: var(--dark);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.sponsors-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--border);
}

.sponsor-card {
  position: relative;
  background: var(--card);
  padding: 2rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: background 0.25s, transform 0.25s;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
}

.sponsor-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--border-solid);
  transition: background 0.25s;
}

.sponsor-card:hover {
  background: var(--card2);
  transform: translateY(-3px);
}

/* Color del borde superior según nivel */
.sponsor-oro::before   { background: var(--gold); }
.sponsor-plata::before { background: #C0C0C0; }
.sponsor-bronce::before{ background: #CD7F32; }

.sponsor-level-badge {
  position: absolute;
  top: 0.6rem;
  right: 0.75rem;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 0;
}

.sponsor-oro   .sponsor-level-badge { color: var(--gold);   background: rgba(245,166,35,.12);  border: 1px solid rgba(245,166,35,.3); }
.sponsor-plata .sponsor-level-badge { color: #C0C0C0;       background: rgba(192,192,192,.1);  border: 1px solid rgba(192,192,192,.25); }
.sponsor-bronce .sponsor-level-badge{ color: #CD7F32;       background: rgba(205,127,50,.1);   border: 1px solid rgba(205,127,50,.25); }

.sponsor-logo-wrap {
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.sponsor-logo {
  max-width: 130px;
  max-height: 70px;
  object-fit: contain;
  filter: grayscale(30%);
  transition: filter 0.25s, transform 0.25s;
}

.sponsor-card:hover .sponsor-logo {
  filter: grayscale(0%) brightness(1.1);
  transform: scale(1.05);
}

.sponsor-logo-placeholder {
  width: 70px;
  height: 70px;
  background: var(--card2);
  border: 1px solid var(--border-solid);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 32px;
  color: var(--gold);
  letter-spacing: 2px;
  transition: background 0.25s;
}

.sponsor-card:hover .sponsor-logo-placeholder {
  background: var(--border-solid);
}

.sponsor-info {
  flex: 1;
}

.sponsor-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--text);
  margin-bottom: 0.4rem;
  line-height: 1.2;
}

.sponsor-desc {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
}

.sponsor-arrow {
  margin-top: 1rem;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 14px;
  color: var(--gold);
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity 0.2s, transform 0.2s;
}

.sponsor-card:hover .sponsor-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* ── Sección noticias CMS ── */
#cms-hero { display: block; }

#cms-news-grid .news-grid,
#cms-news-grid .more-news-grid {
  /* Hereda estilos existentes */
}

/* ── Loading state ── */
.cms-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 13px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--muted);
}

.cms-loading::before {
  content: '';
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-solid);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.75rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Responsive sponsors ── */
@media (max-width: 900px) {
  .sponsors-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 520px) {
  .sponsors-grid {
    grid-template-columns: 1fr 1fr;
  }
  .sponsor-logo-wrap {
    height: 60px;
  }
}
```

### 4b. Actualizar el bloque NAV (añadir "Patrocinadores")

Busca la línea con `<li><a href="#revista">Revista</a></li>` y añade DESPUÉS:

```html
<li><a href="#patrocinadores">Patrocinadores</a></li>
```

Y en el menú móvil `.mobile-menu`, añade:
```html
<a href="#patrocinadores">Patrocinadores</a>
```

### 4c. Reemplazar el HERO estático por contenedor dinámico

Busca y REEMPLAZA toda la sección hero estática:
```html
<!-- ===== HERO (dinámico) ===== -->
<section class="hero" id="hero-section">
  ...contenido estático...
</section>
```

Por este contenedor dinámico:
```html
<!-- ===== HERO — Inyectado dinámicamente por cms-loader.js ===== -->
<div id="cms-hero">
  <!-- Estado de carga inicial -->
  <section class="hero" id="portada">
    <div class="hero-bg"></div>
    <div class="hero-accent"></div>
    <div class="hero-lines"></div>
    <div class="hero-number">01</div>
    <div class="hero-content">
      <div class="cms-loading" style="position:relative;height:auto;margin-bottom:2rem;justify-content:flex-start;"></div>
      <h1 class="hero-title" style="opacity:.2;">Cargando portada…</h1>
    </div>
  </section>
</div>
```

### 4d. Reemplazar el bloque de NOTICIAS estático

Busca:
```html
<!-- ===== NOTICIAS ===== -->
<div id="noticias">
  <div class="section">
    <div class="section-header reveal">
      <h2 class="section-title">Últimas <em>Noticias</em></h2>
      <a class="see-all" href="#">Ver todas →</a>
    </div>
    <div class="news-grid reveal" id="news-grid"></div>
    <div class="more-news-grid reveal reveal-delay-1" id="more-news-grid"></div>
  </div>
</div>
```

Reemplázalo por:
```html
<!-- ===== NOTICIAS — Dinámicas desde CMS ===== -->
<div id="noticias">
  <div class="section">
    <div class="section-header reveal">
      <h2 class="section-title">Últimas <em>Noticias</em></h2>
      <a class="see-all" href="#" class="see-all">Ver todas →</a>
    </div>
    <!-- Grid principal: hero grande + 2 secundarias -->
    <div id="cms-news-grid" class="reveal">
      <div class="cms-loading">Cargando noticias</div>
    </div>
    <!-- Lista de últimas noticias -->
    <div class="section-header reveal" style="margin-top:2.5rem;">
      <h2 class="section-title">Últimas <em>Noticias</em></h2>
    </div>
    <div id="cms-ultimas" class="reveal reveal-delay-1"></div>
  </div>
</div>
```

### 4e. Añadir sección PATROCINADORES (antes del footer)

Busca `<!-- ===== NEWSLETTER` y ANTES de ese bloque añade:

```html
<!-- ===== PATROCINADORES — Dinámicos desde CMS ===== -->
<div id="sponsors-section">
  <!-- cms-loader.js inyectará aquí la sección completa -->
  <section class="sponsors-section" id="patrocinadores">
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">PATRO<em>CINADORES</em></h2>
      </div>
      <div class="cms-loading">Cargando patrocinadores</div>
    </div>
  </section>
</div>
```

### 4f. Añadir el script cms-loader.js (antes del cierre </body>)

Busca `<script>` al final del archivo (el bloque de scripts inline) y ANTES añade:

```html
<!-- Motor CMS: carga noticias y patrocinadores dinámicamente -->
<script src="/js/cms-loader.js" defer></script>
```

---

## PASO 5 — CAMBIOS EN noticia.html

### 5a. Actualizar la función init() para leer desde JSON

Sustituye la función `init()` y `NOTICIAS` hardcodeado por este código:

```javascript
/* ======================================================
   INIT — Lee noticia desde /noticias/[slug].json
   ====================================================== */
async function init() {
  // Leer slug de la URL: noticia.html?slug=mi-slug
  var params = new URLSearchParams(window.location.search);
  var slug = params.get('slug');

  if (!slug) { renderNotFound(); return; }

  try {
    var res = await fetch('/noticias/' + slug + '.json');
    if (!res.ok) throw new Error('not found');
    var noticia = await res.json();
    renderArticle(noticia);
    renderSidebar(slug);
  } catch(e) {
    renderNotFound();
  }
}

/* ======================================================
   RENDER ARTICLE desde JSON de CMS
   ====================================================== */
function renderArticle(n) {
  document.title = n.title + ' — RollerZone';

  // Imagen hero
  if (n.image) {
    document.getElementById('article-hero-bg').innerHTML =
      '<img src="' + n.image + '" alt="' + n.title + '">';
  }

  // Categoría
  var catEl = document.getElementById('article-category');
  var catMap = {
    'Seleccion':     ['Selección',     'cat-seleccion'],
    'Tecnica':       ['Técnica',       'cat-tecnica'],
    'Entrevista':    ['Entrevista',    'cat-entrevista'],
    'Competicion':   ['Competición',   ''],
    'Internacional': ['Internacional', ''],
    'Reportaje':     ['Reportaje',     '']
  };
  var catInfo = catMap[n.categoria] || [n.categoria || 'Reportaje', ''];
  catEl.textContent = catInfo[0];
  if (catInfo[1]) catEl.classList.add(catInfo[1]);

  // Meta
  document.getElementById('article-title').textContent = n.title;
  document.getElementById('article-author').textContent = n.author || 'Redacción';
  document.getElementById('article-date').textContent = formatDate(n.date);

  // Excerpt como lead
  if (n.excerpt) {
    document.getElementById('article-lead').textContent = n.excerpt;
  }

  // Body: parsear Markdown a HTML (requiere marked.js)
  var bodyEl = document.getElementById('article-text');
  if (window.marked && n.body) {
    bodyEl.innerHTML = marked.parse(n.body);
  } else if (n.body) {
    // Fallback básico: párrafos
    bodyEl.innerHTML = n.body.split('\n\n').map(function(p) {
      if (p.startsWith('#')) return '<h2>' + p.replace(/^#+\s/, '') + '</h2>';
      return '<p>' + p + '</p>';
    }).join('');
  }
}

/* ── Sidebar: carga otras noticias desde el índice ── */
async function renderSidebar(currentSlug) {
  try {
    var res = await fetch('/noticias/index.json');
    var noticias = await res.json();
    var otras = noticias.filter(function(n) { return n.slug !== currentSlug; }).slice(0, 4);
    var html = '';
    otras.forEach(function(n, i) {
      html += '<div class="sidebar-news-item" onclick="window.location.href=\'/noticia.html?slug=' + n.slug + '\'">';
      html += '<div class="sidebar-num">0' + (i + 1) + '</div>';
      html += '<div>';
      html += '<div class="sidebar-news-title">' + n.title + '</div>';
      html += '<div class="sidebar-news-meta"><span>' + formatDate(n.date) + '</span></div>';
      html += '</div>';
      html += '</div>';
    });
    document.getElementById('sidebar-news').innerHTML = html;
  } catch(e) {}
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  try {
    return new Date(isoStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch(e) { return isoStr; }
}

document.addEventListener('DOMContentLoaded', init);
```

### 5b. Añadir marked.js en el <head> de noticia.html

```html
<!-- Parser Markdown para renderizar el body de las noticias -->
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
```

---

## PASO 6 — ESTRUCTURA DE CARPETAS EN EL REPO

```
tu-repo/
├── admin/
│   ├── index.html          (ya existe)
│   └── config.yml          ← REEMPLAZAR con el entregado
├── img/
│   └── sponsors/           ← Crear esta subcarpeta para logos
├── js/
│   └── cms-loader.js       ← NUEVO
├── noticias/               ← Netlify CMS creará los .md aquí
│   └── index.json          ← Lo genera build-news-index.js
├── patrocinadores/         ← Netlify CMS creará los .md aquí
│   └── index.json          ← Lo genera build-news-index.js
├── index.html              ← MODIFICAR según instrucciones
├── noticia.html            ← MODIFICAR según instrucciones
├── entrevista.html         (sin cambios)
├── build-news-index.js     ← NUEVO
└── netlify.toml            ← NUEVO / MODIFICAR
```

---

## PASO 7 — FLUJO DE TRABAJO COMPLETO

```
1. Entras a /admin en tu web Netlify
2. Creas una noticia con el CMS (título, imagen, contenido…)
3. Netlify CMS hace commit del .md en /noticias/
4. Netlify detecta el push y lanza el build
5. build-news-index.js genera /noticias/index.json y /noticias/[slug].json
6. El deploy termina (~30-60 segundos)
7. La noticia aparece automáticamente en la portada y tiene su URL propia
```

---

## EJEMPLO DE URL DE NOTICIA

```
https://tudominio.com/noticia.html?slug=2025-07-14-espana-arrasa-europeo-sub23
```

---

## PREGUNTAS FRECUENTES

**¿Necesito Node.js en Netlify?**
Sí, Netlify incluye Node.js por defecto. El script se ejecuta en cada build.

**¿Puedo subir imágenes desde el CMS?**
Sí. Netlify CMS sube las imágenes a `/img/` automáticamente.

**¿Cómo añado un patrocinador?**
Desde `/admin` → colección "Patrocinadores" → Nueva entrada.

**¿Funciona en local?**
Sí. Ejecuta `node build-news-index.js` una vez y abre `index.html` con un servidor local (Live Server de VS Code, por ejemplo). Los datos demo aparecerán si no hay index.json.

**¿Qué pasa si no tengo noticias todavía?**
`cms-loader.js` tiene datos demo integrados que aparecen automáticamente mientras no hay `index.json`.