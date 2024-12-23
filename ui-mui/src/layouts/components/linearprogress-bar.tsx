import * as React from 'react';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface LinearProgressWithLabelProps extends LinearProgressProps {
  value: number; // Accepts progress value as a prop
}

function LinearProgressWithLabel({ value }: LinearProgressWithLabelProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" value={value} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

interface LinearWithValueLabelProps {
  progress: number; // Accepts progress value as a prop
}

export default function LinearWithValueLabel({ progress }: LinearWithValueLabelProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgressWithLabel value={progress} />
    </Box>
  );
}
