import { 
  AlignCenter, ArrowDown, ArrowUp, ChevronDown, ChevronUp, Copy, Download, 
  Ear, Eraser, FlipHorizontal, Grid3X3, Guitar, History, Keyboard, 
  LoaderCircle, Mic, Music2, Pencil, Play, Plus, Redo, RotateCcw, Save, 
  Scissors, Shuffle, Sliders, Square, Trash2, Undo, Upload, Volume2, 
  VolumeX, Waves, Zap 
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ============ CONSTANTES ============
const CIRCLE_KEYS = [
  { major: 'C', minor: 'Am', accidental: '0' },
  { major: 'G', minor: 'Em', accidental: '1#' },
  { major: 'D', minor: 'Bm', accidental: '2#' },
  { major: 'A', minor: 'F#m', accidental: '3#' },
  { major: 'E', minor: 'C#m', accidental: '4#' },
  { major: 'B', minor: 'G#m', accidental: '5#' },
  { major: 'F#/Gb', minor: 'D#m/Ebm', accidental: '6# / 6b' },
  { major: 'Db', minor: 'Bbm', accidental: '5b' },
  { major: 'Ab', minor: 'Fm', accidental: '4b' },
  { major: 'Eb', minor: 'Cm', accidental: '3b' },
  { major: 'Bb', minor: 'Gm', accidental: '2b' },
  { major: 'F', minor: 'Dm', accidental: '1b' },
];

const NOTE_TO_INDEX = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const ALL_OCTAVE_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const FLAT_TONICS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm']);

const TIME_SIGNATURES = [
  { id: '4/4', beats: 4, division: 4, label: '4/4 (Común)' },
  { id: '3/4', beats: 3, division: 4, label: '3/4 (Vals)' },
  { id: '6/8', beats: 6, division: 8, label: '6/8 (Balada)' },
  { id: '2/4', beats: 2, division: 4, label: '2/4 (Marcha)' },
  { id: '5/4', beats: 5, division: 4, label: '5/4 (Prog)' },
  { id: '7/8', beats: 7, division: 8, label: '7/8 (Étnico)' },
];

const NOTE_DURATIONS = [
  { id: '1n', label: 'Redonda', value: 4, icon: '𝅝' },
  { id: '2n', label: 'Blanca', value: 2, icon: '𝅗𝅥' },
  { id: '4n', label: 'Negra', value: 1, icon: '𝅘𝅥' },
  { id: '8n', label: 'Corchea', value: 0.5, icon: '𝅘𝅥𝅮' },
  { id: '16n', label: 'Semicorchea', value: 0.25, icon: '𝅘𝅥𝅯' },
];

const CHORD_INVERSIONS = [
  { id: 'root', label: 'Fundamental', shift: 0 },
  { id: 'first', label: '1ª Inversión', shift: 1 },
  { id: 'second', label: '2ª Inversión', shift: 2 },
];

const PROGRESSION_CATEGORIES = ['Todas', 'Pop', 'Rock', 'Cinemática', 'Folk', 'Soul', 'Cadencia', 'Oscura'];

const GREEK_MODES = [
  { id: 'ionian', name: 'Jonico', family: 'Mayor', intervals: [0, 2, 4, 5, 7, 9, 11], qualities: ['', 'm', 'm', '', '', 'm', 'dim'], roman: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii dim'], color: 'Estable, brillante y resolutivo.', lesson: 'Es la escala mayor natural. Funciona muy bien cuando el centro tonal queda claro en el I y la progresion resuelve de V a I.', characteristicDegrees: [1, 4, 5] },
  { id: 'dorian', name: 'Dorico', family: 'Menor', intervals: [0, 2, 3, 5, 7, 9, 10], qualities: ['m', 'm', '', '', 'm', 'dim', ''], roman: ['i', 'ii', 'III', 'IV', 'v', 'vi dim', 'VII'], color: 'Menor con sexta mayor, moderno y jazzistico.', lesson: 'La nota clave es la sexta mayor. Para que suene dorico, usa i menor con IV mayor y evita resolver como menor natural todo el tiempo.', characteristicDegrees: [1, 4, 7] },
  { id: 'phrygian', name: 'Frigio', family: 'Menor', intervals: [0, 1, 3, 5, 7, 8, 10], qualities: ['m', '', '', 'm', 'dim', '', 'm'], roman: ['i', 'bII', 'bIII', 'iv', 'v dim', 'bVI', 'bvii'], color: 'Oscuro, flamenco y exotico.', lesson: 'La segunda bemol es el sello. Alternar i menor con bII mayor hace aparecer el color frigio rapidamente.', characteristicDegrees: [1, 2, 6] },
  { id: 'lydian', name: 'Lidio', family: 'Mayor', intervals: [0, 2, 4, 6, 7, 9, 11], qualities: ['', '', 'm', 'dim', '', 'm', 'm'], roman: ['I', 'II', 'iii', '#iv dim', 'V', 'vi', 'vii'], color: 'Mayor flotante, abierto y cinematografico.', lesson: 'La cuarta aumentada es la nota de identidad. Usa I mayor con II mayor para evitar que suene simplemente jonico.', characteristicDegrees: [1, 2, 5] },
  { id: 'mixolydian', name: 'Mixolidio', family: 'Mayor', intervals: [0, 2, 4, 5, 7, 9, 10], qualities: ['', 'm', 'dim', '', 'm', 'm', ''], roman: ['I', 'ii', 'iii dim', 'IV', 'v', 'vi', 'bVII'], color: 'Mayor con septima bemol, rock, blues y funk.', lesson: 'El bVII mayor evita la resolucion clasica y da un color muy de riff. I - bVII - IV es una firma mixolidia.', characteristicDegrees: [1, 4, 7] },
  { id: 'aeolian', name: 'Eolico', family: 'Menor', intervals: [0, 2, 3, 5, 7, 8, 10], qualities: ['m', 'dim', '', 'm', 'm', '', ''], roman: ['i', 'ii dim', 'III', 'iv', 'v', 'VI', 'VII'], color: 'Menor natural, melancolico y estable.', lesson: 'Es la escala menor natural. VI y VII mayores son esenciales para ese color menor moderno.', characteristicDegrees: [1, 6, 7] },
  { id: 'locrian', name: 'Locrio', family: 'Disminuido', intervals: [0, 1, 3, 5, 6, 8, 10], qualities: ['dim', '', 'm', 'm', '', '', 'm'], roman: ['i dim', 'bII', 'bIII', 'iv', 'bV', 'bVI', 'bvii'], color: 'Inestable, tenso y disminuido.', lesson: 'La quinta bemol genera mucha tension. Conviene usarlo para pasajes oscuros o transiciones, no tanto como reposo largo.', characteristicDegrees: [1, 2, 5] },
];

const SONG_SECTION_TYPES = ['Intro', 'Verso', 'Pre-estribillo', 'Estribillo', 'Puente', 'Solo', 'Outro'];

const DRUM_PATTERNS = [
  { id: 'none', name: 'Sin bateria', steps: [] },
  { id: 'basic', name: 'Base limpia', steps: [{ beat: 0, sound: 'kick', velocity: 0.9 }, { beat: 1, sound: 'hat', velocity: 0.35 }, { beat: 2, sound: 'snare', velocity: 0.75 }, { beat: 3, sound: 'hat', velocity: 0.35 }] },
  { id: 'pop', name: 'Pop 4/4', steps: [{ beat: 0, sound: 'kick', velocity: 0.9 }, { beat: 0.5, sound: 'hat', velocity: 0.3 }, { beat: 1, sound: 'snare', velocity: 0.75 }, { beat: 1.5, sound: 'hat', velocity: 0.28 }, { beat: 2, sound: 'kick', velocity: 0.72 }, { beat: 2.5, sound: 'hat', velocity: 0.32 }, { beat: 3, sound: 'snare', velocity: 0.82 }, { beat: 3.5, sound: 'openHat', velocity: 0.28 }] },
  { id: 'rock', name: 'Rock fuerte', steps: [{ beat: 0, sound: 'kick', velocity: 1 }, { beat: 0.5, sound: 'hat', velocity: 0.32 }, { beat: 1, sound: 'snare', velocity: 0.92 }, { beat: 1.5, sound: 'hat', velocity: 0.32 }, { beat: 2, sound: 'kick', velocity: 0.94 }, { beat: 2.5, sound: 'hat', velocity: 0.34 }, { beat: 3, sound: 'snare', velocity: 0.96 }, { beat: 3.5, sound: 'openHat', velocity: 0.42 }] },
  { id: 'balada', name: 'Balada', steps: [{ beat: 0, sound: 'kick', velocity: 0.75 }, { beat: 1, sound: 'hat', velocity: 0.22 }, { beat: 2, sound: 'snare', velocity: 0.58 }, { beat: 3, sound: 'hat', velocity: 0.24 }] },
  { id: 'funk', name: 'Funk suave', steps: [{ beat: 0, sound: 'kick', velocity: 0.82 }, { beat: 0.5, sound: 'hat', velocity: 0.28 }, { beat: 0.75, sound: 'ghostSnare', velocity: 0.24 }, { beat: 1, sound: 'snare', velocity: 0.72 }, { beat: 1.25, sound: 'hat', velocity: 0.3 }, { beat: 2, sound: 'kick', velocity: 0.78 }, { beat: 2.75, sound: 'hat', velocity: 0.32 }, { beat: 3, sound: 'snare', velocity: 0.78 }, { beat: 3.5, sound: 'hat', velocity: 0.28 }] },
  { id: 'reggae', name: 'Reggae offbeat', steps: [{ beat: 0.5, sound: 'hat', velocity: 0.35 }, { beat: 1, sound: 'rim', velocity: 0.68 }, { beat: 1.5, sound: 'hat', velocity: 0.35 }, { beat: 2.5, sound: 'hat', velocity: 0.35 }, { beat: 3, sound: 'kick', velocity: 0.78 }, { beat: 3, sound: 'rim', velocity: 0.54 }, { beat: 3.5, sound: 'openHat', velocity: 0.28 }] },
  { id: 'latin', name: 'Latin pop', steps: [{ beat: 0, sound: 'kick', velocity: 0.84 }, { beat: 0.75, sound: 'hat', velocity: 0.28 }, { beat: 1.5, sound: 'snare', velocity: 0.58 }, { beat: 2, sound: 'kick', velocity: 0.76 }, { beat: 2.5, sound: 'hat', velocity: 0.3 }, { beat: 3, sound: 'clap', velocity: 0.58 }, { beat: 3.5, sound: 'hat', velocity: 0.3 }] },
  { id: 'trap', name: 'Trap lento', steps: [{ beat: 0, sound: 'kick', velocity: 0.88 }, { beat: 0.5, sound: 'hat', velocity: 0.24 }, { beat: 0.75, sound: 'hat', velocity: 0.18 }, { beat: 1, sound: 'hat', velocity: 0.23 }, { beat: 1.5, sound: 'snare', velocity: 0.8 }, { beat: 2.25, sound: 'kick', velocity: 0.74 }, { beat: 2.5, sound: 'hat', velocity: 0.24 }, { beat: 2.75, sound: 'hat', velocity: 0.18 }, { beat: 3, sound: 'hat', velocity: 0.25 }, { beat: 3.5, sound: 'snare', velocity: 0.86 }] },
];

const SCALE_DEGREES = {
  major: {
    label: 'Mayor', intervals: [0, 2, 4, 5, 7, 9, 11], qualities: ['', 'm', 'm', '', '', 'm', 'dim'],
    roman: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii dim'],
    names: ['Tónica', 'Supertónica', 'Mediante', 'Subdominante', 'Dominante', 'Submediante', 'Sensible'],
    progressions: [
      { name: 'Pop clásica', category: 'Pop', degrees: [1, 5, 6, 4] },
      { name: 'Pop emocional', category: 'Pop', degrees: [6, 4, 1, 5] },
      { name: 'Pop ascendente', category: 'Pop', degrees: [1, 3, 4, 5] },
      { name: 'Rock directo', category: 'Rock', degrees: [1, 4, 5, 4] },
      { name: 'Rock himno', category: 'Rock', degrees: [1, 5, 4, 4] },
      { name: 'Rock alternativo', category: 'Rock', degrees: [6, 5, 4, 5] },
      { name: 'Folk / balada', category: 'Folk', degrees: [1, 6, 4, 5] },
      { name: 'Folk abierto', category: 'Folk', degrees: [1, 4, 1, 5] },
      { name: 'Soul suave', category: 'Soul', degrees: [6, 4, 1, 5] },
      { name: 'Soul cálido', category: 'Soul', degrees: [2, 5, 1, 6] },
      { name: 'Cadencia fuerte', category: 'Cadencia', degrees: [2, 5, 1, 1] },
      { name: 'Cadencia clásica', category: 'Cadencia', degrees: [4, 5, 1, 1] },
      { name: 'Cinemática luminosa', category: 'Cinemática', degrees: [1, 5, 6, 3] },
      { name: 'Cinemática épica', category: 'Cinemática', degrees: [6, 4, 1, 5] },
    ],
  },
  minor: {
    label: 'Menor natural', intervals: [0, 2, 3, 5, 7, 8, 10], qualities: ['m', 'dim', '', 'm', 'm', '', ''],
    roman: ['i', 'ii dim', 'III', 'iv', 'v', 'VI', 'VII'],
    names: ['Tónica', 'Supertónica', 'Mediante', 'Subdominante', 'Dominante', 'Submediante', 'Subtónica'],
    progressions: [
      { name: 'Menor moderno', category: 'Pop', degrees: [1, 6, 3, 7] },
      { name: 'Pop menor', category: 'Pop', degrees: [1, 7, 6, 7] },
      { name: 'Rock menor', category: 'Rock', degrees: [1, 7, 6, 7] },
      { name: 'Rock pesado', category: 'Rock', degrees: [1, 6, 7, 1] },
      { name: 'Rock oscuro', category: 'Rock', degrees: [1, 4, 6, 7] },
      { name: 'Cinemática', category: 'Cinemática', degrees: [1, 6, 4, 5] },
      { name: 'Cinemática épica', category: 'Cinemática', degrees: [1, 3, 7, 6] },
      { name: 'Cinemática dramática', category: 'Cinemática', degrees: [1, 6, 7, 5] },
      { name: 'Oscura estable', category: 'Oscura', degrees: [1, 4, 7, 3] },
      { name: 'Oscura descendente', category: 'Oscura', degrees: [1, 7, 6, 5] },
      { name: 'Resolución menor', category: 'Cadencia', degrees: [6, 7, 1, 1] },
      { name: 'Cadencia menor', category: 'Cadencia', degrees: [4, 5, 1, 1] },
      { name: 'Folk menor', category: 'Folk', degrees: [1, 6, 7, 1] },
      { name: 'Soul menor', category: 'Soul', degrees: [1, 4, 3, 6] },
    ],
  },
};

// ============ FUNCIONES AUXILIARES ============
function cleanTonic(value) { 
  return value.replace('m', '').split('/')[0]; 
}

function noteName(index, preferFlats) { 
  const notes = preferFlats ? FLAT_NOTES : SHARP_NOTES; 
  return notes[((index % 12) + 12) % 12]; 
}

function clampBpm(value) { 
  return Math.min(220, Math.max(40, Number(value) || 90)); 
}

function readLocalList(key, fallback) { 
  try { 
    return JSON.parse(localStorage.getItem(key)) || fallback; 
  } catch { 
    return fallback; 
  } 
}

function writeLocalList(key, value) { 
  localStorage.setItem(key, JSON.stringify(value)); 
}

function normalizeSongSection(section) {
  return {
    ...section,
    chords: Array.isArray(section.chords) ? section.chords : [],
    melody: Array.isArray(section.melody) ? section.melody : [],
    bars: Math.min(16, Math.max(1, Number(section.bars) || 4)),
    drumPattern: section.drumPattern || 'none',
    drumIntensity: Math.min(1, Math.max(0.25, Number(section.drumIntensity) || 0.75)),
    timeSignature: section.timeSignature || '4/4',
  };
}

function progressionChords(scale, progression) { 
  return progression.degrees.map((degree) => scale[degree - 1]); 
}

function chordNotes(chord, inversion = 'root') {
  const [, root = 'C', quality = ''] = chord.match(/^([A-G](?:#|b)?)(.*)$/) || [];
  const rootIndex = NOTE_TO_INDEX[root] ?? 0;
  
  const intervals = quality.includes('dim') 
    ? [0, 3, 6] 
    : quality.includes('m') 
      ? [0, 3, 7] 
      : [0, 4, 7];
  
  const baseOctave = rootIndex >= 9 ? 3 : 4;
  
  let notes = intervals.map((interval) => {
    const absolute = rootIndex + interval;
    const note = SHARP_NOTES[absolute % 12];
    const octave = baseOctave + Math.floor(absolute / 12);
    return `${note}${octave}`;
  });
  
  if (inversion === 'first' && notes.length >= 3) {
    notes = [...notes.slice(1), notes[0].replace(/\d/, (n) => parseInt(n) + 1)];
  } else if (inversion === 'second' && notes.length >= 3) {
    notes = [
      ...notes.slice(2), 
      notes[0].replace(/\d/, (n) => parseInt(n) + 1), 
      notes[1].replace(/\d/, (n) => parseInt(n) + 1)
    ];
  }
  
  return notes;
}

function getInversionNotes(chord, inversion) {
  return chordNotes(chord, inversion);
}

function buildScale(tonic, mode) {
  const root = cleanTonic(tonic);
  const rootIndex = NOTE_TO_INDEX[root] ?? 0;
  const preferFlats = FLAT_TONICS.has(tonic) || root.includes('b');
  const config = SCALE_DEGREES[mode];
  
  return config.intervals.map((interval, index) => {
    const note = noteName(rootIndex + interval, preferFlats);
    const quality = config.qualities[index];
    return { 
      degree: index + 1, 
      roman: config.roman[index], 
      name: config.names[index], 
      chord: `${note}${quality}` 
    };
  });
}

function buildModeScale(tonic, modeConfig) {
  const root = cleanTonic(tonic);
  const rootIndex = NOTE_TO_INDEX[root] ?? 0;
  const preferFlats = FLAT_TONICS.has(tonic) || root.includes('b');
  
  return modeConfig.intervals.map((interval, index) => {
    const note = noteName(rootIndex + interval, preferFlats);
    const quality = modeConfig.qualities[index];
    return { 
      degree: index + 1, 
      roman: modeConfig.roman[index], 
      name: SCALE_DEGREES.major.names[index], 
      chord: `${note}${quality}`, 
      note, 
      isCharacteristic: modeConfig.characteristicDegrees.includes(index + 1) 
    };
  });
}

// ============ COMPONENTE PRINCIPAL ============
export function HarmonyPage() {
  // Estados principales
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState('major');
  const [progressionIndex, setProgressionIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [audioState, setAudioState] = useState('idle');
  const [audioError, setAudioError] = useState('');
  const [selectedGreekMode, setSelectedGreekMode] = useState('ionian');
  
  // Estados de canción
  const [songTitle, setSongTitle] = useState('Mi cancion');
  const [songBpm, setSongBpm] = useState(() => readLocalList('harmonySongBpm', 90));
  const [songInstrument, setSongInstrument] = useState(() => readLocalList('harmonySongInstrument', 'piano'));
  const [songDrumVolume, setSongDrumVolume] = useState(() => readLocalList('harmonySongDrumVolume', 0.85));
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const [selectedTimeSignature, setSelectedTimeSignature] = useState('4/4');
  const [chordInversion, setChordInversion] = useState('root');
  const [selectedNoteDuration, setSelectedNoteDuration] = useState('8n');
  const [selectedNoteVelocity, setSelectedNoteVelocity] = useState(0.7);
  
  // Estados de efectos
  const [effectsEnabled, setEffectsEnabled] = useState(false);
  const [reverbAmount, setReverbAmount] = useState(0.3);
  const [delayAmount, setDelayAmount] = useState(0.2);
  const [chorusAmount, setChorusAmount] = useState(0);
  const [melodyVolume, setMelodyVolume] = useState(0.8);
  const [chordVolume, setChordVolume] = useState(0.75);
  const [bassVolume, setBassVolume] = useState(0.6);
  
  // Estados de datos guardados
  const [savedProgressions, setSavedProgressions] = useState(() => readLocalList('savedHarmonyProgressions', []));
  const [savedSongs, setSavedSongs] = useState(() => readLocalList('savedHarmonySongs', []));
  const [songSections, setSongSections] = useState(() => readLocalList('harmonySongSections', [
    { id: crypto.randomUUID(), name: 'Intro', chords: [], bars: 4, drumPattern: 'none', drumIntensity: 0.55, melody: [], timeSignature: '4/4' },
    { id: crypto.randomUUID(), name: 'Verso', chords: [], bars: 8, drumPattern: 'basic', drumIntensity: 0.65, melody: [], timeSignature: '4/4' },
    { id: crypto.randomUUID(), name: 'Estribillo', chords: [], bars: 8, drumPattern: 'pop', drumIntensity: 0.9, melody: [], timeSignature: '4/4' },
  ]));
  const [activeSongSectionId, setActiveSongSectionId] = useState(() => songSections[0]?.id || '');
  
  // Estados de UI
  const [showHistory, setShowHistory] = useState(false);
  const [showMixer, setShowMixer] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    harmony: true,
    composer: true,
    melody: true,
    mixer: false,
    effects: false,
  });
  
  // Estados de piano roll
  const [hoveredNote, setHoveredNote] = useState(null);
  
  // Estados de undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Estados de auto-save
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Estado de melodía
  const [melodyChord, setMelodyChord] = useState('');
  
  // Refs
  const samplerRef = useRef(null);
  const guitarRef = useRef(null);
  const bassRef = useRef(null);
  const toneRef = useRef(null);
  const loadingRef = useRef(null);
  const drumsRef = useRef(null);
  const songEndTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const reverbRef = useRef(null);
  const delayRef = useRef(null);
  const chorusRef = useRef(null);
  const pianoRollRef = useRef(null);
  
  // Valores derivados
  const selected = CIRCLE_KEYS[selectedIndex];
  const tonic = mode === 'major' ? selected.major : selected.minor;
  const scale = useMemo(() => buildScale(tonic, mode), [tonic, mode]);
  const activeGreekMode = GREEK_MODES.find((item) => item.id === selectedGreekMode) || GREEK_MODES[0];
  const modalScale = useMemo(() => buildModeScale(tonic, activeGreekMode), [tonic, activeGreekMode]);
  const allProgressions = SCALE_DEGREES[mode].progressions;
  
  const availableCategories = useMemo(() => {
    const categories = new Set(allProgressions.map((p) => p.category));
    return PROGRESSION_CATEGORIES.filter((c) => c === 'Todas' || categories.has(c));
  }, [allProgressions]);
  
  const filteredProgressions = useMemo(() => {
    if (selectedCategory === 'Todas') return allProgressions;
    const filtered = allProgressions.filter((p) => p.category === selectedCategory);
    return filtered.length > 0 ? filtered : allProgressions;
  }, [allProgressions, selectedCategory]);
  
  const activeProgression = filteredProgressions[progressionIndex % filteredProgressions.length];
  const activeChords = progressionChords(scale, activeProgression);
  const normalizedSongSections = songSections.map(normalizeSongSection);
  const activeSongSection = normalizedSongSections.find((s) => s.id === activeSongSectionId) || normalizedSongSections[0];
  const activeMelodyNotes = activeSongSection?.melody || [];
  const songTotalBars = normalizedSongSections.reduce((total, s) => total + s.bars, 0);
  const songTotalChords = normalizedSongSections.reduce((total, s) => total + s.chords.length, 0);
  const songDrumParts = normalizedSongSections.filter((s) => s.drumPattern !== 'none').length;
  const timeSig = TIME_SIGNATURES.find(t => t.id === selectedTimeSignature) || TIME_SIGNATURES[0];
  const songDurationSeconds = Math.round((songTotalBars * timeSig.beats * 60) / songBpm);
  const progressionBpm = 90;
  
  const arrangementChords = useMemo(() => {
    const seen = new Set();
    return normalizedSongSections.flatMap((s) => s.chords).filter((chord) => {
      if (seen.has(chord)) return false;
      seen.add(chord);
      return true;
    });
  }, [normalizedSongSections]);
  
  const melodyChordChoices = arrangementChords.length > 0 ? arrangementChords : activeChords.map((item) => item.chord);
  const selectedMelodyChord = melodyChordChoices.includes(melodyChord) ? melodyChord : melodyChordChoices[0] || tonic;
  const selectedMelodyNotes = chordNotes(selectedMelodyChord, chordInversion);

  // Funciones de toggle para secciones
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Historial undo/redo
  const pushHistory = useCallback((newSections) => {
    if (historyIndex < history.length - 1) {
      setHistory(prev => [...prev.slice(0, historyIndex + 1), newSections]);
    } else {
      setHistory(prev => [...prev.slice(-49), newSections]);
    }
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSongSections(history[newIndex]);
      writeLocalList('harmonySongSections', history[newIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSongSections(history[newIndex]);
      writeLocalList('harmonySongSections', history[newIndex]);
    }
  }, [history, historyIndex]);

  // Auto-save timer
  useEffect(() => {
    if (autoSaveEnabled) {
      autoSaveTimerRef.current = setInterval(() => {
        const song = {
          id: 'autosave',
          title: songTitle.trim() || 'Auto-save',
          tonic,
          mode: activeGreekMode.name,
          bpm: songBpm,
          sections: songSections.map(normalizeSongSection),
          savedAt: new Date().toISOString(),
        };
        setSavedSongs(prev => {
          const next = [song, ...prev.filter(s => s.id !== 'autosave')].slice(0, 21);
          writeLocalList('savedHarmonySongs', next);
          return next;
        });
        setLastSaved(new Date());
      }, 30000);
    }
    return () => clearInterval(autoSaveTimerRef.current);
  }, [autoSaveEnabled, songTitle, tonic, activeGreekMode.name, songBpm, songSections]);

  // Teclado shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo(); }
        if (e.key === 'y') { e.preventDefault(); redo(); }
        if (e.key === 's') { e.preventDefault(); saveCurrentSong(); }
      }
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        playSongSketch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Funciones de modificación
  function changeMode(nextMode) { setMode(nextMode); setSelectedCategory('Todas'); setProgressionIndex(0); }
  function changeCategory(category) { setSelectedCategory(category); setProgressionIndex(0); }
  function changeSongInstrument(value) { setSongInstrument(value); writeLocalList('harmonySongInstrument', value); }
  
  function generateProgression() {
    const next = Math.floor(Math.random() * filteredProgressions.length);
    setProgressionIndex(next === progressionIndex ? (next + 1) % filteredProgressions.length : next);
  }

  function updateSectionField(sectionId, field, value) {
    setSongSections((current) => {
      const next = current.map((section) => {
        if (section.id !== sectionId) return normalizeSongSection(section);
        const normalized = normalizeSongSection(section);
        if (field === 'bars') return { ...normalized, bars: Math.min(16, Math.max(1, Number(value) || 4)) };
        if (field === 'drumIntensity') return { ...normalized, drumIntensity: Math.min(1, Math.max(0.25, Number(value) || 0.75)) };
        if (field === 'timeSignature') return { ...normalized, timeSignature: value };
        return normalized;
      });
      writeLocalList('harmonySongSections', next);
      pushHistory(next);
      return next;
    });
  }

  function updateSectionDrum(sectionId, drumPattern) {
    setSongSections((current) => {
      const next = current.map((s) => (s.id === sectionId ? { ...normalizeSongSection(s), drumPattern } : normalizeSongSection(s)));
      writeLocalList('harmonySongSections', next);
      pushHistory(next);
      return next;
    });
  }

  function addChordToSong(chord) {
    if (!activeSongSection) return;
    setSongSections((current) => {
      const next = current.map((s) => (
        s.id === activeSongSection.id ? { ...normalizeSongSection(s), chords: [...normalizeSongSection(s).chords, chord] } : normalizeSongSection(s)
      ));
      writeLocalList('harmonySongSections', next);
      pushHistory(next);
      return next;
    });
  }

  function addProgressionToSong(progression = activeChords.map((item) => item.chord)) {
    if (!activeSongSection) return;
    setSongSections((current) => {
      const next = current.map((s) => (
        s.id === activeSongSection.id ? { ...normalizeSongSection(s), chords: [...normalizeSongSection(s).chords, ...progression] } : normalizeSongSection(s)
      ));
      writeLocalList('harmonySongSections', next);
      pushHistory(next);
      return next;
    });
  }

  function clearSection(sectionId) {
    setSongSections((current) => {
      const next = current.map((s) => (s.id === sectionId ? { ...normalizeSongSection(s), chords: [], melody: [] } : normalizeSongSection(s)));
      writeLocalList('harmonySongSections', next);
      pushHistory(next);
      return next;
    });
  }

  function deleteSection(sectionId) {
    setSongSections((current) => {
      const next = current.filter((s) => s.id !== sectionId);
      const fallback = next.length > 0 ? next : [{ id: crypto.randomUUID(), name: 'Intro', chords: [], bars: 4, drumPattern: 'none', drumIntensity: 0.55, melody: [], timeSignature: '4/4' }];
      writeLocalList('harmonySongSections', fallback);
      pushHistory(fallback);
      if (!fallback.some((s) => s.id === activeSongSectionId)) {
        setActiveSongSectionId(fallback[0]?.id || '');
      }
      return fallback;
    });
  }

  function addMelodyNote(note) {
    if (!activeSongSection) return;
    const newNote = { id: crypto.randomUUID(), chord: selectedMelodyChord, note, duration: selectedNoteDuration, velocity: selectedNoteVelocity };
    setSongSections((current) => {
      const next = current.map((s) => {
        if (s.id !== activeSongSection.id) return normalizeSongSection(s);
        return { ...normalizeSongSection(s), melody: [...(Array.isArray(s.melody) ? s.melody : []), newNote] };
      });
      writeLocalList('harmonySongSections', next);
      pushHistory(next);
      return next;
    });
    playNote(note, selectedNoteDuration);
  }

  function clearMelody() {
    if (!activeSongSection) return;
    setSongSections((current) => {
      const next = current.map((s) => s.id === activeSongSection.id ? { ...normalizeSongSection(s), melody: [] } : normalizeSongSection(s));
      writeLocalList('harmonySongSections', next);
      pushHistory(next);
      return next;
    });
  }

  function addSection(type = 'Verso') {
    const section = {
      id: crypto.randomUUID(),
      name: type,
      chords: [], melody: [],
      bars: ['Intro', 'Outro'].includes(type) ? 4 : 8,
      drumPattern: type === 'Estribillo' ? 'pop' : type === 'Puente' ? 'build' : 'basic',
      drumIntensity: type === 'Estribillo' ? 0.9 : 0.7,
      timeSignature: '4/4',
    };
    setSongSections((current) => {
      const next = [...current, section];
      writeLocalList('harmonySongSections', next);
      pushHistory(next);
      return next;
    });
    setActiveSongSectionId(section.id);
  }

  function saveCurrentProgression() {
    const saved = { id: crypto.randomUUID(), name: activeProgression.name, tonic, mode: activeGreekMode.name, bpm: progressionBpm, chords: activeChords.map((item) => item.chord), roman: activeChords.map((item) => item.roman), createdAt: new Date().toISOString() };
    setSavedProgressions((current) => { const next = [saved, ...current].slice(0, 24); writeLocalList('savedHarmonyProgressions', next); return next; });
  }

  function deleteProgression(id) {
    setSavedProgressions((current) => { const next = current.filter((p) => p.id !== id); writeLocalList('savedHarmonyProgressions', next); return next; });
  }

  function saveCurrentSong() {
    const song = { id: crypto.randomUUID(), title: songTitle.trim() || 'Cancion sin titulo', tonic, mode: activeGreekMode.name, bpm: songBpm, sections: songSections.map(normalizeSongSection), createdAt: new Date().toISOString() };
    setSavedSongs((current) => { const next = [song, ...current.filter((item) => item.title !== song.title)].slice(0, 20); writeLocalList('savedHarmonySongs', next); return next; });
  }

  function loadSong(song) {
    const normalizedSections = (song.sections || []).map(normalizeSongSection);
    setSongTitle(song.title);
    setSongBpm(clampBpm(song.bpm || songBpm));
    setSongSections(normalizedSections);
    setActiveSongSectionId(normalizedSections[0]?.id || '');
    writeLocalList('harmonySongSections', normalizedSections);
    writeLocalList('harmonySongBpm', clampBpm(song.bpm || songBpm));
  }

  function deleteSong(id) { setSavedSongs((current) => { const next = current.filter((song) => song.id !== id); writeLocalList('savedHarmonySongs', next); return next; }); }

  function exportCurrentSong() {
    const song = { title: songTitle.trim() || 'Cancion sin titulo', tonic, mode: activeGreekMode.name, bpm: songBpm, sections: songSections.map(normalizeSongSection), exportedAt: new Date().toISOString(), version: '1.0' };
    const blob = new Blob([JSON.stringify(song, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${song.title.replace(/\s+/g, '_')}.harmony.json`; a.click(); URL.revokeObjectURL(url);
  }

  function exportAllSongs() {
    const data = { songs: savedSongs, exportedAt: new Date().toISOString(), version: '1.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'todas_mis_canciones.harmony.json'; a.click(); URL.revokeObjectURL(url);
  }

  function handleImportSong(event) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.songs && Array.isArray(data.songs)) {
          data.songs.forEach((song) => { if (song.title && song.sections) { setSavedSongs((current) => { const exists = current.some((s) => s.title === song.title); const next = exists ? current.map((s) => s.title === song.title ? { ...song, id: s.id || crypto.randomUUID() } : s) : [{ ...song, id: song.id || crypto.randomUUID() }, ...current]; writeLocalList('savedHarmonySongs', next.slice(0, 20)); return next.slice(0, 20); }); } });
          alert(`${data.songs.length} canciones importadas.`);
        } else if (data.title && data.sections) { loadSong(data); alert(`Canción "${data.title}" cargada.`); }
        else { alert('Formato inválido.'); }
      } catch (err) { alert('Error: ' + err.message); }
    };
    reader.readAsText(file); event.target.value = '';
  }

  // Funciones de audio
  async function ensurePiano() {
    if (samplerRef.current && toneRef.current) return { sampler: samplerRef.current, Tone: toneRef.current };
    if (loadingRef.current) return loadingRef.current;
    setAudioError(''); setAudioState('loading');
    loadingRef.current = import('tone').then(async (Tone) => {
      await Tone.start();
      const sampler = new Tone.Sampler({
        urls: { A0: 'A0.mp3', C1: 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3', A1: 'A1.mp3', C2: 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3', A2: 'A2.mp3', C3: 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3', A3: 'A3.mp3', C4: 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3', A4: 'A4.mp3', C5: 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3', A5: 'A5.mp3', C6: 'C6.mp3', 'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3', A6: 'A6.mp3', C7: 'C7.mp3', 'D#7': 'Ds7.mp3', 'F#7': 'Fs7.mp3', A7: 'A7.mp3', C8: 'C8.mp3' },
        release: 1, baseUrl: 'https://tonejs.github.io/audio/salamander/',
        onload: () => setAudioState('ready'),
        onerror: (error) => { setAudioState('error'); setAudioError('No se pudieron cargar los samples'); console.error(error); },
      }).toDestination();
      samplerRef.current = sampler; toneRef.current = Tone;
      await Tone.loaded(); setAudioState('ready');
      return { sampler, Tone };
    }).catch((err) => { setAudioState('error'); setAudioError(err.message || 'No se pudo iniciar'); throw err; }).finally(() => { loadingRef.current = null; });
    return loadingRef.current;
  }

  async function ensureGuitar() {
    const { Tone } = await ensurePiano();
    if (guitarRef.current) return { guitar: guitarRef.current, Tone };
    const guitar = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'fmsawtooth' }, envelope: { attack: 0.006, decay: 0.18, sustain: 0.18, release: 0.35 }, volume: -12 }).toDestination();
    guitarRef.current = guitar; return { guitar, Tone };
  }

  async function ensureBass() {
    const { Tone } = await ensurePiano();
    if (bassRef.current) return { bass: bassRef.current, Tone };
    const bass = new Tone.MonoSynth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.4 }, volume: -10 }).toDestination();
    bassRef.current = bass; return { bass, Tone };
  }

  function setupEffects(Tone) {
    if (!effectsEnabled) return;
    if (reverbRef.current) return { reverb: reverbRef.current, delay: delayRef.current, chorus: chorusRef.current };
    const reverb = new Tone.Reverb({ roomSize: reverbAmount, dampening: 0.5, wet: reverbAmount }).toDestination();
    const delay = new Tone.FeedbackDelay({ delayTime: 0.25, feedback: delayAmount, wet: delayAmount }).connect(reverb);
    const chorus = new Tone.Chorus({ frequency: 1.5, depth: chorusAmount, wet: chorusAmount }).connect(delay);
    reverbRef.current = reverb; delayRef.current = delay; chorusRef.current = chorus;
    return { reverb, delay, chorus };
  }

  async function playChord(chord) {
    const { sampler, Tone } = await ensurePiano();
    const now = Tone.now();
    const notes = chordNotes(chord, chordInversion);
    if (songInstrument === 'guitar') { const { guitar } = await ensureGuitar(); guitar.triggerAttackRelease(notes, '1.1', now, 0.66); return; }
    sampler.triggerAttackRelease(notes, '1.3', now, 0.75);
  }

  async function playNote(note, duration = '8n') {
    const { sampler, Tone } = await ensurePiano();
    const now = Tone.now();
    if (songInstrument === 'guitar') { const { guitar } = await ensureGuitar(); guitar.triggerAttackRelease(note, duration, now, 0.7); return; }
    sampler.triggerAttackRelease(note, duration, now, 0.72);
  }

  function triggerHarmonyChord({ sampler, guitar }, Tone, chord, duration, time, velocity = 0.7) {
    const notes = chordNotes(chord, chordInversion);
    if (songInstrument === 'guitar' && guitar) { guitar.triggerAttackRelease(notes, duration, time, velocity * 0.86); return; }
    sampler.triggerAttackRelease(notes, duration, time, velocity);
  }

  async function playProgression() {
    const { sampler, Tone } = await ensurePiano();
    const now = Tone.now();
    const beatSeconds = 60 / progressionBpm;
    activeChords.forEach((item, index) => {
      const offset = index * beatSeconds * 2;
      sampler.triggerAttackRelease(chordNotes(item.chord), beatSeconds * 1.7, now + offset, 0.72);
    });
  }

  function ensureDrums(Tone) {
    if (drumsRef.current) return drumsRef.current;
    const drumBus = new Tone.Gain(songDrumVolume * 1.35).toDestination();
    const drumComp = new Tone.Compressor({ threshold: -22, ratio: 3.5, attack: 0.003, release: 0.16 }).connect(drumBus);
    const hatFilter = new Tone.Filter(7800, 'highpass').connect(drumComp);
    const snareFilter = new Tone.Filter(1800, 'bandpass').connect(drumComp);
    const kick = new Tone.MembraneSynth({ pitchDecay: 0.035, octaves: 8, oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.28, sustain: 0.015, release: 0.18 } }).connect(drumComp);
    const kickClick = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.018, sustain: 0, release: 0.01 } }).connect(drumComp);
    const snareBody = new Tone.MembraneSynth({ pitchDecay: 0.025, octaves: 2, oscillator: { type: 'triangle' }, envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.08 } }).connect(drumComp);
    const snareNoise = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.17, sustain: 0, release: 0.09 } }).connect(snareFilter);
    const hat = new Tone.MetalSynth({ frequency: 260, envelope: { attack: 0.001, decay: 0.045, release: 0.01 }, harmonicity: 5.1, modulationIndex: 18, resonance: 5200, octaves: 1.5 }).connect(hatFilter);
    const openHat = new Tone.MetalSynth({ frequency: 230, envelope: { attack: 0.001, decay: 0.26, release: 0.08 }, harmonicity: 5.6, modulationIndex: 22, resonance: 6200, octaves: 1.8 }).connect(hatFilter);
    const clap = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.001, decay: 0.11, sustain: 0, release: 0.08 } }).connect(snareFilter);
    kick.volume.value = -4; kickClick.volume.value = -20; snareBody.volume.value = -12; snareNoise.volume.value = -7; hat.volume.value = -18; openHat.volume.value = -16; clap.volume.value = -9;
    drumsRef.current = { bus: drumBus, kick, kickClick, snareBody, snareNoise, hat, openHat, clap };
    return drumsRef.current;
  }

  function triggerDrum(drums, sound, time, velocity = 0.7, intensity = 0.75) {
    const amount = Math.min(1, Math.max(0.08, velocity * intensity));
    if (sound === 'kick') { drums.kick.triggerAttackRelease('C1', '8n', time, amount); drums.kickClick.triggerAttackRelease('64n', time, amount * 0.22); }
    if (sound === 'snare') { drums.snareBody.triggerAttackRelease('D2', '16n', time, amount * 0.42); drums.snareNoise.triggerAttackRelease('16n', time, amount * 0.86); }
    if (sound === 'ghostSnare') drums.snareNoise.triggerAttackRelease('32n', time, amount * 0.38);
    if (sound === 'hat') drums.hat.triggerAttackRelease('32n', time, amount * 0.54);
    if (sound === 'openHat') drums.openHat.triggerAttackRelease('8n', time, amount * 0.44);
    if (sound === 'clap') drums.clap.triggerAttackRelease('16n', time, amount * 0.72);
    if (sound === 'rim') drums.snareBody.triggerAttackRelease('G3', '32n', time, amount * 0.34);
  }

  function stopSongSketch() {
    if (songEndTimerRef.current) { clearTimeout(songEndTimerRef.current); songEndTimerRef.current = null; }
    const Tone = toneRef.current;
    if (Tone?.Transport) { Tone.Transport.stop(); Tone.Transport.cancel(0); }
    samplerRef.current?.releaseAll?.(); guitarRef.current?.releaseAll?.(); bassRef.current?.triggerRelease?.();
    setIsSongPlaying(false);
  }

  async function playSongSketch() {
    if (isSongPlaying) { stopSongSketch(); return; }
    const { sampler, Tone } = await ensurePiano();
    const guitar = songInstrument === 'guitar' ? (await ensureGuitar()).guitar : null;
    const drums = ensureDrums(Tone);
    const effects = setupEffects(Tone);
    const beatSeconds = 60 / songBpm;
    let cursor = 0;
    stopSongSketch();
    drums.bus.gain.value = songDrumVolume * 1.35;
    Tone.Transport.bpm.value = songBpm;

    normalizedSongSections.forEach((section) => {
      const ts = TIME_SIGNATURES.find(t => t.id === section.timeSignature) || timeSig;
      const sectionBeats = Math.max(section.bars * ts.beats, section.chords.length * 2, 4);
      const pattern = DRUM_PATTERNS.find((item) => item.id === section.drumPattern) || DRUM_PATTERNS[0];

      section.chords.forEach((chord, index) => {
        const chordSpacing = sectionBeats / Math.max(section.chords.length, 1);
        Tone.Transport.schedule((time) => {
          triggerHarmonyChord({ sampler, guitar }, Tone, chord, beatSeconds * Math.max(1.4, chordSpacing * 0.82), time, 0.7);
          const bassNote = chordNotes(chord)[0].replace(/\d/, (n) => parseInt(n) - 1);
          bassRef.current?.triggerAttackRelease(bassNote, beatSeconds * Math.max(1.4, chordSpacing * 0.82), time, 0.55);
        }, cursor + index * chordSpacing * beatSeconds);
      });

      section.melody?.forEach((item, noteIndex) => {
        const spacing = sectionBeats / Math.max(section.melody.length, 1);
        const duration = item.duration || spacing < 0.5 ? '16n' : '8n';
        Tone.Transport.schedule((time) => {
          const vel = item.velocity || 0.62;
          if (songInstrument === 'guitar' && guitar) { guitar.triggerAttackRelease(item.note, duration, time, vel); }
          else { sampler.triggerAttackRelease(item.note, duration, time, vel); }
        }, cursor + noteIndex * spacing * beatSeconds);
      });

      if (pattern.steps.length > 0) {
        for (let beat = 0; beat < sectionBeats; beat += ts.beats) {
          pattern.steps.forEach((step) => {
            Tone.Transport.schedule((time) => { triggerDrum(drums, step.sound, time, step.velocity, section.drumIntensity); }, cursor + (beat + step.beat) * beatSeconds);
          });
        }
      }

      cursor += sectionBeats * beatSeconds;
    });

    setIsSongPlaying(true);
    Tone.Transport.start('+0.03');
    songEndTimerRef.current = setTimeout(() => { stopSongSketch(); }, Math.max(500, cursor * 1000 + 450));
  }

  // ============ RENDER ============
  return (
    <section className="page harmony-page">
      {/* HEADER PRINCIPAL */}
      <div className="harmony-hero">
        <div>
          <span>Estudio de Armonía Profesional</span>
          <h2>Círculo de Quintas & Compositor</h2>
          <p>Explorá tonalidades, creá progresiones, componé melodías y armá canciones completas.</p>
        </div>
        <div className="mode-switch" aria-label="Modo">
          <button className={mode === 'major' ? 'active' : ''} onClick={() => changeMode('major')} type="button">Mayor</button>
          <button className={mode === 'minor' ? 'active' : ''} onClick={() => changeMode('minor')} type="button">Menor</button>
        </div>
      </div>

      {/* TOOLBAR DE CONTROL GLOBAL */}
      <div className="harmony-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-group">
            <button className="icon-button" onClick={undo} title="Deshacer (Ctrl+Z)" disabled={historyIndex <= 0}>
              <Undo size={16} />
            </button>
            <button className="icon-button" onClick={redo} title="Rehacer (Ctrl+Y)" disabled={historyIndex >= history.length - 1}>
              <Redo size={16} />
            </button>
            <button className="icon-button" onClick={() => setShowHistory(!showHistory)} title="Historial">
              <History size={16} />
            </button>
          </div>
          
          <div className="toolbar-divider" />
          
          <div className="toolbar-group">
            <span className="toolbar-label">Canción:</span>
            <input 
              className="toolbar-input" 
              value={songTitle} 
              onChange={(e) => setSongTitle(e.target.value)} 
              placeholder="Mi canción" 
            />
          </div>
          
          <div className="toolbar-divider" />
          
          <div className="toolbar-group">
            <span className="toolbar-label">BPM:</span>
            <input 
              className="toolbar-input small" 
              type="number" 
              min="40" 
              max="220" 
              value={songBpm} 
              onChange={(e) => { 
                const next = clampBpm(e.target.value); 
                setSongBpm(next); 
                writeLocalList('harmonySongBpm', next); 
              }} 
            />
          </div>
          
          <div className="toolbar-group">
            <span className="toolbar-label">Compás:</span>
            <select 
              className="toolbar-select"
              value={selectedTimeSignature} 
              onChange={(e) => setSelectedTimeSignature(e.target.value)}
            >
              {TIME_SIGNATURES.map(ts => (
                <option key={ts.id} value={ts.id}>{ts.id}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="toolbar-center">
          <button 
            className="play-button" 
            onClick={playSongSketch} 
            title="Reproducir/Pausar (Espacio)"
          >
            {isSongPlaying ? <Square size={20} /> : <Play size={20} />}
            <span>{isSongPlaying ? 'Detener' : 'Reproducir Canción'}</span>
          </button>
        </div>
        
        <div className="toolbar-right">
          <button className="button secondary" onClick={exportCurrentSong} type="button">
            <Download size={16} /> Exportar
          </button>
          <button className="button secondary" onClick={() => fileInputRef.current?.click()} type="button">
            <Upload size={16} /> Importar
          </button>
          <button className="button primary" onClick={saveCurrentSong} type="button">
            <Save size={16} /> Guardar
          </button>
          <input ref={fileInputRef} type="file" accept=".json,.harmony.json" onChange={handleImportSong} style={{ display: 'none' }} />
        </div>
      </div>

      {/* PANEL DE HISTORIAL */}
      {showHistory && (
        <div className="history-panel">
          <div className="panel-header">
            <h3><History size={16} /> Historial de cambios</h3>
            <button onClick={() => setShowHistory(false)}>×</button>
          </div>
          <div className="history-list">
            {history.length === 0 && <p className="empty-text">No hay cambios todavía.</p>}
            {history.map((_, idx) => (
              <button
                key={idx}
                className={idx === historyIndex ? 'active' : ''}
                onClick={() => { 
                  setHistoryIndex(idx); 
                  setSongSections(history[idx]); 
                  writeLocalList('harmonySongSections', history[idx]); 
                }}
                type="button"
              >
                Versión {idx + 1} {idx === historyIndex ? '(actual)' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN 1: HERRAMIENTAS DE ARMONÍA */}
      <div className="harmony-section">
        <button 
          className="section-collapse-header"
          onClick={() => toggleSection('harmony')}
          type="button"
        >
          <div className="section-header-content">
            <Music2 size={20} />
            <div>
              <h2>Herramientas de Armonía</h2>
              <p>Círculo de quintas, progresiones y acordes diatónicos</p>
            </div>
          </div>
          {expandedSections.harmony ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {expandedSections.harmony && (
          <div className="harmony-workbench">
            {/* CÍRCULO DE QUINTAS */}
            <div className="circle-panel">
              <div className="fifths-circle" aria-label="Círculo de quintas">
                <div className="circle-core">
                  <Music2 size={26} />
                  <strong>{tonic}</strong>
                  <span>{selected.accidental}</span>
                </div>
                {CIRCLE_KEYS.map((key, index) => (
                  <button
                    className={index === selectedIndex ? 'circle-key active' : 'circle-key'}
                    key={key.major}
                    onClick={() => setSelectedIndex(index)}
                    style={{ '--angle': `${index * 30 - 90}deg` }}
                    type="button"
                  >
                    <strong>{key.major}</strong>
                    <span>{key.minor}</span>
                  </button>
                ))}
              </div>
              <div className="key-summary">
                <span>Tonalidad</span>
                <h3>{tonic} {SCALE_DEGREES[mode].label}</h3>
                <p>Relativa: {mode === 'major' ? selected.minor : selected.major}</p>
              </div>
            </div>

            {/* PANEL DE PROGRESIONES Y ACORDES */}
            <div className="harmony-panel">
              {/* PROGRESIONES */}
              <div className="progression-card">
                <div className="module-heading">
                  <div>
                    <span>Progresiones</span>
                    <h3>{activeProgression.name}</h3>
                    <p>{activeProgression.category} · {activeChords.map((item) => item.roman).join(' - ')}</p>
                  </div>
                  <div className="harmony-actions">
                    <button className="icon-button" onClick={generateProgression} title="Generar"><Shuffle size={18} /></button>
                    <button className="icon-button sound-button" onClick={playProgression} title="Escuchar" disabled={audioState === 'loading'}>
                      {audioState === 'loading' ? <LoaderCircle size={18} /> : <Play size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="progression-categories">
                  {availableCategories.map((category) => (
                    <button 
                      key={category} 
                      className={selectedCategory === category ? 'active' : ''} 
                      onClick={() => changeCategory(category)} 
                      type="button"
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                <div className="progression-strip">
                  {activeChords.map((item, index) => (
                    <button 
                      key={`${item.chord}-${index}`} 
                      onClick={() => { playChord(item.chord); addChordToSong(item.chord); }} 
                      type="button" 
                      disabled={audioState === 'loading'}
                    >
                      <span>{item.roman}</span>
                      <strong>{item.chord}</strong>
                      <small>{chordNotes(item.chord, chordInversion).join(' · ')}</small>
                    </button>
                  ))}
                </div>
                
                <div className="progression-tools">
                  <button className="button secondary" onClick={saveCurrentProgression} type="button">
                    <Save size={16} /> Guardar Progresión
                  </button>
                  <button className="button primary" onClick={() => addProgressionToSong()} type="button">
                    <Plus size={16} /> Usar en Canción
                  </button>
                </div>
              </div>

              {/* ACORDES DIATÓNICOS + INVERSIONES */}
              <div className="chords-section">
                <div className="chords-header">
                  <h3><Grid3X3 size={16} /> Acordes Diatónicos</h3>
                  <div className="inversion-selector">
                    <span>Inversión:</span>
                    <div className="inversion-controls">
                      {CHORD_INVERSIONS.map((inv) => (
                        <button
                          key={inv.id}
                          className={chordInversion === inv.id ? 'active' : ''}
                          onClick={() => setChordInversion(inv.id)}
                          type="button"
                        >
                          {inv.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="chord-grid">
                  {scale.map((item) => {
                    const invNotes = getInversionNotes(item.chord, chordInversion);
                    return (
                      <button
                        className="chord-tile"
                        key={item.roman}
                        onClick={() => { playChord(item.chord); addChordToSong(item.chord); }}
                        type="button"
                        disabled={audioState === 'loading'}
                      >
                        <span>{item.roman}</span>
                        <strong>{item.chord}</strong>
                        <div className="chord-notes-preview">
                          {invNotes.map((note, i) => (
                            <small key={i}>{note}</small>
                          ))}
                        </div>
                        <small>{item.name}</small>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: COMPOSITOR DE CANCIÓN */}
      <div className="harmony-section">
        <button 
          className="section-collapse-header"
          onClick={() => toggleSection('composer')}
          type="button"
        >
          <div className="section-header-content">
            <Music2 size={20} />
            <div>
              <h2>Compositor de Canción</h2>
              <p>Estructura, secciones, acordes y ritmo</p>
            </div>
          </div>
          <div className="section-header-stats">
            <span>{normalizedSongSections.length} partes</span>
            <span>{songTotalBars} comp.</span>
            <span>{Math.floor(songDurationSeconds / 60)}:{String(songDurationSeconds % 60).padStart(2, '0')}</span>
          </div>
          {expandedSections.composer ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {expandedSections.composer && (
          <div className="composer-workspace">
            {/* BARRA DE HERRAMIENTAS DEL COMPOSITOR */}
            <div className="composer-toolbar">
              <div className="instrument-switch">
                <button className={songInstrument === 'piano' ? 'active' : ''} onClick={() => changeSongInstrument('piano')}>
                  <Keyboard size={16} /> Piano
                </button>
                <button className={songInstrument === 'guitar' ? 'active' : ''} onClick={() => changeSongInstrument('guitar')}>
                  <Guitar size={16} /> Guitarra
                </button>
              </div>
              
              <div className="section-add-buttons">
                {SONG_SECTION_TYPES.map((type) => (
                  <button key={type} onClick={() => addSection(type)} type="button">
                    <Plus size={14} /> {type}
                  </button>
                ))}
              </div>
            </div>

            {/* LISTA DE SECCIONES */}
            <div className="sections-container">
              {normalizedSongSections.map((section) => (
                <article 
                  className={activeSongSection?.id === section.id ? 'song-section active' : 'song-section'} 
                  key={section.id}
                >
                  <button 
                    className="song-section-head" 
                    onClick={() => setActiveSongSectionId(section.id)} 
                    type="button"
                  >
                    <span>
                      <strong>{section.name}</strong>
                      <small>{section.bars} compases · {section.timeSignature || '4/4'}</small>
                    </span>
                    <div className="section-badges">
                      <em>{section.chords.length} acordes</em>
                      {section.melody.length > 0 && <em className="melody-badge">🎵 {section.melody.length} notas</em>}
                    </div>
                  </button>
                  
                  {/* Acordes de la sección */}
                  <div className="song-chords">
                    {section.chords.length === 0 && <small className="placeholder-text">Click en acordes para agregarlos</small>}
                    {section.chords.map((chord, index) => (
                      <button 
                        key={`${section.id}-${chord}-${index}`} 
                        onClick={() => playChord(chord)} 
                        type="button"
                        title={getInversionNotes(chord, chordInversion).join(' · ')}
                      >
                        {chord}
                      </button>
                    ))}
                  </div>
                  
                  {/* Controles de arreglo */}
                  <div className="section-arrange-controls">
                    <label>
                      <span>Batería</span>
                      <select value={section.drumPattern} onChange={(e) => updateSectionDrum(section.id, e.target.value)}>
                        {DRUM_PATTERNS.map((pattern) => (
                          <option key={pattern.id} value={pattern.id}>{pattern.name}</option>
                        ))}
                      </select>
                    </label>
                    
                    <label>
                      <span>Compases</span>
                      <input 
                        type="number" 
                        min="1" 
                        max="16" 
                        value={section.bars} 
                        onChange={(e) => updateSectionField(section.id, 'bars', e.target.value)} 
                      />
                    </label>
                    
                    <label>
                      <span>Compás</span>
                      <select 
                        value={section.timeSignature || '4/4'} 
                        onChange={(e) => updateSectionField(section.id, 'timeSignature', e.target.value)}
                      >
                        {TIME_SIGNATURES.map(ts => (
                          <option key={ts.id} value={ts.id}>{ts.id}</option>
                        ))}
                      </select>
                    </label>
                    
                    <label>
                      <span>Intensidad</span>
                      <input 
                        type="range" 
                        min="0.25" 
                        max="1" 
                        step="0.05" 
                        value={section.drumIntensity} 
                        onChange={(e) => updateSectionField(section.id, 'drumIntensity', e.target.value)} 
                      />
                    </label>
                  </div>
                  
                  {/* Acciones de sección */}
                  <div className="song-section-actions">
                    <button className="section-clear" onClick={() => clearSection(section.id)} type="button">
                      <Eraser size={14} /> Limpiar
                    </button>
                    <button className="section-clear danger" onClick={() => deleteSection(section.id)} type="button">
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 3: EDITOR DE MELODÍA CON PIANO ROLL */}
      <div className="harmony-section">
        <button 
          className="section-collapse-header"
          onClick={() => toggleSection('melody')}
          type="button"
        >
          <div className="section-header-content">
            <Pencil size={20} />
            <div>
              <h2>Editor de Melodía</h2>
              <p>Creá melodías sobre {activeSongSection?.name || 'la sección'} con piano roll visual</p>
            </div>
          </div>
          {expandedSections.melody ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {expandedSections.melody && (
          <div className="melody-workspace">
            {/* Controles de melodía */}
            <div className="melody-controls">
              <div className="melody-chord-selector">
                <label>
                  <span>Acorde base</span>
                  <select value={selectedMelodyChord} onChange={(e) => setMelodyChord(e.target.value)}>
                    {melodyChordChoices.map((chord) => (
                      <option key={chord} value={chord}>{chord}</option>
                    ))}
                  </select>
                </label>
                
                <div className="chord-notes-display">
                  <span>Notas disponibles:</span>
                  <div className="melody-note-bank">
                    {selectedMelodyNotes.map((note) => (
                      <button key={note} onClick={() => addMelodyNote(note)} type="button">
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="melody-params">
                <label>
                  <span>Duración</span>
                  <select value={selectedNoteDuration} onChange={(e) => setSelectedNoteDuration(e.target.value)}>
                    {NOTE_DURATIONS.map((dur) => (
                      <option key={dur.id} value={dur.id}>{dur.label}</option>
                    ))}
                  </select>
                </label>
                
                <label>
                  <span>Volumen: {Math.round(selectedNoteVelocity * 100)}%</span>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1" 
                    step="0.05" 
                    value={selectedNoteVelocity} 
                    onChange={(e) => setSelectedNoteVelocity(Number(e.target.value))} 
                  />
                </label>
                
                <button className="section-clear" onClick={clearMelody} type="button">
                  <Eraser size={14} /> Limpiar melodía
                </button>
              </div>
            </div>

            {/* PIANO ROLL VISUAL */}
            <div className="piano-roll-active">
              <div className="piano-roll-header">
                <h3>🎹 Piano Roll</h3>
                <span>{activeMelodyNotes.length} notas en {activeSongSection?.name || 'sección'}</span>
              </div>
              
              <div className="piano-roll-grid" ref={pianoRollRef}>
                {/* Teclado vertical */}
                <div className="piano-keys">
                  {ALL_OCTAVE_NOTES.map((note, idx) => {
                    const isBlack = note.includes('#');
                    return (
                      <div 
                        key={idx} 
                        className={`piano-key ${isBlack ? 'black' : 'white'} ${hoveredNote === note ? 'hovered' : ''}`}
                        onMouseEnter={() => setHoveredNote(note)}
                        onMouseLeave={() => setHoveredNote(null)}
                        onClick={() => {
                          const fullNote = `${note}4`;
                          if (selectedMelodyNotes.includes(fullNote)) {
                            addMelodyNote(fullNote);
                          }
                        }}
                      >
                        <span>{note}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Grid de notas */}
                <div className="piano-grid">
                  {activeMelodyNotes.length === 0 ? (
                    <div className="piano-grid-empty">
                      <p>🎵</p>
                      <small>Click en las notas del acorde para comenzar tu melodía</small>
                    </div>
                  ) : (
                    <div className="piano-grid-notes">
                      {activeMelodyNotes.map((item, index) => {
                        const noteName = item.note.replace(/\d+$/, '');
                        const noteIndex = ALL_OCTAVE_NOTES.indexOf(noteName);
                        const rowPosition = noteIndex >= 0 ? noteIndex : 0;
                        
                        return (
                          <div 
                            key={item.id}
                            className="piano-note-block"
                            style={{
                              gridRow: 12 - rowPosition,
                              gridColumn: index + 1,
                            }}
                            onClick={() => playNote(item.note, item.duration || '8n')}
                            title={`${item.note} · ${item.duration || '8n'} · ${Math.round((item.velocity || 0.7) * 100)}%`}
                          >
                            <div className="note-block-content">
                              <strong>{item.note}</strong>
                              <small>{index + 1}</small>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Timeline horizontal */}
              <div className="melody-timeline-horizontal">
                <div className="timeline-label">Secuencia:</div>
                <div className="timeline-notes">
                  {activeMelodyNotes.length === 0 && <small className="placeholder-text">Sin notas</small>}
                  {activeMelodyNotes.map((item, index) => (
                    <button 
                      key={item.id} 
                      onClick={() => playNote(item.note, item.duration || '8n')} 
                      type="button"
                      className="timeline-note"
                    >
                      <span>{index + 1}</span>
                      <strong>{item.note}</strong>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 4: MEZCLADOR */}
      <div className="harmony-section">
        <button 
          className="section-collapse-header"
          onClick={() => toggleSection('mixer')}
          type="button"
        >
          <div className="section-header-content">
            <Sliders size={20} />
            <div>
              <h2>Mezclador</h2>
              <p>Balance de volúmenes entre instrumentos</p>
            </div>
          </div>
          {expandedSections.mixer ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {expandedSections.mixer && (
          <div className="mixer-panel">
            <div className="mixer-channels">
              <div className="mixer-channel">
                <div className="channel-header">
                  <Music2 size={16} />
                  <span>Melodía</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={melodyVolume} 
                  onChange={(e) => setMelodyVolume(Number(e.target.value))} 
                  className="channel-slider"
                />
                <div className="channel-value">
                  <strong>{Math.round(melodyVolume * 100)}%</strong>
                  <button className="mute-button" onClick={() => setMelodyVolume(0)}>
                    <VolumeX size={14} />
                  </button>
                </div>
              </div>
              
              <div className="mixer-channel">
                <div className="channel-header">
                  <Grid3X3 size={16} />
                  <span>Acordes</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={chordVolume} 
                  onChange={(e) => setChordVolume(Number(e.target.value))} 
                  className="channel-slider"
                />
                <div className="channel-value">
                  <strong>{Math.round(chordVolume * 100)}%</strong>
                  <button className="mute-button" onClick={() => setChordVolume(0)}>
                    <VolumeX size={14} />
                  </button>
                </div>
              </div>
              
              <div className="mixer-channel">
                <div className="channel-header">
                  <ArrowDown size={16} />
                  <span>Bajo</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={bassVolume} 
                  onChange={(e) => setBassVolume(Number(e.target.value))} 
                  className="channel-slider"
                />
                <div className="channel-value">
                  <strong>{Math.round(bassVolume * 100)}%</strong>
                  <button className="mute-button" onClick={() => setBassVolume(0)}>
                    <VolumeX size={14} />
                  </button>
                </div>
              </div>
              
              <div className="mixer-channel">
                <div className="channel-header">
                  <Volume2 size={16} />
                  <span>Batería</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1.4" 
                  step="0.05" 
                  value={songDrumVolume} 
                  onChange={(e) => { 
                    const next = Math.min(1.4, Math.max(0, Number(e.target.value) || 0)); 
                    setSongDrumVolume(next); 
                    writeLocalList('harmonySongDrumVolume', next); 
                    if (drumsRef.current?.bus) drumsRef.current.bus.gain.value = next * 1.35; 
                  }} 
                  className="channel-slider"
                />
                <div className="channel-value">
                  <strong>{Math.round(songDrumVolume * 100)}%</strong>
                  <button className="mute-button" onClick={() => { 
                    setSongDrumVolume(0); 
                    writeLocalList('harmonySongDrumVolume', 0); 
                    if (drumsRef.current?.bus) drumsRef.current.bus.gain.value = 0; 
                  }}>
                    <VolumeX size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 5: EFECTOS */}
      <div className="harmony-section">
        <button 
          className="section-collapse-header"
          onClick={() => toggleSection('effects')}
          type="button"
        >
          <div className="section-header-content">
            <Waves size={20} />
            <div>
              <h2>Efectos de Audio</h2>
              <p>Reverb, delay y chorus para dar profundidad</p>
            </div>
          </div>
          <label className="effect-toggle">
            <input 
              type="checkbox" 
              checked={effectsEnabled} 
              onChange={(e) => setEffectsEnabled(e.target.checked)} 
            />
            <span>{effectsEnabled ? 'Activados' : 'Desactivados'}</span>
          </label>
          {expandedSections.effects ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {expandedSections.effects && (
          <div className="effects-panel">
            <div className="effects-grid">
              <div className="effect-card">
                <div className="effect-header">
                  <Waves size={20} />
                  <div>
                    <h4>Reverb</h4>
                    <p>Ambiente y espacio</p>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={reverbAmount} 
                  onChange={(e) => { 
                    setReverbAmount(Number(e.target.value)); 
                    if (reverbRef.current) reverbRef.current.wet.value = Number(e.target.value); 
                  }} 
                  disabled={!effectsEnabled}
                />
                <strong>{Math.round(reverbAmount * 100)}%</strong>
              </div>
              
              <div className="effect-card">
                <div className="effect-header">
                  <FlipHorizontal size={20} />
                  <div>
                    <h4>Delay</h4>
                    <p>Eco y repeticiones</p>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="0.8" 
                  step="0.05" 
                  value={delayAmount} 
                  onChange={(e) => { 
                    setDelayAmount(Number(e.target.value)); 
                    if (delayRef.current) delayRef.current.wet.value = Number(e.target.value); 
                  }} 
                  disabled={!effectsEnabled}
                />
                <strong>{Math.round(delayAmount * 100)}%</strong>
              </div>
              
              <div className="effect-card">
                <div className="effect-header">
                  <Waves size={20} />
                  <div>
                    <h4>Chorus</h4>
                    <p>Profundidad estéreo</p>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="0.6" 
                  step="0.05" 
                  value={chorusAmount} 
                  onChange={(e) => { 
                    setChorusAmount(Number(e.target.value)); 
                    if (chorusRef.current) chorusRef.current.wet.value = Number(e.target.value); 
                  }} 
                  disabled={!effectsEnabled}
                />
                <strong>{Math.round(chorusAmount * 100)}%</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BARRA DE ESTADO */}
      <div className="audio-status-bar">
        <div className="status-left">
          <Volume2 size={14} />
          <span>
            {audioState === 'ready' && 'Audio listo'}
            {audioState === 'loading' && 'Cargando piano...'}
            {audioState === 'error' && audioError}
            {audioState === 'idle' && 'Click en un acorde para iniciar el audio'}
          </span>
        </div>
        <div className="status-center">
          <span>{autoSaveEnabled ? `Auto-save activo ${lastSaved ? '· Último: ' + lastSaved.toLocaleTimeString() : ''}` : 'Auto-save desactivado'}</span>
        </div>
        <div className="status-right">
          <span>Ctrl+Z Deshacer · Ctrl+Y Rehacer · Ctrl+S Guardar · Espacio Reproducir</span>
        </div>
      </div>
    </section>
  );
}