# La Curva Fisioterapia · web de demostración

[Español](#español) · [English](#english)

---

## Español

### Qué es

Web completa de **La Curva Fisioterapia**, una clínica de fisioterapia de barrio **ficticia** en Córdoba. Es una
web de demostración del portfolio de [danimefle.com](https://danimefle.com): la clínica, la calle, el equipo, los
precios y el horario son inventados. No se puede pedir cita de verdad y los formularios no envían nada.

Toda la web gira alrededor de una sola forma: el cuarto de círculo (la curva de la calle y la de la columna).
Aparece en la forma gigante de la portada, en la esquina de cada lámina, en los botones, en las viñetas y en la
marca del pie.

Lo interactivo:

- **Mapa del dolor** (portada): marcas una zona del cuerpo y ves qué se suele tratar, las sesiones orientativas y
  el precio, con botón para pedir cita sobre esa zona. Se maneja con teclado (botones con nombre accesible y resultado en una región
  `aria-live`), y sin JavaScript todas las zonas se ven como lista.
- **Calculadora de bonos** (tarifas): eliges el número de sesiones y te dice la forma más barata de pagarlas.
- **Aviso de «abierto ahora»** (portada), calculado con la hora de Madrid.

### Páginas

| Fichero | Contenido |
| --- | --- |
| `index.html` | Portada: mapa del dolor, tratamientos, cómo va un tratamiento, horario, precios, preguntas y cita |
| `tratamientos.html` | Seis tratamientos con detalle y las técnicas que se usan |
| `tarifas.html` | Tabla de precios, calculadora de bonos y condiciones |
| `sobre-nosotros.html` | Historia, equipo (solo nombres de pila ficticios, sin fotos), forma de trabajar y el local |
| `contacto.html` | Formulario de demostración, dirección, horario y plano dibujado |
| `aviso-legal.html`, `privacidad.html`, `cookies.html` | Textos legales de una web de demostración |
| `creditos.html` | Autores y licencias de cada imagen y de la fuente |
| `404.html` | Página de error |

### Tecnología

HTML, CSS y JavaScript propios, **sin librerías ni paso de compilación**. Fuente Roundo alojada en la propia web
(`assets/fonts/`). Analítica con Plausible (sin cookies y sin guardar la IP). El servidor local (`server.js`) usa solo módulos nativos
de Node; se ha probado con **Node 24.22.2**.

### Verla en local

```bash
node server.js 8080
# abre http://127.0.0.1:8080
```

`server.js` sirve la carpeta con las mismas cabeceras de seguridad que `_headers` (CSP incluida), resuelve las
direcciones sin `.html` como Cloudflare Pages y devuelve `404.html` cuando no encuentra algo. También se puede
abrir `index.html` con doble clic, aunque así no se aplican las cabeceras.

### Desplegar en Cloudflare Pages

1. Crea un proyecto de Pages conectado al repositorio (o sube la carpeta con `wrangler pages deploy .`).
2. Sin comando de compilación. Directorio de salida: la raíz del repositorio.
3. `_headers` aplica la CSP, HSTS y el resto de cabeceras. `404.html` se usa sola para las páginas que no existen.
4. Si cambias el dominio, sustituye `https://lacurva.danimefle.com` en todo el proyecto (canonical, Open Graph,
   `sitemap.xml`, `robots.txt`) y el `data-domain` del script de Plausible.

### Adaptarla

- **Textos:** están en cada `.html`. Cabecera y pie se repiten igual en todas las páginas; si cambias un enlace,
  cámbialo en todas.
- **Colores y tamaños:** variables al principio de `assets/css/estilos.css` (`--acento`, `--campo-1`…,
  `--paso-*`, `--margen`, `--seccion`).
- **Imágenes:** en `assets/img/` (WebP). Si cambias una, actualiza su `width`/`height`, su `alt` y los créditos.
- **Mapa del dolor:** cada zona es un `<article class="zona">` en `index.html`; los puntos de la lámina son botones
  con su posición en `--x` / `--y` (porcentaje sobre la lámina).
- **Precios de la calculadora:** constantes `SUELTA`, `BONO5` y `BONO10` en `assets/js/main.js`.
- **Para un negocio real:** quita `noindex` (meta `robots` de cada página y `X-Robots-Tag` en `_headers`), cambia
  los datos de ejemplo por los reales, conecta el formulario a un servicio de envío y revisa los textos legales y
  sanitarios con un profesional.

### Créditos y licencias

- **Código:** licencia MIT (ver `LICENSE`).
- **Imágenes:** láminas de la Wellcome Collection (CC BY 4.0), una lámina de la Biblioteca de la Universidad de
  Leiden (dominio público) y una postal de Córdoba de los años veinte (dominio público), todas vía Wikimedia
  Commons. Detalle en `creditos.html` y `CREDITOS.md`.
- **Fuente:** Roundo, de Indian Type Foundry (Fontshare), con licencia SIL Open Font License 1.1 (texto en `assets/fonts/OFL.txt`).

---

## English

### What it is

A complete website for **La Curva Fisioterapia**, a **fictional** neighbourhood physiotherapy clinic in Córdoba,
Spain. It is a demo site from the [danimefle.com](https://danimefle.com) portfolio: the clinic, the street, the
team, the prices and the opening hours are made up. Nobody can book a real appointment and the forms send nothing.

The whole site is built around a single shape: the quarter circle (the bend in the street and the curve of the
spine). It shows up as the giant shape on the home page, the corner of every plate, the buttons, the bullets and
the footer mark.

Interactive parts:

- **Pain map** (home page): pick a body area and see what is usually treated, the estimated sessions and the
  price, with a button to book for that area. It works with a keyboard (buttons with accessible names and the result in an
  `aria-live` region), and without JavaScript every area is shown as a list.
- **Bundle calculator** (prices page): choose a number of sessions and it shows the cheapest way to pay for them.
- **"Open now" note** (home page), worked out on Madrid time.

### Pages

| File | Content |
| --- | --- |
| `index.html` | Home: pain map, treatments, how treatment works, opening hours, prices, questions and booking |
| `tratamientos.html` | Six treatments in detail and the techniques used |
| `tarifas.html` | Price table, bundle calculator and terms |
| `sobre-nosotros.html` | Story, team (fictional first names only, no photos), way of working and the premises |
| `contacto.html` | Demo form, address, opening hours and a drawn map |
| `aviso-legal.html`, `privacidad.html`, `cookies.html` | Legal pages for a demo site |
| `creditos.html` | Authors and licences of every image and of the font |
| `404.html` | Error page |

### Technology

Hand-written HTML, CSS and JavaScript, **no libraries and no build step**. The Roundo font is self-hosted
(`assets/fonts/`). Analytics by Plausible (no cookies, IP not stored). The local server (`server.js`) only uses native Node
modules; it was tested with **Node 24.22.2**.

### Run it locally

```bash
node server.js 8080
# open http://127.0.0.1:8080
```

`server.js` serves the folder with the same security headers as `_headers` (CSP included), resolves extensionless
paths like Cloudflare Pages and returns `404.html` for anything it cannot find. You can also open `index.html`
directly, but the headers are not applied that way.

### Deploy to Cloudflare Pages

1. Create a Pages project connected to the repository (or upload the folder with `wrangler pages deploy .`).
2. No build command. Output directory: the repository root.
3. `_headers` applies the CSP, HSTS and the other headers. `404.html` is used automatically for missing pages.
4. If you change the domain, replace `https://lacurva.danimefle.com` across the project (canonical, Open Graph,
   `sitemap.xml`, `robots.txt`) and the `data-domain` of the Plausible script.

### Adapting it

- **Copy:** lives in each `.html` file. The header and footer are repeated on every page; change a link in all of
  them.
- **Colours and sizes:** variables at the top of `assets/css/estilos.css` (`--acento`, `--campo-1`…, `--paso-*`,
  `--margen`, `--seccion`).
- **Images:** in `assets/img/` (WebP). If you swap one, update its `width`/`height`, its `alt` and the credits.
- **Pain map:** each area is an `<article class="zona">` in `index.html`; the plate hotspots are buttons
  positioned with `--x` / `--y` (percentages of the plate).
- **Calculator prices:** the `SUELTA`, `BONO5` and `BONO10` constants in `assets/js/main.js`.
- **For a real business:** remove `noindex` (the `robots` meta on every page and `X-Robots-Tag` in `_headers`),
  replace the sample data with real data, connect the form to a sending service and have the legal and health
  copy reviewed by a professional.

### Credits and licences

- **Code:** MIT licence (see `LICENSE`).
- **Images:** plates from the Wellcome Collection (CC BY 4.0), one plate from Leiden University Library (public
  domain) and a 1920s postcard of Córdoba (public domain), all via Wikimedia Commons. Details in `creditos.html`
  and `CREDITOS.md`.
- **Font:** Roundo by Indian Type Foundry (Fontshare), SIL Open Font License 1.1 (text in `assets/fonts/OFL.txt`).
