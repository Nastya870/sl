import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import { IconTrash } from '@tabler/icons-react';
import DataTable from '../DataTable';
import { formatDate, EstimateStatusChip } from 'app/entities/estimate';

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
      render: (row) => (
          <EstimateStatusChip
            status={row.status}
            onClick={(e) => onStatusClick && onStatusClick(e, row)}
          />
      )
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
