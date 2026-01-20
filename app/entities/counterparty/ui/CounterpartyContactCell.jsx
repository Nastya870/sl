import React from 'react';
import Typography from '@mui/material/Typography';

const CounterpartyContactCell = ({ value }) => {
    return (
        <Typography sx={{ fontSize: '0.8125rem', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value || '—'}
        </Typography>
    );
};

export default CounterpartyContactCell;
