import React from 'react';
import { AppBar, Toolbar, IconButton, Box, TextField, InputAdornment } from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import UserIcon from './UserIcon';

interface HeaderProps {
  onMenuClick: () => void;
  userName: string;
  profilePicture: string;
}

const SearchContainer = styled(Box)(({ theme }) => ({
  width: '70%',
  display: 'flex',
  alignItems: 'center',
  marginLeft: theme.spacing(2),
}));

const Header: React.FC<HeaderProps> = ({ onMenuClick, userName, profilePicture }) => {
  return (
    <AppBar position="fixed" sx={{ width: { sm: `calc(100% - 240px)` }, ml: { sm: `240px` } }}>
      <Toolbar>
        {/* Menu Icon for Mobile */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Modern Search Bar */}
        <SearchContainer>
          <TextField
            variant="outlined"
            placeholder="Search..."
            fullWidth
            sx={{ background: '#fff', borderRadius: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </SearchContainer>

        {/* User Icon */}
        <Box sx={{ ml: 2 }}>
          <UserIcon userName={userName} profilePicture={profilePicture} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
