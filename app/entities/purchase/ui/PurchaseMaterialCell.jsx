import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

const PurchaseMaterialCell = ({ materialName, materialImage, materialSku }) => {
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={materialImage}
              alt={materialName}
              variant="rounded"
              sx={{ width: 40, height: 40 }}
            />
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {materialName}
              </Typography>
              {materialSku && (
                <Typography variant="caption" color="text.secondary">
                  Арт: {materialSku}
                </Typography>
              )}
            </Box>
         </Stack>
    );
};

export default PurchaseMaterialCell;
