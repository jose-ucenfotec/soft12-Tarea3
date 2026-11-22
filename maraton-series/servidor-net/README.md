# Maratón de series — servidor-net (ASP.NET Core 10 + EF Core 10 + SQL Server)

Mismo dominio que el servidor Express, ahora en tablas: `Generos`, `Miembros`, `Series`
y la tabla intermedia `MiembroGeneros` (muchos a muchos). Las migraciones `Inicial` y
`GenerosFavoritos` crean las tablas e insertan los datos de ejemplo (`HasData`).

## Requisitos

- SDK de .NET 10 (`global.json` lo fija) y la herramienta `dotnet-ef` 10.0.14:

```bash
dotnet tool install --global dotnet-ef --version 10.0.14
```

- SQL Server: Windows → SQL Server 2025 Express (`localhost\SQLEXPRESS`);
  Mac → contenedor de Docker:

```bash
docker run --platform linux/amd64 -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=Maraton#2026sql" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
```

## Cadena de conexión (user-secrets, nunca en el repositorio)

```bash
# Windows
dotnet user-secrets set "ConnectionStrings:Maraton" "Server=localhost\SQLEXPRESS;Database=Maraton;Trusted_Connection=True;TrustServerCertificate=True"
# Mac
dotnet user-secrets set "ConnectionStrings:Maraton" "Server=localhost,1433;Database=Maraton;User Id=sa;Password=Maraton#2026sql;TrustServerCertificate=True"
```

## Crear la base y ejecutar

```bash
dotnet ef database update   # aplica Inicial y GenerosFavoritos
dotnet run                  # http://localhost:5080
```

| Ruta | Respuesta |
|---|---|
| `GET /api/miembros` | `[{ "_id": "1", "nombre": "Ana" }, …]` ordenados por nombre |
| `GET /api/series` | el mismo JSON que Express: `_id`, `titulo`, `genero`, `temporadas`, `estado`, `miembroId`, `miembro` |

Pruebas en `requests.http`; consultas y experimentos SQL en `sql/consultas.sql`.
