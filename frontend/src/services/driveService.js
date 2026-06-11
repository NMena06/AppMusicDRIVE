const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const PDF_MIME = 'application/pdf';
const GUITAR_PRO_EXTENSIONS = ['gp', 'gp3', 'gp4', 'gp5', 'gpx'];
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'm4v', 'webm', 'avi', 'mkv'];

export const DRIVE_FOLDER_ID = import.meta.env.VITE_DRIVE_FOLDER_ID || '1OnSStgm34WFIiksFfvCimJIyd_oqMwcI';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const EXTRA_FOLDER_IDS = (import.meta.env.VITE_EXTRA_DRIVE_FOLDER_IDS || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);
let driveWarnings = [];
let documentsCache = null;
let documentsCacheAt = 0;
let documentsRequest = null;

const DRIVE_DOCUMENTS_CACHE_KEY = 'musicDrive.documents.cache.v3';
const DRIVE_DOCUMENTS_CACHE_TTL = 1000 * 60 * 60 * 6;

export const DRIVE_COLLECTIONS = [
  {
    id: DRIVE_FOLDER_ID,
    name: 'Guitar',
    path: 'Guitar',
    description: 'Carpeta principal con pdf, Libros y canciones, KIKO, Libros y Nick Johnston.',
  },
];

export function getDriveMediaUrl(id) {
  return `${DRIVE_API}/${id}?alt=media&key=${API_KEY}`;
}

const CATEGORY_RULES = [
  ['Libros de musica', ['libro', 'book', 'metodo', 'method', 'manual', 'user guide', 'matematicas', 'advanced acoustic', 'guitar pro']],
  ['Clases en video', ['video', 'lesson', 'clase', 'masterclass', 'matheus asato', 'leandro celleri']],
  ['Acordes y progresiones', ['acorde', 'chord', 'progresion', 'progression', 'chordhouse', 'ii-v', 'i-vi', 'jazz guitar chord']],
  ['Tablaturas', ['tab', 'tablatura', 'gpx', 'gp5', 'riff', 'solo', 'lick', 'licks']],
  ['Canciones y repertorio', ['song', 'cancion', 'ignore alien', 'poison touch', 'hypergiant', 'remarkably human', 'impossible things', 'weakened', 'fear had him', 'nick johnston']],
  ['Tecnica de guitarra', ['tecnica', 'technique', 'fundamento', 'ejercicio', 'exercise', 'dia ', 'tics and tricks']],
  ['Escalas', ['escala', 'scale', 'menor', 'major']],
  ['Armonia', ['armonia', 'harmony']],
  ['Lectura musical', ['lectura', 'reading', 'sight']],
  ['Teoria musical', ['teoria', 'theory']],
];

export const DEFAULT_CATEGORIES = [...CATEGORY_RULES.map(([name]) => name), 'Otros'];

const TITLE_STOP_WORDS = new Set(['pdf', 'compress', 'compressed', 'final', 'copy', 'copia', 'download']);
const SMALL_WORDS = new Set(['a', 'and', 'by', 'de', 'del', 'for', 'in', 'la', 'las', 'le', 'los', 'of', 'para', 'por', 'the', 'to', 'un', 'una', 'with', 'y']);
const UPPERCASE_WORDS = new Set(['gp', 'gpx', 'pdf', 'ii', 'iii', 'iv', 'vi', 'vii', 'viii', 'ix', 'x']);

function assertApiKey() {
  if (!API_KEY) {
    throw new Error('Falta configurar VITE_GOOGLE_API_KEY en frontend/.env');
  }
}

function inferCategory(name, folderPath, collectionName) {
  const value = `${collectionName || ''} ${folderPath || ''} ${name}`.toLowerCase();
  if (GUITAR_PRO_EXTENSIONS.includes(getExtension(name))) return 'Tablaturas';
  if (value.includes('libros')) return 'Libros de musica';
  if (value.includes('/ kiko /') || value.includes('guitar / kiko')) return 'Tecnica de guitarra';
  if (value.includes('/ nick johnston') || value.includes('nick johnston')) return 'Canciones y repertorio';
  return CATEGORY_RULES.find(([, keys]) => keys.some((key) => value.includes(key)))?.[0] || 'Otros';
}

function inferSection(folderPath) {
  const parts = folderPath.split('/').map((part) => part.trim()).filter(Boolean);
  const mainFolder = parts[1] || 'General';
  const known = {
    KIKO: 'KIKO',
    'Nick Johnston': 'Nick Johnston',
    Libros: 'Libros',
    pdf: 'PDF sueltos',
    'Libros y canciones': 'Libros y canciones',
  };
  return known[mainFolder] || mainFolder;
}

function inferSubfolder(folderPath) {
  const parts = folderPath.split('/').map((part) => part.trim()).filter(Boolean);
  const mainFolder = parts[1] || 'General';
  const nextFolder = parts[2];

  if (!nextFolder) return mainFolder === 'pdf' ? 'PDF principal' : 'Carpeta principal';
  return nextFolder;
}

function getExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

function stripExtension(fileName) {
  const extension = getExtension(fileName);
  return extension ? fileName.slice(0, -(extension.length + 1)) : fileName;
}

function toDisplayCase(value) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (UPPERCASE_WORDS.has(lower)) return lower.toUpperCase();
      if (index > 0 && SMALL_WORDS.has(lower)) return lower;
      if (/^[ivx]+$/i.test(word)) return word.toUpperCase();
      if (/^\d+$/.test(word)) return word;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function cleanTitle(fileName) {
  const extension = getExtension(fileName);
  const withoutExtension = stripExtension(fileName)
    .replace(/pdf$/i, '')
    .replace(/\b\d{4}-\d{2}-\d{2}[-_\s]*\d{6,}\b/g, '')
    .replace(/\b\d{10,}\b/g, '')
    .replace(/\([^)]*\bcompress[^)]*\)/gi, '')
    .replace(/\bcompress(ed)?\b/gi, '')
    .replace(/\buser'?s?\s*guide\b/gi, 'User Guide')
    .replace(/\bmanual\s*usuario\b/gi, 'Manual de Usuario')
    .replace(/[_]+/g, ' ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();

  const parts = withoutExtension
    .split(' - ')
    .map((part) => part.trim())
    .filter((part) => part && !TITLE_STOP_WORDS.has(part.toLowerCase()));

  const title = parts.length ? parts.map(toDisplayCase).join(' - ') : toDisplayCase(withoutExtension || fileName);
  return extension && GUITAR_PRO_EXTENSIONS.includes(extension) ? `${title} (${extension.toUpperCase()})` : title;
}

function buildDescription(file, categoryName, sectionName, subfolderName) {
  const documentType = getDocumentType(file);
  const typeLabel = documentType === 'guitar-pro' ? 'Tablatura Guitar Pro' : documentType === 'video' ? 'Video' : 'PDF';
  return `${typeLabel} en ${sectionName} / ${subfolderName} - ${categoryName}`;
}

function getDocumentType(file) {
  const extension = getExtension(file.name);
  if (file.mimeType === PDF_MIME || extension === 'pdf') return 'pdf';
  if (GUITAR_PRO_EXTENSIONS.includes(extension)) return 'guitar-pro';
  if (file.mimeType?.startsWith('video/') || VIDEO_EXTENSIONS.includes(extension)) return 'video';
  return 'other';
}

async function listFolder(folderId, folderName = 'Principal', folderPath = folderName, collectionName = folderName) {
  assertApiKey();
  const files = [];
  let pageToken = '';

  do {
    const params = new URLSearchParams({
      key: API_KEY,
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'nextPageToken,files(id,name,mimeType,webViewLink,webContentLink,createdTime,modifiedTime,size)',
      pageSize: '1000',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
    });
    if (pageToken) params.set('pageToken', pageToken);

    const response = await fetch(`${DRIVE_API}?${params.toString()}`);
    if (!response.ok) {
      const detail = await response.json().catch(() => null);
      const message = detail?.error?.message || 'No se pudo leer Google Drive';
      if ([403, 404].includes(response.status)) {
        driveWarnings.push({
          folderId,
          folderPath,
          collectionName,
          status: response.status,
          message,
        });
        console.warn(`Carpeta omitida: ${folderPath} (${folderId}) - ${message}`);
        return [];
      }
      throw new Error(message);
    }

    const data = await response.json();
    files.push(...data.files.map((file) => ({ ...file, folderId, folderName, folderPath, collectionName })));
    pageToken = data.nextPageToken || '';
  } while (pageToken);

  return files;
}

async function walkFolder(folderId, folderName = 'Principal', results = [], folderPath = folderName, collectionName = folderName) {
  const files = await listFolder(folderId, folderName, folderPath, collectionName);

  for (const file of files) {
    if (file.mimeType === FOLDER_MIME) {
      await walkFolder(file.id, file.name, results, `${folderPath} / ${file.name}`, collectionName);
    }

    const documentType = getDocumentType(file);
    if (documentType === 'pdf' || documentType === 'guitar-pro' || documentType === 'video') {
      const categoryName = getCategory(file.id) || inferCategory(file.name, file.folderPath, file.collectionName);
      const sectionName = inferSection(file.folderPath);
      const subfolderName = inferSubfolder(file.folderPath);
      results.push({
        id: file.id,
        google_drive_id: file.id,
        nombre: file.name,
        titulo: getVisibleName(file.id) || cleanTitle(file.name),
        titulo_original: file.name,
        descripcion: buildDescription(file, categoryName, sectionName, subfolderName),
        extension: getExtension(file.name),
        tipo_documento: documentType,
        mime_type: file.mimeType,
        carpeta_drive_id: file.folderId,
        carpeta_nombre: file.folderName,
        carpeta_ruta: file.folderPath,
        coleccion: file.collectionName,
        seccion: sectionName,
        subcarpeta: subfolderName,
        categoria: { nombre: categoryName },
        categoria_id: categoryName,
        url_view: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
        url_download: file.webContentLink,
        mediaUrl: getDriveMediaUrl(file.id),
        previewUrl: `https://drive.google.com/file/d/${file.id}/preview`,
        tamanio: file.size,
        fecha_creacion_drive: file.createdTime,
        fecha_modificacion_drive: file.modifiedTime,
        esFavorito: isFavorite(file.id),
        progreso: getProgress(file.id),
        visible: true,
      });
    }
  }

  return results;
}

function applyLocalDocumentMeta(doc) {
  const visibleName = getVisibleName(doc.id);
  const categoryName = getCategory(doc.id) || doc.categoria_id || doc.categoria?.nombre;
  return {
    ...doc,
    titulo: visibleName || doc.titulo,
    nombre_visible: visibleName || doc.nombre_visible,
    categoria_id: categoryName || doc.categoria_id,
    categoria: categoryName ? { ...(doc.categoria || {}), nombre: categoryName } : doc.categoria,
    esFavorito: isFavorite(doc.id),
    progreso: getProgress(doc.id),
  };
}

function applyLocalDocumentMetaList(documents) {
  return documents.map(applyLocalDocumentMeta);
}

function isFreshCache(savedAt) {
  return savedAt && Date.now() - savedAt < DRIVE_DOCUMENTS_CACHE_TTL;
}

function readDriveDocumentsCache() {
  if (documentsCache && isFreshCache(documentsCacheAt)) {
    return documentsCache;
  }

  const stored = readJson(DRIVE_DOCUMENTS_CACHE_KEY, null);
  if (!stored?.savedAt || !Array.isArray(stored.documents) || !isFreshCache(stored.savedAt)) {
    return null;
  }

  documentsCache = stored.documents;
  documentsCacheAt = stored.savedAt;
  return documentsCache;
}

function writeDriveDocumentsCache(documents) {
  documentsCache = documents;
  documentsCacheAt = Date.now();
  writeJson(DRIVE_DOCUMENTS_CACHE_KEY, { savedAt: documentsCacheAt, documents });
}

export function clearDriveDocumentsCache() {
  documentsCache = null;
  documentsCacheAt = 0;
  documentsRequest = null;
  localStorage.removeItem(DRIVE_DOCUMENTS_CACHE_KEY);
}

async function loadDriveDocumentsFromDrive() {
  driveWarnings = [];
  const roots = [
    ...DRIVE_COLLECTIONS,
    ...EXTRA_FOLDER_IDS.map((id, index) => ({
      id,
      name: `Extra ${index + 1}`,
      path: `Extra ${index + 1}`,
      description: 'Carpeta agregada desde VITE_EXTRA_DRIVE_FOLDER_IDS.',
    })),
  ];
  const byId = new Map();

  for (const root of roots) {
    const docs = await walkFolder(root.id, root.name, [], root.path, root.name);
    for (const doc of docs) {
      if (!byId.has(doc.id)) {
        byId.set(doc.id, doc);
      } else {
        const existing = byId.get(doc.id);
        byId.set(doc.id, {
          ...existing,
          coleccion: existing.coleccion.includes(doc.coleccion) ? existing.coleccion : `${existing.coleccion}, ${doc.coleccion}`,
        });
      }
    }
  }

  const documents = [...byId.values()];
  if (documents.length === 0 && driveWarnings.length > 0) {
    const folders = driveWarnings.map((warning) => `${warning.folderPath} (${warning.status})`).join(', ');
    throw new Error(`No se pudo leer ninguna carpeta publica de Drive. Revisar permisos o IDs: ${folders}`);
  }
  if (documents.length === 0) {
    throw new Error('Google Drive respondio correctamente, pero no entrego archivos. Verifica que la carpeta principal este compartida como "Cualquier persona con el enlace puede ver" y que sus PDFs tambien sean accesibles.');
  }

  return documents;
}

export async function fetchDriveDocuments(options = {}) {
  const forceRefresh = options.forceRefresh === true;

  if (!forceRefresh) {
    const cached = readDriveDocumentsCache();
    if (cached) return applyLocalDocumentMetaList(cached);
    if (documentsRequest) return documentsRequest.then(applyLocalDocumentMetaList);
  }

  documentsRequest = loadDriveDocumentsFromDrive()
    .then((documents) => {
      writeDriveDocumentsCache(documents);
      return documents;
    })
    .finally(() => {
      documentsRequest = null;
    });

  return documentsRequest.then(applyLocalDocumentMetaList);
}

export function getDriveWarnings() {
  return driveWarnings;
}

export function filterDocuments(documents, filters = {}) {
  const search = (filters.search || '').toLowerCase();
  const filtered = documents.filter((doc) => {
    const searchable = `${doc.titulo} ${doc.titulo_original || ''} ${doc.nombre} ${doc.descripcion || ''} ${doc.carpeta_ruta}`.toLowerCase();
    const matchesSearch = !search || searchable.includes(search);
    const matchesCategory = !filters.categoryId || doc.categoria?.nombre === filters.categoryId;
    const matchesFolder = !filters.folder || doc.carpeta_nombre === filters.folder;
    const matchesCollection = !filters.collection || doc.coleccion?.includes(filters.collection);
    const matchesSection = !filters.section || doc.seccion === filters.section;
    const matchesType = !filters.type || doc.tipo_documento === filters.type;
    const matchesFavorite = filters.favorite !== 'true' || doc.esFavorito;
    return matchesSearch && matchesCategory && matchesFolder && matchesCollection && matchesSection && matchesType && matchesFavorite;
  });

  const sort = filters.sort || 'nombre';
  return filtered.sort((a, b) => {
    if (sort === 'fecha') return new Date(b.fecha_modificacion_drive || 0) - new Date(a.fecha_modificacion_drive || 0);
    if (sort === 'categoria') return (a.categoria?.nombre || '').localeCompare(b.categoria?.nombre || '');
    return a.titulo.localeCompare(b.titulo);
  });
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function isFavorite(id) {
  return readJson('favorites', []).includes(id);
}

export function toggleFavorite(id) {
  const favorites = readJson('favorites', []);
  const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
  writeJson('favorites', next);
  return next.includes(id);
}

export function getProgress(id) {
  return readJson('progress', {})[id] || 1;
}

export function saveProgress(id, page) {
  const progress = readJson('progress', {});
  progress[id] = Math.max(Number(page) || 1, 1);
  writeJson('progress', progress);
}

export function touchHistory(doc, page = getProgress(doc.id)) {
  const history = readJson('history', []).filter((item) => item.id !== doc.id);
  history.unshift({
    id: doc.id,
    titulo: doc.titulo,
    categoria: doc.categoria,
    carpeta_nombre: doc.carpeta_nombre,
    carpeta_ruta: doc.carpeta_ruta,
    coleccion: doc.coleccion,
    seccion: doc.seccion,
    subcarpeta: doc.subcarpeta,
    previewUrl: doc.previewUrl,
    url_view: doc.url_view,
    ultima_pagina: page,
    fecha_ultimo_acceso: new Date().toISOString(),
  });
  writeJson('history', history.slice(0, 30));
}

export function getHistory() {
  return readJson('history', []);
}

export function getCategories() {
  const stored = readJson('categories', []);
  return [...new Set([...DEFAULT_CATEGORIES, ...stored])].map((nombre) => ({ id: nombre, nombre, activo: true }));
}

export function saveCategories(categories) {
  writeJson('categories', categories.map((category) => category.nombre).filter(Boolean));
}

export function getCategory(id) {
  return readJson('documentCategories', {})[id];
}

export function setDocumentMeta(id, data) {
  const names = readJson('documentNames', {});
  const categories = readJson('documentCategories', {});
  if (data.nombre_visible) names[id] = data.nombre_visible;
  if (data.categoria_id) categories[id] = data.categoria_id;
  writeJson('documentNames', names);
  writeJson('documentCategories', categories);
}

export function getVisibleName(id) {
  return readJson('documentNames', {})[id];
}
