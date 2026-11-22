# Maratón de series — cliente (React + Vite + React Router)

```bash
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:3000/api
npm run dev              # http://localhost:5173
```

| Dirección | Página |
|---|---|
| `/` | `paginas/Inicio.jsx` |
| `/series` | `paginas/PaginaSeries.jsx` (lista, filtros en `?estado=…&miembro=…`, resumen) |
| `/series/nueva` | `paginas/NuevaSerie.jsx` (formulario → POST, luego `useNavigate`) |
| `/series/:id` | `paginas/DetalleSerie.jsx` (`useParams` + `useEffect([id])` con `AbortController`) |
| `*` | `paginas/NoEncontrada.jsx` |

Todas las llamadas al API están en `src/api/seriesApi.js`.
