import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { Button } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { PictureAsPdf, Description, FileCopy, DocumentScanner } from '@mui/icons-material';
import FileUploadOperation from 'src/routes/components/uploadfileoperation';

// Interface for file data
interface FileData {
  file: File;
  fileName: string;
  fileSize: string;
  fileType: string;
}

interface FileUploadSectionProps {
  files: FileData[];
}

// Icon Utility Function
const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case 'pdf':
      return PictureAsPdf;
    case 'doc':
    case 'docx':
      return Description;
    case 'ppt':
    case 'pptx':
      return FileCopy;
    case 'jpeg':
    case 'jpg':
    case 'png':
    case 'gif':
      return PictureAsPdf; // You can replace with an image icon if needed
    default:
      return DocumentScanner; // Fallback icon
  }
};

// File Upload Section Component
const FileUploadSection: React.FC<{ files: FileData[]; onRemove: (fileName: string) => void }> = ({
  files,
  onRemove,
}) => (
  <Box
    display="flex"
    flexDirection="column"
    gap={0.5}
    alignItems="left"
    sx={{ mb: 5, width: '80%', maxHeight: 355, overflowY: 'auto' }}
  >
    {files.length > 0 ? (
      files.map((file, index) => (
        <FileUploadOperation
          key={index}
          file={file.file}
          fileName={file.fileName}
          fileSize={file.fileSize}
          IconComponent={getFileIcon(file.fileType)}
          uploadEndpoint="http://localhost:8001/api/v1/files/upload"
          onRemove={onRemove} // Pass the remove handler
        />
      ))
    ) : (
      <Typography variant="body2">No files available to display.</Typography>
    )}
  </Box>
);

// Upload View Component
export function UploadView() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles).map((file) => ({
        file,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        fileType: file.name.split('.').pop() || 'unknown',
      }));
      setFiles((prevFiles) => {
        const existingFileNames = new Set(prevFiles.map((file) => file.fileName));
        return [...prevFiles, ...newFiles.filter((file) => !existingFileNames.has(file.fileName))];
      });
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.fileName !== fileName));
  };

  return (
    <>
      <Box display="flex" flexDirection="column" alignItems="center" gap={3} sx={{ mb: 5 }}>
        <Box
          display="flex"
          flexDirection="column"
          component="section"
          alignItems="center"
          gap={2}
          onDrop={(e) => {
            e.preventDefault();
            handleFileSelect({ target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
          }}
          onDragOver={(e) => e.preventDefault()}
          sx={{
            m: 5,
            p: 2,
            border: '2px dashed grey',
            borderRadius: 1,
            width: '80%',
            height: '250px',
          }}
        >
          <CloudUploadOutlinedIcon />
          <Typography variant="h6">Drag your files here.</Typography>
          <Typography variant="body2" gutterBottom>
            DOC, PDF, XLSX, and PPT formats, up to 50MB
          </Typography>
          <Button variant="contained" component="label">
            Browse Files
            <input type="file" hidden multiple onChange={handleFileSelect} />
          </Button>
        </Box>
        <FileUploadSection files={files} onRemove={handleRemoveFile} />
        <Box sx={{ width: '80%', mt: 2 }}>
          <Divider />
          <Typography variant="body2" sx={{ mt: 1 }}>
            {uploadStatus.join(', ')}
          </Typography>
        </Box>
      </Box>
    </>
  );
}
