import React, { useState } from 'react';
import { 
  Box,
  Card, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  Typography,
  Fade,
  useTheme,
  IconButton
} from '@mui/material';
import { 
  Email as EmailIcon,
  Home as HomeIcon,
  Password as PasswordIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

// Composant pour afficher le mot de passe avec possibilité de le révéler
const PasswordDisplay = ({ password }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePassword = (event) => {
    event.stopPropagation(); // Empêche le déclenchement de l'événement onClick du TableRow
    setShowPassword(!showPassword);
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <PasswordIcon fontSize="small" color="action" />
      <Typography variant="body2" sx={{ flex: 1 }}>
        {showPassword ? password : '••••••••'}
      </Typography>
      <IconButton 
        size="small" 
        onClick={togglePassword}
        sx={{ ml: 1 }}
      >
        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
      </IconButton>
    </Box>
  );
};

const AccountList = ({ accounts, selectedAccount, onAccountSelect }) => {
  console.log('AccountList', accounts);
  const theme = useTheme();
  
  return (
    <Card 
      elevation={2}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: 4
        }
      }}
    >
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>LOGIN</TableCell>
              <TableCell>MOT DE PASSE</TableCell>
              <TableCell>AGENCE</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Aucun compte ne correspond aux critères de recherche
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <Fade key={account.id} in={true} timeout={300}>
                  <TableRow
                    hover
                    selected={selectedAccount?.id === account.id}
                    onClick={() => onAccountSelect(account)}
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&.Mui-selected': {
                        backgroundColor: `${theme.palette.primary.light}20`
                      },
                      '&.Mui-selected:hover': {
                        backgroundColor: `${theme.palette.primary.light}30`
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={selectedAccount?.id === account.id ? 'bold' : 'regular'}>
                        {account.redId || ''}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <PasswordDisplay password={account.password || 'Non défini'} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <HomeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {typeof account.agency === 'string' ? account.agency.name : (
                            account.agency.name || ''
                          )}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                </Fade>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default AccountList;