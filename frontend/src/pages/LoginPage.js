import React from 'react';
import LoginForm from '../components/LoginForm';
import { Container, Box, Typography } from '@mui/material';

const LoginPage = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Login to Your Account
        </Typography>
        <LoginForm />
      </Box>
    </Container>
  );
};

export default LoginPage;