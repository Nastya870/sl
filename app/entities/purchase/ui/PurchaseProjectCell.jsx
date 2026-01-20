import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const PurchaseProjectCell = ({ projectName, estimateName }) => {
    return (
        <Box>
            <Typography variant="body2" color="text.primary" fontWeight={500}>
              {projectName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {estimateName}
            </Typography>
        </Box>
    );
};

export default PurchaseProjectCell;
