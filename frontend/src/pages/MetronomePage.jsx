import { Minus, Play, Plus, Square } from 'lucide-react';
import { useMetronome } from '../context/MetronomeContext.jsx';

const BPM_PRESETS = [60, 72, 90, 120, 140, 160];

export function MetronomePage() {
  const {
    bpm,
    setBpm,
    beatsPerBar,
    setBeatsPerBar,
    volume,
    setVolume,
    accent,
    setAccent,
    isRunning,
    currentBeat,
    toggle,
    nudgeBpm,
  } = useMetronome();

  return (
    <section className="page metronome-page">
      <div className="metronome-hero">
        <div>
          <span>Herramienta de practica</span>
          <h2>Metronomo</h2>
          <p>Click preciso para estudiar tecnica, lectura y repertorio sin salir de la app.</p>
        </div>
        <strong>{beatsPerBar}/4</strong>
      </div>

      <div className="metronome-panel">
        <div className="metronome-display">
          <span>BPM</span>
          <strong>{bpm}</strong>
          <div className="beat-dots">
            {Array.from({ length: beatsPerBar }, (_, index) => (
              <i key={index} className={isRunning && currentBeat === index ? 'active' : ''} />
            ))}
          </div>
        </div>

        <div className="bpm-presets">
          {BPM_PRESETS.map((preset) => (
            <button key={preset} className={bpm === preset ? 'active' : ''} onClick={() => setBpm(preset)} type="button">
              {preset}
            </button>
          ))}
        </div>

        <div className="metronome-actions">
          <button className="icon-button" onClick={() => nudgeBpm(-1)} title="Bajar BPM"><Minus size={18} /></button>
          <input type="range" min="30" max="260" value={bpm} onChange={(event) => setBpm(Number(event.target.value))} />
          <button className="icon-button" onClick={() => nudgeBpm(1)} title="Subir BPM"><Plus size={18} /></button>
        </div>

        <div className="practice-grid">
          <label>
            Compas
            <select value={beatsPerBar} onChange={(event) => setBeatsPerBar(Number(event.target.value))}>
              <option value="2">2/4</option>
              <option value="3">3/4</option>
              <option value="4">4/4</option>
              <option value="5">5/4</option>
              <option value="6">6/8</option>
              <option value="7">7/8</option>
            </select>
          </label>
          <label>
            Volumen
            <input type="range" min="0.1" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
          </label>
          <label className="toggle-control large">
            <input type="checkbox" checked={accent} onChange={(event) => setAccent(event.target.checked)} />
            Acentuar primer pulso
          </label>
        </div>

        <button className={isRunning ? 'button secondary metronome-main' : 'button primary metronome-main'} onClick={toggle}>
          {isRunning ? <Square size={18} /> : <Play size={18} />}
          {isRunning ? 'Detener' : 'Iniciar'}
        </button>
      </div>
    </section>
  );
}
