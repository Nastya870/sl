import React from 'react';
import Typography from '@mui/material/Typography';

const CounterpartyInnCell = ({ inn }) => {
    return (
        <Typography sx={{ fontSize: '0.8125rem', color: '#374151', fontFamily: 'monospace' }}>
            {inn}
        </Typography>
    );
};

export default CounterpartyInnCell;
