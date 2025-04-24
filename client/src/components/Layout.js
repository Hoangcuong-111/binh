import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Paper,
  Button,
  Avatar,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import DvrIcon from '@mui/icons-material/Dvr';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useState } from 'react';

function Layout({ children, user, onLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    onLogout();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar 
        position="static" 
        sx={{ 
          mb: 2,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DvrIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div">
              Quản lý thiết bị
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">
              {user.fullName}
            </Typography>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ 
                color: 'white',
                '&:hover': {
                  transform: 'scale(1.1)',
                  transition: 'transform 0.2s'
                }
              }}
            >
              <AccountCircleIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              sx={{
                '& .MuiPaper-root': {
                  mt: 1,
                  minWidth: 150,
                }
              }}
            >
              <MenuItem sx={{ color: 'text.secondary' }}>
                Vai trò: {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
              </MenuItem>
              <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container component="main" sx={{ flex: 1, mb: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: 6,
              transform: 'translateY(-2px)'
            }
          }}
        >
          {children}
        </Paper>
      </Container>

      {/* Footer */}
      <Paper 
        component="footer" 
        square 
        variant="outlined" 
        sx={{ 
          mt: 'auto', 
          py: 2,
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} Hệ thống Quản lý Thiết bị
          </Typography>
        </Container>
      </Paper>
    </Box>
  );
}

export default Layout;