import React from 'react';
import Typography from '@mui/material/Typography';
import { formatCurrency } from '../model';

const PurchaseTotalCell = ({ total }) => {
    return (
        <Typography variant="body2" fontWeight={600} color="primary.main">
            {formatCurrency(total)}
        </Typography>
    );
};

export default PurchaseTotalCell;
