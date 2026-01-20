import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const MaterialImageCell = ({ material }) => {
    return (
        <Box
          sx={{
            width: 35,
            height: 35,
            borderRadius: '4px',
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#F9FAFB'
          }}
        >
          {material.showImage && material.image ? (
            <Box
              component="img"
              src={material.image}
              alt={material.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <Typography sx={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
              —
            </Typography>
          )}
        </Box>
    );
};

export default MaterialImageCell;
