import { ChevronLeft, ChevronRight, Minus, Play, Plus, Square } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMetronome } from '../context/MetronomeContext.jsx';

export function FloatingMetronome() {
  const { bpm, beatsPerBar, currentBeat, isRunning, nudgeBpm, toggle } = useMetronome();
  const [isHidden, setIsHidden] = useState(false);

  return (
    <div className={`${isRunning ? 'floating-metronome active' : 'floating-metronome'} ${isHidden ? 'collapsed' : ''}`}>
      <button className="metro-collapse" onClick={() => setIsHidden((current) => !current)} title={isHidden ? 'Mostrar metronomo' : 'Ocultar metronomo'} type="button">
        {isHidden ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
      <Link className="metro-info" to="/metronomo">
        <span>{isRunning ? 'Click activo' : 'Metronomo'}</span>
        <strong>{bpm} BPM</strong>
      </Link>
      <div className="mini-beats">
        {Array.from({ length: beatsPerBar }, (_, index) => (
          <i key={index} className={isRunning && currentBeat === index ? 'active' : ''} />
        ))}
      </div>
      <button className="icon-button" onClick={() => nudgeBpm(-1)} title="Bajar BPM" type="button">
        <Minus size={15} />
      </button>
      <button className="icon-button" onClick={toggle} title={isRunning ? 'Detener' : 'Iniciar'} type="button">
        {isRunning ? <Square size={15} /> : <Play size={15} />}
      </button>
      <button className="icon-button" onClick={() => nudgeBpm(1)} title="Subir BPM" type="button">
        <Plus size={15} />
      </button>
    </div>
  );
}
