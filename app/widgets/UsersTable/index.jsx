import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import {
  IconEdit,
  IconTrash,
  IconShield,
  IconCircleCheck,
  IconCircleX
} from '@tabler/icons-react';
import { DataTable } from 'app/widgets';

const getRoleNames = (roles) => {
    if (!roles || roles.length === 0) return 'Нет ролей';

    const roleMap = {
      super_admin: 'Супер Админ',
      admin: 'Админ',
      manager: 'Менеджер',
      estimator: 'Сметчик',
      supplier: 'Снабженец'
    };

    return roles.map((role) => roleMap[role.name] || role.name).join(', ');
};

const getRoleBadgeStyle = (roles) => {
    return { bgcolor: '#F3E8FF', color: '#6D28D9' };
};

const UsersTable = ({ users, onManageRoles, onEdit, onDelete, isLoading, emptyText }) => {
  const columns = [
    {
      id: 'fullName',
      label: 'Имя',
      render: (row) => (
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#374151' }}>
          {row.fullName || 'Не указано'}
        </Typography>
      )
    },
    {
      id: 'email',
      label: 'Email',
      render: (row) => (
        <Typography sx={{ fontSize: '0.8125rem', color: '#374151' }}>
          {row.email}
        </Typography>
      )
    },
    {
      id: 'phone',
      label: 'Телефон',
      render: (row) => (
        <Typography sx={{ fontSize: '0.8125rem', color: '#374151' }}>
          {row.phone || '—'}
        </Typography>
      )
    },
    {
      id: 'roles',
      label: 'Роли',
      render: (row) => (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: '6px',
            px: '8px',
            py: '3px',
            fontSize: '12px',
            fontWeight: 500,
            ...getRoleBadgeStyle(row.roles)
          }}
        >
          {getRoleNames(row.roles)}
        </Box>
      )
    },
    {
      id: 'isActive',
      label: 'Статус',
      render: (row) => row.isActive ? (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              bgcolor: '#DCFCE7',
              color: '#15803D',
              borderRadius: '6px',
              px: '8px',
              py: '3px',
              fontSize: '12px',
              fontWeight: 500
            }}
          >
            <IconCircleCheck size={14} style={{ color: '#15803D' }} />
            Активен
          </Box>
        ) : (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              bgcolor: '#F3F4F6',
              color: '#6B7280',
              borderRadius: '6px',
              px: '8px',
              py: '3px',
              fontSize: '12px',
              fontWeight: 500
            }}
          >
            <IconCircleX size={14} />
            Неактивен
          </Box>
        )
    },
    {
      id: 'actions',
      label: 'Действия',
      align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
          <Tooltip title="Управление ролями">
            <IconButton
              size="small"
              onClick={() => onManageRoles && onManageRoles(row)}
              sx={{ width: 30, height: 30, color: '#6D28D9', '&:hover': { color: '#5B21B6', bgcolor: '#F3E8FF' } }}
            >
              <IconShield size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Редактировать">
            <IconButton
              size="small"
              onClick={() => onEdit && onEdit(row)}
              sx={{ width: 30, height: 30, color: '#6B7280', '&:hover': { color: '#374151', bgcolor: '#F3F4F6' } }}
            >
              <IconEdit size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Удалить">
            <IconButton
              size="small"
              onClick={() => onDelete && onDelete(row)}
              sx={{ width: 30, height: 30, color: '#EF4444', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}
            >
              <IconTrash size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      rowKey="id"
      isLoading={isLoading}
      emptyText={emptyText || "Пользователи не найдены"}
      containerSx={{ flex: 1, border: 'none' }}
      sx={{ '& .MuiTableRow-root': { height: '52px' } }}
      stickyHeader
    />
  );
};

UsersTable.propTypes = {
  users: PropTypes.array.isRequired,
  onManageRoles: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  isLoading: PropTypes.bool,
  emptyText: PropTypes.string
};

export default UsersTable;
