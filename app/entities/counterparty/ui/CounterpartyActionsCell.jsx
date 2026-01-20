import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { IconEdit, IconTrash } from '@tabler/icons-react';

const CounterpartyActionsCell = ({ counterparty, onEdit, onDelete }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
            <Tooltip title="Редактировать">
                <IconButton
                size="small"
                onClick={() => onEdit && onEdit(counterparty)}
                sx={{ width: 28, height: 28, color: '#6B7280', '&:hover': { color: '#374151', bgcolor: '#F3F4F6' } }}
                >
                <IconEdit size={16} />
                </IconButton>
            </Tooltip>
            <Tooltip title="Удалить">
                <IconButton
                size="small"
                onClick={() => onDelete && onDelete(counterparty.id)}
                sx={{ width: 28, height: 28, color: '#EF4444', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}
                >
                <IconTrash size={16} />
                </IconButton>
            </Tooltip>
        </Box>
    );
};

export default CounterpartyActionsCell;
