import React from 'react';
import Box from '@mui/material/Box';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';

const UserStatusBadge = ({ isActive }) => {
    return isActive ? (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            bgcolor: '#DCFCE7',
            color: '#15803D',
            borderRadius: '6px',
            px: '8px',
            py: '3px',
            fontSize: '12px',
            fontWeight: 500
          }}
        >
          <IconCircleCheck size={14} style={{ color: '#15803D' }} />
          Активен
        </Box>
      ) : (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            bgcolor: '#F3F4F6',
            color: '#6B7280',
            borderRadius: '6px',
            px: '8px',
            py: '3px',
            fontSize: '12px',
            fontWeight: 500
          }}
        >
          <IconCircleX size={14} />
          Неактивен
        </Box>
      );
};

export default UserStatusBadge;
