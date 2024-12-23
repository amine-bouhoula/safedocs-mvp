import React, { useState, useEffect } from "react";
import { Box, CssBaseline, Card, CardContent, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DashboardContent from "../components/DashboardContent";
import Footer from "../components/Footer";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  name: string;
  profileLink: string;
  [key: string]: any;
}

const Dashboard: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    name: string;
    profilePicture: string;
  }>({
    name: "",
    profilePicture: "",
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    // Retrieve token from localStorage
    const token = localStorage.getItem("token");
    console.log("Token:", token);
    if (token) {
      // Decode the token
      const decoded = jwtDecode<DecodedToken>(token);
      console.log("name:", decoded.name);
      setUserInfo({
        name: decoded.name || "Guest",
        profilePicture: decoded.profileLink || "https://via.placeholder.com/32",
      });
    }
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Header */}
      <Header
        onMenuClick={handleDrawerToggle}
        userName={userInfo.name}
        profilePicture={userInfo.profilePicture}
      />

      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: { sm: 240 }, // Offset for sidebar
          width: { sm: `calc(100% - 240px)` },
          minHeight: "100vh",
          backgroundColor: "#f4f6f8",
          p: 3,
        }}
      >
        <Grid container spacing={1}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Dashboard Content
              </Typography>
              <DashboardContent />
            </CardContent>
          </Card>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
