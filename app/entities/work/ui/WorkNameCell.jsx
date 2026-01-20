import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { IconWorld } from '@tabler/icons-react';

const WorkNameCell = ({ work }) => {
    const hierarchyParts = [work.phase, work.section, work.subsection].filter(Boolean);
    const hierarchyText = hierarchyParts.length > 0 ? hierarchyParts.join(' → ') : null;

    return (
        <Stack direction="row" alignItems="center" spacing={1}>
          {work.isGlobal && (
            <Tooltip title="Глобальная работа" arrow placement="top">
              <IconWorld size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
            </Tooltip>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#111827', mb: 0.25 }}>
              {work.name}
            </Typography>
            {hierarchyText && (
              <Typography sx={{ fontSize: '0.6875rem', color: '#6B7280', lineHeight: 1.4 }}>
                {hierarchyText}
              </Typography>
            )}
            {work._optimistic && (
              <Chip
                label="Сохраняется..."
                size="small"
                color="warning"
                sx={{ animation: 'pulse 1.5s infinite', mt: 0.5 }}
              />
            )}
          </Box>
        </Stack>
    );
};

export default WorkNameCell;
