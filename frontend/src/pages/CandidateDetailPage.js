import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Work,
  School,
  Code,
  Email,
  Phone,
} from '@mui/icons-material';
import { resumeAPI } from '../services/api';

const CandidateDetailPage = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const response = await resumeAPI.getResume(id);
        setCandidate(response.data);
      } catch (err) {
        setError('Failed to load candidate details');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!candidate) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Candidate not found
      </Alert>
    );
  }

  const { parsedData } = candidate;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button
          component={Link}
          to="/search"
          startIcon={<ArrowBack />}
          sx={{ mr: 2 }}
        >
          Back to Search
        </Button>
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
          Candidate Details
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Personal Info Card */}
          <Card elevation={3} sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Person sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" gutterBottom>
                    {parsedData.name || 'Unknown Candidate'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {parsedData.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Email fontSize="small" color="action" />
                        <Typography variant="body1" color="textSecondary">
                          {parsedData.email}
                        </Typography>
                      </Box>
                    )}
                    {parsedData.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Phone fontSize="small" color="action" />
                        <Typography variant="body1" color="textSecondary">
                          {parsedData.phone}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Skills */}
              {parsedData.skills && parsedData.skills.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Code sx={{ mr: 1 }} />
                    Skills & Technologies
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {parsedData.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        color="primary"
                        variant="outlined"
                        size="medium"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Experience */}
          {parsedData.experience && parsedData.experience.length > 0 && (
            <Card elevation={2} sx={{ mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Work sx={{ mr: 1 }} />
                  Work Experience
                </Typography>
                <List>
                  {parsedData.experience.map((exp, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="h6" component="div">
                                  {exp.title}
                                </Typography>
                                <Typography variant="subtitle1" color="primary" gutterBottom>
                                  {exp.company}
                                </Typography>
                              </Box>
                              {exp.duration && (
                                <Chip label={exp.duration} variant="outlined" size="small" />
                              )}
                            </Box>
                          }
                          secondary={
                            exp.description && (
                              <Typography variant="body2" color="textSecondary" sx={{ mt: 1, lineHeight: 1.5 }}>
                                {exp.description}
                              </Typography>
                            )
                          }
                        />
                      </ListItem>
                      {index < parsedData.experience.length - 1 && <Divider sx={{ my: 2 }} />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {parsedData.education && parsedData.education.length > 0 && (
            <Card elevation={2}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <School sx={{ mr: 1 }} />
                  Education
                </Typography>
                <List>
                  {parsedData.education.map((edu, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="h6" component="div">
                                  {edu.degree}
                                </Typography>
                                <Typography variant="subtitle1" color="primary">
                                  {edu.institution}
                                </Typography>
                              </Box>
                              {edu.year && (
                                <Chip label={edu.year} variant="outlined" size="small" />
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < parsedData.education.length - 1 && <Divider sx={{ my: 2 }} />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* File Info */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Resume Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">
                    File Name:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {candidate.originalName}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">
                    Upload Date:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {new Date(candidate.uploadDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">
                    File Size:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {(candidate.fileSize / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/search"
                  startIcon={<ArrowBack />}
                >
                  Back to Search
                </Button>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/jobs"
                >
                  Match with Jobs
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CandidateDetailPage;