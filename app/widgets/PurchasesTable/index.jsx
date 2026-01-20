import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import DataTable from '../DataTable';
import {
    PurchaseMaterialCell,
    PurchaseProjectCell,
    PurchaseQuantityCell,
    PurchasePriceCell,
    PurchaseTotalCell,
    formatCurrency
} from 'app/entities/purchase';

const PurchasesTable = ({ purchases, onEdit, onDelete, totalSpent, isLoading, emptyText, containerSx }) => {
  const columns = [
    {
        id: 'material_name',
        label: 'Наименование',
        width: 300,
        render: (row) => (
            <PurchaseMaterialCell
                materialName={row.material_name}
                materialImage={row.material_image}
                materialSku={row.material_sku}
            />
        )
    },
    {
        id: 'project_name',
        label: 'Проект / Смета',
        render: (row) => (
            <PurchaseProjectCell
                projectName={row.project_name}
                estimateName={row.estimate_name}
            />
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
            <PurchaseQuantityCell
                quantity={row.quantity}
                unit={row.unit}
            />
        )
    },
    {
        id: 'purchase_price',
        label: 'Цена',
        align: 'right',
        render: (row) => <PurchasePriceCell price={row.purchase_price} />
    },
    {
        id: 'total_price',
        label: 'Сумма',
        align: 'right',
        render: (row) => <PurchaseTotalCell total={row.total_price} />
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

  // Group purchases by project and flatten for table
  const tableData = useMemo(() => {
      const grouped = purchases.reduce((acc, purchase) => {
          const projectName = purchase.project_name || 'Без проекта';
          if (!acc[projectName]) {
              acc[projectName] = { projectId: purchase.project_id, purchases: [], total: 0 };
          }
          acc[projectName].purchases.push(purchase);
          acc[projectName].total += parseFloat(purchase.total_price || 0);
          return acc;
      }, {});

      const rows = [];
      Object.entries(grouped).forEach(([projectName, data], groupIndex) => {
          // Header Row Object
          rows.push({
              _type: 'header',
              id: `header-${projectName}-${groupIndex}`,
              projectName,
              count: data.purchases.length,
              index: groupIndex + 1
          });
          // Purchase Items
          rows.push(...data.purchases);
      });
      return rows;
  }, [purchases]);

  const renderRow = (row, index, cols) => {
      if (row._type === 'header') {
          return (
            <TableRow key={row.id}>
                <TableCell
                  colSpan={cols.length}
                  sx={{
                    bgcolor: '#F3F4F6',
                    borderLeft: '3px solid #6366F1',
                    py: 1,
                    borderBottom: '1px solid #E5E7EB'
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 22,
                          height: 22,
                          borderRadius: '4px',
                          bgcolor: '#6366F1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.6875rem',
                          fontWeight: 700
                        }}
                      >
                        {row.index}
                      </Box>
                      <Typography sx={{ fontWeight: 600, color: '#374151', fontSize: '0.8125rem' }}>
                        {row.projectName}
                      </Typography>
                      <Chip
                        label={`${row.count} поз.`}
                        size="small"
                        sx={{ height: 18, fontSize: '0.75rem', bgcolor: '#F3F4F6', color: '#6B7280', fontWeight: 500, border: '1px solid #E5E7EB' }}
                      />
                    </Stack>
                  </Stack>
                </TableCell>
            </TableRow>
          );
      }
      return null; // Use default
  };

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
      data={tableData}
      rowKey="id"
      isLoading={isLoading}
      emptyText={emptyText}
      footer={footer}
      sx={{ '& .MuiTableCell-root': { verticalAlign: 'middle' } }}
      containerSx={containerSx}
      renderRow={renderRow}
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
