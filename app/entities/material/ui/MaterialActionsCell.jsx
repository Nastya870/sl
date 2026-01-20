import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { IconEdit, IconTrash, IconExternalLink } from '@tabler/icons-react';

const MaterialActionsCell = ({ material, onEdit, onDelete }) => {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          {material.productUrl && (
            <IconButton
              size="small"
              href={material.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ width: 26, height: 26, color: '#6B7280', '&:hover': { color: '#374151', bgcolor: '#F3F4F6' } }}
            >
              <IconExternalLink size={14} />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={() => onEdit && onEdit(material)}
            sx={{ width: 26, height: 26, color: '#6B7280', '&:hover': { color: '#374151', bgcolor: '#F3F4F6' } }}
          >
            <IconEdit size={14} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete && onDelete(material.id)}
            sx={{ width: 26, height: 26, color: '#EF4444', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}
          >
            <IconTrash size={14} />
          </IconButton>
        </Box>
    );
};

export default MaterialActionsCell;
