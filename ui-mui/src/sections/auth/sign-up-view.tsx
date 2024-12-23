import { useState, useCallback, SetStateAction } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignUpView() {
  const router = useRouter();

  const handleEmailChange = (e: { target: { value: SetStateAction<string> } }) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: { target: { value: SetStateAction<string> } }) => {
    setPassword(e.target.value);
  };

  const handleUsernameChange = (e: { target: { value: SetStateAction<string> } }) => {
    setUsername(e.target.value);
  };

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSignUp = useCallback(() => {
    // router.push('/');
    fetch('http://localhost:8000/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Add any data you want to send
        username,
        email,
        password,
      }),
    })
      .then((response) => {
        // Check if the response status is OK (200 range)
        if (response.status !== 201) {
          // Handle error or invalid status code
          console.error('Error creating new account:', response.status);
          return Promise.reject(new Error('Error creating new account')); // Reject if status is not OK
        }
        return response.json(); // Proceed to parse JSON if status is 200
      })
      .then((data) => {
        // Handle successful login, once the JSON is parsed
        console.log('Success:', data);
        router.push('/sign-in'); // Navigate to homepage upon successful response
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, [username, email, password, router]);

  const renderForm = (
    <Box display="flex" flexDirection="column" alignItems="flex-end">
      <TextField
        fullWidth
        name="name"
        label="Name"
        defaultValue="user"
        onChange={handleUsernameChange} // Update email state on change
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 3 }}
      />
      <TextField
        fullWidth
        name="email"
        label="Email address"
        defaultValue="user@company.com"
        onChange={handleEmailChange} // Update email state on change
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        name="password"
        label="Password"
        defaultValue="@demo1234"
        InputLabelProps={{ shrink: true }}
        onChange={handlePasswordChange} // Update password state on change
        type='password'
        // type={showPassword ? 'text' : 'password'}
        // InputProps={{
        //   endAdornment: (
        //     <InputAdornment position="end">
        //       <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
        //         <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
        //       </IconButton>
        //     </InputAdornment>
        //   ),
        // }}
        sx={{ mb: 3 }}
      />

      <TextField
        fullWidth
        name="password"
        label="Confirm Password"
        defaultValue="@demo1234"
        InputLabelProps={{ shrink: true }}
        onChange={handlePasswordChange} // Update password state on change
        type='password'
        sx={{ mb: 3 }}
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleSignUp}
      >
        Register
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Create new account</Typography>
      </Box>

      {renderForm}
    </>
  );
}
