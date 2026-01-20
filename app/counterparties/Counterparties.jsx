import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, InputAdornment, Alert
} from '@mui/material';
import {
  IconUsers, IconPlus, IconSearch, IconBuilding, IconUser
} from '@tabler/icons-react';
import CounterpartyModal from './CounterpartyModal';
import { CounterpartiesTable } from 'app/widgets';
import { useCounterpartiesTableData } from 'app/features/counterparties/useCounterpartiesTableData';

const Counterparties = () => {
  // Feature Hook
  const {
      counterparties,
      loading,
      error,
      search,
      setSearch,
      entityTypeFilter,
      setEntityTypeFilter,
      deleteCounterparty,
      refresh,
      setError
  } = useCounterpartiesTableData();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCounterparty, setSelectedCounterparty] = useState(null);

  const handleCreate = () => {
    setSelectedCounterparty(null);
    setModalOpen(true);
  };

  const handleEdit = (counterparty) => {
    setSelectedCounterparty(counterparty);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого контрагента?')) return;
    
    try {
      await deleteCounterparty(id);
    } catch (err) {
      console.error('Error deleting counterparty:', err);
      setError('Не удалось удалить контрагента');
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedCounterparty(null);
  };

  const handleModalSuccess = () => {
    refresh();
    handleModalClose();
  };

  // Табы фильтрации
  const tabs = [
    { value: 'all', label: 'Все' },
    { value: 'individual', label: 'Физ. лица', icon: <IconUser size={16} /> },
    { value: 'legal', label: 'Юр. лица', icon: <IconBuilding size={16} /> }
  ];

  return (
    <Box sx={{ bgcolor: '#F3F4F6', height: '100vh', p: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} data-testid="counterparties-page">
      <Paper 
        elevation={0}
        sx={{ 
          bgcolor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden'
        }}
      >
        {/* Заголовок */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '10px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconUsers size={20} style={{ color: '#6B7280' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1F2937' }} data-testid="counterparties-title">
              Контрагенты
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<IconPlus size={16} />} 
            onClick={handleCreate} 
            data-testid="add-counterparty-btn"
            sx={{
              textTransform: 'none',
              bgcolor: '#4F46E5',
              height: 40,
              px: 2,
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(79,70,229,0.2)',
              '&:hover': { 
                bgcolor: '#4338CA',
                boxShadow: '0 4px 6px rgba(79,70,229,0.25)'
              }
            }}
          >
            Добавить контрагента
          </Button>
        </Box>

        {/* Табы */}
        <Box sx={{ display: 'flex', gap: 0, mb: '12px', borderBottom: '1px solid #E5E7EB' }} data-testid="counterparties-tabs">
          {tabs.map((tab) => (
            <Box
              key={tab.value}
              onClick={() => setEntityTypeFilter(tab.value)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 2,
                py: 1.5,
                cursor: 'pointer',
                borderBottom: entityTypeFilter === tab.value ? '2px solid #7C3AED' : '2px solid transparent',
                color: entityTypeFilter === tab.value ? '#5B21B6' : '#6B7280',
                fontWeight: entityTypeFilter === tab.value ? 600 : 400,
                fontSize: '0.875rem',
                transition: 'all 0.15s ease',
                mb: '-1px',
                '&:hover': {
                  color: entityTypeFilter === tab.value ? '#5B21B6' : '#7C3AED'
                }
              }}
            >
              {tab.icon}
              {tab.label}
            </Box>
          ))}
        </Box>

        {/* Поиск */}
        <TextField
          placeholder="Поиск по имени, ИНН, телефону, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          data-testid="counterparties-search"
          size="small"
          fullWidth
          sx={{
            mb: '20px',
            '& .MuiOutlinedInput-root': {
              height: 44,
              bgcolor: '#FFFFFF',
              borderRadius: '10px',
              fontSize: '0.875rem',
              pl: 0.5,
              '& fieldset': { borderColor: '#E5E7EB' },
              '&:hover fieldset': { borderColor: '#D1D5DB' },
              '&.Mui-focused fieldset': { borderColor: '#6366F1' }
            },
            '& .MuiInputBase-input': {
              color: '#374151',
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

        {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

        {/* Таблица */}
        <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
          <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', height: '100%' }}>
            <CounterpartiesTable
              counterparties={counterparties}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={loading}
              emptyText={search || entityTypeFilter !== 'all' ? 'Контрагенты не найдены' : 'Нет контрагентов. Добавьте первого контрагента.'}
            />
          </Box>
        </Box>
      </Paper>

      <CounterpartyModal
        open={modalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        counterparty={selectedCounterparty}
      />
    </Box>
  );
};

export default Counterparties;
