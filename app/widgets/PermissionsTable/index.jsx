import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Checkbox,
  Tooltip
} from '@mui/material';
import {
  IconMenu2,
  IconEye,
  IconPlus,
  IconPencil,
  IconTrash,
  IconCheck
} from '@tabler/icons-react';

import DataTable from 'app/widgets/DataTable';
import { getResourceActions, parentResources, childResourcesMap } from 'app/entities/permission';

const checkboxSx = {
  p: 0.5,
  color: '#D1D5DB',
  '&.Mui-checked': { color: '#4F46E5' },
  '&.MuiCheckbox-indeterminate': { color: '#4F46E5' },
  '& .MuiSvgIcon-root': { fontSize: 18 }
};

const PermissionsTable = ({
  permissions,
  rolePermissions,
  onToggleAction,
  onToggleAll,
  loading,
  error
}) => {
  const columns = [
    {
      id: 'resource',
      label: 'Раздел',
      width: '30%',
      render: (row) => {
        const isParent = parentResources.includes(row.resource);
        const children = childResourcesMap[row.resource] || [];

        return (
          <Box sx={{ pl: isParent ? 0 : 1.5 }}>
            <Typography sx={{
              fontSize: '13px',
              fontWeight: isParent ? 600 : 500,
              color: '#374151',
              lineHeight: 1.3
            }}>
              {row.resourceName}
            </Typography>
            <Typography sx={{
              fontSize: '11px',
              color: '#9CA3AF',
              lineHeight: 1.2
            }}>
              {row.resource}
              {isParent && children.length > 0 && (
                <span> → {children.join(', ')}</span>
              )}
            </Typography>
          </Box>
        );
      }
    },
    {
      id: 'menu',
      label: (
        <Tooltip title="Видимость в меню">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <IconMenu2 size={14} />
            <span>Меню</span>
          </Box>
        </Tooltip>
      ),
      align: 'center',
      width: '12%',
      render: (row) => {
        const actions = getResourceActions(row);
        return actions.view_menu ? (
          <Checkbox
            checked={rolePermissions.includes(actions.view_menu.id)}
            onChange={() => onToggleAction(actions.view_menu)}
            sx={checkboxSx}
          />
        ) : (
          <Typography sx={{ fontSize: '11px', color: '#D1D5DB' }}>—</Typography>
        );
      }
    },
    {
      id: 'read',
      label: (
        <Tooltip title="Просмотр данных">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <IconEye size={14} />
            <span>Просмотр</span>
          </Box>
        </Tooltip>
      ),
      align: 'center',
      width: '12%',
      render: (row) => {
        const actions = getResourceActions(row);
        return actions.read ? (
          <Checkbox
            checked={rolePermissions.includes(actions.read.id)}
            onChange={() => onToggleAction(actions.read)}
            sx={checkboxSx}
          />
        ) : (
          <Typography sx={{ fontSize: '11px', color: '#D1D5DB' }}>—</Typography>
        );
      }
    },
    {
      id: 'create',
      label: (
        <Tooltip title="Создание записей">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <IconPlus size={14} />
            <span>Создание</span>
          </Box>
        </Tooltip>
      ),
      align: 'center',
      width: '12%',
      render: (row) => {
        const actions = getResourceActions(row);
        return actions.create ? (
          <Checkbox
            checked={rolePermissions.includes(actions.create.id)}
            onChange={() => onToggleAction(actions.create)}
            sx={checkboxSx}
          />
        ) : (
          <Typography sx={{ fontSize: '11px', color: '#D1D5DB' }}>—</Typography>
        );
      }
    },
    {
      id: 'update',
      label: (
        <Tooltip title="Редактирование">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <IconPencil size={14} />
            <span>Изменение</span>
          </Box>
        </Tooltip>
      ),
      align: 'center',
      width: '12%',
      render: (row) => {
        const actions = getResourceActions(row);
        return actions.update ? (
          <Checkbox
            checked={rolePermissions.includes(actions.update.id)}
            onChange={() => onToggleAction(actions.update)}
            sx={checkboxSx}
          />
        ) : (
          <Typography sx={{ fontSize: '11px', color: '#D1D5DB' }}>—</Typography>
        );
      }
    },
    {
      id: 'delete',
      label: (
        <Tooltip title="Удаление записей">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <IconTrash size={14} />
            <span>Удаление</span>
          </Box>
        </Tooltip>
      ),
      align: 'center',
      width: '12%',
      render: (row) => {
        const actions = getResourceActions(row);
        return actions.delete ? (
          <Checkbox
            checked={rolePermissions.includes(actions.delete.id)}
            onChange={() => onToggleAction(actions.delete)}
            sx={checkboxSx}
          />
        ) : (
          <Typography sx={{ fontSize: '11px', color: '#D1D5DB' }}>—</Typography>
        );
      }
    },
    {
      id: 'all',
      label: (
        <Tooltip title="Выбрать все">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <IconCheck size={14} />
            <span>Все</span>
          </Box>
        </Tooltip>
      ),
      align: 'center',
      width: '10%',
      render: (row) => {
        const actions = getResourceActions(row);
        const allActions = Object.values(actions).filter(a => a !== null);
        if (allActions.length === 0) return null;

        const allChecked = allActions.every(a => rolePermissions.includes(a.id));
        const someChecked = allActions.some(a => rolePermissions.includes(a.id));

        return (
          <Checkbox
            checked={allChecked}
            indeterminate={someChecked && !allChecked}
            onChange={() => onToggleAll(row)}
            sx={checkboxSx}
          />
        );
      }
    }
  ];

  // We need to filter out rows that have NO actions at all
  const filteredData = permissions.filter(row => {
    const actions = getResourceActions(row);
    return Object.values(actions).some(a => a !== null);
  });

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      rowKey="resource"
      isLoading={loading}
      emptyText={error || "Нет доступных разрешений"}
      sx={{ '& .MuiTableCell-head': { py: 1 }, '& .MuiTableCell-body': { py: 0.75 } }}
    />
  );
};

PermissionsTable.propTypes = {
  permissions: PropTypes.array.isRequired,
  rolePermissions: PropTypes.array.isRequired,
  onToggleAction: PropTypes.func.isRequired,
  onToggleAll: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default PermissionsTable;
