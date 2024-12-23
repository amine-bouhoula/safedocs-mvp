import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { SvgIconComponent } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import LinearWithValueLabel from '../../layouts/components/linearprogress-bar';

interface FileUploadOperationProps {
  file: File;
  fileName: string;
  fileSize: string;
  IconComponent: SvgIconComponent;
  uploadEndpoint: string; // URL of the upload endpoint
}

const FileUploadOperation: React.FC<FileUploadOperationProps> = ({
  file,
  fileName,
  fileSize,
  IconComponent,
  uploadEndpoint,
}) => {
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'paused' | 'completed'>(
    'idle'
  );
  const [progress, setProgress] = useState(0); // Track upload progress
  const [isCompleted, setIsCompleted] = useState(false); // Manage green check state

  useEffect(() => {
    // Reset green check and progress when a new file is selected
    setUploadState('idle');
    setProgress(0);
    setIsCompleted(false);
  }, [file]);

  const handleStartPauseClick = async () => {
    const token = localStorage.getItem('token'); // Get token from localStorage

    if (!token) {
      console.error('Authentication token not found');
      alert('You must be logged in to upload files.');
      return;
    }

    try {
      if (uploadState === 'idle' || uploadState === 'paused') {
        // Start or resume the upload
        setUploadState('uploading');
        console.log(`Starting upload for ${fileName}`);

        // Actual upload logic
        const formData = new FormData();
        formData.append('files', file);
        formData.append('fileName', fileName);
        formData.append('fileSize', fileSize);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadEndpoint, true);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        // Update progress during upload
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setProgress(percentComplete);
          }
        };

        // Handle upload completion
        xhr.onload = () => {
          if (xhr.status === 200) {
            setUploadState('completed');
            setIsCompleted(true);
            console.log(`Upload completed for ${fileName}`);
          } else {
            console.error('Upload failed');
            alert('Upload failed');
            setUploadState('paused');
          }
        };

        // Handle upload error
        xhr.onerror = () => {
          console.error('Upload error');
          alert('Upload error');
          setUploadState('paused');
        };

        xhr.send(formData);
      } else if (uploadState === 'uploading') {
        // Pause the upload
        setUploadState('paused');
        console.log(`Pausing upload for ${fileName}`);
      }
    } catch (error) {
      console.error('Error starting upload:', error);
      alert('An error occurred while starting the upload. Please try again.');
      setUploadState('paused');
    }
  };

  const handleCancelClick = () => {
    // Reset state to idle
    setUploadState('idle');
    setProgress(0);
    setIsCompleted(false);
    console.log(`Cancelling upload for ${fileName}`);
  };

  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <Box
        display="flex"
        flexDirection="column"
        sx={{
          p: 2,
          border: '2px solid grey',
          borderRadius: 1,
          transition: 'border-color 0.3s ease',
          '&:hover': {
            borderColor: 'lightblue',
          },
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <IconComponent fontSize="large" />
            <Box display="flex" flexDirection="column">
              <Typography variant="h6" gutterBottom>
                {fileName}
              </Typography>
              <Typography variant="overline" gutterBottom sx={{ display: 'block' }}>
                {fileSize}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {isCompleted ? (
              <CheckCircleIcon fontSize="large" color="success" />
            ) : (
              <>
                <IconButton
                  onClick={handleStartPauseClick}
                  sx={{
                    '&:hover': { transform: 'scale(1.2)' },
                    color: uploadState === 'uploading' ? 'red' : 'green',
                  }}
                >
                  {uploadState === 'uploading' ? (
                    <PauseIcon fontSize="large" />
                  ) : (
                    <PlayArrowIcon fontSize="large" />
                  )}
                </IconButton>
                <IconButton
                  onClick={handleCancelClick}
                  sx={{ '&:hover': { transform: 'scale(1.2)' } }}
                >
                  <CloseIcon fontSize="large" />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
        <Box>
          <LinearWithValueLabel progress={progress} />
        </Box>
      </Box>
    </Box>
  );
};

export default FileUploadOperation;
