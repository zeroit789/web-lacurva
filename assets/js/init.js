/*
  init.js · Marca el documento con la clase "js" antes de pintar.
  init.js · Flags the document with the "js" class before first paint.
  Va en un fichero aparte porque la CSP no deja scripts en línea. Bajo .js solo va la carga animada
  del héroe (acaba siempre visible); lo que se oculta o se pliega depende de clases que pone main.js
  tras instalar sus manejadores, así que sin JS, o si main.js falla, todo el contenido se ve.
  Lives in its own file because the CSP blocks inline scripts. Only the animated hero load (it always
  ends visible) sits under .js; whatever hides or folds depends on classes main.js sets after
  installing its handlers, so without JS, or if main.js fails, all content stays visible.
*/
document.documentElement.classList.add('js');
