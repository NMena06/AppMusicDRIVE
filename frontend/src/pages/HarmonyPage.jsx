import { LoaderCircle, Music2, Play, Shuffle, Volume2 } from 'lucide-react';
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
const FLAT_TONICS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm']);

const SCALE_DEGREES = {
  major: {
    label: 'Mayor',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    qualities: ['', 'm', 'm', '', '', 'm', 'dim'],
    roman: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii dim'],
    names: ['Tonica', 'Supertonica', 'Mediante', 'Subdominante', 'Dominante', 'Submediante', 'Sensible'],
    progressions: [
      { name: 'Pop clasica', degrees: [1, 5, 6, 4] },
      { name: 'Folk / balada', degrees: [1, 6, 4, 5] },
      { name: 'Rock directo', degrees: [1, 4, 5, 4] },
      { name: 'Cadencia fuerte', degrees: [2, 5, 1, 1] },
      { name: 'Soul suave', degrees: [6, 4, 1, 5] },
    ],
  },
  minor: {
    label: 'Menor natural',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    qualities: ['m', 'dim', '', 'm', 'm', '', ''],
    roman: ['i', 'ii dim', 'III', 'iv', 'v', 'VI', 'VII'],
    names: ['Tonica', 'Supertonica', 'Mediante', 'Subdominante', 'Dominante', 'Submediante', 'Subtonica'],
    progressions: [
      { name: 'Menor moderno', degrees: [1, 6, 3, 7] },
      { name: 'Rock menor', degrees: [1, 7, 6, 7] },
      { name: 'Cinematica', degrees: [1, 6, 4, 5] },
      { name: 'Oscura estable', degrees: [1, 4, 7, 3] },
      { name: 'Resolucion menor', degrees: [6, 7, 1, 1] },
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

function progressionChords(scale, progression) {
  return progression.degrees.map((degree) => scale[degree - 1]);
}

function chordNotes(chord) {
  const [, root = 'C', quality = ''] = chord.match(/^([A-G](?:#|b)?)(.*)$/) || [];
  const rootIndex = NOTE_TO_INDEX[root] ?? 0;
  const intervals = quality.includes('dim') ? [0, 3, 6] : quality.includes('m') ? [0, 3, 7] : [0, 4, 7];
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
  const [audioState, setAudioState] = useState('idle');
  const [audioError, setAudioError] = useState('');
  const pianoRef = useRef(null);
  const toneRef = useRef(null);
  const loadingRef = useRef(null);
  const selected = CIRCLE_KEYS[selectedIndex];
  const tonic = mode === 'major' ? selected.major : selected.minor;
  const scale = useMemo(() => buildScale(tonic, mode), [tonic, mode]);
  const progressions = SCALE_DEGREES[mode].progressions;
  const activeProgression = progressions[progressionIndex % progressions.length];
  const activeChords = progressionChords(scale, activeProgression);

  function generateProgression() {
    const next = Math.floor(Math.random() * progressions.length);
    setProgressionIndex(next === progressionIndex ? (next + 1) % progressions.length : next);
  }

  async function ensurePiano() {
    if (pianoRef.current && toneRef.current) return { piano: pianoRef.current, Tone: toneRef.current };
    if (loadingRef.current) return loadingRef.current;

    setAudioError('');
    setAudioState('loading');
    loadingRef.current = Promise.all([import('@tonejs/piano'), import('tone')])
      .then(async ([pianoModule, Tone]) => {
        await Tone.start();
        const piano = new pianoModule.Piano({ velocities: 3 });
        piano.toDestination();
        await piano.load();
        pianoRef.current = piano;
        toneRef.current = Tone;
        setAudioState('ready');
        return { piano, Tone };
      })
      .catch((err) => {
        setAudioState('error');
        setAudioError(err.message || 'No se pudieron cargar los samples de piano');
        throw err;
      })
      .finally(() => {
        loadingRef.current = null;
      });

    return loadingRef.current;
  }

  async function playChord(chord, offset = 0) {
    const { piano, Tone } = await ensurePiano();
    const now = Tone.now();
    chordNotes(chord).forEach((note) => {
      piano.keyDown(note, now + offset, 0.64);
      piano.keyUp(note, now + offset + 1.35);
    });
  }

  async function playProgression() {
    const { piano, Tone } = await ensurePiano();
    const now = Tone.now();
    activeChords.forEach((item, index) => {
      const offset = index * 0.82;
      chordNotes(item.chord).forEach((note) => {
        piano.keyDown(note, now + offset, 0.62);
        piano.keyUp(note, now + offset + 0.72);
      });
    });
  }

  return (
    <section className="page harmony-page">
      <div className="harmony-hero">
        <div>
          <span>Herramientas de armonia</span>
          <h2>Circulo de quintas</h2>
          <p>Explora tonalidades, acordes diatonicos y progresiones listas para practicar.</p>
        </div>
        <div className="mode-switch" aria-label="Modo">
          <button className={mode === 'major' ? 'active' : ''} onClick={() => { setMode('major'); setProgressionIndex(0); }}>Mayor</button>
          <button className={mode === 'minor' ? 'active' : ''} onClick={() => { setMode('minor'); setProgressionIndex(0); }}>Menor</button>
        </div>
      </div>

      <div className="harmony-workbench">
        <div className="circle-panel">
          <div className="fifths-circle" aria-label="Circulo de quintas">
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
            <h3>{tonic} {SCALE_DEGREES[mode].label}</h3>
            <p>Relativa: {mode === 'major' ? selected.minor : selected.major}</p>
          </div>

          <div className="progression-card">
            <div className="module-heading">
              <div>
                <h3>{activeProgression.name}</h3>
                <p>{activeChords.map((item) => item.roman).join(' - ')}</p>
              </div>
              <div className="harmony-actions">
                <button className="icon-button" onClick={generateProgression} title="Generar progresion">
                  <Shuffle size={18} />
                </button>
                <button className="icon-button sound-button" onClick={playProgression} title="Escuchar progresion">
                  {audioState === 'loading' ? <LoaderCircle size={18} /> : <Play size={18} />}
                </button>
              </div>
            </div>
            <div className="progression-strip">
              {activeChords.map((item, index) => (
                <button key={`${item.chord}-${index}`} onClick={() => playChord(item.chord)}>
                  <span>{item.roman}</span>
                  <strong>{item.chord}</strong>
                </button>
              ))}
            </div>
            <div className="sample-status">
              <Volume2 size={15} />
              <span>
                {audioState === 'ready' && 'Piano sampleado listo'}
                {audioState === 'loading' && 'Cargando samples reales de piano...'}
                {audioState === 'error' && audioError}
                {audioState === 'idle' && 'Click en un acorde para cargar piano sampleado'}
              </span>
            </div>
          </div>

          <div className="chord-grid">
            {scale.map((item) => (
              <button className="chord-tile" key={item.roman} onClick={() => playChord(item.chord)}>
                <span>{item.roman}</span>
                <strong>{item.chord}</strong>
                <small>{item.name}</small>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
