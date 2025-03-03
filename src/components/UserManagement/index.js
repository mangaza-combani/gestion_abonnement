// src/components/UserManagement/UserList.js
import React from 'react';
import { 
  Card, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  Chip,
  Typography,
  useTheme,
  alpha
} from '@mui/material';

const StatusChip = ({ status }) => {
  const theme = useTheme();
  const getColor = (status) => {
    switch (status) {
      case 'ACTIF':
        return 'success';
      case 'INACTIF':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip 
      label={status} 
      color={getColor(status)} 
      size="small" 
      variant="outlined"
    />
  );
};

const UserList = ({ users, selectedUser, onUserSelect }) => {
  const theme = useTheme();

  return (
    <Card 
      sx={{ 
        flex: 1, 
        boxShadow: theme.shadows[2],
        borderRadius: 2,
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <TableContainer>
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>NOM D'UTILISATEUR</TableCell>
              <TableCell>EMAIL</TableCell>
              <TableCell>TÉLÉPHONE</TableCell>
              <TableCell>RÔLE</TableCell>
              <TableCell>AGENCE</TableCell>
              <TableCell align="center">STATUT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                hover
                selected={selectedUser?.id === user.id}
                onClick={() => onUserSelect(user)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04)
                  }
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {user.username}
                  </Typography>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.telephone}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.agency}</TableCell>
                <TableCell align="center">
                  <StatusChip status={user.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default UserList;