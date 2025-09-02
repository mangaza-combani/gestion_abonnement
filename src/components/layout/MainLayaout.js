import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  PhoneAndroid,
  Settings,
  ExitToApp,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { logOut, useLogoutMutation } from '../../store/slices/authSlice';
import NotificationCenter from '../notifications/NotificationCenter';

const drawerWidth = 280;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role } = useSelector((state) => {
        const localStorageUser = localStorage.getItem('user');
        if (!localStorageUser) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          return { role: null };
        }
        
        let parsedUser = null;
        try {
          parsedUser = JSON.parse(localStorageUser);
        } catch (error) {
          console.error('Invalid user data in localStorage:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          return { role: null };
        }
        
        const user = parsedUser || user;
    return {
      role: user ? user.role : null,
    };
  });

  // Utiliser le hook de déconnexion de RTK Query
  const [logout] = useLogoutMutation();
  

  const menuItems = role === 'SUPERVISOR' || role === 'ADMIN' || role === 'SUPER_ADMIN'
    ? [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Gestion Agences', icon: <People />, path: '/agencies' },
        { text: 'Gestion Lignes', icon: <PhoneAndroid />, path: '/lines' },
        { text: 'C.rattacher', icon: <People />, path: '/accountresign' },
        { text: 'Paramètres', icon: <Settings />, path: '/settings' },
        { text: 'Utilisateur', icon: <Settings />, path: '/user' },
      ]
    : [
              { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
              { text: 'Clients', icon: <People />, path: '/clients' },
              { text: 'Mes Lignes', icon: <PhoneIcon />, path: '/my-lines' },
              { text: 'Stock SIM', icon: <PhoneAndroid />, path: '/sim-stock' },
      ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };


  const handleLogout = async () => {
    try {
      // Appel API pour déconnecter l'utilisateur côté serveur
      await logout().unwrap();
      // Ensuite mise à jour de l'état local
      dispatch(logOut());
      navigate('/login');
    } catch (err) {
      // En cas d'erreur, on déconnecte quand même côté client
      console.error('Erreur lors de la déconnexion:', err);
      dispatch(logOut());
      navigate('/login');
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {user?.username?.[0]?.toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {user?.username}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {role === 'SUPERVISOR' || role === "ADMIN" || role === "SUPER_ADMIN" ? 'Superviseur' : 'Agence'}
          </Typography>
        </Box>
      </Box>
      <List>
        {menuItems?.map((item) => (
          <ListItem
            component="button"
            key={item.text}
            onClick={() => handleNavigate(item.path)}
            sx={{
              my: 0.5,
              mx: 1,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'primary.light',
                '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                  color: 'white',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {role === 'SUPERVISOR' || role === "ADMIN" || role === "SUPER_ADMIN" ? 'Superviseur' : "Agence"}
          </Typography>
          <NotificationCenter />
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user?.firstname?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
          {/* Menu de profil */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToApp fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Déconnexion" />
            </MenuItem>
          </Menu>

        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;