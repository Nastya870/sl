import React from 'react';
import Box from '@mui/material/Box';
import { IconUser, IconBuilding } from '@tabler/icons-react';
import { getEntityTypeLabel } from '../model';

const CounterpartyTypeCell = ({ type }) => {
    return (
        <Box
            sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            bgcolor: '#F3E8FF',
            color: '#7C3AED',
            borderRadius: '4px',
            px: '8px',
            py: '3px',
            fontSize: '11.5px',
            fontWeight: 500
            }}
        >
            {type === 'individual' ? <IconUser size={12} /> : <IconBuilding size={12} />}
            {getEntityTypeLabel(type)}
        </Box>
    );
};

export default CounterpartyTypeCell;
