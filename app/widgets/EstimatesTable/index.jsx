import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { IconTrash } from '@tabler/icons-react';
import { DataTable } from 'app/widgets';
import { formatDate } from 'app/projects/utils';

const estimateStatuses = [
    { value: 'draft', label: 'Черновик', color: '#6B7280', bg: '#F3F4F6' },
    { value: 'approved', label: 'Утверждена', color: '#16A34A', bg: '#E6FCEB' },
    { value: 'in_progress', label: 'В работе', color: '#4F46E5', bg: '#EEF2FF' }
];

const getEstimateStatusStyle = (status) => {
    const s = estimateStatuses.find(st => st.value === status) || estimateStatuses[0];
    return { color: s.color, bg: s.bg, label: s.label };
};

const EstimatesTable = ({ estimates, onRowClick, onDelete, onStatusClick }) => {
  const columns = [
    {
      id: 'index',
      label: '№',
      width: 50,
      render: (_, index) => index + 1,
      cellSx: { fontSize: '0.8125rem', color: '#6B7280' }
    },
    {
      id: 'name',
      label: 'Название',
      render: (row) => row.name,
      cellSx: { fontSize: '0.875rem', fontWeight: 500, color: '#111827' }
    },
    {
      id: 'created_at',
      label: 'Дата',
      render: (row) => formatDate(row.created_at),
      cellSx: { fontSize: '0.8125rem', color: '#6B7280' }
    },
    {
      id: 'status',
      label: 'Статус',
      align: 'center',
      render: (row) => {
        const statusStyle = getEstimateStatusStyle(row.status || 'draft');
        return (
          <Box
            onClick={(e) => {
               e.stopPropagation();
               onStatusClick && onStatusClick(e, row);
            }}
            sx={{
              display: 'inline-flex',
              px: 1,
              py: 0.375,
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 500,
              bgcolor: statusStyle.bg,
              color: statusStyle.color,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 }
            }}
          >
            {statusStyle.label}
          </Box>
        );
      }
    },
    {
      id: 'actions',
      align: 'center',
      width: 50,
      render: (row) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete(row.id, e);
          }}
          sx={{
            color: '#9CA3AF',
            p: 0.5,
            opacity: 0.5,
            lineHeight: 1,
            '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2', opacity: 1 }
          }}
        >
          <IconTrash size={14} />
        </IconButton>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={estimates}
      rowKey="id"
      emptyText="Смет пока нет"
      onRowClick={(e, row) => onRowClick && onRowClick(row)}
    />
  );
};

EstimatesTable.propTypes = {
  estimates: PropTypes.array.isRequired,
  onRowClick: PropTypes.func,
  onDelete: PropTypes.func,
  onStatusClick: PropTypes.func
};

export default EstimatesTable;
