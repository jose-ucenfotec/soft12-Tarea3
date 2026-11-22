# Tarea 3 — Laboratorios guiados del Maratón de series (Parte A)

SOFT-12 Programación Web Avanzada · Universidad CENFOTEC · III cuatrimestre 2026 · Autor: José Barrantes

Repositorio personal con todos los laboratorios guiados del curso. El Maratón está en su
estado final (etapa 10 + laboratorio de EF Core): cliente React con React Router, servidor
Express con MongoDB y servidor .NET con EF Core y SQL Server.

```
tarea-3/
├── README.md
├── .gitignore
├── docs/
│   ├── laboratorios.md      una sección por laboratorio: captura, recorrido, Reflexiona y experimentos
│   └── capturas/
├── proyectos-base/
│   └── series-js/           Maratón en JavaScript sin React (fetch a TVmaze y jsonplaceholder)
└── maraton-series/
    ├── cliente/             React 19 + Vite + Bootstrap + React Router 8   → http://localhost:5173
    ├── servidor/            Express 5 + driver de MongoDB                   → http://localhost:3000
    └── servidor-net/        ASP.NET Core 10 + EF Core 10 + SQL Server       → http://localhost:5080
```

## Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 22.22 o superior (React Router 8 lo exige) |
| MongoDB | Clúster de MongoDB Atlas (o un MongoDB local) |
| .NET SDK | 10.0.x (lo fija `servidor-net/global.json`) + `dotnet-ef` 10.0.14 |
| SQL Server | 2025 Express (Windows) o 2022 en Docker (Mac) |
| VS Code | Extensiones REST Client, C# Dev Kit y SQL Server (mssql) |

## 1. Servidor Express + MongoDB (terminal 1)

```bash
cd maraton-series/servidor
npm install
cp .env.example .env
```

Edite `.env` y ponga su cadena de Atlas en `MONGODB_URI` (`DB_NAME=maraton`,
`CLIENT_ORIGIN=http://localhost:5173`). Si la base `maraton` todavía no tiene datos, créela
con el script de semilla (borra y vuelve a crear las colecciones `miembros` y `series` con su
`$jsonSchema` y los datos del laboratorio de diseño):

```bash
npm run semilla
```

```bash
npm run dev
```

Debe mostrar `Conectado a MongoDB: maraton` y `API escuchando en http://localhost:3000`.
Las 16 peticiones de prueba están en `servidor/requests.http`.

| Ruta | Respuestas |
|---|---|
| `GET /api/miembros` | 200 |
| `GET /api/series` | 200 |
| `GET /api/series/:id` | 200 · 400 `ID_INVALIDO` · 404 `NO_ENCONTRADA` |
| `POST /api/series` | 201 · 400 `DATOS_INVALIDOS` · 400 `JSON_INVALIDO` |
| `PATCH /api/series/:id/estado` | 200 · 400 · 404 |
| `DELETE /api/series/:id` | 204 · 400 · 404 |

## 2. Cliente React (terminal 2)

```bash
cd maraton-series/cliente
npm install
cp .env.example .env
npm run dev
```

`.env` contiene `VITE_API_URL=http://localhost:3000/api`. Abra http://localhost:5173.

Rutas: `/` (inicio), `/series` (lista; filtros en la dirección, por ejemplo
`/series?estado=Viendo&miembro=Ana`), `/series/nueva` (formulario), `/series/:id`
(detalle) y cualquier otra dirección → página 404.

## 3. Servidor .NET + SQL Server (terminal 3)

Solo la primera vez: instale `dotnet-ef` y guarde la cadena de conexión en user-secrets.

```bash
dotnet tool install --global dotnet-ef --version 10.0.14
```

```bash
cd maraton-series/servidor-net
```

Windows:

```bash
dotnet user-secrets set "ConnectionStrings:Maraton" "Server=localhost\SQLEXPRESS;Database=Maraton;Trusted_Connection=True;TrustServerCertificate=True"
```

Mac (con el contenedor `sqlserver` encendido: `docker start sqlserver`):

```bash
dotnet user-secrets set "ConnectionStrings:Maraton" "Server=localhost,1433;Database=Maraton;User Id=sa;Password=Maraton#2026sql;TrustServerCertificate=True"
```

Crear la base con las dos migraciones (`Inicial` y `GenerosFavoritos`) y encender:

```bash
dotnet ef database update
```

```bash
dotnet run
```

Debe mostrar `Now listening on: http://localhost:5080`. `GET /api/miembros` y
`GET /api/series` responden el mismo JSON que Express (con `_id` numérico como texto).
Pruebas en `servidor-net/requests.http` y consultas en `servidor-net/sql/consultas.sql`.

## 4. Proyecto base series-js

```bash
cd proyectos-base/series-js
npm install
```

Abra `index.html` con Live Server (no con doble clic: los módulos no funcionan con `file://`).

## Lo que no se sube

`node_modules`, `dist`, `bin`, `obj` y los archivos `.env` están en `.gitignore`. La cadena
de conexión de SQL Server vive en user-secrets, fuera del proyecto. Solo se suben los
`.env.example`.
