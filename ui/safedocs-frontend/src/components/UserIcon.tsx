import React from "react";
import { Box, Avatar, Typography, Menu, MenuItem } from "@mui/material";

interface UserIconProps {
  userName: string;
  profilePicture: string;
}

const UserIcon: React.FC<UserIconProps> = ({ userName, profilePicture }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {/* User Icon Section */}
      <Box
        onClick={handleMenuOpen}
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          padding: "8px",
          borderRadius: "8px",
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <Avatar
          alt={userName}
          src={profilePicture}
          sx={{ width: 32, height: 32, mr: 1 }}
        />
        <Typography variant="body1" sx={{ fontWeight: 500, color: "#555" }}>
          {userName}
        </Typography>
      </Box>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "12px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            padding: "8px",
            minWidth: "160px",
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
        <MenuItem
          onClick={async () => {
            try {
              // Notify backend about logout
              await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
              });

              // Clear local storage or session data
              localStorage.removeItem("token");

              // Redirect to login page
              window.location.href = "/login";
            } catch (error) {
              console.error("Logout failed", error);
            }
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserIcon;
