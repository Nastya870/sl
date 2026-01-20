import React from 'react';
import Box from '@mui/material/Box';
import { highlightMatches } from 'shared/lib/utils/fullTextSearch';

const HighlightText = ({ text, query }) => {
  if (!query || query.trim().length === 0) {
    return <>{text}</>;
  }

  const parts = highlightMatches(text, query);

  return (
    <>
      {parts.map((part, index) => (
        part.match ? (
          <Box
            key={index}
            component="span"
            sx={{
              bgcolor: '#FEF3C7',
              color: '#92400E',
              borderRadius: '2px',
              px: 0.25
            }}
          >
            {part.text}
          </Box>
        ) : (
          <span key={index}>{part.text}</span>
        )
      ))}
    </>
  );
};

export default HighlightText;
