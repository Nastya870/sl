import React, { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import debounce from 'lodash.debounce';
import storageService from '@/shared/lib/services/storageService';
import Papa from 'papaparse';
// InfiniteScroll больше не используется - собственная реализация через Intersection Observer

// material-ui
import {
  Grid,
  Typography,
  Divider,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Tooltip,
  Card,
  CardContent,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconWorld, IconBuilding, IconDownload, IconUpload, IconDatabaseX } from '@tabler/icons-react';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import EmptyState from './EmptyState';
import { emptyWork } from './mockData';
import worksAPI from 'api/works';
import worksImportExportAPI from 'api/worksImportExport';
import ImportDialog from 'shared/ui/components/ImportDialog';
import { useNotifications } from 'contexts/NotificationsContext';
import useAuth from 'shared/lib/hooks/useAuth';
import { WorksTable } from 'app/widgets';
import { useWorksTableData } from 'app/features/references/useWorksTableData';
import { formatPrice } from 'app/entities/work';

// Code Splitting: Lazy load WorkDialog (загружается только при открытии)
const WorkDialog = lazy(() => import('./WorkDialog'));

// ==============================|| WORKS REFERENCE PAGE ||============================== //

const WorksReferencePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { success, error: showError, info: showInfo } = useNotifications();
  const { isSuperAdmin } = useAuth();

  // Feature Hook
  const {
      works,
      loading,
      initialLoading,
      error,
      hasMore,
      totalRecords,
      searchTerm,
      globalFilter,
      setGlobalFilter,
      onSearch,
      loadMore,
      refresh,
      createWork,
      updateWork,
      deleteWork,
      scrollContainerRef,
      loadMoreTriggerRef
  } = useWorksTableData();

  // Local State
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentWork, setCurrentWork] = useState(emptyWork);
  const [searchInput, setSearchInput] = useState('');
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Мемоизированные обработчики (стабильные функции, не пересоздаются при каждом рендере)
  const handleOpenCreate = useCallback(() => {
    setEditMode(false);
    setCurrentWork({ ...emptyWork, isGlobal: globalFilter === 'global' });
    setOpenDialog(true);
  }, [globalFilter]);

  const handleOpenEdit = useCallback((work) => {
    setEditMode(true);
    setCurrentWork({ ...work });
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setCurrentWork(emptyWork);
  }, []);

  const handleSaveWork = async () => {
      try {
          if (editMode) {
              await updateWork(currentWork.id, currentWork);
          } else {
              await createWork(currentWork);
          }
          handleCloseDialog();
      } catch (err) {
          // Error handled in hook
      }
  };

  const handleDelete = async (id) => {
      if (window.confirm('Вы уверены, что хотите удалить эту работу?')) {
          await deleteWork(id, works.find(w => w.id === id)?.name);
      }
  };

  const handleDeleteFromDialog = async () => {
      if (currentWork.id && window.confirm('Вы уверены, что хотите удалить эту работу?')) {
          await deleteWork(currentWork.id, currentWork.name);
          handleCloseDialog();
      }
  };

  const handleFieldChange = (field, value) => {
    setCurrentWork({ ...currentWork, [field]: value });
  };

  // Открыть диалог импорта

  const handleOpenImport = () => {
    setOpenImportDialog(true);
  };

  // Закрыть диалог импорта
  const handleCloseImport = () => {
    setOpenImportDialog(false);
  };

  // Массовый импорт с прогрессом
  const handleImport = async (file, options, setProgress) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (parseResult) => {
          try {
            const rows = parseResult.data;
            if (rows.length === 0) return reject(new Error('Файл пуст'));

            const fieldMapping = {
              'Код': 'code',
              'Артикул': 'code',
              'Наименование': 'name',
              'Название': 'name',
              'Единица измерения': 'unit',
              'Ед. изм.': 'unit',
              'Базовая цена': 'basePrice',
              'Цена': 'basePrice',
              'Стоимость': 'basePrice',
              'Фаза': 'phase',
              'Раздел': 'section',
              'Подраздел': 'subsection',
              'Категория': 'phase',
              'Группа': 'phase'
            };

            const worksToImport = rows.map(row => {
              const normalized = {};
              // Приводим все заголовки к нижнему регистру для надежного поиска
              const lowerCaseRow = {};
              Object.keys(row).forEach(k => {
                lowerCaseRow[k.trim().toLowerCase()] = row[k];
              });

              const lowerCaseMapping = {};
              Object.keys(fieldMapping).forEach(k => {
                lowerCaseMapping[k.toLowerCase()] = fieldMapping[k];
              });

              Object.keys(lowerCaseRow).forEach(key => {
                const mappedKey = lowerCaseMapping[key] || key;
                normalized[mappedKey] = lowerCaseRow[key];
              });

              return {
                code: String(normalized.code || '').trim(),
                name: String(normalized.name || '').trim(),
                unit: normalized.unit?.trim() || 'шт',
                basePrice: parseFloat(String(normalized.basePrice || '0').replace(/,/g, '.').replace(/\s/g, '')) || 0,
                phase: normalized.phase?.trim() || '',
                section: normalized.section?.trim() || '',
                subsection: normalized.subsection?.trim() || ''
              };
            }).filter(w => w.code && w.name);

            const total = worksToImport.length;
            const CHUNK_SIZE = 500;
            let successful = 0;
            let failed = 0;
            const allErrors = [];

            // В режиме 'Update' (replace) МЫ НЕ МЕНЯЕМ МОДУ НА 'add', 
            // так как сервер теперь умеет делать Upsert (Insert or Update).
            const importMode = options.mode;

            for (let i = 0; i < worksToImport.length; i += CHUNK_SIZE) {
              const chunk = worksToImport.slice(i, i + CHUNK_SIZE);

              const result = await worksAPI.bulkImport({
                works: chunk,
                mode: importMode,
                isGlobal: options.isGlobal
              });

              successful += result.successCount || 0;
              failed += result.errorCount || 0;
              if (result.errors) {
                allErrors.push(...result.errors.map(err => ({
                  row: i + (err.index !== undefined ? err.index : 0) + 2,
                  error: err.error
                })));
              }

              if (setProgress) {
                setProgress({ current: Math.min(i + CHUNK_SIZE, total), total });
              }
            }

            resolve({
              success: true,
              successCount: successful,
              errorCount: failed,
              errors: allErrors
            });
          } catch (err) {
            reject(err);
          }
        },
        error: reject
      });
    });
  };

  const handleImportSuccess = () => {
    // ✅ Сигнализируем Смете, что данные обновились и нужна инвалидация кеша
    localStorage.setItem('works_need_sync', 'true');
    fetchWorks(1, true); // Перезагрузить список работ с первой страницы
    success('Работы успешно импортированы');
  };

  // Экспорт работ
  const handleExport = async () => {
    try {
      setIsExporting(true);
      showInfo('Подготовка файла экспорта...');
      await worksImportExportAPI.exportWorks({
        isGlobal: globalFilter === 'global' ? 'true' : 'false'
      });
      success('Файл экспорта успешно сформирован');
    } catch (err) {
      console.error('Export error:', err);
      showError('Ошибка при экспорте работ', err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Очистить весь справочник (ТОЛЬКО для суперадмина)
  const [isClearing, setIsClearing] = useState(false);
  const handleClearAll = async () => {
    if (!isSuperAdmin) {
      showError('Только суперадмин может очистить справочник');
      return;
    }

    if (!window.confirm('⚠️ ВНИМАНИЕ! Вы уверены, что хотите УДАЛИТЬ ВСЕ работы и категории? Это действие необратимо!')) {
      return;
    }

    try {
      setIsClearing(true);
      const response = await worksAPI.clearAll();
      localStorage.setItem('works_need_sync', 'true');
      success(response.message || 'Справочник работ очищен');
      fetchWorks(1, true);
    } catch (err) {
      console.error('Clear all error:', err);
      showError('Ошибка при очистке справочника', err.message);
    } finally {
      setIsClearing(false);
    }
  };

  // Форматирование цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <Box sx={{ bgcolor: '#F3F4F6', height: '100vh', p: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden'
        }}
      >
        {/* Шапка и Кнопки управления */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, gap: 2, flexWrap: 'wrap' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1F2937' }} data-testid="works-title">
            Виды работ
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {(globalFilter === 'tenant' || isSuperAdmin) && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <IconDownload size={16} />}
                  onClick={handleExport}
                  disabled={isExporting}
                  sx={{
                    textTransform: 'none',
                    height: 32,
                    fontSize: '0.8125rem',
                    borderColor: '#E5E7EB',
                    color: '#4B5563',
                    '&:hover': { borderColor: '#D1D5DB', bgcolor: '#F9FAFB' }
                  }}
                >
                  {isExporting ? 'Экспорт...' : 'Экспорт'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<IconUpload size={16} />}
                  onClick={handleOpenImport}
                  sx={{
                    textTransform: 'none',
                    height: 32,
                    fontSize: '0.8125rem',
                    borderColor: '#E5E7EB',
                    color: '#4B5563',
                    '&:hover': { borderColor: '#D1D5DB', bgcolor: '#F9FAFB' }
                  }}
                >
                  Импорт
                </Button>
                {isSuperAdmin && (
                  <Tooltip title="Удалить ВСЕ работы и категории">
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={isClearing ? <CircularProgress size={14} /> : <IconDatabaseX size={16} />}
                      onClick={handleClearAll}
                      disabled={isClearing}
                      sx={{
                        textTransform: 'none',
                        height: 32,
                        fontSize: '0.8125rem',
                        borderColor: '#FECACA',
                        color: '#DC2626',
                        '&:hover': { borderColor: '#F87171', bgcolor: '#FEF2F2' }
                      }}
                    >
                      Очистить
                    </Button>
                  </Tooltip>
                )}
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<IconPlus size={16} />}
                  onClick={handleOpenCreate}
                  sx={{
                    textTransform: 'none',
                    height: 32,
                    fontSize: '0.8125rem',
                    bgcolor: '#6366F1',
                    '&:hover': { bgcolor: '#4F46E5' }
                  }}
                >
                  Добавить
                </Button>
              </>
            )}
          </Stack>
        </Box>

        {/* Ошибка загрузки */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Индикатор загрузки */}
        {initialLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Контент */}
        {!initialLoading && (
          <>
            {/* Поиск и фильтр по типу */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
              <TextField
                fullWidth
                placeholder="Поиск по названию, коду или единице измерения..."
                value={searchInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchInput(value);
                  debouncedSearch(value);
                }}
                data-testid="works-search"
                size="small"
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    height: 38,
                    bgcolor: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    '& fieldset': { borderColor: '#E5E7EB' },
                    '&:hover fieldset': { borderColor: '#D1D5DB' },
                    '&.Mui-focused fieldset': { borderColor: '#6366F1' }
                  },
                  '& .MuiInputBase-input': {
                    color: '#374151',
                    py: 0.75,
                    '&::placeholder': { color: '#9CA3AF', opacity: 1 }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={18} style={{ color: '#9CA3AF' }} />
                    </InputAdornment>
                  )
                }}
              />

              {/* Toggle Switch - фиолетовый стиль, высота 32px */}
              <Tooltip
                title={globalFilter === 'global' ? 'Глобальные работы' : 'Мои работы'}
                arrow
                placement="top"
              >
                <Box
                  onClick={() => setGlobalFilter(globalFilter === 'global' ? 'tenant' : 'global')}
                  sx={{
                    position: 'relative',
                    width: 76,
                    height: 32,
                    bgcolor: '#F3E8FF',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#EDE9FE'
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 2,
                      left: globalFilter === 'global' ? 2 : 'calc(50% - 2px)',
                      width: 'calc(50% - 2px)',
                      height: 28,
                      bgcolor: '#EDE9FE',
                      borderRadius: '4px',
                      transition: 'left 0.2s ease',
                      border: '1px solid #C4B5FD'
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '50%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}
                  >
                    <IconWorld
                      size={16}
                      style={{
                        color: globalFilter === 'global' ? '#5B21B6' : '#6B7280'
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '50%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}
                  >
                    <IconBuilding
                      size={16}
                      style={{
                        color: globalFilter === 'tenant' ? '#5B21B6' : '#6B7280'
                      }}
                    />
                  </Box>
                </Box>
              </Tooltip>
            </Box>

            {/* Статистика */}
            <Box sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: '0.8125rem', color: '#9CA3AF', fontWeight: 500 }}>
                {searchTerm ? (
                  <>Найдено: <Box component="span" sx={{ color: '#4B5563' }}>{filteredWorks.length}</Box></>
                ) : (
                  <>Загружено: <Box component="span" sx={{ color: '#4B5563' }}>{works.length}</Box> из {totalRecords}</>
                )}
              </Typography>
            </Box>

            {/* Таблица работ или карточки - занимает оставшееся пространство */}
            <Box sx={{ flex: 1, minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {works.length > 0 ? (
                isMobile ? (
                  // � Мобильная версия - карточки с автозагрузкой
                  <Box
                    id="works-mobile-container"
                    ref={scrollContainerRef}
                    sx={{ flex: 1, overflow: 'auto' }}
                  >
                    {works.map((work, index) => {
                      const hierarchyParts = [work.phase, work.section, work.subsection].filter(Boolean);
                      const hierarchyText = hierarchyParts.length > 0 ? hierarchyParts.join(' → ') : null;

                      return (
                        <Box key={work.id} sx={{ mb: 2 }}>
                          <Card sx={{ width: '100%', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                            <CardContent sx={{ pb: 1 }}>
                              <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5, wordBreak: 'break-word', color: '#374151' }}>
                                      {work.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                      Код: {work.code}
                                    </Typography>
                                  </Box>
                                  {work.isGlobal && (
                                    <IconWorld size={14} style={{ color: '#9CA3AF' }} />
                                  )}
                                </Box>

                                {hierarchyText && (
                                  <Box sx={{ bgcolor: '#F9FAFB', px: 1.5, py: 0.75, borderRadius: 1 }}>
                                    <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                      {hierarchyText}
                                    </Typography>
                                  </Box>
                                )}

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
                                  <Box>
                                    <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }} display="block">
                                      Ед. изм.
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                                      {work.unit}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'right' }}>
                                    <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }} display="block">
                                      Базовая цена
                                    </Typography>
                                    <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
                                      {work.basePrice != null && !isNaN(Number(work.basePrice))
                                        ? formatPrice(Number(work.basePrice))
                                        : '—'}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Действия */}
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', mt: 1 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenEdit(work)}
                                    sx={{ color: '#6B7280', '&:hover': { color: '#374151', bgcolor: '#F3F4F6' } }}
                                  >
                                    <IconEdit size={16} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDelete(work.id)}
                                    sx={{ color: '#EF4444', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}
                                  >
                                    <IconTrash size={16} />
                                  </IconButton>
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Box>
                      );
                    })}

                    {/* Триггер для автозагрузки через Intersection Observer */}
                    {hasMore && (
                      <Box
                        ref={loadMoreTriggerRef}
                        sx={{ height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}
                      >
                        {loading && <CircularProgress size={20} thickness={4} sx={{ color: '#3B82F6' }} />}
                      </Box>
                    )}

                    {/* Сообщение когда всё загружено */}
                    {!hasMore && works.length > 0 && (
                      <Typography sx={{ textAlign: 'center', py: 2, color: '#9CA3AF', fontSize: '0.875rem' }}>
                        {searchTerm ? `Найдено: ${works.length}` : `Загружено всё (${works.length} из ${totalRecords})`}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  // 🖥️ Десктопная версия - таблица с автозагрузкой
                  <WorksTable
                    works={works}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                    isLoading={loading}
                    hasMore={hasMore}
                    loadMoreTriggerRef={loadMoreTriggerRef}
                  />
                )
              ) : works.length === 0 ? (
                <EmptyState onCreateClick={handleOpenCreate} />
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: '#6B7280' }}>
                    Ничего не найдено
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: '#9CA3AF', mt: 0.5 }}>
                    Попробуйте изменить критерии поиска
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Модальное окно создания/редактирования работы (Code Splitting) */}
            {openDialog && (
              <Suspense fallback={<CircularProgress />}>
                <WorkDialog
                  open={openDialog}
                  editMode={editMode}
                  work={currentWork}
                  onClose={handleCloseDialog}
                  onSave={handleSaveWork}
                  onDelete={handleDeleteFromDialog}
                  onChange={handleFieldChange}
                />
              </Suspense>
            )}

            {/* Диалог импорта */}
            <ImportDialog
              open={openImportDialog}
              onClose={handleCloseImport}
              onImport={handleImport}
              onDownloadTemplate={worksImportExportAPI.downloadTemplate}
              onSuccess={handleImportSuccess}
              isGlobal={globalFilter === 'global'}
              title="Импорт работ из CSV"
              description="📄 Загрузите CSV файл с работами. Обязательные поля: Код, Наименование. Дополнительные: Ед изм, Базовая цена, Фаза, Раздел, Подраздел."
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default WorksReferencePage;
