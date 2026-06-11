import * as alphaTab from '@coderline/alphatab';
import { Gauge, Pause, Play, RefreshCcw, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getDriveMediaUrl } from '../services/driveService.js';

export function AlphaTabViewer({ document }) {
  const hostRef = useRef(null);
  const scrollRef = useRef(null);
  const apiRef = useRef(null);
  const [status, setStatus] = useState('Cargando tablatura...');
  const [trackInfo, setTrackInfo] = useState('');
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState({ currentTime: 0, endTime: 0 });
  const [speed, setSpeed] = useState(1);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [countInEnabled, setCountInEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = '';

    async function loadTab() {
      setError('');
      setStatus('Descargando archivo Guitar Pro...');
      setTrackInfo('');
      setIsReady(false);
      setIsPlaying(false);
      setPosition({ currentTime: 0, endTime: 0 });

      try {
        apiRef.current?.destroy?.();
        hostRef.current.innerHTML = '';

        const response = await fetch(getDriveMediaUrl(document.id));
        if (!response.ok) {
          throw new Error('No se pudo descargar la tablatura desde Google Drive');
        }

        const data = await response.arrayBuffer();
        if (cancelled) return;

        const api = new alphaTab.AlphaTabApi(hostRef.current, {
          core: {
            fontDirectory: '/font/',
          },
          player: {
            enablePlayer: true,
            playerMode: alphaTab.PlayerMode.EnabledSynthesizer,
            soundFont: '/soundfont/sonivox.sf2',
            scrollElement: scrollRef.current,
          },
          display: {
            scale: window.innerWidth < 640 ? 0.72 : 0.9,
          },
        });

        apiRef.current = api;
        api.metronomeVolume = 0;
        api.countInVolume = 0;
        api.playbackSpeed = speed;
        api.renderStarted.on(() => setStatus('Renderizando tablatura...'));
        api.renderFinished.on(() => setStatus(''));
        api.playerReady.on(() => {
          setIsReady(true);
          setStatus('');
        });
        api.playerStateChanged.on((args) => {
          setIsPlaying(args.state === alphaTab.synth.PlayerState.Playing);
        });
        api.playerPositionChanged.on((args) => {
          setPosition({ currentTime: args.currentTime || 0, endTime: args.endTime || 0 });
        });
        api.error.on((err) => {
          setError(err?.message || 'No se pudo renderizar la tablatura');
          setStatus('');
        });
        api.scoreLoaded.on((score) => {
          const tracks = score?.tracks?.length || 0;
          setTrackInfo(`${tracks} pista${tracks === 1 ? '' : 's'}`);
        });

        const loaded = api.load(data);
        if (!loaded) {
          objectUrl = URL.createObjectURL(new Blob([data]));
          api.load(objectUrl);
        }
      } catch (err) {
        setError(err.message || 'No se pudo abrir el archivo Guitar Pro');
        setStatus('');
      }
    }

    loadTab();

    return () => {
      cancelled = true;
      apiRef.current?.destroy?.();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document.id]);

  function togglePlayback() {
    apiRef.current?.playPause();
  }

  function stopPlayback() {
    apiRef.current?.stop();
    setIsPlaying(false);
  }

  function changeSpeed(event) {
    const value = Number(event.target.value);
    setSpeed(value);
    if (apiRef.current) apiRef.current.playbackSpeed = value;
  }

  function toggleMetronome(event) {
    const enabled = event.target.checked;
    setMetronomeEnabled(enabled);
    if (apiRef.current) apiRef.current.metronomeVolume = enabled ? 0.75 : 0;
  }

  function toggleCountIn(event) {
    const enabled = event.target.checked;
    setCountInEnabled(enabled);
    if (apiRef.current) apiRef.current.countInVolume = enabled ? 0.75 : 0;
  }

  function formatTime(ms) {
    const totalSeconds = Math.max(Math.floor(ms / 1000), 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  const progress = position.endTime ? Math.min((position.currentTime / position.endTime) * 100, 100) : 0;
  return (
    <div className="tab-viewer">
      <div className="tab-toolbar compact">
        <div className="tab-player-controls">
          <button className="tab-play-button" onClick={togglePlayback} disabled={!isReady} title={isPlaying ? 'Pausar' : 'Reproducir'}>
            {isPlaying ? <Pause size={17} /> : <Play size={17} />}
            <span>{isPlaying ? 'Pausar' : 'Tocar'}</span>
          </button>
          <button className="icon-button" onClick={stopPlayback} disabled={!isReady} title="Detener">
            <Square size={16} />
          </button>
          <label className="compact-control">
            <Gauge size={15} />
            <select value={speed} onChange={changeSpeed} disabled={!isReady}>
              <option value="0.5">50%</option>
              <option value="0.75">75%</option>
              <option value="1">100%</option>
              <option value="1.25">125%</option>
            </select>
          </label>
          <label className="toggle-control">
            <input type="checkbox" checked={metronomeEnabled} onChange={toggleMetronome} disabled={!isReady} />
            Metrónomo
          </label>
          <label className="toggle-control">
            <input type="checkbox" checked={countInEnabled} onChange={toggleCountIn} disabled={!isReady} />
            Cuenta previa
          </label>
          <button className="icon-button" onClick={() => window.location.reload()} title="Recargar">
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>
      <div className="tab-stage" ref={scrollRef}>
        <div className="tab-progress" aria-label="Progreso de reproduccion">
          <span>{formatTime(position.currentTime)}</span>
          <div>
            <i style={{ width: `${progress}%` }} />
            <b style={{ left: `${progress}%` }} />
          </div>
          <span>{formatTime(position.endTime)}</span>
        </div>
        {status && <div className="tab-status">{status}</div>}
        {error && <div className="empty-state">{error}</div>}
        <div className="alphatab-host" ref={hostRef} />
      </div>
    </div>
  );
}
