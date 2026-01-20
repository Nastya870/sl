import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';
import storageService from '@/shared/lib/services/storageService';
import materialsAPI from 'api/materials';
import searchAPI from 'api/search';
import { useNotifications } from 'contexts/NotificationsContext';
import { normalizeMaterial } from 'app/entities/material/model';

const INITIAL_PAGE_SIZE = 30;
const PAGE_SIZE = 30;

export const useMaterialsTableData = () => {
    const { success, error: showError } = useNotifications();

    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [globalFilter, setGlobalFilter] = useState(() => {
        return storageService.get('materialsGlobalFilter', 'global');
    });

    // Refs
    const scrollContainerRef = useRef(null);
    const loadMoreTriggerRef = useRef(null);

    // AI Search Logic
    const aiSearchMaterials = useCallback(async (query) => {
        try {
            setLoading(true);
            const aiResponse = await searchAPI.smartMaterials(query, {
                limit: 100,
                scope: globalFilter
            });

            if (aiResponse.success && aiResponse.results?.length > 0) {
                const aiMaterials = aiResponse.results.map(r => ({
                    id: r.id,
                    name: r.name,
                    sku: r.sku || null,
                    price: r.price || 0,
                    unit: r.unit || 'шт',
                    category: r.category || null,
                    supplier: r.supplier || null,
                    is_global: r.is_global ?? true,
                    _aiScore: 1,
                    _aiSource: 'smart-gpt',
                    _matchedKeyword: r.matchedKeyword
                }));
                setMaterials(aiMaterials);
                setTotalRecords(aiMaterials.length);
                setHasMore(false);
            } else {
                setMaterials([]);
                setTotalRecords(0);
                setHasMore(false);
            }
        } catch (error) {
            console.warn('⚠️ AI-поиск недоступен, fallback на SQL:', error.message);
            fetchMaterials(1, true, query);
        } finally {
            setLoading(false);
        }
    }, [globalFilter]);

    // Fetch Materials
    const fetchMaterials = async (pageNumber = 1, resetData = false, search = '') => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page: pageNumber,
                pageSize: search ? 1000 : (pageNumber === 1 ? INITIAL_PAGE_SIZE : PAGE_SIZE),
                skipCount: pageNumber > 1 ? 'true' : 'false'
            };
            if (globalFilter === 'global') params.isGlobal = 'true';
            if (globalFilter === 'tenant') params.isGlobal = 'false';
            if (search) params.search = search;

            const response = await materialsAPI.getAll(params);

            let newMaterials = [];
            if (response.data) {
                newMaterials = response.data.map(normalizeMaterial);
            } else {
                const data = Array.isArray(response) ? response : [];
                newMaterials = data.map(normalizeMaterial);
            }

            const total = response.total !== null && response.total !== undefined
                ? response.total
                : (totalRecords || response.count || newMaterials.length);
            setTotalRecords(total);

            if (resetData) {
                setMaterials(newMaterials);
                setPage(1);
                setHasMore(newMaterials.length < total);
            } else {
                setMaterials(prev => {
                    const updated = [...prev, ...newMaterials];
                    setHasMore(updated.length < total);
                    return updated;
                });
                setPage(pageNumber);
            }

        } catch (err) {
            console.error('Error loading materials:', err);
            setError('Не удалось загрузить материалы. Проверьте подключение к серверу.');
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };

    // Infinite Scroll
    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            fetchMaterials(page + 1, false);
        }
    }, [loading, hasMore, page]);

    // Debounced Search
    const debouncedSearch = useMemo(
        () => debounce((value) => {
            setSearchTerm(value);
            if (value.trim()) {
                setMaterials([]);
                setPage(1);
                aiSearchMaterials(value.trim());
            } else {
                setMaterials([]);
                setPage(1);
                fetchMaterials(1, true);
            }
        }, 400),
        [globalFilter, aiSearchMaterials]
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    // Effect on Global Filter Change
    useEffect(() => {
        storageService.set('materialsGlobalFilter', globalFilter);
        setSearchTerm('');
        fetchMaterials(1, true);
    }, [globalFilter]);

    // Infinite Scroll Observer
    useEffect(() => {
        if (!loadMoreTriggerRef.current || loading || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading && hasMore) {
                    loadMore();
                }
            },
            {
                root: scrollContainerRef.current,
                rootMargin: '0px 0px 2500px 0px',
                threshold: 0.01
            }
        );

        observer.observe(loadMoreTriggerRef.current);

        return () => {
            observer.disconnect();
        };
    }, [loading, hasMore, loadMore]);

    // CRUD Handlers
    const createMaterial = async (data) => {
        const optimisticMaterial = {
            ...data,
            id: `temp-${Date.now()}`,
            _optimistic: true
        };
        setMaterials([optimisticMaterial, ...materials]);

        try {
            const created = await materialsAPI.create({
                ...data,
                isGlobal: data.isGlobal
            });
            setMaterials(prev => prev.map(m => m.id === optimisticMaterial.id ? created : m));
            setTotalRecords(prev => prev + 1);
            success('Материал успешно создан', data.name);
        } catch (err) {
            setMaterials(prev => prev.filter(m => m.id !== optimisticMaterial.id));
            console.error('Error creating material:', err);
            showError('Ошибка при создании материала', err.response?.data?.message);
            throw err;
        }
    };

    const updateMaterial = async (id, data) => {
        const previousMaterials = [...materials];
        const optimisticUpdate = { ...data, _optimistic: true };
        setMaterials(materials.map(m => m.id === id ? optimisticUpdate : m));

        try {
            const updated = await materialsAPI.update(id, data);
            setMaterials(prev => prev.map(m => m.id === updated.id ? updated : m));
            success('Материал успешно обновлен', data.name);
        } catch (err) {
            setMaterials(previousMaterials);
            console.error('Error updating material:', err);
            showError('Ошибка при обновлении материала', err.response?.data?.message);
            throw err;
        }
    };

    const deleteMaterial = async (id, name) => {
        const previousMaterials = [...materials];
        setMaterials(materials.filter(m => m.id !== id));
        setTotalRecords(prev => Math.max(0, prev - 1));

        try {
            await materialsAPI.delete(id);
            success('Материал успешно удален', name);
        } catch (err) {
            setMaterials(previousMaterials);
            setTotalRecords(prev => prev + 1);
            console.error('Error deleting material:', err);
            showError('Ошибка при удалении материала', err.response?.data?.message);
        }
    };

    const refresh = () => fetchMaterials(1, true, searchTerm);

    return {
        materials,
        loading,
        initialLoading,
        error,
        hasMore,
        totalRecords,
        searchTerm,
        globalFilter,
        setGlobalFilter,
        onSearch: (value) => debouncedSearch(value),
        loadMore,
        refresh,
        createMaterial,
        updateMaterial,
        deleteMaterial,
        scrollContainerRef,
        loadMoreTriggerRef
    };
};
