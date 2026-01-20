import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { IconEdit, IconTrash } from '@tabler/icons-react';

const WorkActionsCell = ({ work, onEdit, onDelete }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
          <IconButton
            size="small"
            onClick={() => onEdit && onEdit(work)}
            sx={{ width: 28, height: 28, color: '#6B7280', '&:hover': { color: '#374151', bgcolor: '#F3F4F6' } }}
          >
            <IconEdit size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete && onDelete(work.id)}
            sx={{ width: 28, height: 28, color: '#EF4444', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}
          >
            <IconTrash size={16} />
          </IconButton>
        </Box>
    );
};

export default WorkActionsCell;
