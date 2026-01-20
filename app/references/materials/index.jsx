import React, { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import debounce from 'lodash.debounce';
import storageService from '@/shared/lib/services/storageService';
import Papa from 'papaparse';
// InfiniteScroll больше не используется - собственная реализация через Intersection Observer

// material-ui
import {
  Grid,
  Typography,
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
  FormControlLabel,
  Switch,
  Stack,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Card,
  CardContent,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconExternalLink, IconWorld, IconBuilding, IconUpload, IconDownload, IconDatabaseX } from '@tabler/icons-react';

// project imports
import EmptyState from './EmptyState';
import { emptyMaterial } from './mockData';
import materialsAPI from 'api/materials';
import materialsImportExportAPI from 'api/materialsImportExport';
import ImportDialog from 'shared/ui/components/ImportDialog';
import { highlightMatches } from 'shared/lib/utils/fullTextSearch';
import { useNotifications } from 'contexts/NotificationsContext';
import useAuth from 'shared/lib/hooks/useAuth';
import { MaterialsTable } from 'app/widgets';
import { useMaterialsTableData } from 'app/features/references/useMaterialsTableData';
import { HighlightText, formatPrice } from 'app/entities/material';

// Code Splitting: Lazy load MaterialDialog (загружается только при открытии)
const MaterialDialog = lazy(() => import('./MaterialDialog'));

// ==============================|| MATERIALS REFERENCE PAGE ||============================== //

const MaterialsReferencePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { success, error: showError, info: showInfo } = useNotifications();
  const { isSuperAdmin } = useAuth();

  // Feature Hook
  const {
      materials,
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
      createMaterial,
      updateMaterial,
      deleteMaterial,
      scrollContainerRef,
      loadMoreTriggerRef
  } = useMaterialsTableData();

  // Local State
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState(emptyMaterial);
  const [searchInput, setSearchInput] = useState('');

  // Управление видимостью колонок
  const [showImageColumn, setShowImageColumn] = useState(true);
  const [showSupplierColumn, setShowSupplierColumn] = useState(true);

  // Мемоизированные обработчики
  const handleOpenCreate = useCallback(() => {
    setEditMode(false);
    setCurrentMaterial({ ...emptyMaterial, isGlobal: globalFilter === 'global' });
    setOpenDialog(true);
  }, [globalFilter]);

  const handleOpenEdit = useCallback((material) => {
    setEditMode(true);
    setCurrentMaterial({ ...material });
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setCurrentMaterial(emptyMaterial);
  }, []);

  const handleSaveMaterial = async () => {
      try {
          if (editMode) {
              await updateMaterial(currentMaterial.id, currentMaterial);
          } else {
              await createMaterial(currentMaterial);
          }
          handleCloseDialog();
      } catch (err) {
          // Error handled in hook
      }
  };

  const handleDelete = async (id) => {
      if (window.confirm('Вы уверены, что хотите удалить этот материал?')) {
          await deleteMaterial(id, materials.find(m => m.id === id)?.name);
      }
  };

  const handleDeleteFromDialog = async () => {
      if (currentMaterial.id && window.confirm('Вы уверены, что хотите удалить этот материал?')) {
          await deleteMaterial(currentMaterial.id, currentMaterial.name);
          handleCloseDialog();
      }
  };

  const handleFieldChange = (field, value) => {
    setCurrentMaterial({ ...currentMaterial, [field]: value });
  };

  // Открыть диалог импорта
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleOpenImport = () => {
    setOpenImportDialog(true);
  };

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
              'Артикул': 'sku',
              'Наименование': 'name',
              'Название': 'name',
              'Категория': 'category',
              'Категория LV1': 'categoryLv1',
              'Категория LV2': 'categoryLv2',
              'Категория LV3': 'categoryLv3',
              'Категория LV4': 'categoryLv4',
              'LV1': 'categoryLv1',
              'LV2': 'categoryLv2',
              'LV3': 'categoryLv3',
              'LV4': 'categoryLv4',
              'Подкатегория': 'categoryLv2',
              'Группа': 'categoryLv3',
              'Единица измерения': 'unit',
              'Ед. изм.': 'unit',
              'Ед': 'unit',
              'Цена': 'price',
              'Стоимость': 'price',
              'Поставщик': 'supplier',
              'Бренд': 'supplier',
              'Производитель': 'supplier',
              'Вес (кг)': 'weight',
              'Вес': 'weight',
              'URL изображения': 'image',
              'Ссылка на изображение': 'image',
              'Изображение': 'image',
              'Фото': 'image',
              'Фотография': 'image',
              'Картинка': 'image',
              'Изображение товара': 'image',
              'URL товара': 'productUrl',
              'Ссылка на товар': 'productUrl',
              'Ссылка': 'productUrl',
              'Сайт': 'productUrl',
              'Показывать изображение': 'showImage',
              'image': 'image',
              'imageUrl': 'image',
              'image_url': 'image'
            };

            const materialsToImport = rows.map(row => {
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
                sku: String(normalized.sku || '').trim(),
                name: String(normalized.name || '').trim(),
                unit: normalized.unit?.trim() || 'шт',
                price: parseFloat(String(normalized.price || '0').replace(/,/g, '.').replace(/\s/g, '')) || 0,
                // Новая структура категорий
                category: normalized.category?.trim(),
                categoryLv1: normalized.categoryLv1?.trim(),
                categoryLv2: normalized.categoryLv2?.trim(),
                categoryLv3: normalized.categoryLv3?.trim(),
                categoryLv4: normalized.categoryLv4?.trim(),
                supplier: normalized.supplier?.trim() || '',
                weight: parseFloat(String(normalized.weight || '0').replace(/,/g, '.').replace(/\s/g, '')) || 0,
                image: normalized.image?.trim() || '',
                productUrl: normalized.productUrl?.trim() || '',
                showImage: normalized.showImage === undefined ? true : (normalized.showImage === 'да' || normalized.showImage === 'true' || normalized.showImage === true)
              };
            }).filter(m => m.sku && m.name);

            const total = materialsToImport.length;
            const CHUNK_SIZE = 500;
            let successful = 0;
            let failed = 0;
            const allErrors = [];

            // В режиме 'Update' (replace) МЫ НЕ МЕНЯЕМ МОДУ НА 'add', 
            // так как сервер теперь умеет делать Upsert (Insert or Update).
            const importMode = options.mode;

            for (let i = 0; i < materialsToImport.length; i += CHUNK_SIZE) {
              const chunk = materialsToImport.slice(i, i + CHUNK_SIZE);

              const result = await materialsAPI.bulkImport({
                materials: chunk,
                mode: importMode,
                isGlobal: options.isGlobal
              });

              successful += result.successCount || 0;
              failed += result.errorCount || 0;

              const serverErrors = result.errors || result.failedItems;
              if (serverErrors) {
                allErrors.push(...serverErrors.map(err => ({
                  row: i + (err.index !== undefined ? err.index : 0) + 2,
                  error: err.error
                })));
              }

              if (setProgress) {
                setProgress({ current: Math.min(i + CHUNK_SIZE, total), total });
              }
            }

            // ✅ Сигнализируем всем компонентам, что данные обновились и нужна синхронизация
            localStorage.setItem('materials_need_sync', 'true');

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
    fetchMaterials(1, true); // Перезагрузить список материалов с первой страницы
    success('Материалы успешно импортированы');
  };

  // Экспорт материалов
  const handleExport = async () => {
    try {
      setIsExporting(true);
      showInfo('Подготовка файла экспорта...');
      await materialsImportExportAPI.exportMaterials({
        isGlobal: globalFilter === 'global' ? 'true' : 'false'
      });
      success('Файл экспорта успешно сформирован');
    } catch (err) {
      console.error('Export error:', err);
      showError('Ошибка при экспорте материалов', err.message);
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

    if (!window.confirm('⚠️ ВНИМАНИЕ! Вы уверены, что хотите УДАЛИТЬ ВСЕ материалы и категории? Это действие необратимо!')) {
      return;
    }

    try {
      setIsClearing(true);
      const response = await materialsAPI.clearAll();
      localStorage.setItem('materials_need_sync', 'true');
      success(response.message || 'Справочник материалов очищен');
      fetchMaterials(1, true);
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

  // Loading state
  if (initialLoading) {
    return (
      <Box sx={{ bgcolor: '#F3F4F6', minHeight: '100vh', p: 3 }}>
        <Paper elevation={0} sx={{ bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        </Paper>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ bgcolor: '#F3F4F6', minHeight: '100vh', p: 3 }}>
        <Paper elevation={0} sx={{ bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', p: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={fetchMaterials} size="small">
            Повторить попытку
          </Button>
        </Paper>
      </Box>
    );
  }

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
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1F2937' }} data-testid="materials-title">
            Строительные материалы
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
                  data-testid="materials-import-btn"
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
                  <Tooltip title="Удалить ВСЕ материалы и категории">
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={isClearing ? <CircularProgress size={14} /> : <IconDatabaseX size={16} />}
                      onClick={handleClearAll}
                      disabled={isClearing}
                      data-testid="materials-clear-all-btn"
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
                  data-testid="materials-add-btn"
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

        {/* Поиск и фильтр по типу */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
          <TextField
            fullWidth
            placeholder="Поиск по названию, коду, поставщику или единице измерения..."
            value={searchInput}
            onChange={(e) => {
              const value = e.target.value;
              setSearchInput(value);
              debouncedSearch(value);
            }}
            data-testid="materials-search"
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
            title={globalFilter === 'global' ? 'Глобальные материалы' : 'Мои материалы'}
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

        {/* Переключатели и Статистика на одной линии */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={showImageColumn}
                  onChange={(e) => setShowImageColumn(e.target.checked)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#6366F1' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#6366F1' }
                  }}
                />
              }
              label={<Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Фото</Typography>}
              sx={{ m: 0 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showSupplierColumn}
                  onChange={(e) => setShowSupplierColumn(e.target.checked)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#6366F1' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#6366F1' }
                  }}
                />
              }
              label={<Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>Поставщик</Typography>}
              sx={{ m: 0 }}
            />
          </Stack>

          <Typography sx={{ fontSize: '0.8125rem', color: '#9CA3AF', fontWeight: 500 }}>
            {searchTerm ? (
              <>Найдено: <Box component="span" sx={{ color: '#4B5563' }}>{filteredMaterials.length}</Box></>
            ) : (
              <>Загружено: <Box component="span" sx={{ color: '#4B5563' }}>{materials.length}</Box> из {totalRecords}</>
            )}
            <Box component="span" sx={{ mx: 1, color: '#E5E7EB' }}>|</Box>
            Категорий: <Box component="span" sx={{ color: '#4B5563' }}>{new Set(materials.map((m) => m.category)).size}</Box>
          </Typography>
        </Box>

        {/* Таблица материалов или карточки - занимает оставшееся пространство */}
        <Box sx={{ flex: 1, minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {materials.length > 0 ? (
            isMobile ? (
              // 📱 Мобильная версия - карточки с автозагрузкой
              <Box
                id="materials-mobile-container"
                ref={scrollContainerRef}
                sx={{ flex: 1, overflow: 'auto' }}
              >
                {materials.map((material) => (
                  <Box key={material.id} sx={{ mb: 1.5 }}>
                    <Card sx={{ width: '100%', border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                      <CardContent sx={{ p: 2, pb: 1, '&:last-child': { pb: 1 } }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          {/* Изображение слева */}
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              flexShrink: 0,
                              borderRadius: 1,
                              overflow: 'hidden',
                              bgcolor: '#F9FAFB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {material.image ? (
                              <Box
                                component="img"
                                src={material.image}
                                alt={material.name}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                                Нет фото
                              </Typography>
                            )}
                          </Box>

                          {/* Контент справа */}
                          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                            {/* Заголовок с бейджем */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151', mb: 0.25, wordBreak: 'break-word', lineHeight: 1.3 }}>
                                  <HighlightText text={material.name} query={searchTerm} />
                                </Typography>
                                <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                  <HighlightText text={material.sku} query={searchTerm} />
                                </Typography>
                              </Box>
                              {material.isGlobal && (
                                <IconWorld size={14} style={{ color: '#9CA3AF' }} />
                              )}
                            </Box>

                            {/* Компактная сетка параметров */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr', gap: 1.5, alignItems: 'center', mt: 'auto' }}>
                              <Box>
                                <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Ед. изм:</Typography>
                                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#374151', ml: 0.5, display: 'inline' }}>
                                  {material.unit}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Вес:</Typography>
                                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#374151', ml: 0.5, display: 'inline' }}>
                                  {material.weight} кг
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
                                  {material.price != null && !isNaN(Number(material.price))
                                    ? formatPrice(Number(material.price))
                                    : '—'}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Поставщик (если есть) */}
                            {showSupplierColumn && material.supplier && (
                              <Box sx={{ mt: 0.5 }}>
                                <Typography sx={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                  Поставщик: <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#374151' }}>{material.supplier}</Typography>
                                </Typography>
                              </Box>
                            )}

                            {/* Действия */}
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end', mt: 1 }}>
                              {material.productUrl && (
                                <IconButton
                                  size="small"
                                  onClick={() => window.open(material.productUrl, '_blank')}
                                  sx={{ color: '#6B7280', '&:hover': { color: '#374151', bgcolor: '#F3F4F6' } }}
                                >
                                  <IconExternalLink size={16} />
                                </IconButton>
                              )}
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEdit(material)}
                                sx={{ color: '#6B7280', '&:hover': { color: '#374151', bgcolor: '#F3F4F6' } }}
                              >
                                <IconEdit size={16} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(material.id)}
                                sx={{ color: '#EF4444', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}
                              >
                                <IconTrash size={16} />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}

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
                {!hasMore && materials.length > 0 && (
                  <Typography sx={{ textAlign: 'center', py: 2, color: '#9CA3AF', fontSize: '0.875rem' }}>
                    {searchTerm ? `Найдено: ${materials.length}` : `Загружено всё (${materials.length} из ${totalRecords})`}
                  </Typography>
                )}
              </Box>
            ) : (
              // 🖥️ Десктопная версия - таблица с автозагрузкой
              <MaterialsTable
                materials={materials}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                isLoading={loading}
                hasMore={hasMore}
                loadMoreTriggerRef={loadMoreTriggerRef}
                searchTerm={searchTerm}
                showImageColumn={showImageColumn}
                showSupplierColumn={showSupplierColumn}
              />
            )
          ) : materials.length === 0 ? (
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

        {/* Модальное окно создания/редактирования материала (Code Splitting) */}
        {openDialog && (
          <Suspense fallback={<CircularProgress />}>
            <MaterialDialog
              open={openDialog}
              editMode={editMode}
              material={currentMaterial}
              onClose={handleCloseDialog}
              onSave={handleSaveMaterial}
              onDelete={handleDeleteFromDialog}
              onChange={handleFieldChange}
            />
          </Suspense>
        )}

        {/* Диалог импорта материалов */}
        <ImportDialog
          open={openImportDialog}
          onClose={handleCloseImport}
          onImport={handleImport}
          onDownloadTemplate={materialsImportExportAPI.downloadTemplate}
          onSuccess={handleImportSuccess}
          isGlobal={globalFilter === 'global'}
          title="Импорт материалов из CSV"
          description="📄 Загрузите CSV файл с материалами. Обязательные поля: Артикул, Наименование. Дополнительные: Категория, Ед изм, Цена, Поставщик."
        />
      </Paper>
    </Box>
  );
};

export default MaterialsReferencePage;
