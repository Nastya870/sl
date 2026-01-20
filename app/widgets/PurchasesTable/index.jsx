import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { DataTable } from 'app/widgets';
import { formatCurrency } from 'utils/formatters';

const PurchasesTable = ({ purchases, onEdit, onDelete, totalSpent, isLoading, emptyText, containerSx }) => {
  const columns = [
    {
        id: 'material_name',
        label: 'Наименование',
        width: 300,
        render: (row) => (
            <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={row.material_image}
                  alt={row.material_name}
                  variant="rounded"
                  sx={{ width: 40, height: 40 }}
                />
                <Box>
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    {row.material_name}
                  </Typography>
                  {row.material_sku && (
                    <Typography variant="caption" color="text.secondary">
                      Арт: {row.material_sku}
                    </Typography>
                  )}
                </Box>
             </Stack>
        )
    },
    {
        id: 'project_name',
        label: 'Проект / Смета',
        render: (row) => (
            <Box>
                <Typography variant="body2" color="text.primary" fontWeight={500}>
                  {row.project_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.estimate_name}
                </Typography>
            </Box>
        )
    },
    {
        id: 'purchase_date',
        label: 'Дата',
        render: (row) => (
            <Typography variant="body2" color="text.secondary">
                {row.purchase_date ? new Date(row.purchase_date).toLocaleDateString('ru-RU') : '—'}
            </Typography>
        )
    },
    {
        id: 'quantity',
        label: 'Кол-во',
        align: 'right',
        render: (row) => (
            <Box>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {row.quantity}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {row.unit}
                </Typography>
            </Box>
        )
    },
    {
        id: 'purchase_price',
        label: 'Цена',
        align: 'right',
        render: (row) => (
            <Typography variant="body2" color="text.secondary">
                {formatCurrency(row.purchase_price)}
            </Typography>
        )
    },
    {
        id: 'total_price',
        label: 'Сумма',
        align: 'right',
        render: (row) => (
            <Typography variant="body2" fontWeight={600} color="primary.main">
                {formatCurrency(row.total_price)}
            </Typography>
        )
    },
    {
        id: 'actions',
        align: 'center',
        width: 80,
        render: (row) => (
           <Stack direction="row" spacing={1} justifyContent="center">
                <IconButton
                  size="small"
                  onClick={() => onEdit && onEdit(row)}
                  title="Редактировать"
                  sx={{ width: 28, height: 28, color: '#6B7280', '&:hover': { bgcolor: '#F3F4F6', color: '#374151' } }}
                >
                  <IconEdit size={16} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDelete && onDelete(row.id)}
                  title="Удалить"
                  sx={{ width: 28, height: 28, color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2', color: '#DC2626' } }}
                >
                  <IconTrash size={16} />
                </IconButton>
            </Stack>
        )
    }
  ];

  const footer = purchases.length > 0 ? (
    <TableRow>
      <TableCell
        colSpan={5}
        align="right"
        sx={{ bgcolor: '#F9FAFB', borderTop: '2px solid rgba(0,0,0,0.07)', pt: 2.5, pb: 2 }}
      >
        <Typography sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
          Итого по всем проектам:
        </Typography>
      </TableCell>
      <TableCell
        align="right"
        sx={{ bgcolor: '#F9FAFB', borderTop: '2px solid rgba(0,0,0,0.07)', pt: 2.5, pb: 2 }}
      >
        <Typography sx={{ fontWeight: 700, color: '#059669', fontSize: '1rem' }}>
          {formatCurrency(totalSpent)}
        </Typography>
      </TableCell>
      <TableCell sx={{ bgcolor: '#F9FAFB', borderTop: '2px solid rgba(0,0,0,0.07)', pt: 2.5, pb: 2 }} />
    </TableRow>
  ) : null;

  return (
    <DataTable
      columns={columns}
      data={purchases}
      rowKey="id"
      isLoading={isLoading}
      emptyText={emptyText}
      footer={footer}
      sx={{ '& .MuiTableCell-root': { verticalAlign: 'middle' } }}
      containerSx={containerSx}
    />
  );
};

PurchasesTable.propTypes = {
    purchases: PropTypes.array.isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    totalSpent: PropTypes.number,
    isLoading: PropTypes.bool,
    emptyText: PropTypes.string
};

export default PurchasesTable;
