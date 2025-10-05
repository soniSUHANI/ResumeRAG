import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/upload', label: 'Upload Resumes' },
    { path: '/search', label: 'Search' },
    { path: '/jobs', label: 'Jobs' },
  ];

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <AppBar position="static" elevation={2} sx={{ backgroundColor: '#2563eb' }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/"
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold', 
              textDecoration: 'none', 
              color: 'white' 
            }}
          >
            ResumeRAG
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  color: 'white',
                  backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;