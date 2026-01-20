import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import {
  IconEdit,
  IconTrash,
  IconShield
} from '@tabler/icons-react';
import DataTable from '../DataTable';
import { UserRoleBadge, UserStatusBadge } from 'app/entities/user';

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
        <UserRoleBadge roles={row.roles} />
      )
    },
    {
      id: 'isActive',
      label: 'Статус',
      render: (row) => <UserStatusBadge isActive={row.isActive} />
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
