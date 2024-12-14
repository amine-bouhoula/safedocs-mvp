import React from 'react';
import { Container, Typography, Toolbar } from '@mui/material';

const DashboardContent: React.FC = () => {
  return (
    <>
      <Toolbar />
      <Container>
        <Typography variant="h4" gutterBottom>
          Welcome to SafeDocs Dashboard
        </Typography>
        <Typography variant="body1">
          Here you can manage your documents, check reports, and adjust settings.
        </Typography>
      </Container>
    </>
  );
};

export default DashboardContent;
