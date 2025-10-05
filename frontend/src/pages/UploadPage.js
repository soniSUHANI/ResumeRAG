import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
} from '@mui/material';
import { Upload as UploadIcon, Refresh } from '@mui/icons-material';
import FileUpload from '../components/FileUpload';
import { resumeAPI } from '../services/api';

const UploadPage = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFilesUpload = async (files) => {
    setIsUploading(true);
    setUploadProgress(0);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('resumes', file);
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await resumeAPI.uploadResumes(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);

      setUploadedFiles(response.data.resumes);
      setMessage({
        type: 'success',
        text: `Successfully processed ${files.length} resume(s)!`
      });

      // Reset progress after 2 seconds
      setTimeout(() => setUploadProgress(0), 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to upload resumes'
      });
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setUploadedFiles([]);
    setMessage({ type: '', text: '' });
  };

  const stats = {
    total: uploadedFiles.length,
    successful: uploadedFiles.filter(f => !f.error).length,
    failed: uploadedFiles.filter(f => f.error).length
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
        Upload Resumes
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Upload multiple resumes in PDF or TXT format. The system will automatically parse and extract candidate information for search and matching.
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Card elevation={3}>
            <CardContent sx={{ p: 4 }}>
              {message.text && (
                <Alert 
                  severity={message.type} 
                  sx={{ mb: 3 }}
                  action={
                    message.type === 'success' && (
                      <Button color="inherit" size="small" onClick={handleReset}>
                        <Refresh sx={{ mr: 1 }} />
                        Reset
                      </Button>
                    )
                  }
                >
                  {message.text}
                </Alert>
              )}

              <FileUpload
                onFilesUpload={handleFilesUpload}
                uploadProgress={uploadProgress}
                uploadedFiles={uploadedFiles}
                isUploading={isUploading}
              />

              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => document.querySelector('input[type="file"]').click()}
                  disabled={isUploading}
                >
                  Select Files
                </Button>
                <Typography variant="body2" color="textSecondary">
                  Or drag and drop files into the area above
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Stats Card */}
            {uploadedFiles.length > 0 && (
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Upload Summary
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                    <Chip 
                      label={`Total: ${stats.total}`} 
                      variant="outlined" 
                      color="primary" 
                    />
                    <Chip 
                      label={`Success: ${stats.successful}`} 
                      variant="outlined" 
                      color="success" 
                    />
                    {stats.failed > 0 && (
                      <Chip 
                        label={`Failed: ${stats.failed}`} 
                        variant="outlined" 
                        color="error" 
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Tips Card */}
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Tips for Best Results
                </Typography>
                <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Use clear, text-based PDF files for best parsing
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Ensure resumes have proper formatting
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    Upload up to 10 files at a time
                  </Typography>
                  <Typography component="li" variant="body2">
                    Supported formats: PDF, TXT
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UploadPage;