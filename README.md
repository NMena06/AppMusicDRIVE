# Guitar PDF Library

Aplicación web profesional, sin base de datos ni backend, para organizar y visualizar PDFs musicales alojados en Google Drive.

## Stack

- Frontend: React + Vite
- Drive: Google Drive API desde navegador
- Persistencia local: `localStorage`
- Visor PDF: Google Drive Preview embebido

## Instalación rápida

```bash
npm run install:all
cp frontend/.env.example frontend/.env
npm run dev
```

Frontend: `http://localhost:5173`

## Configurar Google Drive

1. Entrá a Google Cloud Console y creá un proyecto.
2. Habilitá **Google Drive API**.
3. Creá una **API key** restringida por HTTP referrer para tu dominio.
4. La carpeta de Drive debe estar pública o compartida de forma que una API key pueda listar su contenido.
5. En `frontend/.env`, configurá:

```env
VITE_GOOGLE_API_KEY=tu_api_key
VITE_DRIVE_FOLDER_ID=1OnSStgm34WFIiksFfvCimJIyd_oqMwcI
VITE_EXTRA_DRIVE_FOLDER_IDS=
```

La app recorre subcarpetas, detecta PDFs y los muestra en biblioteca. Favoritos, últimos vistos, progreso y categorías editadas se guardan localmente en el navegador.

Ruta precargada:

- `Guitar`: `1OnSStgm34WFIiksFfvCimJIyd_oqMwcI`

Desde esa carpeta principal la app recorre automaticamente subcarpetas como `pdf`, `Libros y canciones`, `KIKO`, `Libros` y `Nick Johnston`.

Para agregar mas rutas directas, poné IDs separados por coma en `VITE_EXTRA_DRIVE_FOLDER_IDS`.

## Scripts útiles

```bash
npm run dev          # inicia Vite
npm run build        # compila producción
```
