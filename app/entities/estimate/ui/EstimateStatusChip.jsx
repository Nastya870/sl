import React from 'react';
import Box from '@mui/material/Box';
import { getEstimateStatusStyle } from '../model';

const EstimateStatusChip = ({ status, onClick }) => {
    const statusStyle = getEstimateStatusStyle(status || 'draft');

    return (
        <Box
            onClick={(e) => {
               if (onClick) {
                   e.stopPropagation();
                   onClick(e);
               }
            }}
            sx={{
              display: 'inline-flex',
              px: 1,
              py: 0.375,
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 500,
              bgcolor: statusStyle.bg,
              color: statusStyle.color,
              cursor: onClick ? 'pointer' : 'default',
              '&:hover': onClick ? { opacity: 0.8 } : undefined
            }}
        >
            {statusStyle.label}
        </Box>
    );
};

export default EstimateStatusChip;
