/**
 * REEMPLAZA todo el bloque <script> de noticia.html
 * (desde el <!-- === DATOS === --> hasta el cierre </script>)
 * por este código.
 *
 * Requiere marked.js en el <head>:
 * <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
 */

/* ── Helpers ── */
function formatDate(isoStr) {
  if (!isoStr) return '';
  try {
    return new Date(isoStr).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch(e) { return isoStr; }
}

/* ── INIT: carga la noticia desde /noticias/[slug].json ── */
async function init() {
  var params  = new URLSearchParams(window.location.search);
  var slug    = params.get('slug');

  if (!slug) { renderNotFound(); return; }

  try {
    var res = await fetch('/noticias/' + slug + '.json');
    if (!res.ok) throw new Error('not found');
    var noticia = await res.json();
    renderArticle(noticia);
    renderSidebar(slug);
    renderRelacionadas(slug);
  } catch(e) {
    renderNotFound();
  }
}

/* ── Renderiza la noticia en el DOM ── */
function renderArticle(n) {
  document.title = n.title + ' — RollerZone';

  // Breadcrumb
  var bc = document.getElementById('breadcrumb-current');
  if (bc) bc.textContent = n.title.length > 50 ? n.title.slice(0, 50) + '…' : n.title;

  // Imagen hero
  if (n.image) {
    var bgEl = document.getElementById('article-hero-bg');
    if (bgEl) bgEl.innerHTML = '<img src="' + n.image + '" alt="' + n.title + '">';
  }

  // Categoría → badge con color correcto
  var catEl = document.getElementById('article-category');
  if (catEl) {
    var catMap = {
      'Seleccion':     ['Selección',     'cat-seleccion'],
      'Tecnica':       ['Técnica',       'cat-tecnica'],
      'Entrevista':    ['Entrevista',    'cat-entrevista'],
      'Competicion':   ['Competición',   ''],
      'Internacional': ['Internacional', ''],
      'Reportaje':     ['Reportaje',     '']
    };
    var ci = catMap[n.categoria] || [n.categoria || 'Reportaje', ''];
    catEl.textContent = ci[0];
    if (ci[1]) catEl.classList.add(ci[1]);
  }

  // Metadatos del artículo
  var titleEl  = document.getElementById('article-title');
  var authorEl = document.getElementById('article-author');
  var dateEl   = document.getElementById('article-date');
  if (titleEl)  titleEl.textContent  = n.title;
  if (authorEl) authorEl.textContent = n.author || 'Redacción RollerZone';
  if (dateEl)   dateEl.textContent   = formatDate(n.date);

  // Lead / excerpt
  var leadEl = document.getElementById('article-lead');
  if (leadEl && n.excerpt) leadEl.textContent = n.excerpt;

  // Cuerpo del artículo: Markdown → HTML via marked.js
  var bodyEl = document.getElementById('article-text');
  if (bodyEl) {
    if (window.marked && n.body) {
      bodyEl.innerHTML = marked.parse(n.body);
    } else if (n.body) {
      // Fallback básico si marked no cargó
      bodyEl.innerHTML = n.body
        .split(/\n\n+/)
        .map(function(block) {
          if (/^#{1,3}\s/.test(block)) {
            var level = block.match(/^(#{1,3})/)[1].length;
            return '<h' + (level+1) + '>' + block.replace(/^#+\s/, '') + '</h' + (level+1) + '>';
          }
          if (/^>\s/.test(block)) {
            return '<blockquote>' + block.replace(/^>\s/, '') + '</blockquote>';
          }
          return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
        })
        .join('');
    }
  }

  // Tags en footer (si la noticia los tiene)
  var tagsEl = document.getElementById('article-tags-footer');
  if (tagsEl && n.tags) {
    var tagsArr = Array.isArray(n.tags) ? n.tags : String(n.tags).split(',');
    tagsEl.innerHTML = tagsArr.map(function(t) {
      return '<span class="article-tag">' + t.trim() + '</span>';
    }).join('');
  }
}

/* ── Sidebar: otras noticias recientes ── */
async function renderSidebar(currentSlug) {
  var container = document.getElementById('sidebar-news');
  if (!container) return;
  try {
    var res = await fetch('/noticias/index.json');
    if (!res.ok) return;
    var noticias = await res.json();
    var otras = noticias.filter(function(n) { return n.slug !== currentSlug; }).slice(0, 4);
    var html = '';
    otras.forEach(function(n, i) {
      html +=
        '<div class="sidebar-news-item" onclick="window.location.href=\'/noticia.html?slug=' + n.slug + '\'">' +
          '<div class="sidebar-num">0' + (i + 1) + '</div>' +
          '<div>' +
            '<div class="sidebar-news-title">' + n.title + '</div>' +
            '<div class="sidebar-news-meta"><span>' + formatDate(n.date) + '</span></div>' +
          '</div>' +
        '</div>';
    });
    container.innerHTML = html || '<p style="color:var(--muted);font-size:13px;">Sin más noticias</p>';
  } catch(e) {}
}

/* ── Noticias relacionadas ── */
async function renderRelacionadas(currentSlug) {
  var container = document.getElementById('related-grid');
  if (!container) return;
  try {
    var res = await fetch('/noticias/index.json');
    if (!res.ok) return;
    var noticias = await res.json();
    var rel = noticias.filter(function(n) { return n.slug !== currentSlug; }).slice(0, 3);
    var html = '';
    var catMap = { 'Seleccion': 'cat-seleccion', 'Tecnica': 'cat-tecnica', 'Entrevista': 'cat-entrevista' };
    rel.forEach(function(n) {
      var cc = catMap[n.categoria] || '';
      html +=
        '<div class="related-card" onclick="window.location.href=\'/noticia.html?slug=' + n.slug + '\'">' +
          '<div class="news-category ' + cc + '">' + (n.categoria || 'Reportaje') + '</div>' +
          '<div class="news-title">' + n.title + '</div>' +
          '<div class="news-meta"><span>' + formatDate(n.date) + '</span></div>' +
        '</div>';
    });
    container.innerHTML = html;
  } catch(e) {}
}

/* ── 404 ── */
function renderNotFound() {
  var heroEl = document.getElementById('article-hero');
  var layoutEl = document.getElementById('article-layout');
  var relEl = document.querySelector('.related-section');
  if (heroEl)  heroEl.style.display  = 'none';
  if (relEl)   relEl.style.display   = 'none';
  if (layoutEl) layoutEl.innerHTML =
    '<div class="not-found" style="text-align:center;padding:4rem 2rem;">' +
      '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:120px;color:rgba(245,166,35,.15);line-height:1;">404</div>' +
      '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:28px;letter-spacing:2px;margin-bottom:1rem;">Noticia no encontrada</div>' +
      '<p style="color:var(--muted);margin-bottom:2rem;">La noticia que buscas no existe o ha sido eliminada.</p>' +
      '<a class="btn-primary" href="/">← Volver al inicio</a>' +
    '</div>';
}

/* ── Compartir ── */
function shareArticle(platform) {
  var url   = window.location.href;
  var title = document.getElementById('article-title')
               ? document.getElementById('article-title').textContent : 'RollerZone';
  if (platform === 'twitter') {
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(url), '_blank');
  } else if (platform === 'whatsapp') {
    window.open('https://wa.me/?text=' + encodeURIComponent(title + ' ' + url), '_blank');
  } else if (platform === 'copy') {
    navigator.clipboard.writeText(url).then(function() {
      alert('Enlace copiado.');
    });
  }
}

/* ── Newsletter ── */
function suscribirNl() {
  var email = document.getElementById('nl-email').value.trim();
  if (!email || !email.includes('@')) { alert('Introduce un correo válido.'); return; }
  var btn = document.querySelector('.nl-mini-btn');
  btn.textContent = '✓ Suscrito';
  btn.style.background = '#3DD68C';
  document.getElementById('nl-email').value = '';
  setTimeout(function() { btn.textContent = 'Suscribirme →'; btn.style.background = ''; }, 3000);
}

/* ── Menú móvil ── */
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

/* ── Arranque ── */
document.addEventListener('DOMContentLoaded', init);