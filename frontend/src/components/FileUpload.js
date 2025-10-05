import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Paper,
  Typography,
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  PictureAsPdf,
  Description,
} from '@mui/icons-material';

const FileUpload = ({ onFilesUpload, uploadProgress, uploadedFiles, isUploading }) => {
  const onDrop = useCallback((acceptedFiles) => {
    onFilesUpload(acceptedFiles);
  }, [onFilesUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt']
    },
    multiple: true,
    maxFiles: 10
  });

  const getFileIcon = (filename) => {
    if (filename.toLowerCase().endsWith('.pdf')) {
      return <PictureAsPdf color="error" />;
    }
    return <Description color="primary" />;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        {...getRootProps()}
        sx={{
          p: 6,
          textAlign: 'center',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          backgroundColor: isDragActive ? '#f0f9ff' : '#f8fafc',
          border: '2px dashed #cbd5e1',
          '&:hover': {
            backgroundColor: isUploading ? '#f8fafc' : '#f1f5f9',
          },
          opacity: isUploading ? 0.6 : 1,
        }}
      >
        <input {...getInputProps()} disabled={isUploading} />
        <CloudUpload sx={{ fontSize: 64, color: '#64748b', mb: 2 }} />
        <Typography variant="h5" gutterBottom color="textSecondary">
          {isDragActive ? 'Drop resumes here...' : 'Drag & drop resumes here'}
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
          or click to select files
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Supports PDF and TXT files. Max 10 files at once.
        </Typography>
        <Chip 
          label="PDF & TXT files supported" 
          variant="outlined" 
          size="small" 
          sx={{ mt: 2 }} 
        />
      </Paper>

      {uploadProgress > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" gutterBottom>
            Uploading files... {uploadProgress}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      )}

      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Uploaded Files ({uploadedFiles.length})
          </Typography>
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {uploadedFiles.map((file, index) => (
              <ListItem 
                key={index}
                sx={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor: file.error ? '#fef2f2' : '#ffffff'
                }}
              >
                <ListItemIcon>
                  {getFileIcon(file.originalName)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {file.originalName}
                      </Typography>
                      {file.error && (
                        <Chip label="Error" color="error" size="small" />
                      )}
                    </Box>
                  }
                  secondary={
                    file.error ? (
                      <Typography variant="body2" color="error">
                        {file.error}
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body2" color="textSecondary">
                          Size: {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                        {file.parsedData?.name && file.parsedData.name !== 'Unknown' && (
                          <Typography variant="body2" color="primary">
                            Candidate: {file.parsedData.name}
                          </Typography>
                        )}
                        {file.parsedData?.skills && file.parsedData.skills.length > 0 && (
                          <Typography variant="body2" color="textSecondary">
                            Skills: {file.parsedData.skills.slice(0, 3).join(', ')}
                            {file.parsedData.skills.length > 3 && '...'}
                          </Typography>
                        )}
                      </Box>
                    )
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;