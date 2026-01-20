import React from 'react';
import Typography from '@mui/material/Typography';
import { formatCurrency } from '../model';

const PurchasePriceCell = ({ price }) => {
    return (
        <Typography variant="body2" color="text.secondary">
            {formatCurrency(price)}
        </Typography>
    );
};

export default PurchasePriceCell;
