import React from 'react';
import PropTypes from 'prop-types';
import {
  Stack,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Box
} from '@mui/material';
import {
  IconEye,
  IconDownload,
  IconTrash,
  IconHash,
  IconUser,
  IconCalendar,
  IconListNumbers,
  IconCurrencyRubel,
  IconTag
} from '@tabler/icons-react';

import DataTable from 'app/widgets/DataTable';
import {
  getActTypeLabel,
  getActTypeIcon,
  getActTypeStyles,
  getStatusLabel,
  getStatusStyles
} from 'app/entities/act';
import { formatCurrency } from 'shared/lib/formatters';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const WorkCompletionActsTable = ({ acts, loading, emptyText, onView, onDelete, onDownload }) => {
  const columns = [
    {
      id: 'actNumber',
      label: (
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <IconHash size={16} />
          <span>Номер акта</span>
        </Stack>
      ),
      render: (row) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: '#4F46E5', // primary
            fontFamily: 'monospace'
          }}
        >
          {row.actNumber}
        </Typography>
      )
    },
    {
      id: 'actType',
      label: (
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <IconUser size={16} />
          <span>Тип</span>
        </Stack>
      ),
      render: (row) => {
        const typeStyles = getActTypeStyles(row.actType);
        return (
          <Chip
            icon={getActTypeIcon(row.actType)}
            label={getActTypeLabel(row.actType)}
            size="small"
            sx={{
              ...typeStyles,
              fontWeight: 500,
              height: 28,
              '& .MuiChip-icon': {
                color: typeStyles.color,
                ml: 0.5
              }
            }}
          />
        );
      }
    },
    {
      id: 'actDate',
      label: (
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <IconCalendar size={16} />
          <span>Дата</span>
        </Stack>
      ),
      render: (row) => (
        <Typography variant="body2" sx={{ color: '#374151' }}>
          {formatDate(row.actDate)}
        </Typography>
      )
    },
    {
      id: 'workCount',
      label: (
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.75}>
          <IconListNumbers size={16} />
          <span>Работ</span>
        </Stack>
      ),
      align: 'right',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
          {row.workCount || 0}
        </Typography>
      )
    },
    {
      id: 'totalAmount',
      label: (
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.75}>
          <IconCurrencyRubel size={16} />
          <span>Сумма</span>
        </Stack>
      ),
      align: 'right',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#10B981' }}>
          {formatCurrency(row.totalAmount)}
        </Typography>
      )
    },
    {
      id: 'status',
      label: (
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <IconTag size={16} />
          <span>Статус</span>
        </Stack>
      ),
      render: (row) => {
        const statusStyles = getStatusStyles(row.status);
        return (
          <Chip
            icon={statusStyles.icon}
            label={getStatusLabel(row.status)}
            size="small"
            sx={{
              bgcolor: statusStyles.bgcolor,
              color: statusStyles.color,
              fontWeight: 500,
              height: 28,
              '& .MuiChip-icon': {
                color: statusStyles.color,
                ml: 0.5
              }
            }}
          />
        );
      }
    },
    {
      id: 'actions',
      label: 'Действия',
      align: 'center',
      width: 130,
      render: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <Tooltip title="Просмотр">
            <IconButton
              size="small"
              onClick={() => onView && onView(row.id)}
              sx={{
                color: '#6B7280',
                transition: 'all 0.2s',
                '&:hover': {
                  color: '#4F46E5',
                  bgcolor: '#EEF2FF'
                }
              }}
            >
              <IconEye size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Скачать PDF">
            <IconButton
              size="small"
              onClick={() => onDownload && onDownload(row)}
              sx={{
                color: '#6B7280',
                transition: 'all 0.2s',
                '&:hover': {
                  color: '#10B981',
                  bgcolor: '#D1FAE5'
                }
              }}
            >
              <IconDownload size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Удалить">
            <IconButton
              size="small"
              onClick={() => onDelete && onDelete(row.id)}
              sx={{
                color: '#6B7280',
                transition: 'all 0.2s',
                '&:hover': {
                  color: '#EF4444',
                  bgcolor: '#FEE2E2'
                }
              }}
            >
              <IconTrash size={20} />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  const totalAmount = acts.reduce((sum, act) => sum + (parseFloat(act.totalAmount) || 0), 0);

  const footer = acts.length > 0 ? (
    <React.Fragment>
      <Box
        component="tr" // Render as tr to be valid in tfoot (but DataTable puts footer in TableFooter which expects tr)
        sx={{
            display: 'table-row',
            '& td': {
                px: 2.5,
                py: 2,
                bgcolor: '#F9FAFB',
                borderTop: '1px solid #E5E7EB',
                borderBottom: 'none'
            }
        }}
      >
        <td colSpan={7}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Всего актов: <strong style={{ color: '#111827' }}>{acts.length} шт.</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Общая сумма: <strong style={{ color: '#10B981', fontSize: '1rem' }}>{formatCurrency(totalAmount)}</strong>
                </Typography>
            </Box>
        </td>
      </Box>
    </React.Fragment>
  ) : null;

  // Note: DataTable expects `footer` to be React nodes that go INSIDE TableFooter.
  // But my DataTable implementation renders {footer} inside TableFooter.
  // So I should return a TableRow or similar.
  // The original component rendered a Box OUTSIDE the table for the summary.
  // My DataTable widget allows passing a footer, which renders inside TableFooter.
  // The structure above `tr > td > Box` might work if `DataTable` just renders `{footer}` inside `<TableFooter>`.
  // Let's check DataTable again: ` {footer && (<TableFooter>{footer}</TableFooter>)} `
  // So yes, I need to return TableRow(s).

  // Actually, the original design had the summary bar looking like a separate box footer, but integrated visually.
  // Using TableFooter is semantically correct.

  return (
    <DataTable
      columns={columns}
      data={acts}
      rowKey="id"
      isLoading={loading}
      emptyText={emptyText || "Пока нет сформированных актов"}
      footer={footer}
      sx={{ '& .MuiTableCell-head': { py: 1.5 } }}
    />
  );
};

WorkCompletionActsTable.propTypes = {
  acts: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  emptyText: PropTypes.string,
  onView: PropTypes.func,
  onDelete: PropTypes.func,
  onDownload: PropTypes.func
};

export default WorkCompletionActsTable;
