import React from 'react';
import Typography from '@mui/material/Typography';

const CounterpartyNameCell = ({ name }) => {
    return (
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#374151' }}>
            {name}
        </Typography>
    );
};

export default CounterpartyNameCell;
