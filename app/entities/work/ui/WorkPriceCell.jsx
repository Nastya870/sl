import React from 'react';
import Typography from '@mui/material/Typography';
import { formatPrice } from '../model';

const WorkPriceCell = ({ price }) => {
    return (
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#374151' }}>
          {formatPrice(price)}
        </Typography>
    );
};

export default WorkPriceCell;
