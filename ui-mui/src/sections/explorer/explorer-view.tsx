import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import { Download, Share, Delete, Edit } from '@mui/icons-material';
import { format } from 'date-fns';

interface FileData {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  version: string;
  createdAt: string;
  modifiedAt: string;
  downloadUrl: string;
}

const FileExplorer: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          console.error('Authentication token not found');
          alert('You must be logged in to upload files.');
          return;
        }

        const response = await fetch('http://localhost:8001/api/v1/files/list', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        const fileData = data.files.map((file: any) => ({
          id: file.FileID,
          fileName: file.FileName,
          fileSize: `${(file.Size / (1024 * 1024)).toFixed(2)} MB`,
          fileType: file.FileName.split('.').pop() || 'unknown',
          version: file.Version || '1.0',
          downloadUrl: `/api/v1/files/download/${file.FileID}`,
        }));

        setFiles(fileData);
      } catch (err) {
        setError('Failed to fetch files.');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const deleteFile = async (fileId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Authentication token not found');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8001/api/v1/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete the file');
      }

      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Failed to delete the file');
    }
  };

  const downloadFile = async (fileId: string, fileName: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Authentication token not found');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8001/api/v1/files/download/${fileId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download the file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download the file');
    }
  };

  const editFile = (fileId: string) => {
    console.log(`Edit file with ID: ${fileId}`);
    alert('Edit file functionality is not implemented yet!');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" sx={{ p: 3, width: '100%' }}>
      <Typography variant="h5" gutterBottom>
        File Explorer
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: 1000,
          userSelect: 'none',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>File Name</strong>
              </TableCell>
              <TableCell>
                <strong>File Size</strong>
              </TableCell>
              <TableCell>
                <strong>File Type</strong>
              </TableCell>
              <TableCell>
                <strong>Version</strong>
              </TableCell>
              <TableCell>
                <strong>Created At</strong>
              </TableCell>
              <TableCell>
                <strong>Modified At</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((file) => (
              <TableRow
                key={file.id}
                sx={{
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    '& .MuiTableCell-root': {
                      fontWeight: 'bold',
                    },
                  },
                  cursor: 'pointer',
                }}
              >
                <TableCell>{file.fileName}</TableCell>
                <TableCell>{file.fileSize}</TableCell>
                <TableCell>{file.fileType}</TableCell>
                <TableCell>{file.version}</TableCell>
                <TableCell>{file.createdAt}</TableCell>
                <TableCell>{file.modifiedAt}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => downloadFile(file.id, file.fileName)}>
                    <Download />
                  </IconButton>
                  <IconButton color="primary" onClick={() => editFile(file.id)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => deleteFile(file.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export function FileExplorerView() {
  return (
    <>
      <FileExplorer />
    </>
  );
}
