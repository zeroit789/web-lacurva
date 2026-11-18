/*
  main.js · Comportamiento de la web de La Curva Fisioterapia (todas las páginas).
  main.js · Behaviour for the La Curva Fisioterapia site (every page).
  Partes: entradas al hacer scroll, mapa del dolor, acordeón de etapas, fichas de preguntas,
  formularios de demostración (validan, se vacían y avisan; no envían nada), menú en móvil,
  calculadora de bonos y aviso de «abierto ahora». Sin librerías.
  Parts: scroll entrances, pain map, stages accordion, question cards, demo forms (they validate,
  clear and announce; they send nothing), phone menu, bundle calculator and the "open now" note.
  No libraries.
*/
(function () {
  'use strict';

  var reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Entradas al hacer scroll ---------- */
  /* ---------- Scroll entrances ---------- */
  // Escalona los elementos de cada sección en orden de lectura (70 ms entre uno y otro).
  // Staggers each section's parts in reading order (70ms apart).
  function prepararEntradas() {
    document.querySelectorAll('section, footer').forEach(function (seccion) {
      seccion.querySelectorAll('[data-revela]').forEach(function (el, i) {
        el.style.setProperty('--retardo', Math.min(i, 8) * 70 + 'ms');
      });
    });
    // Numera los puntos del mapa y los bloques del pie para que entren uno detrás de otro.
    // Numbers the map hotspots and footer blocks so they arrive one after another.
    document.querySelectorAll('.punto').forEach(function (p, i) { p.style.setProperty('--n', i); });
    document.querySelectorAll('.pie__marca span').forEach(function (b, i) { b.style.setProperty('--n', i); });

    // El obturador se vigila a través de su caja: un elemento recortado del todo no "entra" nunca.
    // The shutter is watched through its box: a fully clipped element never "enters".
    var objetivos = document.querySelectorAll('[data-revela], .mapa__lamina-caja, .pie__marca');
    function mostrar(el) {
      el.classList.add('is-dentro');
      var obt = el.querySelector && el.querySelector('[data-obturador]');
      if (obt) obt.classList.add('is-dentro');
    }
    // Sin IntersectionObserver o con movimiento reducido, se muestra todo
    // Without IO or with reduced motion, show everything
    if (!('IntersectionObserver' in window) || reducir) {
      objetivos.forEach(mostrar);
      return;
    }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { mostrar(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    objetivos.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Mapa del dolor ---------- */
  /* ---------- Pain map ---------- */
  // Un mismo estado para los puntos de la lámina y para la lista de zonas.
  // One shared state for the plate's hotspots and the zone list.
  function prepararMapa() {
    var articulos = document.querySelectorAll('[data-resultados] .zona');
    var controles = document.querySelectorAll('.punto, .zona-boton');
    if (!articulos.length) return;

    // Muestra la zona elegida y marca su punto y su botón
    // Shows the chosen zone and marks its hotspot and button
    function elegir(zona, animar) {
      articulos.forEach(function (a) {
        var es = a.getAttribute('data-zona') === zona;
        a.hidden = !es;
        a.classList.remove('is-entrando');
        if (es && animar && !reducir) { void a.offsetWidth; a.classList.add('is-entrando'); }
      });
      controles.forEach(function (c) {
        var es = c.getAttribute('data-zona') === zona;
        c.classList.toggle('is-activo', es);
        c.setAttribute('aria-pressed', es ? 'true' : 'false');
      });
    }

    controles.forEach(function (c) {
      c.addEventListener('click', function () { elegir(c.getAttribute('data-zona'), true); });
    });
    // La zona lumbar abre por defecto: es la consulta más común
    // Lumbar opens by default: the most common visit
    elegir('lumbar', false);
  }

  /* ---------- Llevar el motivo al cupón ---------- */
  /* ---------- Carry the reason into the coupon ---------- */
  // Cualquier botón con data-motivo rellena el desplegable del formulario antes de bajar a él.
  // Any button with data-motivo fills the form's select before scrolling to it.
  function prepararMotivos() {
    var campo = document.querySelector('[data-motivo-campo]');
    if (!campo) return;
    document.querySelectorAll('[data-motivo]').forEach(function (b) {
      b.addEventListener('click', function () {
        var motivo = b.getAttribute('data-motivo');
        for (var i = 0; i < campo.options.length; i++) {
          if (campo.options[i].text === motivo) { campo.selectedIndex = i; break; }
        }
        // Tras el salto al ancla, el foco va al primer campo
        // After the anchor jump, focus goes to the first field
        setTimeout(function () { var n = document.getElementById('f-nombre'); if (n) n.focus({ preventScroll: true }); }, 450);
      });
    });
  }

  /* ---------- Acordeón de etapas ---------- */
  /* ---------- Stages accordion ---------- */
  // Una etapa abierta a la vez; al abrir otra, la anterior se cierra.
  // One stage open at a time; opening another closes the previous one.
  function prepararAcordeon() {
    var acordeon = document.querySelector('[data-acordeon]');
    if (!acordeon) return;
    var etapas = acordeon.querySelectorAll('.etapa');
    etapas.forEach(function (etapa) {
      var boton = etapa.querySelector('.etapa__boton');
      boton.addEventListener('click', function () {
        etapas.forEach(function (otra) {
          var abre = otra === etapa;
          otra.classList.toggle('is-abierta', abre);
          otra.querySelector('.etapa__boton').setAttribute('aria-expanded', abre ? 'true' : 'false');
        });
        // El foco pasa al título de la etapa abierta
        // Focus moves to the opened stage's title
        var titulo = etapa.querySelector('.etapa__titulo');
        if (titulo) { titulo.setAttribute('tabindex', '-1'); titulo.focus({ preventScroll: true }); }
      });
    });
  }

  /* ---------- Fichas de preguntas ---------- */
  /* ---------- Question cards ---------- */
  // Abrir una ficha cierra la que estaba abierta, como al sacar una ficha del cajón.
  // Opening a card closes the open one, like pulling a card from the drawer.
  function prepararCajon() {
    var cajon = document.querySelector('[data-cajon]');
    if (!cajon) return;
    var tarjetas = cajon.querySelectorAll('.tarjeta');
    tarjetas.forEach(function (t) {
      var b = t.querySelector('.tarjeta__pregunta button');
      b.addEventListener('click', function () {
        var yaAbierta = t.classList.contains('is-abierta');
        tarjetas.forEach(function (o) {
          var abre = o === t && !yaAbierta;
          o.classList.toggle('is-abierta', abre);
          o.querySelector('.tarjeta__pregunta button').setAttribute('aria-expanded', abre ? 'true' : 'false');
        });
      });
    });
  }

  /* ---------- Formularios de demostración ---------- */
  /* ---------- Demo forms ---------- */
  // No hay servidor: se abre el correo del visitante con todo ya escrito.
  // No backend: opens the visitor's email app with everything already written.
  function prepararFormularios() {
    // Mensajes de error por campo / Per-field error messages
    var mensajes = {
      'f-nombre': 'Escribe tu nombre.', 'f-telefono': 'Escribe un teléfono para llamarte.',
      'c-nombre': 'Escribe tu nombre.', 'c-contacto': 'Escribe un teléfono o un correo.',
      'c-privacidad': 'Marca la casilla para continuar.'
    };
    document.querySelectorAll('[data-demo-form]').forEach(function (form) {
      var estado = form.querySelector('[data-estado-envio]');
      // Activa el botón (sin JS se queda desactivado: no hay nada que enviar)
      // Enables the button (without JS it stays disabled: there is nothing to send)
      form.querySelectorAll('[type="submit"]').forEach(function (b) { b.disabled = false; });
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var primero = null;
        form.querySelectorAll('[required]').forEach(function (campo) {
          var vacio = campo.type === 'checkbox' ? !campo.checked : !campo.value.trim();
          var error = form.querySelector('[data-error-de="' + campo.id + '"]');
          campo.setAttribute('aria-invalid', vacio ? 'true' : 'false');
          if (error) error.textContent = vacio ? (mensajes[campo.id] || 'Rellena este campo.') : '';
          if (vacio && !primero) primero = campo;
        });
        if (primero) {
          if (estado) estado.textContent = '';
          primero.focus();
          return;
        }
        // Todo bien: se vacía y se avisa de que es una demostración (no se envía nada)
        // All good: clear it and say it is a demo (nothing is sent)
        form.reset();
        form.querySelectorAll('[aria-invalid]').forEach(function (c) { c.removeAttribute('aria-invalid'); });
        if (estado) {
          estado.textContent = 'Gracias. Esta es una web de demostración de una clínica ficticia: no se ha enviado ni guardado nada.';
          estado.setAttribute('tabindex', '-1');
          estado.focus();
        }
      });
      // El error se borra en cuanto el campo se rellena / The error clears as soon as the field is filled
      form.addEventListener('input', function (ev) {
        var c = ev.target;
        if (c.getAttribute('aria-invalid') === 'true') {
          var ok = c.type === 'checkbox' ? c.checked : c.value.trim();
          if (ok) {
            c.setAttribute('aria-invalid', 'false');
            var e = form.querySelector('[data-error-de="' + c.id + '"]');
            if (e) e.textContent = '';
          }
        }
      });
    });
  }

  /* ---------- Motivo desde la dirección (contacto.html#motivo=...) ---------- */
  /* ---------- Reason from the address (contacto.html#motivo=...) ---------- */
  function motivoDesdeUrl() {
    // El motivo va en el fragmento (#motivo=...): no llega nunca al servidor
    // The reason travels in the fragment (#motivo=...): it never reaches the server
    var campo = document.querySelector('[data-motivo-campo]');
    var h = window.location.hash;
    if (!campo || h.indexOf('#motivo=') !== 0) return;
    var motivo = decodeURIComponent(h.slice(8));
    for (var i = 0; i < campo.options.length; i++) {
      if (campo.options[i].text === motivo) { campo.selectedIndex = i; break; }
    }
    var form = document.getElementById('formulario');
    if (form) {
      form.scrollIntoView();
      var n = form.querySelector('input'); if (n) n.focus({ preventScroll: true });
    }
  }


  /* ---------- Menú en móvil ---------- */
  /* ---------- Phone menu ---------- */
  // Abre un panel a pantalla completa; el foco se queda dentro, Escape lo cierra y el foco vuelve al botón.
  // Opens a full-screen panel; focus stays inside, Escape closes it and focus returns to the button.
  function prepararMenu() {
    var cab = document.querySelector('[data-cabecera]');
    var boton = document.querySelector('[data-menu-boton]');
    if (!cab || !boton) return;
    var menu = document.getElementById(boton.getAttribute('aria-controls'));
    function enlaces() { return Array.prototype.slice.call(menu.querySelectorAll('a')); }
    function abrir() {
      cab.classList.add('is-abierta');
      boton.setAttribute('aria-expanded', 'true');
      boton.textContent = 'Cerrar';
      document.body.style.overflow = 'hidden';
      var l = enlaces(); if (l[0]) l[0].focus();
    }
    function cerrar(devolverFoco) {
      cab.classList.remove('is-abierta');
      boton.setAttribute('aria-expanded', 'false');
      boton.textContent = 'Menú';
      document.body.style.overflow = '';
      if (devolverFoco) boton.focus();
    }
    boton.addEventListener('click', function () {
      if (cab.classList.contains('is-abierta')) cerrar(true); else abrir();
    });
    menu.addEventListener('click', function (ev) { if (ev.target.closest('a')) cerrar(false); });
    document.addEventListener('keydown', function (ev) {
      if (!cab.classList.contains('is-abierta')) return;
      if (ev.key === 'Escape') { ev.preventDefault(); cerrar(true); return; }
      if (ev.key !== 'Tab') return;
      // Trampa de foco: botón y enlaces del menú / Focus trap: the button and the menu links
      var l = enlaces(), orden = [boton].concat(l);
      var idx = orden.indexOf(document.activeElement);
      if (ev.shiftKey && idx <= 0) { ev.preventDefault(); orden[orden.length - 1].focus(); }
      else if (!ev.shiftKey && idx === orden.length - 1) { ev.preventDefault(); orden[0].focus(); }
    });
    // Si la ventana se ensancha con el menú abierto, se cierra / If the window widens with the menu open, close it
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1000 && cab.classList.contains('is-abierta')) cerrar(false);
    });
  }

  /* ---------- Calculadora de bonos (tarifas.html) ---------- */
  /* ---------- Bundle calculator (tarifas.html) ---------- */
  // Busca la forma más barata de cubrir N sesiones con bonos de 10, de 5 y sesiones sueltas.
  // Finds the cheapest way to cover N sessions with 10-packs, 5-packs and single sessions.
  function prepararCalculadora() {
    var caja = document.querySelector('[data-calculadora]');
    if (!caja) return;
    var rango = caja.querySelector('input[type="range"]');
    var total = caja.querySelector('[data-total]');
    var detalle = caja.querySelector('[data-detalle]');
    var SUELTA = 45, BONO5 = 200, BONO10 = 370;
    function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }
    function mejor(n) {
      var mejorPlan = null;
      for (var a = 0; a <= Math.ceil(n / 10); a++) {
        for (var b = 0; b <= Math.ceil(n / 5); b++) {
          var resto = Math.max(0, n - a * 10 - b * 5);
          var coste = a * BONO10 + b * BONO5 + resto * SUELTA;
          var sobran = Math.max(0, a * 10 + b * 5 - n);
          if (!mejorPlan || coste < mejorPlan.coste || (coste === mejorPlan.coste && sobran < mejorPlan.sobran)) {
            mejorPlan = { a: a, b: b, c: resto, coste: coste, sobran: sobran };
          }
        }
      }
      return mejorPlan;
    }
    function pintar() {
      var n = +rango.value;
      var m = mejor(n);
      var partes = [];
      if (m.a) partes.push(m.a === 1 ? 'un bono de diez' : plural(m.a, 'bono de diez', 'bonos de diez'));
      if (m.b) partes.push(m.b === 1 ? 'un bono de cinco' : plural(m.b, 'bono de cinco', 'bonos de cinco'));
      if (m.c) partes.push(m.c === 1 ? 'una sesión suelta' : plural(m.c, 'sesión suelta', 'sesiones sueltas'));
      var texto = 'Para ' + plural(n, 'sesión', 'sesiones') + ': ' + partes.join(' y ') + '.';
      if (m.sobran) texto += ' Te ' + (m.sobran === 1 ? 'sobra una sesión' : 'sobran ' + m.sobran + ' sesiones') + ', y aun así sale más barato.';
      if (m.coste < n * SUELTA) texto += ' Sesión a sesión serían ' + n * SUELTA + ' €.';
      total.textContent = m.coste + ' €';
      detalle.textContent = texto;
      rango.setAttribute('aria-valuetext', plural(n, 'sesión', 'sesiones'));
    }
    rango.addEventListener('input', pintar);
    caja.querySelectorAll('[data-paso]').forEach(function (b) {
      b.addEventListener('click', function () {
        rango.value = Math.min(+rango.max, Math.max(+rango.min, +rango.value + +b.getAttribute('data-paso')));
        pintar();
      });
    });
    pintar();
  }

  /* ---------- Abierto ahora ---------- */
  /* ---------- Open now ---------- */
  // Calcula con la hora de Madrid si la clínica está abierta y hasta cuándo, o cuándo abre.
  // Works out, on Madrid time, whether the clinic is open and until when, or when it opens.
  function prepararAbierto() {
    var el = document.querySelector('[data-abierto]');
    if (!el || !window.Intl) return;
    // Horario por día (0 = domingo), en minutos desde medianoche
    // Hours per day (0 = Sunday), in minutes from midnight
    var H = { 1: [[480, 840], [960, 1290]], 2: [[480, 840], [960, 1290]], 3: [[480, 840], [960, 1290]], 4: [[480, 840], [960, 1290]], 5: [[480, 840], [960, 1290]], 6: [[540, 780]], 0: [] };
    var dias = ['el domingo', 'el lunes', 'el martes', 'el miércoles', 'el jueves', 'el viernes', 'el sábado'];
    function hora(m) { return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); }
    var partes = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    var mapa = {}; partes.forEach(function (p) { mapa[p.type] = p.value; });
    var cortos = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    var dia = cortos.indexOf((mapa.weekday || '').replace('.', '').toLowerCase());
    if (dia < 0) return;
    var ahora = (+mapa.hour) * 60 + (+mapa.minute);
    var hoy = H[dia];
    for (var i = 0; i < hoy.length; i++) {
      if (ahora >= hoy[i][0] && ahora < hoy[i][1]) { el.textContent = 'Abierto ahora, hasta las ' + hora(hoy[i][1]); return; }
      if (ahora < hoy[i][0]) { el.textContent = 'Cerrado ahora, abrimos a las ' + hora(hoy[i][0]); return; }
    }
    // Busca el siguiente día con horario
    // Finds the next day with opening hours
    for (var d = 1; d <= 7; d++) {
      var sig = (dia + d) % 7;
      if (H[sig].length) { el.textContent = 'Cerrado, abrimos ' + (d === 1 ? 'mañana' : dias[sig]) + ' a las ' + hora(H[sig][0][0]); return; }
    }
  }

  /* ---------- Arranque ---------- */
  /* ---------- Start ---------- */
  prepararEntradas();
  prepararMapa();
  prepararMotivos();
  prepararAcordeon();
  prepararCajon();
  prepararFormularios();
  motivoDesdeUrl();
  prepararMenu();
  prepararCalculadora();
  prepararAbierto();
})();
