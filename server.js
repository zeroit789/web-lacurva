/*
  server.js · Servidor local para ver la web con las mismas cabeceras que en Cloudflare Pages.
  server.js · Local server to view the site with the same headers as on Cloudflare Pages.
  Solo usa módulos nativos de Node (sin dependencias). Uso: node server.js [puerto]
  Uses only native Node modules (no dependencies). Usage: node server.js [port]
*/
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = __dirname;
const PUERTO = Number(process.argv[2] || process.env.PORT || 8080);

/* ---------- Tipos de fichero ---------- */
/* ---------- File types ---------- */
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.md': 'text/plain; charset=utf-8'
};

/* ---------- Lee _headers (formato de Cloudflare Pages) ---------- */
/* ---------- Reads _headers (Cloudflare Pages format) ---------- */
// Devuelve una lista de { patrón, cabeceras }
// Returns a list of { pattern, headers }
function leerCabeceras() {
  const reglas = [];
  let actual = null;
  const texto = fs.existsSync(path.join(RAIZ, '_headers')) ? fs.readFileSync(path.join(RAIZ, '_headers'), 'utf8') : '';
  for (const linea of texto.split(/\r?\n/)) {
    if (!linea.trim() || linea.trim().startsWith('#')) continue;
    if (!/^\s/.test(linea)) { actual = { patron: linea.trim(), cabeceras: {} }; reglas.push(actual); continue; }
    const i = linea.indexOf(':');
    if (actual && i > 0) actual.cabeceras[linea.slice(0, i).trim()] = linea.slice(i + 1).trim();
  }
  return reglas;
}

// Convierte "/assets/fonts/*" en una expresión regular
// Turns "/assets/fonts/*" into a regular expression
function coincide(patron, ruta) {
  const re = new RegExp('^' + patron.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
  return re.test(ruta);
}

/* ---------- Resuelve la ruta como Cloudflare Pages (/tratamientos → tratamientos.html) ---------- */
/* ---------- Resolves the path like Cloudflare Pages (/tratamientos → tratamientos.html) ---------- */
function resolver(ruta) {
  const limpia = path.normalize(decodeURIComponent(ruta)).replace(/^([\\/])+/, '');
  if (limpia.startsWith('..')) return null;
  const candidatos = [limpia, limpia + '.html', path.join(limpia, 'index.html')];
  for (const c of candidatos) {
    const completo = path.join(RAIZ, c);
    if (completo.startsWith(RAIZ) && fs.existsSync(completo) && fs.statSync(completo).isFile()) return completo;
  }
  return null;
}

/* ---------- Servidor ---------- */
/* ---------- Server ---------- */
const reglas = leerCabeceras();
http.createServer((req, res) => {
  const ruta = new URL(req.url, 'http://localhost').pathname;
  let fichero = resolver(ruta === '/' ? '/index.html' : ruta);
  let estado = 200;
  if (!fichero) { fichero = path.join(RAIZ, '404.html'); estado = 404; }
  // Aplica las cabeceras de cada regla que coincida
  // Applies the headers of every matching rule
  for (const r of reglas) if (coincide(r.patron, ruta)) for (const [k, v] of Object.entries(r.cabeceras)) res.setHeader(k, v);
  res.setHeader('Content-Type', TIPOS[path.extname(fichero).toLowerCase()] || 'application/octet-stream');
  res.writeHead(estado);
  fs.createReadStream(fichero).pipe(res);
}).listen(PUERTO, '127.0.0.1', () => {
  console.log(`La Curva en http://127.0.0.1:${PUERTO}  (Ctrl+C para parar / to stop)`);
});
