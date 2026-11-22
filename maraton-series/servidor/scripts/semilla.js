// scripts/semilla.js
// Crea (o reinicia) la base del Maratón con el modelo del laboratorio de diseño:
// colecciones miembros y series, su validación $jsonSchema, el índice único del
// correo y los datos de ejemplo (4 miembros y 5 series).
//
// Uso (dentro de servidor):  npm run semilla
// ¡Cuidado! Borra las colecciones miembros y series antes de crearlas otra vez.
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const nombreBd = process.env.DB_NAME ?? 'maraton'
if (!uri) throw new Error('Falta la variable de entorno MONGODB_URI')

const GENEROS = ['Drama', 'Comedia', 'Ciencia ficción', 'Animación', 'Documental']
const ESTADOS = ['Por ver', 'Viendo', 'Vista']

const cliente = new MongoClient(uri)
await cliente.connect()
const db = cliente.db(nombreBd)

// 1. Empezar de cero
for (const nombre of ['series', 'miembros']) {
  const existe = await db.listCollections({ name: nombre }).hasNext()
  if (existe) await db.collection(nombre).drop()
}

// 2. miembros: correo único y géneros favoritos embebidos
await db.createCollection('miembros', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['nombre', 'correo', 'registro'],
      properties: {
        nombre: { bsonType: 'string', minLength: 2 },
        correo: { bsonType: 'string' },
        registro: { bsonType: 'date' },
        generosFavoritos: { bsonType: 'array', items: { enum: GENEROS } },
      },
    },
  },
})
await db.collection('miembros').createIndex({ correo: 1 }, { unique: true })

// 3. series: referencia al miembro y calificaciones embebidas
await db.createCollection('series', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['titulo', 'genero', 'temporadas', 'estado', 'miembroId'],
      properties: {
        titulo: { bsonType: 'string', minLength: 2 },
        genero: { enum: GENEROS },
        temporadas: { bsonType: 'int', minimum: 1, maximum: 30 },
        estado: { enum: ESTADOS },
        miembroId: { bsonType: 'objectId' },
        calificaciones: {
          bsonType: 'array',
          items: { bsonType: 'int', minimum: 1, maximum: 5 },
        },
      },
    },
  },
})

// 4. Datos de ejemplo (los mismos que usa servidor-net en HasData)
const { insertedIds: m } = await db.collection('miembros').insertMany([
  { nombre: 'Ana', correo: 'ana@club.com', registro: new Date('2026-08-01'), generosFavoritos: ['Ciencia ficción', 'Documental'] },
  { nombre: 'Luis', correo: 'luis@club.com', registro: new Date('2026-08-03'), generosFavoritos: ['Comedia'] },
  { nombre: 'Sofía', correo: 'sofia@club.com', registro: new Date('2026-08-10'), generosFavoritos: ['Animación', 'Drama'] },
  { nombre: 'Diego', correo: 'diego@club.com', registro: new Date('2026-09-02'), generosFavoritos: ['Drama'] },
])
const [ana, luis, sofia, diego] = [m[0], m[1], m[2], m[3]]

await db.collection('series').insertMany([
  { titulo: 'Dark', genero: 'Ciencia ficción', temporadas: 3, estado: 'Vista', miembroId: ana, calificaciones: [5, 4, 5] },
  { titulo: 'The Office', genero: 'Comedia', temporadas: 9, estado: 'Viendo', miembroId: luis, calificaciones: [4] },
  { titulo: 'Arcane', genero: 'Animación', temporadas: 2, estado: 'Por ver', miembroId: sofia, calificaciones: [] },
  { titulo: 'Chernobyl', genero: 'Drama', temporadas: 1, estado: 'Vista', miembroId: diego, calificaciones: [5, 5] },
  { titulo: 'Planeta Tierra', genero: 'Documental', temporadas: 3, estado: 'Por ver', miembroId: ana, calificaciones: [4] },
])

console.log(`Base «${nombreBd}» lista:`,
  await db.collection('miembros').countDocuments(), 'miembros y',
  await db.collection('series').countDocuments(), 'series.')
await cliente.close()
