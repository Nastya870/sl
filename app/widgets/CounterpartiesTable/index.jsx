import React from 'react';
import PropTypes from 'prop-types';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DataTable } from 'app/widgets';
import {
    CounterpartyTypeCell,
    CounterpartyNameCell,
    CounterpartyInnCell,
    CounterpartyContactCell,
    CounterpartyActionsCell
} from 'app/entities/counterparty';

const CounterpartiesTable = ({
    counterparties,
    onEdit,
    onDelete,
    isLoading,
    emptyText
}) => {
  const columns = [
    {
      id: 'type',
      label: 'Тип',
      width: 120,
      render: (row) => <CounterpartyTypeCell type={row.entityType} />,
      cellSx: { pl: 2 }
    },
    {
      id: 'name',
      label: 'Наименование / ФИО',
      render: (row) => <CounterpartyNameCell name={row.entityType === 'individual' ? row.fullName : row.companyName} />
    },
    {
      id: 'inn',
      label: 'ИНН / Паспорт',
      width: 150,
      render: (row) => <CounterpartyInnCell inn={row.entityType === 'individual' ? row.passportSeriesNumber : row.inn} />
    },
    {
      id: 'phone',
      label: 'Телефон',
      width: 140,
      render: (row) => <CounterpartyContactCell value={row.phone} />
    },
    {
      id: 'email',
      label: 'Email',
      width: 180,
      render: (row) => <CounterpartyContactCell value={row.email} />
    },
    {
      id: 'actions',
      label: 'Действия',
      width: 90,
      align: 'center',
      render: (row) => <CounterpartyActionsCell counterparty={row} onEdit={onEdit} onDelete={onDelete} />,
      cellSx: { pr: 2 }
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={counterparties}
      rowKey="id"
      isLoading={isLoading}
      emptyText={emptyText}
      stickyHeader
      sx={{ tableLayout: 'fixed' }}
      containerSx={{ height: '100%', overflowX: 'hidden' }}
    />
  );
};

CounterpartiesTable.propTypes = {
    counterparties: PropTypes.array.isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    isLoading: PropTypes.bool,
    emptyText: PropTypes.string
};

export default CounterpartiesTable;
