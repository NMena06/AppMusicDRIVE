import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const MetronomeContext = createContext(null);

export function MetronomeProvider({ children }) {
  const [bpm, setBpmState] = useState(() => Number(localStorage.getItem('metronome:bpm')) || 90);
  const [beatsPerBar, setBeatsPerBarState] = useState(() => Number(localStorage.getItem('metronome:beats')) || 4);
  const [volume, setVolumeState] = useState(() => Number(localStorage.getItem('metronome:volume')) || 0.8);
  const [accent, setAccentState] = useState(() => localStorage.getItem('metronome:accent') !== 'false');
  const [isRunning, setIsRunning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const beatRef = useRef(0);
  const settingsRef = useRef({ bpm, beatsPerBar, volume, accent });

  useEffect(() => {
    settingsRef.current = { bpm, beatsPerBar, volume, accent };
    localStorage.setItem('metronome:bpm', String(bpm));
    localStorage.setItem('metronome:beats', String(beatsPerBar));
    localStorage.setItem('metronome:volume', String(volume));
    localStorage.setItem('metronome:accent', String(accent));
  }, [bpm, beatsPerBar, volume, accent]);

  useEffect(() => {
    return () => stop();
  }, []);

  function setBpm(value) {
    setBpmState(Math.min(Math.max(Number(value) || 90, 30), 260));
  }

  function setBeatsPerBar(value) {
    setBeatsPerBarState(Math.min(Math.max(Number(value) || 4, 1), 12));
    beatRef.current = 0;
    setCurrentBeat(0);
  }

  function setVolume(value) {
    setVolumeState(Math.min(Math.max(Number(value) || 0.8, 0.05), 1));
  }

  function setAccent(value) {
    setAccentState(Boolean(value));
  }

  function scheduleClick(time, beatIndex) {
    const context = audioRef.current;
    const { volume: currentVolume, accent: currentAccent } = settingsRef.current;
    const isAccent = currentAccent && beatIndex === 0;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.frequency.value = isAccent ? 1320 : 880;
    oscillator.type = 'square';
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(currentVolume, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.055);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(time);
    oscillator.stop(time + 0.06);
  }

  function scheduler() {
    const context = audioRef.current;
    if (!context) return;

    while (nextNoteTimeRef.current < context.currentTime + 0.1) {
      const { bpm: currentBpm, beatsPerBar: currentBeats } = settingsRef.current;
      const beatIndex = beatRef.current % currentBeats;
      scheduleClick(nextNoteTimeRef.current, beatIndex);
      window.setTimeout(() => setCurrentBeat(beatIndex), Math.max((nextNoteTimeRef.current - context.currentTime) * 1000, 0));
      nextNoteTimeRef.current += 60 / currentBpm;
      beatRef.current = (beatRef.current + 1) % currentBeats;
    }
  }

  async function start() {
    if (!audioRef.current) {
      audioRef.current = new AudioContext();
    }
    if (audioRef.current.state === 'suspended') {
      await audioRef.current.resume();
    }
    if (timerRef.current) window.clearInterval(timerRef.current);
    beatRef.current = 0;
    setCurrentBeat(0);
    nextNoteTimeRef.current = audioRef.current.currentTime + 0.06;
    setIsRunning(true);
    timerRef.current = window.setInterval(scheduler, 25);
  }

  function stop() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setIsRunning(false);
    setCurrentBeat(0);
  }

  function toggle() {
    if (isRunning) stop();
    else start();
  }

  function nudgeBpm(amount) {
    setBpm(bpm + amount);
  }

  const value = useMemo(() => ({
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
    start,
    stop,
    toggle,
    nudgeBpm,
  }), [bpm, beatsPerBar, volume, accent, isRunning, currentBeat]);

  return <MetronomeContext.Provider value={value}>{children}</MetronomeContext.Provider>;
}

export function useMetronome() {
  return useContext(MetronomeContext);
}
