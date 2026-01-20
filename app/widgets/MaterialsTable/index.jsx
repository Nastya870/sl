import React from 'react';
import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import DataTable from '../DataTable';
import {
    MaterialNameCell,
    MaterialImageCell,
    MaterialPriceCell,
    MaterialActionsCell,
    HighlightText
} from 'app/entities/material';

const MaterialsTable = ({
    materials,
    onEdit,
    onDelete,
    isLoading,
    hasMore,
    loadMoreTriggerRef,
    searchTerm,
    showImageColumn = true,
    showSupplierColumn = true
}) => {
  const columns = [
    {
      id: 'code',
      label: 'Артикул',
      width: 100,
      render: (row) => (
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis' }}>
           {/* Reusing HighlightText logic via simple replacement or prop?
               Wait, HighlightText is inside MaterialNameCell, but here we need it for code too.
               Let's import HighlightText from entity ui if exported, or just render plain text.
               The entity UI exports HighlightText.
           */}
           {/* Actually, MaterialNameCell uses it internally. I should probably use HighlightText component directly here. */}
           {/* Let's assume I can import HighlightText from app/entities/material */}
           <HighlightText text={row.sku} query={searchTerm} />
        </Typography>
      ),
      cellSx: { pl: 2 }
    },
    {
      id: 'name',
      label: 'Наименование',
      render: (row) => (
        <MaterialNameCell material={row} searchTerm={searchTerm} />
      )
    },
    ...(showImageColumn ? [{
      id: 'image',
      label: 'Фото',
      width: 60,
      align: 'center',
      render: (row) => <MaterialImageCell material={row} />
    }] : []),
    {
      id: 'unit',
      label: 'Ед.',
      width: 60,
      align: 'center',
      render: (row) => <Typography sx={{ fontSize: '0.8125rem', color: '#374151' }}>{row.unit}</Typography>
    },
    {
      id: 'price',
      label: 'Цена',
      width: 90,
      align: 'right',
      render: (row) => <MaterialPriceCell price={row.price} />
    },
    ...(showSupplierColumn ? [{
      id: 'supplier',
      label: 'Поставщик',
      width: 100,
      render: (row) => (
        <Typography sx={{ fontSize: '0.8125rem', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {row.supplier}
        </Typography>
      )
    }] : []),
    {
      id: 'weight',
      label: 'Вес',
      width: 70,
      align: 'center',
      render: (row) => <Typography sx={{ fontSize: '0.8125rem', color: '#374151' }}>{row.weight}</Typography>
    },
    {
      id: 'category',
      label: 'Категория',
      width: 100,
      render: (row) => (
        <Chip
            label={row.category}
            size="small"
            sx={{
            height: 22,
            fontSize: '0.625rem',
            bgcolor: '#F3F4F6',
            color: '#6B7280',
            border: '1px solid #E5E7EB',
            maxWidth: '100%',
            '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' }
            }}
        />
      )
    },
    {
      id: 'actions',
      label: 'Действия',
      width: 90,
      align: 'center',
      render: (row) => <MaterialActionsCell material={row} onEdit={onEdit} onDelete={onDelete} />,
      cellSx: { pr: 2 }
    }
  ];

  // Custom footer for infinite scroll trigger
  // DataTable doesn't support "body append" easily unless we treat it as a row or use a specific prop.
  // The original implementation had a TableRow with a ref at the end of TableBody.
  // We can simulate this by appending a dummy row to data if hasMore is true?
  // Or simpler: DataTable could accept a `loadingRow` prop?
  // Or I can modify DataTable again? No, constraint says "Do NOT rewrite DataTable".
  // Actually, I modified DataTable to support `renderRow`.
  // But infinite scroll trigger needs to be *after* all rows.
  // If I append a special object to `materials` array, I can use `renderRow` to render the loader.

  // Let's create a computed data array.
  const tableData = React.useMemo(() => {
      if (hasMore) {
          return [...materials, { _type: 'loader', id: 'loader-trigger' }];
      }
      return materials;
  }, [materials, hasMore]);

  const renderRow = (row, index, cols) => {
      if (row._type === 'loader') {
          return (
            <TableRow ref={loadMoreTriggerRef} key="loader">
                <TableCell colSpan={cols.length} sx={{ py: 2, textAlign: 'center', borderBottom: 'none', height: '40px' }}>
                    {isLoading && <CircularProgress size={20} thickness={4} sx={{ color: '#3B82F6' }} />}
                </TableCell>
            </TableRow>
          );
      }
      return null;
  };

  return (
    <DataTable
      columns={columns}
      data={tableData}
      rowKey="id"
      // isLoading handled via infinite scroll loader mostly, but initial loading passed here?
      // If initialLoading is true, DataTable shows loader in body.
      // If loading is true (fetching next page), we show the loader row.
      isLoading={false} // We handle loading state manually via loader row for infinite scroll
      emptyText="Ничего не найдено"
      renderRow={renderRow}
      sx={{ tableLayout: 'fixed', width: '100%' }}
      containerSx={{ height: '100%', overflow: 'auto' }}
    />
  );
};

MaterialsTable.propTypes = {
    materials: PropTypes.array.isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    isLoading: PropTypes.bool,
    hasMore: PropTypes.bool,
    loadMoreTriggerRef: PropTypes.object,
    searchTerm: PropTypes.string,
    showImageColumn: PropTypes.bool,
    showSupplierColumn: PropTypes.bool
};

export default MaterialsTable;
