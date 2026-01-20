import React from 'react';
import PropTypes from 'prop-types';

// Material-UI
import {
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';

// Feature & Widgets
import { usePermissionsTableData } from 'app/features/permissions/usePermissionsTableData';
import PermissionsTable from 'app/widgets/PermissionsTable';

// ==============================|| SIMPLIFIED PERMISSIONS MATRIX ||============================== //

const PermissionsMatrixSimple = ({ roleId, roleName, roleKey, onPermissionsChange }) => {
  const {
    permissions,
    rolePermissions,
    loading,
    error,
    hasChanges,
    handleActionToggle,
    toggleAllForResource
  } = usePermissionsTableData(roleId, onPermissionsChange);

  const isSuperAdmin = roleKey === 'super_admin';

  if (loading && permissions.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress size={28} sx={{ color: '#6B7280' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ fontSize: '12px', py: 0.5 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Super admin warning */}
      {isSuperAdmin && (
        <Typography sx={{ fontSize: '11px', color: '#DC2626', mb: 1 }}>
          ⚠ Вы редактируете роль super_admin с полным доступом к системе
        </Typography>
      )}

      {/* Role name + badge - single line */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        mb: 1.5
      }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
          {roleName}
        </Typography>
        <Typography sx={{ 
          fontSize: '10px', 
          fontWeight: 500,
          color: '#6D28D9',
          bgcolor: '#F5F3FF',
          px: 0.75,
          py: 0.125,
          borderRadius: '3px',
          lineHeight: '16px'
        }}>
          {rolePermissions.length} активно
        </Typography>
        {hasChanges && (
          <Typography sx={{ 
            fontSize: '10px', 
            fontWeight: 500,
            color: '#DC2626',
            bgcolor: '#FEF2F2',
            px: 0.75,
            py: 0.125,
            borderRadius: '3px',
            lineHeight: '16px'
          }}>
            Не сохранено
          </Typography>
        )}
      </Box>

      {/* Permissions Table Widget */}
      <PermissionsTable
        permissions={permissions}
        rolePermissions={rolePermissions}
        onToggleAction={handleActionToggle}
        onToggleAll={toggleAllForResource}
        loading={loading}
        error={error}
      />

      {/* Muted help text - no container */}
      <Typography sx={{ 
        mt: 1.5, 
        fontSize: '11px', 
        color: '#9CA3AF', 
        lineHeight: 1.4 
      }}>
        Меню — навигация • Просмотр — чтение • Создание — добавление • Изменение — редактирование • Удаление — удаление
      </Typography>

      {hasChanges && (
        <Typography sx={{ mt: 1, fontSize: '11px', color: '#DC2626' }}>
          ⚠ Есть несохраненные изменения
        </Typography>
      )}
    </Box>
  );
};

PermissionsMatrixSimple.propTypes = {
  roleId: PropTypes.string.isRequired,
  roleName: PropTypes.string.isRequired,
  roleKey: PropTypes.string.isRequired,
  onPermissionsChange: PropTypes.func
};

export default PermissionsMatrixSimple;
