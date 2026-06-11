import { LoaderCircle, Music2, Play, Plus, Save, Shuffle, Trash2, Volume2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

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
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
};

const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const FLAT_TONICS = new Set([
  'F',
  'Bb',
  'Eb',
  'Ab',
  'Db',
  'Gb',
  'Dm',
  'Gm',
  'Cm',
  'Fm',
  'Bbm',
  'Ebm',
]);

const PROGRESSION_CATEGORIES = [
  'Todas',
  'Pop',
  'Rock',
  'Cinemática',
  'Folk',
  'Soul',
  'Cadencia',
  'Oscura',
];

const GREEK_MODES = [
  {
    id: 'ionian',
    name: 'Jonico',
    family: 'Mayor',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    qualities: ['', 'm', 'm', '', '', 'm', 'dim'],
    roman: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii dim'],
    color: 'Estable, brillante y resolutivo.',
    lesson: 'Es la escala mayor natural. Funciona muy bien cuando el centro tonal queda claro en el I y la progresion resuelve de V a I.',
    characteristicDegrees: [1, 4, 5],
  },
  {
    id: 'dorian',
    name: 'Dorico',
    family: 'Menor',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    qualities: ['m', 'm', '', '', 'm', 'dim', ''],
    roman: ['i', 'ii', 'III', 'IV', 'v', 'vi dim', 'VII'],
    color: 'Menor con sexta mayor, moderno y jazzistico.',
    lesson: 'La nota clave es la sexta mayor. Para que suene dorico, usa i menor con IV mayor y evita resolver como menor natural todo el tiempo.',
    characteristicDegrees: [1, 4, 7],
  },
  {
    id: 'phrygian',
    name: 'Frigio',
    family: 'Menor',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    qualities: ['m', '', '', 'm', 'dim', '', 'm'],
    roman: ['i', 'bII', 'bIII', 'iv', 'v dim', 'bVI', 'bvii'],
    color: 'Oscuro, flamenco y exotico.',
    lesson: 'La segunda bemol es el sello. Alternar i menor con bII mayor hace aparecer el color frigio rapidamente.',
    characteristicDegrees: [1, 2, 6],
  },
  {
    id: 'lydian',
    name: 'Lidio',
    family: 'Mayor',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    qualities: ['', '', 'm', 'dim', '', 'm', 'm'],
    roman: ['I', 'II', 'iii', '#iv dim', 'V', 'vi', 'vii'],
    color: 'Mayor flotante, abierto y cinematografico.',
    lesson: 'La cuarta aumentada es la nota de identidad. Usa I mayor con II mayor para evitar que suene simplemente jonico.',
    characteristicDegrees: [1, 2, 5],
  },
  {
    id: 'mixolydian',
    name: 'Mixolidio',
    family: 'Mayor',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    qualities: ['', 'm', 'dim', '', 'm', 'm', ''],
    roman: ['I', 'ii', 'iii dim', 'IV', 'v', 'vi', 'bVII'],
    color: 'Mayor con septima bemol, rock, blues y funk.',
    lesson: 'El bVII mayor evita la resolucion clasica y da un color muy de riff. I - bVII - IV es una firma mixolidia.',
    characteristicDegrees: [1, 4, 7],
  },
  {
    id: 'aeolian',
    name: 'Eolico',
    family: 'Menor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    qualities: ['m', 'dim', '', 'm', 'm', '', ''],
    roman: ['i', 'ii dim', 'III', 'iv', 'v', 'VI', 'VII'],
    color: 'Menor natural, melancolico y estable.',
    lesson: 'Es la escala menor natural. VI y VII mayores son esenciales para ese color menor moderno.',
    characteristicDegrees: [1, 6, 7],
  },
  {
    id: 'locrian',
    name: 'Locrio',
    family: 'Disminuido',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    qualities: ['dim', '', 'm', 'm', '', '', 'm'],
    roman: ['i dim', 'bII', 'bIII', 'iv', 'bV', 'bVI', 'bvii'],
    color: 'Inestable, tenso y disminuido.',
    lesson: 'La quinta bemol genera mucha tension. Conviene usarlo para pasajes oscuros o transiciones, no tanto como reposo largo.',
    characteristicDegrees: [1, 2, 5],
  },
];

const SONG_SECTION_TYPES = ['Intro', 'Verso', 'Pre-estribillo', 'Estribillo', 'Puente', 'Solo', 'Outro'];

const SCALE_DEGREES = {
  major: {
    label: 'Mayor',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    qualities: ['', 'm', 'm', '', '', 'm', 'dim'],
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
    label: 'Menor natural',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    qualities: ['m', 'dim', '', 'm', 'm', '', ''],
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

function cleanTonic(value) {
  return value.replace('m', '').split('/')[0];
}

function noteName(index, preferFlats) {
  const notes = preferFlats ? FLAT_NOTES : SHARP_NOTES;
  return notes[((index % 12) + 12) % 12];
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
      chord: `${note}${quality}`,
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
      isCharacteristic: modeConfig.characteristicDegrees.includes(index + 1),
    };
  });
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

function progressionChords(scale, progression) {
  return progression.degrees.map((degree) => scale[degree - 1]);
}

function chordNotes(chord) {
  const [, root = 'C', quality = ''] = chord.match(/^([A-G](?:#|b)?)(.*)$/) || [];
  const rootIndex = NOTE_TO_INDEX[root] ?? 0;

  const intervals = quality.includes('dim')
    ? [0, 3, 6]
    : quality.includes('m')
      ? [0, 3, 7]
      : [0, 4, 7];

  const baseOctave = rootIndex >= 9 ? 3 : 4;

  return intervals.map((interval) => {
    const absolute = rootIndex + interval;
    const note = SHARP_NOTES[absolute % 12];
    const octave = baseOctave + Math.floor(absolute / 12);

    return `${note}${octave}`;
  });
}

export function HarmonyPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState('major');
  const [progressionIndex, setProgressionIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [audioState, setAudioState] = useState('idle');
  const [audioError, setAudioError] = useState('');
  const [selectedGreekMode, setSelectedGreekMode] = useState('ionian');
  const [savedProgressions, setSavedProgressions] = useState(() => readLocalList('savedHarmonyProgressions', []));
  const [songTitle, setSongTitle] = useState('Mi cancion');
  const [savedSongs, setSavedSongs] = useState(() => readLocalList('savedHarmonySongs', []));
  const [songSections, setSongSections] = useState(() => readLocalList('harmonySongSections', [
    { id: crypto.randomUUID(), name: 'Intro', chords: [] },
    { id: crypto.randomUUID(), name: 'Verso', chords: [] },
    { id: crypto.randomUUID(), name: 'Estribillo', chords: [] },
  ]));
  const [activeSongSectionId, setActiveSongSectionId] = useState(() => songSections[0]?.id || '');

  const samplerRef = useRef(null);
  const toneRef = useRef(null);
  const loadingRef = useRef(null);

  const selected = CIRCLE_KEYS[selectedIndex];
  const tonic = mode === 'major' ? selected.major : selected.minor;

  const scale = useMemo(() => buildScale(tonic, mode), [tonic, mode]);
  const activeGreekMode = GREEK_MODES.find((item) => item.id === selectedGreekMode) || GREEK_MODES[0];
  const modalScale = useMemo(() => buildModeScale(tonic, activeGreekMode), [tonic, activeGreekMode]);

  const allProgressions = SCALE_DEGREES[mode].progressions;

  const availableCategories = useMemo(() => {
    const categories = new Set(allProgressions.map((progression) => progression.category));
    return PROGRESSION_CATEGORIES.filter(
      (category) => category === 'Todas' || categories.has(category)
    );
  }, [allProgressions]);

  const filteredProgressions = useMemo(() => {
    if (selectedCategory === 'Todas') return allProgressions;

    const filtered = allProgressions.filter(
      (progression) => progression.category === selectedCategory
    );

    return filtered.length > 0 ? filtered : allProgressions;
  }, [allProgressions, selectedCategory]);

  const activeProgression = filteredProgressions[
    progressionIndex % filteredProgressions.length
  ];

  const activeChords = progressionChords(scale, activeProgression);
  const activeSongSection = songSections.find((section) => section.id === activeSongSectionId) || songSections[0];

  function changeMode(nextMode) {
    setMode(nextMode);
    setSelectedCategory('Todas');
    setProgressionIndex(0);
  }

  function changeCategory(category) {
    setSelectedCategory(category);
    setProgressionIndex(0);
  }

  function generateProgression() {
    const next = Math.floor(Math.random() * filteredProgressions.length);
    setProgressionIndex(
      next === progressionIndex
        ? (next + 1) % filteredProgressions.length
        : next
    );
  }

  function saveCurrentProgression() {
    const saved = {
      id: crypto.randomUUID(),
      name: activeProgression.name,
      tonic,
      mode: activeGreekMode.name,
      chords: activeChords.map((item) => item.chord),
      roman: activeChords.map((item) => item.roman),
      createdAt: new Date().toISOString(),
    };
    setSavedProgressions((current) => {
      const next = [saved, ...current].slice(0, 24);
      writeLocalList('savedHarmonyProgressions', next);
      return next;
    });
  }

  function addSection(type = 'Verso') {
    const section = { id: crypto.randomUUID(), name: type, chords: [] };
    setSongSections((current) => {
      const next = [...current, section];
      writeLocalList('harmonySongSections', next);
      return next;
    });
    setActiveSongSectionId(section.id);
  }

  function addChordToSong(chord) {
    if (!activeSongSection) return;
    setSongSections((current) => {
      const next = current.map((section) => (
        section.id === activeSongSection.id ? { ...section, chords: [...section.chords, chord] } : section
      ));
      writeLocalList('harmonySongSections', next);
      return next;
    });
  }

  function addProgressionToSong(progression = activeChords.map((item) => item.chord)) {
    if (!activeSongSection) return;
    setSongSections((current) => {
      const next = current.map((section) => (
        section.id === activeSongSection.id ? { ...section, chords: [...section.chords, ...progression] } : section
      ));
      writeLocalList('harmonySongSections', next);
      return next;
    });
  }

  function clearSection(sectionId) {
    setSongSections((current) => {
      const next = current.map((section) => (section.id === sectionId ? { ...section, chords: [] } : section));
      writeLocalList('harmonySongSections', next);
      return next;
    });
  }

  function deleteProgression(id) {
    setSavedProgressions((current) => {
      const next = current.filter((progression) => progression.id !== id);
      writeLocalList('savedHarmonyProgressions', next);
      return next;
    });
  }

  function deleteSection(sectionId) {
    setSongSections((current) => {
      const next = current.filter((section) => section.id !== sectionId);
      const fallback = next.length > 0 ? next : [{ id: crypto.randomUUID(), name: 'Intro', chords: [] }];
      writeLocalList('harmonySongSections', fallback);
      if (!fallback.some((section) => section.id === activeSongSectionId)) {
        setActiveSongSectionId(fallback[0]?.id || '');
      }
      return fallback;
    });
  }

  function saveCurrentSong() {
    const song = {
      id: crypto.randomUUID(),
      title: songTitle.trim() || 'Cancion sin titulo',
      tonic,
      mode: activeGreekMode.name,
      sections: songSections,
      createdAt: new Date().toISOString(),
    };

    setSavedSongs((current) => {
      const next = [song, ...current.filter((item) => item.title !== song.title)].slice(0, 20);
      writeLocalList('savedHarmonySongs', next);
      return next;
    });
  }

  function loadSong(song) {
    setSongTitle(song.title);
    setSongSections(song.sections);
    setActiveSongSectionId(song.sections[0]?.id || '');
    writeLocalList('harmonySongSections', song.sections);
  }

  function deleteSong(id) {
    setSavedSongs((current) => {
      const next = current.filter((song) => song.id !== id);
      writeLocalList('savedHarmonySongs', next);
      return next;
    });
  }

  async function ensurePiano() {
    if (samplerRef.current && toneRef.current) {
      return {
        sampler: samplerRef.current,
        Tone: toneRef.current,
      };
    }

    if (loadingRef.current) return loadingRef.current;

    setAudioError('');
    setAudioState('loading');

    loadingRef.current = import('tone')
      .then(async (Tone) => {
        await Tone.start();

        const sampler = new Tone.Sampler({
          urls: {
            A0: 'A0.mp3',
            C1: 'C1.mp3',
            'D#1': 'Ds1.mp3',
            'F#1': 'Fs1.mp3',
            A1: 'A1.mp3',
            C2: 'C2.mp3',
            'D#2': 'Ds2.mp3',
            'F#2': 'Fs2.mp3',
            A2: 'A2.mp3',
            C3: 'C3.mp3',
            'D#3': 'Ds3.mp3',
            'F#3': 'Fs3.mp3',
            A3: 'A3.mp3',
            C4: 'C4.mp3',
            'D#4': 'Ds4.mp3',
            'F#4': 'Fs4.mp3',
            A4: 'A4.mp3',
            C5: 'C5.mp3',
            'D#5': 'Ds5.mp3',
            'F#5': 'Fs5.mp3',
            A5: 'A5.mp3',
            C6: 'C6.mp3',
            'D#6': 'Ds6.mp3',
            'F#6': 'Fs6.mp3',
            A6: 'A6.mp3',
            C7: 'C7.mp3',
            'D#7': 'Ds7.mp3',
            'F#7': 'Fs7.mp3',
            A7: 'A7.mp3',
            C8: 'C8.mp3',
          },
          release: 1,
          baseUrl: 'https://tonejs.github.io/audio/salamander/',
          onload: () => {
            setAudioState('ready');
          },
          onerror: (error) => {
            setAudioState('error');
            setAudioError('No se pudieron cargar los samples de piano');
            console.error(error);
          },
        }).toDestination();

        samplerRef.current = sampler;
        toneRef.current = Tone;

        await Tone.loaded();

        setAudioState('ready');

        return {
          sampler,
          Tone,
        };
      })
      .catch((err) => {
        setAudioState('error');
        setAudioError(err.message || 'No se pudo iniciar el piano');
        throw err;
      })
      .finally(() => {
        loadingRef.current = null;
      });

    return loadingRef.current;
  }

  async function playChord(chord) {
    const { sampler, Tone } = await ensurePiano();
    const now = Tone.now();

    sampler.triggerAttackRelease(chordNotes(chord), '1.3', now, 0.75);
  }

  async function playProgression() {
    const { sampler, Tone } = await ensurePiano();
    const now = Tone.now();

    activeChords.forEach((item, index) => {
      const offset = index * 0.95;
      sampler.triggerAttackRelease(chordNotes(item.chord), '0.85', now + offset, 0.72);
    });
  }

  async function playSongSketch() {
    const { sampler, Tone } = await ensurePiano();
    const now = Tone.now();
    const chords = songSections.flatMap((section) => section.chords);

    chords.forEach((chord, index) => {
      sampler.triggerAttackRelease(chordNotes(chord), '0.85', now + index * 0.82, 0.7);
    });
  }

  return (
    <section className="page harmony-page">
      <div className="harmony-hero">
        <div>
          <span>Herramientas de armonía</span>
          <h2>Círculo de quintas</h2>
          <p>Explorá tonalidades, acordes diatónicos y progresiones listas para practicar.</p>
        </div>

        <div className="mode-switch" aria-label="Modo">
          <button
            className={mode === 'major' ? 'active' : ''}
            onClick={() => changeMode('major')}
            type="button"
          >
            Mayor
          </button>

          <button
            className={mode === 'minor' ? 'active' : ''}
            onClick={() => changeMode('minor')}
            type="button"
          >
            Menor
          </button>
        </div>
      </div>

      <div className="harmony-workbench">
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
        </div>

        <aside className="harmony-side">
          <div className="key-summary">
            <span>Tonalidad seleccionada</span>
            <h3>
              {tonic} {SCALE_DEGREES[mode].label}
            </h3>
            <p>Relativa: {mode === 'major' ? selected.minor : selected.major}</p>
          </div>

          <div className="progression-card">
            <div className="module-heading">
              <div>
                <h3>{activeProgression.name}</h3>
                <p>
                  {activeProgression.category} ·{' '}
                  {activeChords.map((item) => item.roman).join(' - ')}
                </p>
              </div>

              <div className="harmony-actions">
                <button
                  className="icon-button"
                  onClick={generateProgression}
                  title="Generar progresión"
                  type="button"
                >
                  <Shuffle size={18} />
                </button>

                <button
                  className="icon-button sound-button"
                  onClick={playProgression}
                  title="Escuchar progresión"
                  type="button"
                  disabled={audioState === 'loading'}
                >
                  {audioState === 'loading' ? <LoaderCircle size={18} /> : <Play size={18} />}
                </button>
              </div>
            </div>

            <div className="progression-categories" aria-label="Tipo de progresión">
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
                  onClick={() => playChord(item.chord)}
                  type="button"
                  disabled={audioState === 'loading'}
                >
                  <span>{item.roman}</span>
                  <strong>{item.chord}</strong>
                </button>
              ))}
            </div>

            <div className="progression-tools">
              <button className="button secondary" onClick={saveCurrentProgression} type="button">
                <Save size={17} />
                Guardar
              </button>
              <button className="button primary" onClick={() => addProgressionToSong()} type="button">
                <Plus size={17} />
                Agregar a cancion
              </button>
            </div>

            <div className="sample-status">
              <Volume2 size={15} />
              <span>
                {audioState === 'ready' && 'Piano sampleado listo'}
                {audioState === 'loading' && 'Cargando piano real...'}
                {audioState === 'error' && audioError}
                {audioState === 'idle' && 'Click en un acorde para cargar el piano'}
              </span>
            </div>
          </div>

          <div className="chord-grid">
            {scale.map((item) => (
              <button
                className="chord-tile"
                key={item.roman}
                onClick={() => {
                  playChord(item.chord);
                  addChordToSong(item.chord);
                }}
                type="button"
                disabled={audioState === 'loading'}
              >
                <span>{item.roman}</span>
                <strong>{item.chord}</strong>
                <small>{item.name}</small>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <div className="harmony-lab">
        <section className="modal-panel">
          <div className="module-heading">
            <div>
              <span>Modos griegos</span>
              <h3>{tonic} {activeGreekMode.name}</h3>
              <p>{activeGreekMode.color}</p>
            </div>
          </div>

          <div className="mode-chip-grid">
            {GREEK_MODES.map((item) => (
              <button
                className={selectedGreekMode === item.id ? 'active' : ''}
                key={item.id}
                onClick={() => setSelectedGreekMode(item.id)}
                type="button"
              >
                <strong>{item.name}</strong>
                <span>{item.family}</span>
              </button>
            ))}
          </div>

          <p className="mode-lesson">{activeGreekMode.lesson}</p>

          <div className="modal-scale-grid">
            {modalScale.map((item) => (
              <button
                className={item.isCharacteristic ? 'mode-degree characteristic' : 'mode-degree'}
                key={item.roman}
                onClick={() => {
                  playChord(item.chord);
                  addChordToSong(item.chord);
                }}
                type="button"
              >
                <span>{item.roman}</span>
                <strong>{item.chord}</strong>
                <small>{item.note}</small>
                {item.isCharacteristic && <em>color modal</em>}
              </button>
            ))}
          </div>

          {(savedProgressions.length > 0 || savedSongs.length > 0) && (
            <div className="harmony-library">
              {savedProgressions.length > 0 && (
                <div className="saved-progressions">
                  <span>Progresiones guardadas</span>
                  {savedProgressions.map((progression) => (
                    <article key={progression.id}>
                      <button onClick={() => addProgressionToSong(progression.chords)} type="button">
                        <strong>{progression.name}</strong>
                        <small>{progression.tonic} · {progression.chords.join(' - ')}</small>
                      </button>
                      <button className="icon-button" onClick={() => deleteProgression(progression.id)} title="Borrar progresion" type="button">
                        <Trash2 size={15} />
                      </button>
                    </article>
                    
                  ))}
                </div>
              )}

              {savedSongs.length > 0 && (
                <div className="saved-songs">
                  <span>Canciones guardadas</span>
                  {savedSongs.map((song) => (
                    <article key={song.id}>
                      <button onClick={() => loadSong(song)} type="button">
                        <strong>{song.title}</strong>
                        <small>{song.tonic} {song.mode} · {song.sections.length} partes</small>
                      </button>
                      <button className="icon-button" onClick={() => deleteSong(song.id)} title="Borrar cancion" type="button">
                        <Trash2 size={15} />
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        <section className="song-builder">
          <div className="module-heading">
            <div>
              <span>Compositor</span>
              <h3>Armar cancion</h3>
              <p>Elegis una parte, agregas acordes o progresiones, y escuchas el boceto completo.</p>
            </div>
            <button className="icon-button sound-button" onClick={playSongSketch} title="Reproducir cancion" type="button">
              <Play size={18} />
            </button>
          </div>

          <div className="song-savebar">
            <input value={songTitle} onChange={(event) => setSongTitle(event.target.value)} placeholder="Nombre de la cancion" />
            <button className="button primary" onClick={saveCurrentSong} type="button">
              <Save size={17} />
              Guardar cancion
            </button>
          </div>

          <div className="song-section-toolbar">
            {SONG_SECTION_TYPES.map((type) => (
              <button key={type} onClick={() => addSection(type)} type="button">
                <Plus size={14} />
                {type}
              </button>
            ))}
          </div>

          <div className="song-sections">
            {songSections.map((section) => (
              <article className={activeSongSection?.id === section.id ? 'song-section active' : 'song-section'} key={section.id}>
                <button className="song-section-head" onClick={() => setActiveSongSectionId(section.id)} type="button">
                  <strong>{section.name}</strong>
                  <span>{section.chords.length} acordes</span>
                </button>
                <div className="song-chords">
                  {section.chords.length === 0 && <small>Selecciona acordes o agrega una progresion.</small>}
                  {section.chords.map((chord, index) => (
                    <button key={`${section.id}-${chord}-${index}`} onClick={() => playChord(chord)} type="button">
                      {chord}
                    </button>
                  ))}
                </div>
                <div className="song-section-actions">
                  <button className="section-clear" onClick={() => clearSection(section.id)} type="button">
                    <Trash2 size={14} />
                    Limpiar
                  </button>
                  <button className="section-clear danger" onClick={() => deleteSection(section.id)} type="button">
                    <Trash2 size={14} />
                    Borrar parte
                  </button>
                </div>
              </article>
            ))}
          </div>

        </section>
      </div>
    </section>
  );
}
