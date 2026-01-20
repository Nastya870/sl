import React from 'react';
import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import DataTable from '../DataTable';
import {
    WorkNameCell,
    WorkPriceCell,
    WorkActionsCell
} from 'app/entities/work';

const WorksTable = ({
    works,
    onEdit,
    onDelete,
    isLoading,
    hasMore,
    loadMoreTriggerRef
}) => {
  const columns = [
    {
      id: 'code',
      label: 'Код',
      width: 120,
      render: (row) => (
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#374151' }}>
          {row.code}
        </Typography>
      ),
      cellSx: { pl: 2.5 }
    },
    {
      id: 'name',
      label: 'Наименование',
      render: (row) => <WorkNameCell work={row} />
    },
    {
      id: 'unit',
      label: 'Ед. изм.',
      width: 100,
      align: 'center',
      render: (row) => <Typography sx={{ fontSize: '0.8125rem', color: '#374151' }}>{row.unit}</Typography>
    },
    {
      id: 'basePrice',
      label: 'Базовая цена',
      width: 150,
      align: 'right',
      render: (row) => <WorkPriceCell price={row.basePrice || row.base_price} />
    },
    {
      id: 'actions',
      label: 'Действия',
      width: 100,
      align: 'center',
      render: (row) => <WorkActionsCell work={row} onEdit={onEdit} onDelete={onDelete} />,
      cellSx: { pr: 2.5 }
    }
  ];

  const tableData = React.useMemo(() => {
      if (hasMore) {
          return [...works, { _type: 'loader', id: 'loader-trigger' }];
      }
      return works;
  }, [works, hasMore]);

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
      isLoading={false}
      emptyText="Ничего не найдено"
      renderRow={renderRow}
      sx={{ tableLayout: 'fixed' }}
      containerSx={{ height: '100%', overflow: 'auto' }}
    />
  );
};

WorksTable.propTypes = {
    works: PropTypes.array.isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    isLoading: PropTypes.bool,
    hasMore: PropTypes.bool,
    loadMoreTriggerRef: PropTypes.object
};

export default WorksTable;
