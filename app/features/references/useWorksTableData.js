import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import debounce from 'lodash.debounce';
import storageService from '@/shared/lib/services/storageService';
import worksAPI from 'api/works';
import searchAPI from 'api/search';
import { useNotifications } from 'contexts/NotificationsContext';

const INITIAL_PAGE_SIZE = 30;
const PAGE_SIZE = 30;

export const useWorksTableData = () => {
    const { success, error: showError } = useNotifications();

    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [globalFilter, setGlobalFilter] = useState(() => {
        return storageService.get('worksGlobalFilter', 'global');
    });

    const scrollContainerRef = useRef(null);
    const loadMoreTriggerRef = useRef(null);

    const aiSearchWorks = useCallback(async (query) => {
        try {
            setLoading(true);
            const aiResponse = await searchAPI.smartWorks(query, {
                limit: 100,
                scope: globalFilter
            });

            if (aiResponse.success && aiResponse.results?.length > 0) {
                const aiWorks = aiResponse.results.map(r => ({
                    id: r.id,
                    code: r.code || null,
                    name: r.name,
                    category: r.category || null,
                    unit: r.unit || 'шт',
                    base_price: r.price || 0,
                    is_global: r.is_global ?? true,
                    _aiScore: 1,
                    _aiSource: 'smart-gpt',
                    _matchedKeyword: r.matchedKeyword
                }));
                setWorks(aiWorks);
                setTotalRecords(aiWorks.length);
                setHasMore(false);
            } else {
                setWorks([]);
                setTotalRecords(0);
                setHasMore(false);
            }
        } catch (error) {
            console.warn('⚠️ AI-поиск недоступен, fallback на SQL:', error.message);
            fetchWorks(1, true, query);
        } finally {
            setLoading(false);
        }
    }, [globalFilter]);

    const fetchWorks = async (pageNumber = 1, resetData = false, search = '') => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page: pageNumber,
                pageSize: search ? 1000 : (pageNumber === 1 ? INITIAL_PAGE_SIZE : PAGE_SIZE),
            };

            if (globalFilter === 'global') params.isGlobal = 'true';
            if (globalFilter === 'tenant') params.isGlobal = 'false';
            if (search) params.search = search;

            const response = await worksAPI.getAll(params);
            const newWorks = response.data || (Array.isArray(response) ? response : []);
            const total = response.total || response.count || newWorks.length;

            setTotalRecords(total);

            if (resetData) {
                setWorks(newWorks);
                setHasMore(newWorks.length < total);
            } else {
                setWorks(prev => {
                    const updated = [...prev, ...newWorks];
                    setHasMore(updated.length < total);
                    return updated;
                });
            }

        } catch (err) {
            console.error('Error loading works:', err);
            setError('Ошибка загрузки данных. Проверьте подключение к серверу.');
            setHasMore(false);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchWorks(nextPage, false);
        }
    }, [loading, hasMore, page]);

    const debouncedSearch = useMemo(
        () => debounce((value) => {
            setSearchTerm(value);
            if (value.trim()) {
                setWorks([]);
                setPage(1);
                aiSearchWorks(value.trim());
            } else {
                setWorks([]);
                setPage(1);
                fetchWorks(1, true);
            }
        }, 400),
        [globalFilter, aiSearchWorks]
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    useEffect(() => {
        storageService.set('worksGlobalFilter', globalFilter);
        setWorks([]);
        setPage(1);
        setHasMore(true);
        setTotalRecords(0);
        setSearchTerm('');
        fetchWorks(1, true);
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

    // CRUD
    const createWork = async (data) => {
        const optimisticWork = {
            ...data,
            id: `temp-${Date.now()}`,
            _optimistic: true
        };
        setWorks([optimisticWork, ...works]);

        try {
            const created = await worksAPI.create({
                code: data.code,
                name: data.name,
                unit: data.unit,
                basePrice: data.basePrice,
                phase: data.phase || null,
                section: data.section || null,
                subsection: data.subsection || null,
                isGlobal: data.isGlobal
            });
            setWorks(prev => prev.map(w => w.id === optimisticWork.id ? created : w));
            setTotalRecords(prev => prev + 1);
            success('Работа успешно создана', data.name);
        } catch (err) {
            setWorks(prev => prev.filter(w => w.id !== optimisticWork.id));
            console.error('Error creating work:', err);
            showError('Ошибка при создании работы', err.response?.data?.message);
            throw err;
        }
    };

    const updateWork = async (id, data) => {
        const previousWorks = [...works];
        const optimisticUpdate = { ...data, _optimistic: true };
        setWorks(works.map((w) => (w.id === id ? optimisticUpdate : w)));

        try {
            const updated = await worksAPI.update(id, {
                code: data.code,
                name: data.name,
                unit: data.unit,
                basePrice: data.basePrice,
                phase: data.phase || null,
                section: data.section || null,
                subsection: data.subsection || null
            });
            setWorks(prev => prev.map((w) => (w.id === updated.id ? updated : w)));
            success('Работа успешно обновлена', data.name);
        } catch (err) {
            setWorks(previousWorks);
            console.error('Error updating work:', err);
            showError('Ошибка при обновлении работы', err.response?.data?.message);
            throw err;
        }
    };

    const deleteWork = async (id, name) => {
        const previousWorks = [...works];
        setWorks(works.filter(w => w.id !== id));
        setTotalRecords(prev => Math.max(0, prev - 1));

        try {
            await worksAPI.delete(id);
            success('Работа успешно удалена', name);
        } catch (err) {
            setWorks(previousWorks);
            setTotalRecords(prev => prev + 1);
            console.error('Error deleting work:', err);
            showError('Ошибка удаления работы', err.response?.data?.message);
        }
    };

    const refresh = () => fetchWorks(1, true, searchTerm);

    return {
        works,
        loading,
        initialLoading,
        error,
        hasMore,
        totalRecords,
        searchTerm,
        globalFilter,
        setGlobalFilter,
        onSearch: (value) => {
            // Updating input value is handled by page via searchTerm, wait...
            // The page has searchInput and searchTerm. This hook exposes logic for searchTerm.
            debouncedSearch(value);
        },
        loadMore,
        refresh,
        createWork,
        updateWork,
        deleteWork,
        scrollContainerRef,
        loadMoreTriggerRef
    };
};
