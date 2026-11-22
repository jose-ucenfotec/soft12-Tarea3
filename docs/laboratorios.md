# Laboratorios guiados — Maratón de series



Cada sección tiene la captura del resultado esperado (en `docs/capturas/`), la tabla
«Explique el recorrido» (cuando el laboratorio la pide), las respuestas del recuadro
«Reflexiona» o de las preguntas finales, y los experimentos con lo que se observó.



## Índice

**React (cliente)**

1. [Montaje del proyecto](#1-montaje-del-proyecto)
2. [Armar el tablero con los componentes](#2-armar-el-tablero-con-los-componentes)
3. [¿Por qué no basta una variable?](#3-por-qué-no-basta-una-variable)
4. [Cambiar estado y quitar con useState](#4-cambiar-estado-y-quitar-con-usestate)
5. [Filtros y resumen](#5-filtros-y-resumen)
6. [Formulario para agregar una serie](#6-formulario-para-agregar-una-serie)
7. [Proyecto base: series-js con fetch](#7-proyecto-base-series-js-con-fetch)

**API y conexión (servidor + cliente)**
8. [Estructura del proyecto del API](#8-estructura-del-proyecto-del-api)
9. [Etapa 2 · El API escuchando peticiones](#9-etapa-2--el-api-escuchando-peticiones)
10. [Etapa 3 · Conectar el API con MongoDB](#10-etapa-3--conectar-el-api-con-mongodb)
11. [Etapa 4 · El primer módulo: miembros](#11-etapa-4--el-primer-módulo-miembros)
12. [Etapa 5 · Series: listar y crear](#12-etapa-5--series-listar-y-crear)
13. [Etapa 6 · Series: cambiar estado y eliminar](#13-etapa-6--series-cambiar-estado-y-eliminar)
14. [Etapa 7 · React lee el API](#14-etapa-7--react-lee-el-api)
15. [Etapa 8 · El formulario crea con POST](#15-etapa-8--el-formulario-crea-con-post)
16. [Etapa 9 · Cambiar estado y quitar desde React](#16-etapa-9--cambiar-estado-y-quitar-desde-react)

**Laboratorios nuevos**
17. [Etapa 10 · React Router: varias páginas](#17-etapa-10--react-router-varias-páginas)
18. [EF Core y SQL Server](#18-ef-core-y-sql-server)

\---

## 1\. Montaje del proyecto



**Captura:** `capturas/01-montaje.png`: el proyecto corriendo en http://localhost:5173 con los estilos de Bootstrap.

!\[Montaje](capturas/01-montaje.png)

**Qué se hizo:** `npm create vite@latest maraton-series -- --template react`, `npm install`,
`npm install bootstrap`, se borró lo que no se usa (`App.css`, `index.css`, `assets/`), se
copiaron los assets (`App.jsx`, `estilos.css`, `data/series.js`, `utils/series.js`,
`componentes/layout/Encabezado.jsx`) y en `main.jsx` se importó Bootstrap y después
`estilos.css`.

**Comprobación:** Bootstrap se carga desde `node\_modules` con un `import` en `main.jsx`, no
con un `<link>` al CDN. Se usa uno u otro, nunca los dos. Con el import la página funciona
sin internet y la versión queda anotada en `package.json`.

\---

## 2\. Armar el tablero con los componentes

**Captura:** `capturas/02-componentes.png`: el tablero con el encabezado, el panel y las cinco tarjetas.

!\[Componentes](capturas/02-componentes.png)

**Tabla de componentes**

|Componente|Props que recibe|¿Qué hace?|
|-|-|-|
|Encabezado.jsx|Ninguna|Dibuja la barra azul de Bootstrap con el nombre de la aplicación.|
|Pagina.jsx|`children`|Pone el encabezado arriba y, dentro de un `container`, lo que reciba como hijos.|
|Panel.jsx|`titulo`, `children`|Una tarjeta de Bootstrap con un título y el contenido que le pasen.|
|TarjetaSerie.jsx|`serie`, `onAvanzar`, `onQuitar`|Muestra una serie (estado, título, género, temporadas, quién la propuso) y dos botones que llaman a las funciones recibidas.|
|ListaSeries.jsx|`series`, `onAvanzar`, `onQuitar`|Recorre el arreglo con `map` y dibuja una `TarjetaSerie` por serie; si está vacío, muestra un aviso.|

**Preguntas guía**

1. *¿De dónde sale lo que se muestra en `{children}`?* De lo que el componente padre escribe entre la etiqueta de apertura y la de cierre: `<Panel titulo="…"> <ListaSeries …/> </Panel>`. Para Panel, `children` es esa `ListaSeries`.
2. *¿La tarjeta cambia la serie o solo avisa?* Solo avisa. El botón ejecuta `onAvanzar(serie.id)`, una función que vino por props desde App. La tarjeta no tiene estado ni modifica datos.
3. *¿Qué se muestra si `series` está vacío? ¿Qué key se usa?* Una alerta azul «Ninguna serie coincide con los filtros.». La key es el identificador de la serie (`serie.id`, después `serie.\_id`).
4. *¿Qué recibe ListaSeries que solo pasa a cada TarjetaSerie?* `onAvanzar` y `onQuitar`: no las usa, solo las reenvía.

\---

## 3\. ¿Por qué no basta una variable?

**Captura:** `capturas/03-variable.png`: la consola con «Quedan 3 series» y las cinco tarjetas todavía en pantalla.

!\[Variable vs estado](capturas/03-variable.png)

**Experimento (series en `let series = seriesIniciales`)**

|Clic|¿Qué dice la consola?|¿Cuántas tarjetas se ven?|
|-|-|-|
|1. «Quitar» en Dark|Quedan 4 series|5|
|2. «Quitar» en Arcane|Quedan 3 series|5|
|3. «Quitar» en Dark otra vez|Quedan 3 series|5|
|Recargar (F5) y «Quitar»|Quedan 4 series|5|

**Pregunta: ¿por qué la pantalla no cambió si el dato sí?** Porque React dibuja App una vez
ejecutando la función. Cambiar una variable común no le avisa nada a React, así que no
vuelve a ejecutar App. Aunque lo hiciera, `let series = seriesIniciales` se volvería a
crear con las cinco series: una variable no recuerda su valor entre dibujos. Hace falta un
valor que React recuerde y una forma de avisarle que cambió: `useState`.

\---

## 4\. Cambiar estado y quitar con useState

**Captura:** `capturas/04-usestate.png`: Arcane en «Viendo», Dark quitada y el título con 4 series.

!\[useState](capturas/04-usestate.png)

**Experimento (paso 8, modificar el estado directamente):** con
`serie.estado = siguienteEstado(serie.estado); setSeries(series)`, la consola dijo
«Estado en los datos: Viendo», pero la tarjeta siguió en «Por ver». `setSeries` recibió el
mismo arreglo que ya tenía y React, al compararlo, no vio cambios y no redibujó. Se restauró
la versión con `map`.

**Preguntas**

1. *¿Qué dos cosas devuelve useState?* El valor actual (`series`) y la función para reemplazarlo (`setSeries`), que además le pide a React volver a dibujar.
2. *¿Por qué no cambiaba la página en el paso 8?* Porque se mutó el objeto y se entregó el mismo arreglo. React compara por referencia: mismo arreglo, nada que redibujar.
3. *¿Qué hace filter en quitar y por qué no splice?* `filter` crea un arreglo nuevo con todas las series menos la del id. `splice` modifica el arreglo original (muta el estado) y React no se enteraría.
4. *¿Para qué sirve `...serie` en avanzar?* Copia todas las propiedades de la serie en un objeto nuevo y luego se sobrescribe solo `estado`. Así no se muta el objeto original.
5. *¿Por qué la cantidad del título no necesita su propio useState?* Porque se calcula de `series` (`series.length`) en cada dibujo. Si fuera otro estado podría quedar desincronizada.

\---

## 5\. Filtros y resumen

**Captura:** `capturas/05-filtros.png`: tablero con filtros y resumen; y `capturas/05-filtros-vacio.png`: Viendo + Diego sin coincidencias.

!\[Filtros](capturas/05-filtros.png)

**Experimento (paso 8, resumen en un useState):** al guardar `conteos` con `useState`, cambié
el estado de Arcane y quité Dark: las tarjetas cambiaron, pero el resumen quedó en
2 · 1 · 2. El valor se calculó una vez al inicio y nadie lo volvió a calcular. Se restauró el
cálculo derivado.

**Preguntas**

1. *¿Por qué los filtros se guardan en App y no en Filtros?* Porque la lista también los necesita para calcular `visibles`. El estado se sube al ancestro común (estado elevado).
2. *¿Cómo avisa Filtros a App?* Con las funciones `onCambiarEstado` y `onCambiarMiembro` que recibe por props; el `onChange` del select las llama con `event.target.value`.
3. *¿Por qué visibles y conteos no son useState?* Porque se derivan de `series` y de los filtros. Se calculan en cada dibujo y nunca quedan desactualizados.
4. *¿Por qué el resumen no cambia al filtrar?* Porque `conteos` se calcula sobre `series` (todas), no sobre `visibles`.
5. *¿Qué pasaría si quitar usara visibles?* Al quitar con un filtro activo, el nuevo estado sería solo la lista filtrada: se perderían todas las series ocultas por el filtro.

\---

## 6\. Formulario para agregar una serie

**Captura:** `capturas/06-formulario-vacio.png`: un mensaje debajo de cada campo; y `capturas/06-formulario-severance.png`: Severance agregada.

!\[Formulario](capturas/06-formulario-vacio.png)

**Experimentos**

* *Paso 7, sin `...datos`:* con `setDatos({ \[name]: value })` el título seguía escrito en pantalla pero se perdió del estado. La consola avisó «A component is changing a controlled input to be uncontrolled» y al enviar apareció `Cannot read properties of undefined (reading 'trim')`. Se restauró `...datos`.
* *Pregunta 3, sin `event.preventDefault()`:* el navegador hizo el envío normal del formulario y recargó la página, perdiendo lo agregado. Se volvió a poner.

**Preguntas**

1. *¿Qué lo hace controlado?* Cada campo toma su `value` del estado `datos` y lo actualiza con `onChange`. React es la única fuente de verdad del valor.
2. *¿Cómo sabe cambiar qué campo actualizar?* Por el atributo `name` del input: `setDatos({ ...datos, \[name]: value })` usa ese nombre como clave.
3. *¿Qué pasa sin `preventDefault()`?* Se recarga la página (envío HTML clásico) y se pierde el estado.
4. *¿Cómo aparece cada mensaje bajo su campo?* `validarSerie` devuelve un objeto con una clave por campo; cada campo agrega `is-invalid` y un `invalid-feedback` cuando `errores.campo` existe.
5. *¿Por qué el id y «Por ver» se ponen en App?* Porque son reglas de cómo se guarda una serie, no datos que escribe la persona. El formulario solo entrega lo escrito; App (después el API) decide el id y el estado inicial.
6. *¿Por qué el resumen y los filtros se actualizaron solos?* Porque se derivan de `series`: al agregar, cambia el estado, App se vuelve a dibujar y se recalculan.

\---

## 7\. Proyecto base: series-js con fetch

Código en `proyectos-base/series-js` (`api.js`, `render.js`, `main.js`).

**Capturas:** `capturas/07-seriesjs-resultados.png`, `07-seriesjs-cargando.png`, `07-seriesjs-vacio.png`, `07-seriesjs-error.png` y `07-seriesjs-propuesta.png`.

!\[series-js](capturas/07-seriesjs-resultados.png)

**Experimentos (los cuatro estados)**

|Estado|Cómo se provocó|Qué se vio|
|-|-|-|
|Resultados|Buscar «dark»|Tarjetas con portada; las que no tienen, con `sin-imagen.svg`|
|Cargando|Red limitada a «Slow 4G»|El spinner «Buscando…» unos segundos|
|Vacío|Buscar «zzzzqqq»|«No se encontraron series para «zzzzqqq».»|
|Error de red|Red «Sin conexión»|La alerta roja|
|Error HTTP|URL `…/search/showz?q=`|Alerta roja; en consola «La API respondió con el código 404»|
|Propuesta|Enviar los tres campos|«Propuesta registrada con el número 101.» y el formulario vacío|

**Preguntas (paso 11)**

1. *¿Por qué revisar `response.ok` si hay try/catch?* Porque `fetch` solo lanza error cuando no hay respuesta (sin red). Un 404 o un 500 llegan como respuesta normal; hay que revisarlos a mano y lanzar el error.
2. *¿Qué hace await y por qué async?* Espera el resultado de una promesa sin bloquear la página. Solo se puede usar dentro de una función `async`, que a su vez devuelve una promesa.
3. *¿textContent o innerHTML?* `textContent` pone el dato como texto; `innerHTML` lo interpreta como HTML, así que un dato de la API con `<script>` o un `onerror` se ejecutaría (XSS).
4. *¿method, headers y body?* `method: 'POST'` indica que se envían datos; `headers` con `Content-Type: application/json` avisa el formato; `body: JSON.stringify(...)` es el contenido convertido a texto.
5. *¿Qué se hizo a mano que React hacía solo?* Crear cada elemento con `createElement`, ponerle clases y textos, limpiar la zona con `replaceChildren` antes de cada estado y decidir qué mostrar en cada caso. React redibuja a partir del estado sin que uno toque el DOM.

\---

## 8\. Estructura del proyecto del API

**Captura:** `capturas/08-estructura.png`: el explorador de VS Code con `cliente` y `servidor` y la salida de `git status -u` sin `.env` ni `node\_modules`.

!\[Estructura](capturas/08-estructura.png)

**Comprobaciones:** `npm run dev` mostró «Completed running 'src/index.js'» (solo había
comentarios); `node --env-file=.env -e "console.log(process.env.DB\_NAME, process.env.PORT)"`
mostró `maraton 3000`; `git status -u` no listó `.env` ni `node\_modules`.

**Reflexiona**

1. *¿Por qué React no puede conectarse a MongoDB?* Para conectarse se necesita usuario y contraseña, y todo el código de React se descarga al navegador: cualquiera la vería con F12. El API corre en el servidor y es el único que conoce la cadena de conexión.
2. *¿Por qué la carpeta madre? ¿Cambió la configuración?* Para tener la aplicación completa (cliente y servidor) en un solo repositorio y una sola ventana de VS Code, cada parte con su `package.json`. No cambió nada: Vite usa rutas relativas a su carpeta; solo hay que entrar con `cd cliente`.
3. *¿Qué hacen `--env-file` y `--watch`?* `--env-file=.env` carga las variables del `.env` en `process.env`; `--watch` reinicia el API cada vez que se guarda un archivo de código.
4. *¿.env o .env.example?* `.env` tiene los valores reales (con la contraseña) y no se sube. `.env.example` tiene los mismos nombres con valores de ejemplo y sí se sube, para que quien clone sepa qué crear.
5. *¿Qué es un módulo? ¿Por qué series tiene un archivo más?* Una carpeta con todo lo de un recurso del API, un archivo por capa. Series tiene `series.validacion.js` porque sus datos llegan del formulario y hay que revisarlos.
6. *Restaurante:* routes es la recepción (indica a dónde va cada pedido), controller el mesero (toma el pedido y entrega la respuesta), service el chef (aplica las reglas) y repository la bodega (guarda y saca los ingredientes: la base).

\---

## 9\. Etapa 2 · El API escuchando peticiones

**Captura:** `capturas/09-api-escuchando.png`: las respuestas 404, 404 y 400 en REST Client.

!\[API escuchando](capturas/09-api-escuchando.png)

**Explique el recorrido (petición 3, POST con JSON mal escrito)**

|#|Pieza|Qué hace con la petición 3|
|-|-|-|
|1|app.listen (index.js)|El servidor que escucha en el puerto 3000 recibe la petición y Express crea `req` y `res`.|
|2|cors|Agrega `Access-Control-Allow-Origin: http://localhost:5173` y llama a `next()`.|
|3|express.json()|Intenta convertir el cuerpo `{ "titulo":` en objeto; falla y llama a `next(error)` con `type: 'entity.parse.failed'`.|
|4|rutaNoEncontrada|No se ejecuta: con `next(error)` Express salta los middlewares normales y va directo a los de cuatro parámetros.|
|5|manejarErrores|Recibe el error, ve `entity.parse.failed` y responde 400 `JSON\_INVALIDO`.|

**Experimento (falta una variable):** con `# CLIENT\_ORIGIN=…` comentado, `npm run dev` se
detuvo con `Error: Falta la variable de entorno CLIENT\_ORIGIN` y «Failed running
'src/index.js'». Al quitar el `#` y reiniciar volvió «API escuchando…». El `.env` solo se lee
al arrancar.

**Reflexiona**

1. *¿Petición y respuesta?* La petición la envía el cliente (método, dirección, encabezados y cuerpo opcional); la respuesta la envía el servidor (código de estado, encabezados y cuerpo). A cada petición, una respuesta.
2. *¿Por qué `next(new HttpError(…))`?* Para que una sola pieza, `manejarErrores`, arme todas las respuestas de error con el mismo formato.
3. *¿Cómo sabe Express que es un manejador de errores?* Porque la función tiene cuatro parámetros `(err, req, res, next)`.
4. *¿Por qué cors primero y manejarErrores al final?* cors primero para que toda respuesta, incluso las de error, lleve el permiso. manejarErrores al final para recibir los errores de todas las piezas anteriores.
5. *¿codigo, mensaje y detalles?* `codigo` es para el programa (texto fijo para comparar), `mensaje` para la persona, `detalles` para el formulario: un mensaje por campo.
6. *¿Por qué no enviar el detalle de un 500?* Puede revelar rutas, versiones o datos internos. Al cliente le basta un mensaje genérico; el detalle queda en la terminal del servidor.

\---

## 10\. Etapa 3 · Conectar el API con MongoDB

**Captura:** `capturas/10-conexion.png`: la terminal con «Conectado a MongoDB: maraton» y «API escuchando…».

!\[Conexión](capturas/10-conexion.png)

**Explique el arranque**

|#|Archivo y línea|Qué ocurre|
|-|-|-|
|1|package.json · script dev|`node --env-file=.env --watch src/index.js`: carga el `.env` y ejecuta index.js.|
|2|config/env.js|Al importarse revisa `MONGODB\_URI`, `DB\_NAME` y `CLIENT\_ORIGIN` y exporta `config`.|
|3|config/db.js · new MongoClient|Al importarse crea el cliente con la cadena, todavía sin conectarse.|
|4|index.js · await conectar()|Abre la conexión con Atlas (red, usuario, contraseña) y espera.|
|5|config/db.js · cliente.db(…)|Elige la base `maraton`, la guarda en `db` e imprime «Conectado a MongoDB: maraton».|
|6|index.js · app.listen|Solo después de conectar, enciende el API en el 3000 e imprime «API escuchando…».|

**Experimentos**

* *6.1 Contraseña incorrecta:* `MongoServerError: bad auth : authentication failed`. No apareció «API escuchando» porque `await conectar()` falló y `app.listen` nunca se ejecutó.
* *6.2 Dirección del clúster incorrecta:* `Error: querySrv ENOTFOUND \_mongodb.\_tcp.cluster0.zzzzz.mongodb.net`: el driver no encontró ese servidor. Se restauró la cadena original.

**Reflexiona**

1. *¿Una sola conexión?* Conectar es lento (red, cifrado, credenciales). El cliente se crea una vez y todas las peticiones lo reutilizan; abrir una conexión por petición sería lento y agotaría las conexiones.
2. *¿Qué hace `await conectar()`? ¿Sin await?* Espera a que la conexión termine antes de seguir. Sin `await`, `app.listen` arrancaría antes de conectar: las primeras peticiones fallarían con «La base de datos todavía no está conectada» y un error de conexión quedaría sin atrapar.
3. *¿Por qué no apareció «API escuchando» en 6.1?* Porque el error se lanzó en `await conectar()` y detuvo el programa antes de `app.listen`.
4. *¿Qué comprueba «Conectado a MongoDB»?* Que la cadena está bien escrita, que el clúster existe, que la red tiene permiso y que usuario y contraseña son correctos. No comprueba que la base `maraton` exista ni que tenga colecciones.
5. *¿Database Access y Network Access?* Database Access controla quién entra (usuario y contraseña); Network Access controla desde dónde (direcciones IP).
6. *¿Para qué servirá `obtenerDb()`?* Para que los repositorios pidan la base ya conectada en el momento de consultar.

\---

## 11\. Etapa 4 · El primer módulo: miembros

**Captura:** `capturas/11-miembros.png`: la respuesta 200 de la petición 4.

!\[Miembros](capturas/11-miembros.png)

**Explique el recorrido (GET /api/miembros)**

|#|Pieza|Qué hace con esta petición|
|-|-|-|
|1|app.js · app.use('/api/miembros', …)|La dirección empieza con `/api/miembros`: la pasa al router de miembros.|
|2|miembros.routes.js|`GET /` coincide: llama a `controlador.listar`.|
|3|miembros.controller.js|Pide la lista al servicio con `await servicio.listar()`.|
|4|miembros.service.js|No hay reglas: la pide al repositorio.|
|5|miembros.repository.js|`find({}, { projection: { nombre: 1 } }).sort({ nombre: 1 }).toArray()` en la colección miembros.|
|6|MongoDB|Devuelve los cuatro documentos con `\_id` y `nombre`, ordenados.|
|7|De vuelta: miembros.controller.js|`res.json(miembros)`: 200 con el arreglo; los ObjectId salen como texto.|

**Experimentos**

* *7.1 Sin `toArray()`:* 500 `ERROR\_INTERNO` y en la terminal `TypeError: Converting circular structure to JSON`. El repositorio devolvió el cursor, que no se puede convertir a JSON.
* *7.2 Sin `await` en el controlador:* 200 con `{}`. Se envió la promesa, no la lista. Es un error engañoso porque el código es 200.

**Reflexiona**

1. *¿Qué pregunta responde cada capa?* routes: qué función atiende esta dirección y método. controller: qué pidió el cliente y qué se le responde. service: qué dicen las reglas. repository: cómo se lee o guarda en la base.
2. *¿Por qué existe el servicio sin reglas?* Para que el controlador nunca hable con el repositorio. Si aparece una regla (solo miembros activos), se agrega ahí sin tocar las otras capas; y otros módulos (series) lo usan.
3. *¿Por qué `'/'` y no `'/api/miembros'`?* Las rutas del router son relativas; el prefijo lo pone app.js. Con `'/miembros'` la dirección sería `/api/miembros/miembros`.
4. *¿Qué es un cursor?* Un objeto que va leyendo los resultados de `find` por partes. En 7.1 se envió el cursor en lugar de los datos y `res.json` falló.
5. *¿Por qué 7.2 respondió 200?* Porque `res.json` sí se ejecutó, con una promesa, que en JSON es `{}`. No hubo error, solo una respuesta vacía.
6. *¿Por qué POST /api/miembros es 404?* El router solo tiene `get('/')`. Para POST ninguna ruta coincide y la petición llega a `rutaNoEncontrada`.

\---

## 12\. Etapa 5 · Series: listar y crear

**Capturas:** `capturas/12-crear-201.png` (petición 6) y `capturas/12-crear-400.png` (petición 7).

!\[Crear 201](capturas/12-crear-201.png)

**Explique el recorrido del POST (petición 6, Severance)**

|#|Pieza|Qué hace con esta petición|
|-|-|-|
|1|express.json()|Convierte el cuerpo JSON en `req.body`.|
|2|series.routes.js|`POST /` → `controlador.crear`.|
|3|series.controller.js · crear|Llama a `servicio.crear(req.body ?? {})`.|
|4|series.validacion.js|`validarSerie` revisa título, género, temporadas y formato de `miembroId`: devuelve `{}`.|
|5|miembros.service.js · existe|Busca a Sofía por `\_id`: existe, devuelve `true`.|
|6|series.service.js · repositorio.crear|Arma el documento campo por campo (`estado: 'Por ver'`, `miembroId` como ObjectId, `calificaciones: \[]`) y lo inserta; recibe el `\_id` nuevo.|
|7|series.repository.js · buscarPorId|Lee la serie con `$match` + `CON\_MIEMBRO`: trae `miembro: 'Sofía'`.|
|8|series.controller.js · res.status(201)|Responde 201 con la serie leída de la base.|

Con la petición 8 (miembro inexistente) el recorrido se detiene en la fila 5: `existe`
devuelve `false`, el servicio lanza `HttpError(400, …, { miembroId: 'Ese miembro no existe.' })`
y quien escribe la respuesta es `manejarErrores`.

**Pruebas:** 5 → 200 con cinco series y su miembro (Ana, Luis, Sofía, Diego, Ana); 6 → 201;
7 → 400 con los cuatro mensajes; 8 → 400 en `miembroId`. Con `"temporadas": "2"` → 400 en
temporadas. Con `"estado": "Vista", "admin": true` se creó en «Por ver» y sin `admin`.

**Experimento (`from: 'miembro'`):** la petición 5 respondió 200 con `\[]`. El `$lookup` no
encontró la colección, dejó `miembro` vacío y `$unwind` descartó todas las series. MongoDB no
avisa de un nombre incorrecto.

**Reflexiona**

1. *¿Por qué preguntar a miembros.service?* Cada módulo es dueño de su colección. Si series leyera el repositorio de miembros, una regla nueva de miembros no se aplicaría.
2. *¿Por qué validar en el servidor?* La validación de React se puede saltar (REST Client, consola). El servidor protege la base y responde 400 claro antes de que el `$jsonSchema` rechace con un 500.
3. *¿Qué pasaría con `insertOne(req.body)`?* Entraría a la base lo que el cliente quiera: `estado: 'Vista'`, `admin: true`, `miembroId` como texto. En la prueba 7 el servicio lo ignoró porque arma el documento campo por campo.
4. *¿Por qué `new ObjectId(miembroId)`?* En la base las referencias son ObjectId: lo exige el `$jsonSchema` y el `$lookup` compara ObjectId con ObjectId; un texto nunca coincidiría.
5. *¿Qué hace cada etapa de CON\_MIEMBRO?* `$lookup` trae el miembro como arreglo, `$unwind` lo saca del arreglo, `$set` lo reemplaza por su nombre y `$project` quita `calificaciones`. El experimento mostró que un nombre de colección mal escrito da una lista vacía sin error.
6. *¿Por qué 201 con la serie leída de la base?* 201 significa «se creó». Se responde lo que quedó guardado, con `\_id`, estado y nombre del miembro, no lo que envió el cliente.

\---

## 13\. Etapa 6 · Series: cambiar estado y eliminar

**Capturas:** `capturas/13-patch-200.png` (petición 9), `13-patch-404.png` (petición 12) y `13-delete-204.png` (petición 13).

!\[PATCH 200](capturas/13-patch-200.png)

**Explique el recorrido del PATCH (petición 9)**

|#|Pieza|Qué hace con esta petición|
|-|-|-|
|1|app.js · /api/series|Pasa la petición al router de series.|
|2|series.routes.js · patch('/:id/estado')|Coincide y deja el id en `req.params.id`.|
|3|series.controller.js · cambiarEstado|Llama a `servicio.cambiarEstado(req.params.id, req.body ?? {})`.|
|4|utils/revisarId.js|El id tiene formato de ObjectId: sigue.|
|5|series.validacion.js · validarEstado|«Viendo» está en `ESTADOS`: sin errores.|
|6|series.repository.js · cambiarEstado|`updateOne` con `$set: { estado }`; `matchedCount === 1` → `true`.|
|7|series.repository.js · buscarPorId|Lee la serie actualizada con el nombre del miembro.|
|8|series.controller.js · res.json|200 con la serie.|

Con la 11 (`abc`) se detiene en la fila 4 → 400 `ID\_INVALIDO`. Con la 10 (`Abandonada`) en
la fila 5 → 400 `DATOS\_INVALIDOS`. Con la 12 (id que no existe) en la fila 6: `matchedCount`
es 0 y el servicio lanza 404 `NO\_ENCONTRADA`.

**Experimentos**

* *8.1 Sin revisarId:* la petición 11 respondió 500 y la terminal mostró `BSONError: input must be a 24 character hex string…`. El error era del usuario, pero recibió un 500 sin explicación.
* *8.2 modifiedCount:* la primera petición 9 dio 200; la segunda, 404 «La serie no existe.», porque no se modificó nada aunque la serie sí existía.
* *8.3 Sin `.end()`:* REST Client se quedó esperando, pero la serie sí se borró (la petición 5 ya no la mostraba).

**Reflexiona**

1. *¿Id en la dirección y estado en el cuerpo?* La dirección identifica el recurso sobre el que se actúa; el cuerpo trae lo que cambia.
2. *¿400 ID\_INVALIDO o 404 NO\_ENCONTRADA?* 400: el id ni siquiera tiene formato válido, lo detecta `revisarId` sin tocar la base. 404: el formato es correcto pero ninguna serie lo tiene, lo detecta el servicio con la respuesta de MongoDB.
3. *¿Por qué revisarId en utils?* No pertenece a series: cualquier módulo que reciba un id en la dirección la puede usar.
4. *¿matchedCount o modifiedCount?* `matchedCount` dice si se encontró la serie; `modifiedCount` si cambió algo. Para saber si existe, sirve el primero.
5. *¿Problema en React del 8.3?* React se quedaría esperando la respuesta: la tarjeta no desaparecería y no habría mensaje, aunque la serie ya no exista en la base.
6. *¿Por qué el segundo DELETE es 404?* La serie ya no existe (`deletedCount` = 0). Pasaría con dos pestañas abiertas, o con un doble clic que envía dos DELETE.

\---

## 14\. Etapa 7 · React lee el API

**Capturas:** `capturas/14-react-lee.png` (el Maratón con los datos de la base), `14-red.png` (pestaña Red con `series` y `miembros`) y `14-cors.png` (alerta del experimento 9.2 con su consola).

!\[React lee el API](capturas/14-react-lee.png)

**Explique el recorrido (abrir http://localhost:5173)**

|#|Pieza|Qué hace|
|-|-|-|
|1|App · primer dibujo|`cargando` es `true`: dibuja «Cargando series…».|
|2|useEffect · cargar()|Después del primer dibujo, una sola vez (`\[]`), lanza `Promise.all` con las dos peticiones.|
|3|seriesApi.js · obtenerSeries → pedir|`fetch(URL\_API + '/series')` con la dirección de `VITE\_API\_URL`.|
|4|API · GET /api/series|Responde 200 con las series y el nombre del miembro (CORS autoriza el 5173).|
|5|seriesApi.js · respuesta.json()|Lee el cuerpo; `respuesta.ok` es `true`, devuelve el arreglo.|
|6|App · setSeries y setMiembros|Guarda los datos en el estado.|
|7|App · finally|`setCargando(false)`, con éxito o con error.|
|8|App · segundo dibujo|Con los datos: filtros, tarjetas y resumen.|

En el experimento 9.1 cambia la fila 3: `fetch` falla sin respuesta, `pedir` lanza «No se pudo
conectar con el API…», la fila 6 es `setError` y la página muestra la alerta roja. En el 9.3
cambian las filas 3 a 5: se pide `http://localhost:5173/undefined/series`, Vite responde con
HTML y `respuesta.json()` falla con «Unexpected token '<'…».

**Experimentos**

* *9.1 Servidor apagado:* alerta «No se pudo conectar con el API. ¿Está encendido el servidor?» y en consola `net::ERR\_CONNECTION\_REFUSED`.
* *9.2 React en el 5174:* la misma alerta, pero en consola el bloqueo de CORS: el encabezado decía `http://localhost:5173`, distinto del origen.
* *9.3 Variable sin `VITE\_`:* «Unexpected token '<', "<!doctype "... is not valid JSON» y en Red la dirección `…/undefined/series`.
* *9.4 useEffect sin `\[]`:* la lista de peticiones en Red creció sin parar (cada respuesta cambia el estado, redibuja y el efecto vuelve a pedir). Se restauró enseguida.

**Reflexiona**

1. *¿Por qué la dirección va en un .env?* Cambia según dónde corre el API (local, nube). Se cambia sin tocar el código.
2. *¿Por qué no secretos en VITE\_?* Vite las escribe dentro del JavaScript que descarga el navegador: cualquiera las lee.
3. *¿9.1 y 9.2 muestran lo mismo?* En 9.1 no hubo respuesta; en 9.2 el API respondió pero el navegador bloqueó la lectura. La diferencia se ve en la consola (CONNECTION\_REFUSED o CORS).
4. *¿Por qué useEffect? ¿Qué mostró 9.4?* El cuerpo del componente se ejecuta en cada dibujo: pedir ahí crearía un ciclo sin fin. `useEffect` con `\[]` pide una vez después del primer dibujo. 9.4 mostró el ciclo.
5. *¿Por qué setCargando(false) en finally?* Porque se ejecuta tanto con éxito como con error. En el try, un error dejaría el indicador para siempre.
6. *¿Qué tendría que hacer agregar?* Enviar la serie al API con POST y guardar en el estado la que el API devuelve (etapa 8).

\---

## 15\. Etapa 8 · El formulario crea con POST

**Capturas:** `capturas/15-post-recargar.png` (serie nueva después de recargar), `15-carga-util.png` (Carga útil del POST) y `15-sin-validacion.png` (mensajes del experimento 7.1).

!\[POST](capturas/15-post-recargar.png)

**Explique el recorrido (agregar Severance)**

|#|Pieza|Qué hace|
|-|-|-|
|1|FormularioSerie · validarSerie|Revisa los cuatro campos en el navegador: sin errores.|
|2|FormularioSerie · setEnviando(true)|El botón se desactiva y dice «Guardando…».|
|3|App · agregar|Llama a `await crearSerie(datos)`.|
|4|seriesApi · crearSerie → pedir|`fetch` con `POST`, `Content-Type: application/json` y `JSON.stringify(datos)`.|
|5|API · POST /api/series|Valida, comprueba el miembro, guarda y responde 201 con la serie completa.|
|6|App · setSeries|`setSeries((actuales) => \[...actuales, creada])`: aparece la tarjeta.|
|7|FormularioSerie · setDatos(VACIO)|Limpia el formulario (solo si se guardó).|
|8|FormularioSerie · finally|`setEnviando(false)`: el botón vuelve.|

Con un 400 el recorrido se desvía en la fila 5: `pedir` lanza un Error con `detalles`, que
atraviesa `agregar` (sin try/catch) y llega al catch del formulario. No se ejecutan las filas
6 y 7: se muestra cada mensaje del API debajo de su campo y los datos se quedan.

**Experimentos**

* *7.1 Sin validación del navegador:* en Red, `POST 400`; debajo de Género «Elija un género de la lista.», el mensaje del API.
* *7.2 Sin Content-Type:* los cuatro campos en rojo aunque estaban bien; el encabezado era `text/plain;charset=UTF-8` y `express.json` no leyó el cuerpo.
* *7.3 Sin JSON.stringify:* «El cuerpo no es un JSON válido.» y Carga útil `\[object Object]`.
* *7.4 Sin await:* el formulario se limpió, no apareció la serie ni un mensaje; en consola `Uncaught (in promise) Error: No se pudo conectar…`.

**Reflexiona**

1. *¿Tres piezas de fetch? ¿7.2 y 7.3?* `method`, `headers` con Content-Type y `body` en texto JSON. Sin el encabezado el API no lee el cuerpo; sin `stringify` el cuerpo es `\[object Object]`.
2. *¿Por qué primero el API?* Para que la pantalla muestre solo lo guardado, y con los datos que puso el API (`\_id`, estado, nombre del miembro).
3. *¿Por qué agregar no tiene try/catch?* Para que el error llegue al formulario, que sabe mostrar los mensajes junto a cada campo.
4. *¿Por qué el miembroId y no el nombre?* El API relaciona la serie con el miembro por su `\_id` (ObjectId); dos miembros podrían llamarse igual.
5. *¿Por qué el API valida otra vez?* La validación del navegador se puede saltar; además solo el API sabe si el miembro existe en la base.
6. *¿Qué mostró 7.4?* Sin `await`, el `try` termina antes del error: se pierde lo escrito, nadie atrapa el error y la persona no ve nada.

\---

## 16\. Etapa 9 · Cambiar estado y quitar desde React

**Capturas:** `capturas/16-patch-delete.png` (Red con PATCH 200 y DELETE 204) y `16-dos-pestanas.png` (alerta del experimento 4.1).

!\[PATCH y DELETE](capturas/16-patch-delete.png)

**Explique el recorrido de Quitar**

|#|Pieza|Qué hace|
|-|-|-|
|1|TarjetaSerie · botón Quitar|Llama a `onQuitar(serie.\_id)`.|
|2|App · quitar|`await eliminarSerie(id)` dentro de un try.|
|3|seriesApi · eliminarSerie → pedir|`fetch` con método DELETE a `/series/${id}`, sin cuerpo.|
|4|API · series.routes → controller|`delete('/:id')` → `controlador.eliminar(req.params.id)`.|
|5|API · series.service · eliminar|`revisarId(id)` y llama al repositorio; si no borró nada, 404.|
|6|API · series.repository · deleteOne|Borra el documento; `deletedCount === 1` → `true`. El controlador responde 204.|
|7|seriesApi · pedir (respuesta 204)|Ve el 204 y devuelve `null` sin leer el cuerpo.|
|8|App · setSeries|`setSeries((actuales) => actuales.filter(...))`: la tarjeta desaparece.|

En 4.1 el recorrido se detiene en la fila 5: la serie ya no existe, el API responde 404 y
`pedir` lanza «La serie no existe.», que App muestra con `setError`. En 4.3 se detiene en la
fila 7: sin el caso 204, `respuesta.json()` falla con «Unexpected end of JSON input» aunque la
serie sí se borró.

**Mapa del Maratón completo**

|En la pantalla|Función de seriesApi|Ruta del API|Función del repositorio|
|-|-|-|-|
|Abrir la página|`obtenerSeries`, `obtenerMiembros`|`GET /api/series`, `GET /api/miembros`|`series.listar`, `miembros.listar`|
|Agregar serie|`crearSerie`|`POST /api/series`|`miembros.buscarPorId`, `series.crear`, `series.buscarPorId`|
|Cambiar estado|`cambiarEstadoSerie`|`PATCH /api/series/:id/estado`|`series.cambiarEstado`, `series.buscarPorId`|
|Quitar|`eliminarSerie`|`DELETE /api/series/:id`|`series.eliminar`|
|Ver detalle (etapa 10)|`obtenerSerie`|`GET /api/series/:id`|`series.buscarPorId`|

**Experimentos**

* *4.1 Dos pestañas:* alerta «La serie no existe.» y en Red `DELETE 404`. Al recargar, la pantalla volvió a coincidir con la base.
* *4.2 Primero la pantalla:* con el API apagado, la tarjeta desapareció aunque salió la alerta; al encender y recargar volvió, porque nunca se borró.
* *4.3 Sin el caso 204:* alerta «Unexpected end of JSON input», `DELETE 204` en Red y, al recargar, la serie ya no estaba.
* *4.4 La lista vieja:* con red lenta y dos Quitar seguidos, la primera tarjeta reapareció; al recargar ninguna estaba. El segundo `quitar` filtró la lista de su clic.

**Reflexiona**

1. *¿Por qué revisar el 204 antes de json()?* Un 204 no tiene cuerpo y `json()` lanza error. En 4.3 la serie se borró, pero React mostró un error y dejó la tarjeta.
2. *¿Por qué usar la serie que devolvió el API?* Es lo que quedó guardado. Si el API cambia o rechaza algo, la pantalla muestra la verdad de la base.
3. *¿Qué demostró 4.4?* Que después de un `await` la variable `series` puede ser una foto vieja; la forma con función recibe la lista vigente.
4. *¿Por qué agregar no tiene try/catch y avanzar/quitar sí?* Los errores de agregar los muestra el formulario por campo; los de los botones no tienen campo, así que App los muestra en la alerta de arriba.
5. *¿Ventaja y riesgo de cambiar la pantalla primero?* Ventaja: se siente inmediato. Riesgo: si el API falla, la pantalla muestra algo que no pasó hasta recargar.
6. *¿Qué archivos para un recurso nuevo?* En el servidor: `x.routes.js`, `x.controller.js`, `x.service.js`, `x.validacion.js`, `x.repository.js` y el montaje en `app.js`. En el cliente: las funciones en un `xApi.js` y los componentes que las usan.

\---

## 17\. Etapa 10 · React Router: varias páginas

Laboratorio nuevo. Servidor: `GET /api/series/:id`. Cliente: `BrowserRouter`, `Layout` con
`<Outlet />`, `NavLink`, las páginas `Inicio`, `PaginaSeries`, `NuevaSerie`, `DetalleSerie` y
`NoEncontrada`, y los filtros con `useSearchParams`.

**Capturas:** `capturas/17-detalle.png` (un detalle con su dirección `/series/<id>`), `17-filtros-url.png` (lista filtrada con `?estado=…\&miembro=…`) y `17-red-cancelada.png` (Red con la petición cancelada por StrictMode).

!\[Detalle](capturas/17-detalle.png)

!\[Lista filtrada desde la dirección](capturas/17-filtros-url.png)

Otras pantallas del router: `capturas/17-inicio.png` (Inicio resaltado en el menú),
`capturas/17-serie-no-encontrada.png` (404 del API) y `capturas/17-pagina-404.png` (404 del router).

!\[Serie no encontrada](capturas/17-serie-no-encontrada.png)

!\[Página 404](capturas/17-pagina-404.png)

**Pruebas (Actividad 9)**

|Prueba|Resultado|
|-|-|
|Abrir `/`|Inicio; en el menú, Inicio resaltado.|
|Clic en «Ver series»|`/series` con la lista; Series resaltado; GET series y miembros.|
|Clic en el título de una serie|`/series/<id>` con el detalle; dos GET a `series/<id>`, uno cancelado.|
|Botón Atrás|Vuelve a `/series` sin recargar.|
|F5 en un detalle|El mismo detalle.|
|`/series/650000000000000000000000`|«Serie no encontrada» (404 del API).|
|`/series/abc`|«No se pudo cargar la serie» y «El identificador no es válido.» (400).|
|`/peliculas`|La página 404 del router.|
|Agregar una serie|Al guardar vuelve a `/series` con la serie nueva.|
|Filtros|La dirección cambia (`/series?estado=Por+ver\&miembro=Ana`); recargar y Atrás los respetan.|

**Explique el recorrido (clic en el título de una serie)**

|#|Pieza|Qué hace|
|-|-|-|
|1|TarjetaSerie · `<Link to={…}>`|Evita la navegación normal del `<a>` y le pide al router ir a `/series/<\_id>`.|
|2|BrowserRouter (API de historial)|`history.pushState` cambia la dirección y agrega una entrada al historial, sin pedir nada al servidor.|
|3|App · `<Routes>`|Lee la dirección y elige la ruta más específica: `series/:id`.|
|4|Layout · `<Outlet />`|Layout sigue dibujando el encabezado y en el Outlet pone `<DetalleSerie />`.|
|5|DetalleSerie · useParams|Lee `id` de la dirección (texto).|
|6|DetalleSerie · useEffect|Con `\[id]` como dependencia, crea un AbortController y llama a `cargar()`; la limpieza hará `abort()`.|
|7|seriesApi · obtenerSerie → pedir|`fetch` a `/series/<id>` con la `signal` del controlador.|
|8|API · GET /api/series/:id|`revisarId`, `buscarPorId` con el miembro; responde 200 con la serie.|
|9|DetalleSerie · setSerie y setCargando|Guarda la serie y quita el indicador: se dibuja la tarjeta del detalle.|

Con `/peliculas` el recorrido cambia en la fila 3: ninguna ruta coincide salvo `\*` y el Outlet
dibuja `NoEncontrada`; no se pide nada al API. Con `/series/650000000000000000000000` llega
hasta la fila 8: el API responde 404 `NO\_ENCONTRADA`, `pedir` lanza un Error con
`estado = 404` y en la fila 9 se ejecuta `setError`: la página dice «Serie no encontrada».

**Experimentos**

* *10.1 `<a href>` en lugar de Link:* en Red (filtro Todo) apareció una petición de tipo documento a `/series`: el navegador pidió la página entera y React empezó de cero. Con Link no hay petición de documento.
* *10.2 Sin `<Outlet />`:* solo se vio el encabezado en todas las páginas.
* *10.3 Sin limpieza:* al abrir un detalle hubo 2 peticiones completas y 0 canceladas (con limpieza: 1 y 1).
* *10.4 AbortError tratado como falla:* apareció «No se pudo cargar la serie / No se pudo conectar con el API…» aunque la segunda petición sí funcionó.
* *10.5 La ruta `\*` primero:* todo siguió funcionando; React Router elige la ruta más específica, no la primera.

**Reflexiona**

1. *¿Cómo cambia de página sin pedir otra al servidor?* Link usa la API de historial (`pushState`) para cambiar la dirección; el router lee la nueva dirección y React dibuja el componente que le corresponde. El experimento 10.1 mostró que con `<a href>` sí hay una petición de documento.
2. *¿Por qué Layout no tiene path? ¿Qué hace Outlet?* Es una ruta de diseño: no agrega nada a la dirección, solo envuelve a las demás para compartir el encabezado. `<Outlet />` es el hueco donde se dibuja la ruta hija que coincide.
3. *¿404 de `/peliculas` o de `/series/6500…`?* `/peliculas` lo detecta React Router (ruta `\*`) sin hablar con el servidor. `/series/6500…` coincide con `series/:id`; el que detecta que no existe es el API, que responde 404 y la página lo muestra.
4. *¿Por qué `\[id]`? ¿Y con `\[]`?* Para que el efecto se vuelva a ejecutar cuando cambia el id. Con `\[]` solo pediría al montar: si se navega de un detalle a otro sin desmontar la página, seguiría mostrando la serie anterior.
5. *¿Qué hace la limpieza? ¿10.3 y 10.4?* Cancela la petición pendiente cuando el id cambia o se sale de la página, para que una respuesta vieja no pise el estado. 10.3: sin limpieza las dos peticiones completan y las dos escriben. 10.4: si el AbortError se trata como falla, la cancelación propia aparece como error en pantalla.
6. *¿Qué se gana con los filtros en la dirección? ¿Y para paginar?* Sobreviven a la recarga, Atrás vuelve al filtro anterior y el enlace se puede compartir. Para paginar se guardaría `?page=2\&size=10` y se leería con `parametros.get('page')`, igual que `estado` y `miembro`.

\---

## 18\. EF Core y SQL Server

Laboratorio nuevo: `maraton-series/servidor-net`. Entidades `Genero`, `Miembro`, `Serie`;
`MaratonContext` con largos, índices únicos, CHECK, claves foráneas con `Restrict` y `HasData`;
migraciones `Inicial` y `GenerosFavoritos` (tabla intermedia `MiembroGeneros`); cadena de
conexión en user-secrets; `GET /api/miembros` y `GET /api/series`.

**Capturas:** `capturas/18-tablas.png` (la base con sus tablas en VS Code), `18-consulta3.png` y `18-consulta6.png`, `18-get-series.png` (respuesta de `GET /api/series`) y `18-error-fk.png` (uno de los errores de la Actividad 12).

!\[Tablas](capturas/18-tablas.png)

**Resultados de `sql/consultas.sql`**

|Consulta|Resultado|
|-|-|
|1. Tablas|`\_\_EFMigrationsHistory`, `Generos`, `MiembroGeneros`, `Miembros`, `Series`|
|2. Historial|`…\_Inicial` y `…\_GenerosFavoritos`, versión 10.0.14|
|3. JOIN|Dark · Ciencia ficción · Vista · Ana; The Office · Comedia · Viendo · Luis; Arcane · Animación · Por ver · Sofía; Chernobyl · Drama · Vista · Diego; Planeta Tierra · Documental · Por ver · Ana|
|4. Series de Ana|Dark, Planeta Tierra|
|5. Resumen|Por ver 2 · Viendo 1 · Vista 2|
|6. Favoritos|Ana · Ciencia ficción, Ana · Documental, Diego · Drama, Luis · Comedia, Sofía · Animación, Sofía · Drama|

**Explique el recorrido (GET /api/series)**

|#|Pieza|Qué hace|
|-|-|-|
|1|Kestrel (puerto 5080)|El servidor web de ASP.NET Core recibe la petición HTTP.|
|2|`app.MapGet("/api/series", …)`|La ruta coincide; ASP.NET Core ejecuta su función.|
|3|Inyección de dependencias · AddDbContext|Crea un `MaratonContext` para esta petición y lo entrega como parámetro `db`.|
|4|user-secrets · ConnectionStrings:Maraton|De ahí salió la cadena con la que se configuró `UseSqlServer` (solo en Development).|
|5|LINQ · OrderBy y Select|Arma la consulta: ordenar por Id y proyectar a un objeto anónimo con los nombres del contrato. Todavía no se ejecuta.|
|6|EF Core · ToListAsync|Traduce el LINQ a SQL, lo envía a SQL Server y espera sin bloquear.|
|7|SQL Server · SELECT con JOIN|Ejecuta `SELECT CONVERT(varchar(11), \[s].\[Id]) AS \[\_id], … FROM \[Series] INNER JOIN \[Generos] … INNER JOIN \[Miembros] … ORDER BY \[s].\[Id]` y devuelve las filas.|
|8|Objetos anónimos → JSON|EF Core arma la lista de objetos y ASP.NET Core la serializa como JSON con 200 OK.|

**Del documento a la tabla**

|Decisión del diseño de MongoDB|En SQL Server|
|-|-|
|Correo único (índice único en `miembros.correo`)|Índice único `IX\_Miembros\_Correo` sobre `Miembros.Correo`|
|Referencia `miembroId`|Columna `Series.MiembroId` con clave foránea `FK\_Series\_Miembros\_MiembroId` (Restrict)|
|`enum` de estado en el `$jsonSchema`|Restricción `CK\_Series\_Estado`: `\[Estado] IN (N'Por ver', N'Viendo', N'Vista')`|
|Arreglo embebido `generosFavoritos`|Tabla intermedia `MiembroGeneros (MiembroId, GeneroId)` con clave compuesta y dos FK|

**Experimentos**

|#|Mensaje obtenido|Qué protege|
|-|-|-|
|E1|Msg 547: conflicto con la FOREIGN KEY `FK\_Series\_Miembros\_MiembroId`|No hay series de miembros inexistentes.|
|E2|Msg 2601: clave duplicada en el índice único `IX\_Miembros\_Correo` (ana@club.com)|El correo no se repite.|
|E3|Msg 547: conflicto con la CHECK `CK\_Series\_Estado`|Solo los tres estados válidos.|
|E4|Msg 547: el DELETE choca con la REFERENCE `FK\_Series\_Miembros\_MiembroId`|No se borra un miembro que tiene series.|

* *12.5 Cambiar el modelo sin migración:* con `HasMaxLength(120)`, `dotnet ef database update` se negó con `PendingModelChangesWarning: … has pending changes. Add a new migration…`. Al volver a 100, no hubo nada que aplicar.
* *12.6 Reconstruir desde cero:* `dotnet ef database drop --force` y `dotnet ef database update` aplicaron las dos migraciones en orden; las consultas 3 y 6 devolvieron los mismos datos.
* *Extra, SQL Server apagado:* la petición 2 tardó y respondió 500 con la página de error de desarrollo; en la terminal `SqlException … A network-related or instance-specific error`.

**Reflexiona**

1. *¿Qué garantiza una FK que MongoDB no?* Que el valor de `MiembroId` exista en `Miembros`. En MongoDB solo lo revisaba el servicio. E1 mostró que la base rechaza un miembro 99 y E4 que no deja borrar un miembro con series.
2. *¿Por qué generosFavoritos necesita una tabla aparte?* En una tabla cada columna guarda un solo valor; un miembro tiene varios géneros y un género es favorito de varios miembros. Una relación muchos a muchos se resuelve con una tabla intermedia con dos FK.
3. *¿Migraciones sí y cadena de conexión no?* Las migraciones describen la estructura y los datos de ejemplo: cualquiera reconstruye la base con `database update`; viven en `Migrations/`. La cadena tiene la contraseña: vive en user-secrets, en la carpeta del usuario, fuera del proyecto.
4. *¿Qué hizo EF Core con el Select?* Lo tradujo a un SELECT con solo las columnas pedidas, dos `INNER JOIN` por las navegaciones `Genero` y `Miembro`, `CONVERT(varchar(11), …)` para los `ToString()` y `ORDER BY \[s].\[Id]`.
5. *¿Qué pasó en 12.5?* EF Core comparó el modelo con el último snapshot, vio un cambio sin migración y se negó a actualizar: el modelo y la base tienen que cambiar juntos, con una migración versionada.
6. *¿Qué cambiaría en React?* Solo `VITE\_API\_URL` (a `http://localhost:5080/api`), porque el contrato se mantiene: mismos nombres de campo y `\_id` como texto. Faltarían las demás rutas en .NET (detalle, POST, PATCH, DELETE) y permitir el origen del cliente con CORS.

