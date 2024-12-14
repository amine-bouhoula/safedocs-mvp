import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        &copy; {new Date().getFullYear()} SafeDocs. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
