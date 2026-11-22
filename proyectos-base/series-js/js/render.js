// render.js
// Todo lo que se dibuja en la página. Se crea con métodos del DOM, sin innerHTML.

const zonaEstado = document.getElementById('estado')
const zonaResultados = document.getElementById('resultados')
const zonaAlerta = document.getElementById('alerta-propuesta')

// Crea un elemento con una clase y, si se indica, un texto
function crear(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta)
  if (clase) elemento.className = clase
  if (texto) elemento.textContent = texto
  return elemento
}

// ── Los cuatro estados de la búsqueda ──

export function mostrarCargando() {
  zonaResultados.replaceChildren()
  const caja = crear('div', 'd-flex align-items-center gap-2 text-secondary')
  caja.append(crear('div', 'spinner-border spinner-border-sm'), crear('span', '', 'Buscando…'))
  zonaEstado.replaceChildren(caja)
}

export function mostrarError(mensaje) {
  zonaResultados.replaceChildren()
  zonaEstado.replaceChildren(crear('div', 'alert alert-danger mb-0', mensaje))
}

export function mostrarVacio(texto) {
  zonaResultados.replaceChildren()
  zonaEstado.replaceChildren(crear('div', 'alert alert-info mb-0', 'No se encontraron series para «' + texto + '».'))
}

export function mostrarResultados(series) {
  zonaEstado.replaceChildren()
  zonaResultados.replaceChildren(...series.map(crearTarjeta))
}

// ── Una tarjeta por serie ──

function crearTarjeta(serie) {
  const columna = crear('div', 'col')
  const tarjeta = crear('article', 'card h-100 tarjeta-serie')

  const imagen = crear('img', 'card-img-top')
  imagen.src = serie.image ? serie.image.medium : 'img/sin-imagen.svg'
  imagen.alt = 'Portada de ' + serie.name

  const cuerpo = crear('div', 'card-body')
  const anio = serie.premiered ? serie.premiered.slice(0, 4) : 'Sin fecha'
  const generos = serie.genres.length > 0 ? serie.genres.join(', ') : 'Sin género'
  cuerpo.append(
    crear('h3', 'h6 card-title', serie.name),
    crear('p', 'card-text small text-secondary mb-0', generos + ' · ' + anio)
  )

  tarjeta.append(imagen, cuerpo)
  columna.append(tarjeta)
  return columna
}

// ── Alerta del formulario de propuesta ──

export function mostrarAlerta(tipo, mensaje) {
  zonaAlerta.replaceChildren(crear('div', 'alert alert-' + tipo + ' mb-0', mensaje))
}
