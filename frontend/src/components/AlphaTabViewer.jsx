import * as alphaTab from '@coderline/alphatab';
import { RefreshCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getDriveMediaUrl } from '../services/driveService.js';

export function AlphaTabViewer({ document }) {
  const hostRef = useRef(null);
  const apiRef = useRef(null);
  const [status, setStatus] = useState('Cargando tablatura...');
  const [trackInfo, setTrackInfo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let objectUrl = '';

    async function loadTab() {
      setError('');
      setStatus('Descargando archivo Guitar Pro...');
      setTrackInfo('');

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
          display: {
            scale: window.innerWidth < 640 ? 0.72 : 0.9,
          },
        });

        apiRef.current = api;
        api.renderStarted.on(() => setStatus('Renderizando tablatura...'));
        api.renderFinished.on(() => setStatus(''));
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

  return (
    <div className="tab-viewer">
      <div className="tab-toolbar">
        <div>
          <strong>{document.extension?.toUpperCase()} Guitar Pro</strong>
          <span>{trackInfo || document.categoria?.nombre || 'Tablatura'}</span>
        </div>
        <button className="button secondary" onClick={() => window.location.reload()}>
          <RefreshCcw size={16} />
          Recargar
        </button>
      </div>
      {status && <div className="tab-status">{status}</div>}
      {error && <div className="empty-state">{error}</div>}
      <div className="alphatab-host" ref={hostRef} />
    </div>
  );
}
