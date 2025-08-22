import React from 'react';
import SignupForm from '../components/SignupForm';
import { Container, Box, Typography } from '@mui/material';

const SignupPage = () => {
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
          Create Your Account
        </Typography>
        <SignupForm />
      </Box>
    </Container>
  );
};

export default SignupPage;