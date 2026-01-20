import React from 'react';
import PropTypes from 'prop-types';

// material-ui
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  IconShoppingCart,
  IconDeviceFloppy,
  IconRefresh,
  IconPackage,
  IconPlus,
  IconUpload,
  IconDownload
} from '@tabler/icons-react';

// Shared
import { estimateColors as colors } from 'shared/ui/themes/estimateStyle';

// Hooks
import { useEstimatePurchases } from 'app/features/estimates/useEstimatePurchases';

// Components
import AddPurchaseDialog from './components/AddPurchaseDialog';
import ExtraMaterialDialog from './components/ExtraMaterialDialog';
import EstimatePurchasesTable from 'app/widgets/EstimatePurchasesTable';
import PurchasesSummary from './components/PurchasesSummary';
import ImportDialog from 'shared/ui/components/ImportDialog';
import { useNotifications } from 'contexts/NotificationsContext';

const Purchases = ({ estimateId, projectId }) => {
  const {
    loading,
    purchasesGenerated,
    regularMaterials,
    extraMaterials,
    totalAmount,
    totalActualAmount,
    addDialogOpen,
    addExtraMaterialDialogOpen,
    selectedMaterial,
    purchaseForm,
    setPurchaseForm,
    extraMaterialForm,
    setExtraMaterialForm,
    materials,
    loadingMaterials,
    submitting,
    error,
    handleGeneratePurchases,
    handleOpenAddDialog,
    handleCloseAddDialog,
    handleOpenExtraMaterialDialog,
    handleCloseExtraMaterialDialog,
    handleAddToGlobalPurchases,
    handleAddExtraMaterial,
    getPurchaseStatus,
    exportingCSV,
    openImportDialog,
    setOpenImportDialog,
    handleExportCSV,
    handleImportCSV,
    handleImportSuccess
  } = useEstimatePurchases(estimateId, projectId);

  const { success, info, error: showError } = useNotifications();

  const onExportCSV = async () => {
    try {
      info('Подготовка файла экспорта...');
      await handleExportCSV();
      success('Файл экспорта успешно сформирован');
    } catch (err) {
      showError('Ошибка при экспорте закупок', err.message);
    }
  };

  const onImportSuccess = () => {
    handleImportSuccess();
    success('Закупки успешно импортированы');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* ШАПКА СТРАНИЦЫ */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 1.5, flexShrink: 0 }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: colors.primaryLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconPackage size={20} color={colors.primary} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: colors.textPrimary
              }}
            >
              Закупки
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', lineHeight: 1 }}>
              Материалы, сгруппированные по всей смете
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          {purchasesGenerated && (
            <>
              <Button
                variant="contained"
                startIcon={<IconPlus size={20} />}
                onClick={handleOpenExtraMaterialDialog}
                sx={{
                  bgcolor: colors.primary,
                  fontWeight: 600,
                  px: 2,
                  height: 32,
                  fontSize: '0.8125rem',
                  borderRadius: '8px',
                  textTransform: 'none',
                  boxShadow: 'none'
                }}
              >
                Добавить материал
              </Button>
              <Button
                variant="outlined"
                startIcon={exportingCSV ? <CircularProgress size={20} /> : <IconDownload size={20} />}
                onClick={onExportCSV}
                disabled={loading || exportingCSV}
                sx={{
                  borderColor: colors.border,
                  color: '#4B5563',
                  fontWeight: 600,
                  px: 1.5,
                  height: 32,
                  fontSize: '0.8125rem',
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#D1D5DB',
                    bgcolor: '#F9FAFB'
                  }
                }}
              >
                Экспорт CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<IconUpload size={20} />}
                onClick={handleImportCSV}
                disabled={loading}
                sx={{
                  borderColor: colors.border,
                  color: '#4B5563',
                  fontWeight: 600,
                  px: 1.5,
                  height: 32,
                  fontSize: '0.8125rem',
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#D1D5DB',
                    bgcolor: '#F9FAFB'
                  }
                }}
              >
                Импорт CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<IconRefresh size={20} />}
                onClick={handleGeneratePurchases}
                disabled={loading}
                sx={{
                  borderColor: colors.border,
                  color: '#4B5563',
                  fontWeight: 600,
                  px: 1.5,
                  height: 32,
                  fontSize: '0.8125rem',
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#D1D5DB',
                    bgcolor: '#F9FAFB'
                  }
                }}
              >
                Обновить
              </Button>
            </>
          )}

          {!purchasesGenerated && !loading && (
            <Button
              variant="contained"
              startIcon={<IconDeviceFloppy size={20} />}
              onClick={handleGeneratePurchases}
              disabled={loading || !estimateId || !projectId}
              sx={{
                bgcolor: colors.primary,
                fontWeight: 600,
                px: 3,
                borderRadius: '10px',
                textTransform: 'none'
              }}
            >
              Сформировать закупки
            </Button>
          )}
        </Stack>
      </Stack>

      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', pr: 0.5 }}>
        {/* ИНДИКАТОР ЗАГРУЗКИ */}
        {loading && (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
            <CircularProgress sx={{ color: colors.primary }} />
            <Typography variant="body1" sx={{ color: colors.textSecondary, mt: 2 }}>
              Загрузка данных...
            </Typography>
          </Paper>
        )}

        {/* ОШИБКА */}
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {/* ЗАГЛУШКА */}
        {!loading && !purchasesGenerated && (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: '16px',
              border: `1px solid ${colors.border}`,
              bgcolor: '#FAFAFA'
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                bgcolor: colors.primaryLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}
            >
              <IconShoppingCart size={40} color={colors.primary} style={{ opacity: 0.7 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
              Закупки ещё не сформированы
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 4, maxWidth: 400, mx: 'auto' }}>
              Нажмите кнопку «Сформировать закупки» для создания списка материалов на основе сметы
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<IconDeviceFloppy size={22} />}
              onClick={handleGeneratePurchases}
              disabled={loading || !estimateId || !projectId}
              sx={{
                bgcolor: colors.primary,
                fontWeight: 600,
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none'
              }}
            >
              Сформировать закупки
            </Button>
          </Paper>
        )}

        {/* ТАБЛИЦА И ИТОГИ */}
        {!loading && purchasesGenerated && (
          <>
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', mb: 2 }}>
              <EstimatePurchasesTable
                regularMaterials={regularMaterials}
                extraMaterials={extraMaterials}
                getPurchaseStatus={getPurchaseStatus}
                onOpenAddDialog={handleOpenAddDialog}
                loading={loading}
              />
            </Box>

            <Box sx={{ flexShrink: 0 }}>
              <PurchasesSummary
                totalAmount={totalAmount}
                totalActualAmount={totalActualAmount}
                regularMaterials={regularMaterials}
                extraMaterials={extraMaterials}
                getPurchaseStatus={getPurchaseStatus}
              />
            </Box>
          </>
        )}

        {/* ДИАЛОГИ */}
        <AddPurchaseDialog
          open={addDialogOpen}
          onClose={handleCloseAddDialog}
          material={selectedMaterial}
          form={purchaseForm}
          setForm={setPurchaseForm}
          submitting={submitting}
          onSubmit={handleAddToGlobalPurchases}
          error={error}
        />

        <ExtraMaterialDialog
          open={addExtraMaterialDialogOpen}
          onClose={handleCloseExtraMaterialDialog}
          materials={materials}
          loadingMaterials={loadingMaterials}
          form={extraMaterialForm}
          setForm={setExtraMaterialForm}
          submitting={submitting}
          onSubmit={handleAddExtraMaterial}
          error={error}
        />

        {/* ✅ Диалог импорта закупок */}
        <ImportDialog
          open={openImportDialog}
          onClose={() => setOpenImportDialog(false)}
          onImport={(file, options) => purchasesAPI.importPurchases(estimateId, file, options.mode)}
          onSuccess={onImportSuccess}
          title="Импорт закупок из CSV"
          description="📄 Загрузите CSV файл с закупками. Обязательные поля: Наименование, Кол-во, Цена. Дополнительные: Код, Ед изм, Дата."
        />
      </Box>
    </Box>
  );
};

Purchases.propTypes = {
  estimateId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired
};

export default Purchases;
