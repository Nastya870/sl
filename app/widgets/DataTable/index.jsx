import React from 'react';
import PropTypes from 'prop-types';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

const DataTable = ({
  columns,
  data,
  rowKey,
  isLoading,
  emptyText = 'Нет данных',
  footer,
  sx = {},
  stickyHeader = false,
  containerSx = {},
  onRowClick,
  renderRow
}) => {
  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflowX: 'auto', ...containerSx }}>
      <Table stickyHeader={stickyHeader} sx={{ minWidth: 650, ...sx }} aria-label="data table">
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.key || column.id}
                align={column.align || 'left'}
                style={{ minWidth: column.width }}
                sx={{
                  py: 1.5,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: '#6B7280',
                  bgcolor: '#F9FAFB',
                  borderBottom: '1px solid #E5E7EB',
                  whiteSpace: 'nowrap',
                  ...column.sx
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
             <TableRow>
               <TableCell colSpan={columns.length} align="center" sx={{ py: 4, borderBottom: 'none' }}>
                 <CircularProgress />
               </TableCell>
             </TableRow>
          ) : data.length > 0 ? (
            data.map((row, index) => {
              // Custom Row Rendering (e.g. for Group Headers)
              if (renderRow) {
                  const customRow = renderRow(row, index, columns);
                  if (customRow) return customRow;
              }

              const key = typeof rowKey === 'function' ? rowKey(row) : row[rowKey];
              return (
                <TableRow
                  key={key}
                  hover
                  onClick={onRowClick ? (e) => onRowClick(e, row) : undefined}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background-color 0.15s ease',
                    '&:hover': { bgcolor: '#F9FAFB' },
                    ...((onRowClick && { '&:hover': { bgcolor: '#F3F4F6' } }))
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={`${key}-${column.key || column.id}`}
                      align={column.align || 'left'}
                      sx={{
                         py: 1.5,
                         fontSize: '0.875rem',
                         color: '#111827',
                         verticalAlign: 'middle',
                         ...column.cellSx
                      }}
                    >
                      {column.render ? column.render(row, index) : row[column.key || column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 4, borderBottom: 'none' }}>
                <Typography sx={{ color: '#9CA3AF', fontSize: '0.875rem' }}>{emptyText}</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {footer && (
          <TableFooter>
            {footer}
          </TableFooter>
        )}
      </Table>
    </TableContainer>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    id: PropTypes.string,
    label: PropTypes.node,
    align: PropTypes.oneOf(['left', 'right', 'center', 'justify', 'inherit']),
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    sx: PropTypes.object,
    cellSx: PropTypes.object,
    render: PropTypes.func
  })).isRequired,
  data: PropTypes.array.isRequired,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  isLoading: PropTypes.bool,
  emptyText: PropTypes.string,
  footer: PropTypes.node,
  sx: PropTypes.object,
  stickyHeader: PropTypes.bool,
  containerSx: PropTypes.object,
  onRowClick: PropTypes.func,
  renderRow: PropTypes.func
};

export default DataTable;
