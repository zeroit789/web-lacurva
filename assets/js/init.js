/*
  init.js · Marca el documento con la clase "js" antes de pintar.
  init.js · Flags the document with the "js" class before first paint.
  Va en un fichero aparte porque la CSP no deja scripts en línea. Así, sin JS, todo el contenido se ve.
  Lives in its own file because the CSP blocks inline scripts. Without JS, all content stays visible.
*/
document.documentElement.classList.add('js');
