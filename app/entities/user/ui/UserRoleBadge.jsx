import React from 'react';
import Box from '@mui/material/Box';
import { getRoleNames, getRoleBadgeStyle } from '../model';

const UserRoleBadge = ({ roles }) => {
    return (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: '6px',
            px: '8px',
            py: '3px',
            fontSize: '12px',
            fontWeight: 500,
            ...getRoleBadgeStyle(roles)
          }}
        >
          {getRoleNames(roles)}
        </Box>
    );
};

export default UserRoleBadge;
