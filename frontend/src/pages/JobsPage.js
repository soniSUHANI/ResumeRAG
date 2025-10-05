import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Work as WorkIcon,
  CheckCircle,
  Cancel,
  Person,
  TrendingUp,
} from '@mui/icons-material';
import { jobAPI } from '../services/api';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [matches, setMatches] = useState(null);
  const [matching, setMatching] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    preferredSkills: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
  });

  const handleCreateJob = async () => {
    try {
      const jobData = {
        ...newJob,
        requirements: newJob.requirements.split('\n').filter(r => r.trim()),
        preferredSkills: newJob.preferredSkills.split(',').map(s => s.trim()).filter(s => s),
        salaryRange: {
          min: parseInt(newJob.salaryMin) || 0,
          max: parseInt(newJob.salaryMax) || 0,
        }
      };

      const response = await jobAPI.createJob(jobData);
      setJobs(prev => [...prev, response.data]);
      setOpenDialog(false);
      setNewJob({
        title: '',
        company: '',
        description: '',
        requirements: '',
        preferredSkills: '',
        location: '',
        salaryMin: '',
        salaryMax: '',
      });
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const handleMatchJob = async (jobId, top_n = 5) => {
    setMatching(true);
    try {
      const response = await jobAPI.matchJob(jobId, top_n);
      setMatches(response.data);
      setSelectedJob(jobs.find(j => j._id === jobId));
    } catch (error) {
      console.error('Error matching job:', error);
    } finally {
      setMatching(false);
    }
  };

  const sampleJobs = [
    {
      _id: '1',
      title: 'Full Stack Developer',
      company: 'Tech Corp',
      requirements: ['React', 'Node.js', 'MongoDB', '3+ years experience'],
      preferredSkills: ['TypeScript', 'AWS', 'Docker'],
      location: 'Remote',
    },
    {
      _id: '2',
      title: 'Data Scientist',
      company: 'Data Insights',
      requirements: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
      preferredSkills: ['TensorFlow', 'PyTorch', 'Big Data'],
      location: 'New York, NY',
    }
  ];

  // Use sample jobs for demo
  React.useEffect(() => {
    setJobs(sampleJobs);
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            Job Management
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Create job postings and find the best matching candidates
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create Job
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Jobs List */}
        <Grid item xs={12} lg={6}>
          <Typography variant="h5" gutterBottom color="primary">
            Job Postings
          </Typography>
          {jobs.length === 0 ? (
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom color="textSecondary">
                  No Jobs Created
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Create your first job posting to start matching with candidates
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenDialog(true)}
                >
                  Create Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card key={job._id} elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {job.title}
                      </Typography>
                      <Typography variant="body1" color="primary" gutterBottom>
                        {job.company}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {job.location}
                      </Typography>
                    </Box>
                    <Chip label="Active" color="success" variant="outlined" />
                  </Box>

                  {job.requirements && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        Requirements:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {job.requirements.slice(0, 4).map((req, index) => (
                          <Chip key={index} label={req} size="small" variant="outlined" />
                        ))}
                        {job.requirements.length > 4 && (
                          <Chip label={`+${job.requirements.length - 4} more`} size="small" />
                        )}
                      </Box>
                    </Box>
                  )}

                  <Button
                    variant="outlined"
                    onClick={() => handleMatchJob(job._id)}
                    disabled={matching}
                    startIcon={<TrendingUp />}
                  >
                    {matching && selectedJob?._id === job._id ? 'Matching...' : 'Find Candidates'}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </Grid>

        {/* Matching Results */}
        <Grid item xs={12} lg={6}>
          <Typography variant="h5" gutterBottom color="primary">
            Candidate Matches
          </Typography>
          
          {!matches ? (
            <Card elevation={2}>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom color="textSecondary">
                  No Matches Yet
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Select a job and click "Find Candidates" to see matching resumes
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Matches for {matches.job.title} at {matches.job.company}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                  <Chip 
                    label={`${matches.matches.length} candidates`} 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={`${matches.summary.requirements} requirements`} 
                    variant="outlined" 
                  />
                </Box>

                <List>
                  {matches.matches.map((match, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          <Person color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="h6">
                                {match.candidate.name || 'Unknown Candidate'}
                              </Typography>
                              <Chip 
                                label={`${match.matchPercentage}% match`} 
                                color={
                                  match.matchPercentage >= 80 ? 'success' :
                                  match.matchPercentage >= 60 ? 'warning' : 'error'
                                }
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              {/* Matching Skills */}
                              {match.matchingSkills.length > 0 && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="body2" fontWeight="medium">
                                    Matching Skills:
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                    {match.matchingSkills.map((skill, skillIndex) => (
                                      <Chip
                                        key={skillIndex}
                                        label={skill}
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              )}

                              {/* Missing Requirements */}
                              {match.missingRequirements.length > 0 && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="body2" fontWeight="medium" color="error">
                                    Missing Requirements:
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                    {match.missingRequirements.slice(0, 3).map((req, reqIndex) => (
                                      <Chip
                                        key={reqIndex}
                                        label={req}
                                        size="small"
                                        color="error"
                                        variant="outlined"
                                      />
                                    ))}
                                    {match.missingRequirements.length > 3 && (
                                      <Chip
                                        label={`+${match.missingRequirements.length - 3} more`}
                                        size="small"
                                      />
                                    )}
                                  </Box>
                                </Box>
                              )}

                              {/* Score Details */}
                              <Typography variant="body2" color="textSecondary">
                                Match score: {match.score} points
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < matches.matches.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Create Job Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            Create New Job Posting
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Job Title"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                placeholder="e.g., Senior Frontend Developer"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                value={newJob.company}
                onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                placeholder="Your company name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={newJob.location}
                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                placeholder="e.g., Remote, New York, NY"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Salary"
                type="number"
                value={newJob.salaryMin}
                onChange={(e) => setNewJob({ ...newJob, salaryMin: e.target.value })}
                placeholder="50000"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Salary"
                type="number"
                value={newJob.salaryMax}
                onChange={(e) => setNewJob({ ...newJob, salaryMax: e.target.value })}
                placeholder="120000"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Job Description"
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Requirements (one per line)"
                value={newJob.requirements}
                onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                placeholder="5+ years of experience&#10;React proficiency&#10;Computer Science degree"
                helperText="Enter each requirement on a new line"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Preferred Skills (comma separated)"
                value={newJob.preferredSkills}
                onChange={(e) => setNewJob({ ...newJob, preferredSkills: e.target.value })}
                placeholder="TypeScript, AWS, Docker, Kubernetes"
                helperText="Separate skills with commas"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateJob}
            disabled={!newJob.title || !newJob.company}
          >
            Create Job
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobsPage;