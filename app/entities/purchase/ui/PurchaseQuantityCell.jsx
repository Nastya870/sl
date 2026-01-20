import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const PurchaseQuantityCell = ({ quantity, unit }) => {
    return (
        <Box>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {quantity}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {unit}
            </Typography>
        </Box>
    );
};

export default PurchaseQuantityCell;
