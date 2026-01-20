import { useState, useEffect, useCallback } from 'react';
import counterpartiesAPI from 'api/counterparties';

export const useCounterpartiesTableData = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [counterparties, setCounterparties] = useState([]);
    const [filteredCounterparties, setFilteredCounterparties] = useState([]);
    const [search, setSearch] = useState('');
    const [entityTypeFilter, setEntityTypeFilter] = useState('all');

    const loadCounterparties = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await counterpartiesAPI.getAll();
            setCounterparties(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading counterparties:', err);
            setError('Не удалось загрузить контрагентов');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCounterparties();
    }, [loadCounterparties]);

    useEffect(() => {
        let filtered = [...counterparties];

        if (entityTypeFilter !== 'all') {
            filtered = filtered.filter(c => c.entityType === entityTypeFilter);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(c =>
                c.fullName?.toLowerCase().includes(searchLower) ||
                c.companyName?.toLowerCase().includes(searchLower) ||
                c.inn?.includes(search) ||
                c.phone?.includes(search) ||
                c.email?.toLowerCase().includes(searchLower)
            );
        }

        setFilteredCounterparties(filtered);
    }, [counterparties, search, entityTypeFilter]);

    const deleteCounterparty = async (id) => {
        await counterpartiesAPI.delete(id);
        loadCounterparties();
    };

    return {
        counterparties: filteredCounterparties,
        loading,
        error,
        search,
        setSearch,
        entityTypeFilter,
        setEntityTypeFilter,
        deleteCounterparty,
        refresh: loadCounterparties,
        setError
    };
};
