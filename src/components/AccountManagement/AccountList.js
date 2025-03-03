import React from 'react';
import { 
  Box,
  Card, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  Chip,
  Avatar,
  Tooltip,
  Typography,
  Badge,
  Fade,
  useTheme
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
  Phone as PhoneIcon,
  Person as PersonIcon
} from '@mui/icons-material';

// Composant pour afficher le statut du compte avec la couleur appropriée et une icône
const StatusChip = ({ status }) => {
  let color = 'default';
  let icon = null;
  
  switch (status) {
    case 'ACTIF':
      color = 'success';
      icon = <CheckCircleIcon fontSize="small" />;
      break;
    case 'INACTIF':
      color = 'warning';
      icon = <WarningIcon fontSize="small" />;
      break;
    case 'BLOQUÉ':
      color = 'error';
      icon = <BlockIcon fontSize="small" />;
      break;
    default:
      color = 'default';
      icon = null;
  }
  
  return (
    <Tooltip title={`Statut: ${status}`}>
      <Chip 
        label={status} 
        color={color} 
        size="small" 
        icon={icon}
        sx={{ fontWeight: 'medium' }}
      />
    </Tooltip>
  );
};

// Composant pour afficher le nombre de lignes de façon simplifiée
const LinesIndicator = ({ count, max = 5 }) => {
  const theme = useTheme();
  
  let color = "primary";
  if (count === max) color = "success";
  else if (count > (max * 0.7)) color = "warning";
  
  return (
    <Tooltip title={`${count} lignes sur ${max} maximum`}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Badge 
          badgeContent={count} 
          color={color}
          overlap="circular"
        >
          <PhoneIcon color="action" />
        </Badge>
        <Typography variant="body2" color="text.secondary">
          {count}/{max}
        </Typography>
      </Box>
    </Tooltip>
  );
};

// Composant pour afficher les initiales du compte
const AccountAvatar = ({ name, status }) => {
  let bgcolor = '';
  
  switch (status) {
    case 'ACTIF':
      bgcolor = 'success.light';
      break;
    case 'INACTIF':
      bgcolor = 'warning.light';
      break;
    case 'BLOQUÉ':
      bgcolor = 'error.light';
      break;
    default:
      bgcolor = 'grey.400';
  }
  
  // Extraire les initiales du nom
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  return (
    <Avatar 
      sx={{ 
        bgcolor, 
        color: 'white',
        width: 36,
        height: 36,
        fontSize: '0.9rem',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.1)'
        }
      }}
    >
      {initials}
    </Avatar>
  );
};

const AccountList = ({ accounts, selectedAccount, onAccountSelect }) => {
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
              <TableCell sx={{ width: 50 }}></TableCell>
              <TableCell>COMPTE</TableCell>
              <TableCell align="center">LIGNES</TableCell>
              <TableCell align="center">STATUT</TableCell>
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
                      <AccountAvatar name={account.name} status={account.status} />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={selectedAccount?.id === account.id ? 'bold' : 'regular'}>
                          {account.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonIcon fontSize="inherit" />
                          {account.login} • {account.agency}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <LinesIndicator count={account.linesCount} max={5} />
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip status={account.status} />
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