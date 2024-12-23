import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
} from "@mui/material";

const DashboardContent: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Upload Section */}
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" gutterBottom>
          Upload Files
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Button variant="contained" component="label" color="primary">
          Upload File
          <input type="file" hidden onChange={handleFileUpload} multiple />
        </Button>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          {files.length} file(s) uploaded.
        </Typography>
      </Paper>

      {/* Files List Section */}
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" gutterBottom>
          Files List
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box>
          {files.length > 0 ? (
            files.map((file, index) => (
              <Typography key={index} variant="body1">
                {index + 1}. {file.name}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No files uploaded yet.
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Stats Section */}
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h5" gutterBottom>
          Statistics
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              Total Files: {files.length}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              Storage Used: {(files.length * 0.5).toFixed(2)} MB
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              Uploads Today: {files.length}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default DashboardContent;
