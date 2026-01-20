import { useState, useEffect } from 'react';
import * as globalPurchasesAPI from 'api/globalPurchases';

export const usePurchasesTableData = (filters) => {
    const [purchases, setPurchases] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadPurchases = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await globalPurchasesAPI.getAllGlobalPurchases(filters);
            setPurchases(response.purchases || []);

            // Загрузка статистики
            const statsResponse = await globalPurchasesAPI.getStatistics(filters);
            setStatistics(statsResponse.statistics);

        } catch (err) {
            console.error('❌ Ошибка загрузки закупок:', err);
            console.error('   Детали:', err.response?.data);
            setError('Не удалось загрузить закупки');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPurchases();
    }, [filters.projectId, filters.dateFrom, filters.dateTo]);

    const deletePurchase = async (id) => {
        await globalPurchasesAPI.deleteGlobalPurchase(id);
        loadPurchases();
    };

    const updatePurchase = async (id, data) => {
        await globalPurchasesAPI.updateGlobalPurchase(id, data);
        loadPurchases();
    };

    return {
        purchases,
        statistics,
        loading,
        error,
        refresh: loadPurchases,
        deletePurchase,
        updatePurchase
    };
};
