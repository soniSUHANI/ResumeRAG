import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Slider,
} from '@mui/material';
import { Search as SearchIcon, Person, Star } from '@mui/icons-material';
import { askAPI } from '../services/api';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [k, setK] = useState(3);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await askAPI.askQuestion(query, k);
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search resumes');
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    "Find candidates with Python and React experience",
    "Who has machine learning skills?",
    "Show me candidates with AWS certification",
    "Find developers with 5+ years experience",
    "Who knows Docker and Kubernetes?"
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
        Search Resumes
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Ask questions about candidates and get AI-powered answers with evidence from their resumes.
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Card elevation={3} sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Ask a question about candidates..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                variant="outlined"
                placeholder="e.g., Find candidates with Python and React experience"
                sx={{ mb: 3 }}
                disabled={loading}
              />

              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                  Number of results: {k}
                </Typography>
                <Slider
                  value={k}
                  onChange={(e, newValue) => setK(newValue)}
                  min={1}
                  max={10}
                  marks
                  valueLabelDisplay="auto"
                  disabled={loading}
                />
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                size="large"
              >
                {loading ? 'Searching...' : 'Search Resumes'}
              </Button>
            </CardContent>
          </Card>

          {/* Sample Queries */}
          <Card elevation={2} sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Try these sample queries:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {sampleQueries.map((sample, index) => (
                  <Chip
                    key={index}
                    label={sample}
                    onClick={() => setQuery(sample)}
                    variant="outlined"
                    clickable
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Results */}
          {results && (
            <Box>
              {/* Answer */}
              <Card elevation={2} sx={{ mb: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Star sx={{ mr: 1, color: 'gold' }} />
                    Answer
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6, fontSize: '1.1rem' }}>
                    {results.answer}
                  </Typography>
                </CardContent>
              </Card>

              {/* Evidence */}
              <Typography variant="h5" gutterBottom color="primary">
                Evidence from Resumes
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Found {results.evidence.length} relevant candidates out of {results.totalResumes} total resumes
              </Typography>

              {results.evidence.map((evidence, index) => (
                <Card key={index} elevation={1} sx={{ mb: 3, border: '1px solid #e2e8f0' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person color="primary" />
                        <Typography variant="h6" component="h3">
                          {evidence.resume.name || 'Unknown Candidate'}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`Match: ${evidence.score} points`} 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                    
                    {evidence.resume.skills && evidence.resume.skills.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Skills:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {evidence.resume.skills.slice(0, 8).map((skill, skillIndex) => (
                            <Chip
                              key={skillIndex}
                              label={skill}
                              size="small"
                              variant="outlined"
                              color="secondary"
                            />
                          ))}
                          {evidence.resume.skills.length > 8 && (
                            <Chip
                              label={`+${evidence.resume.skills.length - 8} more`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      Relevant content:
                    </Typography>
                    
                    <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f8fafc' }}>
                      <List dense>
                        {evidence.snippets.map((snippet, snippetIndex) => (
                          <React.Fragment key={snippetIndex}>
                            <ListItem sx={{ px: 0 }}>
                              <ListItemText 
                                primary={
                                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                                    {snippet}
                                  </Typography>
                                } 
                              />
                            </ListItem>
                            {snippetIndex < evidence.snippets.length - 1 && (
                              <Divider variant="inset" component="li" />
                            )}
                          </React.Fragment>
                        ))}
                      </List>
                    </Paper>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Search Tips
              </Typography>
              <Box component="ul" sx={{ pl: 2, color: 'text.secondary' }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Be specific about skills and technologies
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Use natural language questions
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Adjust the slider for more or fewer results
                </Typography>
                <Typography component="li" variant="body2">
                  Results are ranked by relevance score
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchPage;