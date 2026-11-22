// main.js
// Conecta los formularios con la API y con el renderizado.

import { buscarSeries, enviarPropuesta } from './api.js'
import { mostrarCargando, mostrarError, mostrarVacio, mostrarResultados, mostrarAlerta } from './render.js'

// ── Búsqueda (GET) ──

const formBusqueda = document.getElementById('form-busqueda')
const campoBusqueda = document.getElementById('texto-busqueda')

formBusqueda.addEventListener('submit', async (event) => {
  event.preventDefault()
  const texto = campoBusqueda.value.trim()
  if (texto === '') return

  mostrarCargando()
  try {
    const series = await buscarSeries(texto)
    if (series.length === 0) {
      mostrarVacio(texto)
    } else {
      mostrarResultados(series)
    }
  } catch (error) {
    console.error(error)
    mostrarError('No se pudo completar la búsqueda. Revise su conexión e intente de nuevo.')
  }
})

// ── Propuesta (POST) ──

const formPropuesta = document.getElementById('form-propuesta')
const botonPropuesta = document.getElementById('boton-propuesta')

formPropuesta.addEventListener('submit', async (event) => {
  event.preventDefault()

  const propuesta = {
    titulo: formPropuesta.titulo.value.trim(),
    correo: formPropuesta.correo.value.trim(),
    motivo: formPropuesta.motivo.value.trim(),
  }

  botonPropuesta.disabled = true
  try {
    const respuesta = await enviarPropuesta(propuesta)
    mostrarAlerta('success', 'Propuesta registrada con el número ' + respuesta.id + '.')
    formPropuesta.reset()
  } catch (error) {
    console.error(error)
    mostrarAlerta('danger', 'No se pudo enviar la propuesta. Intente de nuevo.')
  } finally {
    botonPropuesta.disabled = false
  }
})
