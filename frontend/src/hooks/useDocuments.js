import { useEffect, useState } from 'react';
import { fetchDriveDocuments, filterDocuments } from '../services/driveService.js';

export function useDocuments(filters) {
  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchDriveDocuments()
      .then((data) => {
        setAllDocuments(data);
        setDocuments(filterDocuments(data, filters));
      })
      .catch((err) => setError(err.message || 'No se pudieron cargar los documentos'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setDocuments(filterDocuments(allDocuments, filters));
  }, [allDocuments, JSON.stringify(filters)]);

  return { documents, allDocuments, setDocuments, loading, error };
}
