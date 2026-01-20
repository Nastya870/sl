import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { IconWorld, IconBuilding } from '@tabler/icons-react';
import HighlightText from './HighlightText';

const MaterialNameCell = ({ material, searchTerm }) => {
    return (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title={material.isGlobal ? 'Глобальный материал' : 'Материал компании'}>
            {material.isGlobal ? (
              <IconWorld size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
            ) : (
              <IconBuilding size={14} style={{ color: '#9CA3AF', flexShrink: 0 }} />
            )}
          </Tooltip>
          <Typography sx={{ fontSize: '0.8125rem', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <HighlightText text={material.name} query={searchTerm} />
          </Typography>
          {material._optimistic && (
            <Chip
              label="Сохраняется..."
              size="small"
              color="warning"
              sx={{ animation: 'pulse 1.5s infinite' }}
            />
          )}
        </Stack>
    );
};

export default MaterialNameCell;
