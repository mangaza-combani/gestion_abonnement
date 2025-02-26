import React from 'react';
import { 
  Card, 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell,
  Chip 
} from '@mui/material';

// Composant pour afficher le statut du compte avec la couleur appropriée
const StatusChip = ({ status }) => {
  let color = 'default';
  
  switch (status) {
    case 'ACTIF':
      color = 'success';
      break;
    case 'INACTIF':
      color = 'warning';
      break;
    case 'BLOQUÉ':
      color = 'error';
      break;
    default:
      color = 'default';
  }
  
  return <Chip label={status} color={color} size="small" />;
};

const AccountList = ({ accounts, selectedAccount, onAccountSelect }) => {
  return (
    <Card sx={{ flex: 1 }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>COMPTE RATTACHÉ</TableCell>
              <TableCell>LOGIN</TableCell>
              <TableCell>AGENCE</TableCell>
              <TableCell>LIGNES</TableCell>
              <TableCell>STATUT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => (
              <TableRow
                key={account.id}
                hover
                selected={selectedAccount?.id === account.id}
                onClick={() => onAccountSelect(account)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{account.name}</TableCell>
                <TableCell>{account.login}</TableCell>
                <TableCell>{account.agency}</TableCell>
                <TableCell>{account.linesCount} / 5</TableCell>
                <TableCell>
                  <StatusChip status={account.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default AccountList;