import { useState, useCallback, useEffect } from 'react';
import workCompletionActsAPI from 'api/workCompletionActs';

export const useActsTableData = (estimateId) => {
  const [acts, setActs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadActs = useCallback(async () => {
    if (!estimateId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await workCompletionActsAPI.getActsByEstimate(estimateId);

      if (Array.isArray(data)) {
        setActs(data);
      } else {
        setActs([]);
      }
    } catch (err) {
      console.error('Error loading acts:', err);
      setError('Не удалось загрузить акты выполненных работ');
      setActs([]);
    } finally {
      setLoading(false);
    }
  }, [estimateId]);

  useEffect(() => {
    loadActs();
  }, [loadActs]);

  const handleDeleteAct = useCallback(async (actId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот акт?')) {
      return false;
    }

    try {
      setLoading(true);
      await workCompletionActsAPI.deleteAct(actId);
      await loadActs();
      return true;
    } catch (err) {
      console.error('Error deleting act:', err);
      setError('Не удалось удалить акт');
      setLoading(false); // Only stop loading if error, otherwise loadActs handles it
      return false;
    }
  }, [loadActs]);

  return {
    acts,
    loading,
    error,
    refreshActs: loadActs,
    handleDeleteAct
  };
};
