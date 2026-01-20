import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

// project imports
import UserDialog from './UserDialog';
import RolesDialog from './RolesDialog';
import { UsersTable } from 'app/widgets';

// assets
import {
  IconSearch,
  IconUserPlus,
  IconUsers
} from '@tabler/icons-react';

// ==============================|| USERS MANAGEMENT ||============================== //

const UsersManagement = () => {
  const theme = useTheme();

  // Feature Hook
  const {
      users,
      loading,
      error,
      page,
      rowsPerPage,
      totalUsers,
      search,
      handleSearchChange,
      handleChangePage,
      handleChangeRowsPerPage,
      handleDeleteUser,
      refresh
  } = useUsersTableData();

  // Dialogs
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Handlers
  const handleCreateUser = () => {
    setSelectedUser(null);
    setUserDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleManageRoles = (user) => {
    setSelectedUser(user);
    setRolesDialogOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await handleDeleteUser(selectedUser.id);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setActionError(err.response?.data?.message || 'Ошибка удаления пользователя');
    }
  };

  const handleUserSaved = () => {
    setUserDialogOpen(false);
    setSelectedUser(null);
    refresh();
  };

  const handleRolesSaved = () => {
    setRolesDialogOpen(false);
    setSelectedUser(null);
    refresh();
  };

  return (
    <Box sx={{ bgcolor: '#F3F4F6', height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Paper 
        elevation={0}
        sx={{ 
          bgcolor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          pt: 2.5,
          px: 3,
          pb: 2,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
          minHeight: 0
        }}
      >
        {/* Заголовок */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '16px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconUsers size={20} style={{ color: '#6B7280' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1F2937' }}>
              Управление пользователями
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<IconUserPlus size={16} />} 
            onClick={handleCreateUser}
            disabled={loading}
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
            Добавить пользователя
          </Button>
        </Box>

        {/* Поиск */}
        <TextField
          fullWidth
          value={search}
          onChange={handleSearchChange}
          placeholder="Поиск по имени или email..."
          size="small"
          sx={{
            mb: '16px',
            flexShrink: 0,
            '& .MuiOutlinedInput-root': {
              height: 44,
              bgcolor: '#FFFFFF',
              borderRadius: '10px',
              fontSize: '0.875rem',
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

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Users Table */}
        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <UsersTable
            users={users}
            isLoading={loading}
            onManageRoles={handleManageRoles}
            onEdit={handleEditUser}
            onDelete={handleDeleteClick}
            containerSx={{ flex: 1, border: 'none', borderRadius: 0, overflow: 'auto' }}
          />

          {/* Pagination */}
          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Строк на странице:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
            sx={{
              borderTop: '1px solid #E5E7EB',
              flexShrink: 0,
              py: 0.5,
              '& .MuiTablePagination-toolbar': {
                minHeight: 48
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontSize: '0.75rem',
                color: '#6B7280'
              },
              '& .MuiTablePagination-select': {
                fontSize: '0.75rem'
              },
              '& .MuiTablePagination-actions': {
                '& .MuiIconButton-root': {
                  padding: '4px',
                  color: '#6B7280'
                }
              }
            }}
          />
        </Paper>
      </Paper>

      {/* User Create/Edit Dialog */}
      <UserDialog
        open={userDialogOpen}
        user={selectedUser}
        onClose={() => setUserDialogOpen(false)}
        onSave={handleUserSaved}
      />

      {/* Roles Management Dialog */}
      <RolesDialog
        open={rolesDialogOpen}
        user={selectedUser}
        onClose={() => setRolesDialogOpen(false)}
        onSave={handleRolesSaved}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            width: '100%',
            maxWidth: '420px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#111827', pb: 1 }}>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ color: '#374151', fontSize: '0.875rem' }}>
            Вы уверены, что хотите удалить пользователя{' '}
            <strong>{selectedUser?.fullName || selectedUser?.email}</strong>?
          </Typography>
          <Typography sx={{ color: '#DC2626', fontSize: '0.8125rem', mt: 2 }}>
            Это действие необратимо!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, justifyContent: 'flex-end', gap: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ 
              textTransform: 'none', 
              color: '#6B7280',
              fontSize: '0.875rem',
              '&:hover': { bgcolor: '#F3F4F6' }
            }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained"
            sx={{
              textTransform: 'none',
              bgcolor: '#EF4444',
              height: 40,
              px: 2,
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '8px',
              '&:hover': { bgcolor: '#DC2626' }
            }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersManagement;
