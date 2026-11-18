/*
  server.js · Servidor local para ver la web con las mismas cabeceras que en Cloudflare Pages.
  server.js · Local server to view the site with the same headers as on Cloudflare Pages.
  Solo usa módulos nativos de Node (sin dependencias). Uso: node server.js [puerto]
  Uses only native Node modules (no dependencies). Usage: node server.js [port]
  Escucha solo en 127.0.0.1 y no sirve nada fuera de la carpeta ni ficheros ocultos (.git…).
  Listens on 127.0.0.1 only and serves nothing outside the folder nor hidden files (.git…).
*/
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const RAIZ = fs.realpathSync(__dirname);
const PUERTO = Number(process.argv[2] || process.env.PORT || 8080);

/* ---------- Tipos de fichero ---------- */
/* ---------- File types ---------- */
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.woff2': 'font/woff2'
};

/* ---------- Lee _headers (formato de Cloudflare Pages) ---------- */
/* ---------- Reads _headers (Cloudflare Pages format) ---------- */
// Devuelve una lista de { patrón, cabeceras }
// Returns a list of { pattern, headers }
function leerCabeceras() {
  const reglas = [];
  let actual = null;
  const fichero = path.join(RAIZ, '_headers');
  const texto = fs.existsSync(fichero) ? fs.readFileSync(fichero, 'utf8') : '';
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

/* ---------- ¿Está dentro de la raíz? ---------- */
/* ---------- Is it inside the root? ---------- */
// Compara rutas reales (sigue enlaces) con path.relative: ni "..", ni absoluta, ni parte oculta.
// Compares real paths (following links) with path.relative: no "..", not absolute, no hidden part.
function dentro(real) {
  const rel = path.relative(RAIZ, real);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return false;
  return !rel.split(path.sep).some((parte) => parte.startsWith('.'));
}

/* ---------- Resuelve la ruta como Cloudflare Pages (/tratamientos → tratamientos.html) ---------- */
/* ---------- Resolves the path like Cloudflare Pages (/tratamientos → tratamientos.html) ---------- */
// Devuelve la ruta real del fichero, o null si no existe o no se puede servir.
// Returns the file's real path, or null if it does not exist or may not be served.
function resolver(rutaDecodificada) {
  const limpia = rutaDecodificada.replace(/^[\\/]+/, '');
  const candidatos = [limpia, limpia + '.html', path.join(limpia, 'index.html')];
  for (const c of candidatos) {
    const completo = path.resolve(RAIZ, c);
    let real;
    try { real = fs.realpathSync(completo); } catch { continue; }
    if (!dentro(real)) continue;
    if (fs.statSync(real).isFile()) return real;
  }
  return null;
}

/* ---------- Servidor ---------- */
/* ---------- Server ---------- */
const reglas = leerCabeceras();
http.createServer((req, res) => {
  try {
    const crudo = new URL(req.url, 'http://localhost').pathname;
    let ruta;
    // Una codificación inválida es un error del cliente (400), no un fallo del servidor
    // An invalid encoding is a client error (400), not a server crash
    try { ruta = decodeURIComponent(crudo); } catch { res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Petición no válida'); return; }
    if (ruta.includes('\0')) { res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Petición no válida'); return; }
    let fichero = resolver(ruta === '/' ? '/index.html' : ruta);
    let estado = 200;
    if (!fichero) { fichero = path.join(RAIZ, '404.html'); estado = 404; }
    // Aplica las cabeceras de cada regla que coincida
    // Applies the headers of every matching rule
    for (const r of reglas) if (coincide(r.patron, crudo)) for (const [k, v] of Object.entries(r.cabeceras)) res.setHeader(k, v);
    res.setHeader('Content-Type', TIPOS[path.extname(fichero).toLowerCase()] || 'application/octet-stream');
    const flujo = fs.createReadStream(fichero);
    flujo.on('error', () => { if (!res.headersSent) res.writeHead(500); res.end(); });
    res.writeHead(estado);
    flujo.pipe(res);
  } catch (err) {
    // Cualquier fallo inesperado responde 500 sin tumbar el servidor
    // Any unexpected failure answers 500 without bringing the server down
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Error interno');
  }
}).listen(PUERTO, '127.0.0.1', () => {
  console.log(`La Curva en http://127.0.0.1:${PUERTO}  (Ctrl+C para parar)`);
  console.log(`La Curva at http://127.0.0.1:${PUERTO}  (Ctrl+C to stop)`);
});
