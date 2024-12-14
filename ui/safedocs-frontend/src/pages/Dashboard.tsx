import React, { useState, useEffect } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import DashboardContent from '../components/DashboardContent';
import Footer from '../components/Footer';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  name: string;
  profileLink: string;
  [key: string]: any;
}

const Dashboard: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; profilePicture: string }>({
    name: '',
    profilePicture: '',
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    // Retrieve token from localStorage
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    if (token) {
      // Decode the token
      const decoded = jwtDecode<DecodedToken>(token);
      console.log('name:', decoded.name);
      setUserInfo({
        name: decoded.name || 'Guest',
        profilePicture: decoded.profileLink || 'https://via.placeholder.com/32',
      });
    }
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header
        onMenuClick={handleDrawerToggle}
        userName={userInfo.name}
        profilePicture={userInfo.profilePicture}
      />
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - 240px)` } }}>
        <DashboardContent />
        <Footer />
      </Box>
    </Box>
  );
};

export default Dashboard;
