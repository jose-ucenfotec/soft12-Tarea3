// api.js
// Acceso a las APIs. Solo pide y devuelve datos: no toca el DOM.

const URL_BUSQUEDA = 'https://api.tvmaze.com/search/shows?q='
const URL_PROPUESTAS = 'https://jsonplaceholder.typicode.com/posts'

// GET: busca series por nombre y devuelve un arreglo de series
export async function buscarSeries(texto) {
  const respuesta = await fetch(URL_BUSQUEDA + encodeURIComponent(texto))

  if (!respuesta.ok) {
    throw new Error('La API respondió con el código ' + respuesta.status)
  }

  const datos = await respuesta.json()
  return datos.map((resultado) => resultado.show)
}

// POST: envía una propuesta y devuelve lo que responde el servidor
export async function enviarPropuesta(propuesta) {
  const respuesta = await fetch(URL_PROPUESTAS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(propuesta),
  })

  if (!respuesta.ok) {
    throw new Error('El servidor respondió con el código ' + respuesta.status)
  }

  return respuesta.json()
}
