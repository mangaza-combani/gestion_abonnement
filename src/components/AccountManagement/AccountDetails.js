import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  Stack, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Block as BlockIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// Composant pour afficher le statut de la ligne avec la couleur appropriée
const LineStatusChip = ({ status }) => {
  switch (status) {
    case 'ACTIF':
      return <Chip label="ACTIF" color="success" size="small" />;
    case 'BLOQUÉ':
      return <Chip label="BLOQUÉ" color="error" size="small" />;
    case 'PAUSE':
      return <Chip label="PAUSE" color="warning" size="small" />;
    case 'RÉSILIÉ':
      return <Chip label="RÉSILIÉ" color="default" size="small" />;
    case 'NON ATTRIBUÉ':
      return <Chip label="NON ATTRIBUÉ" color="info" size="small" />;
    default:
      return <Chip label={status} size="small" />;
  }
};

// Composant pour afficher l'état de paiement
const PaymentStatusChip = ({ status }) => {
  switch (status) {
    case 'A JOUR':
      return <Chip label="A JOUR" color="success" size="small" />;
    case 'EN RETARD':
      return <Chip label="EN RETARD" color="warning" size="small" />;
    case 'DETTE':
      return <Chip label="DETTE" color="error" size="small" />;
    default:
      return <Chip label={status} size="small" />;
  }
};

const AccountDetails = ({ account, onAddLine, onActivateLine, onBlockLine, onPauseLine, onDeleteLine }) => {
  if (!account) return null;

  return (
    <Card sx={{ width: 380, minWidth: 380 }}>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Détails du compte
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Stack spacing={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Compte:</Typography>
              <Typography variant="body2">{account.name}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Login:</Typography>
              <Typography variant="body2">{account.login}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Email:</Typography>
              <Typography variant="body2">{account.email}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Agence:</Typography>
              <Typography variant="body2">{account.agency}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Carte:</Typography>
              <Typography variant="body2">**** **** **** {account.cardLastFour}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Expiration:</Typography>
              <Typography variant="body2">{account.cardExpiry}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Statut:</Typography>
              <Chip label={account.status} 
                color={account.status === 'ACTIF' ? 'success' : account.status === 'BLOQUÉ' ? 'error' : 'warning'} 
                size="small"
              />
            </Box>
          </Stack>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">
              Lignes ({account.lines?.length || 0}/5)
            </Typography>
            <Button 
              startIcon={<AddIcon />} 
              size="small" 
              variant="contained"
              onClick={onAddLine}
              disabled={account.lines?.length >= 5}
            >
              Ajouter
            </Button>
          </Box>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>NUMERO</TableCell>
                  <TableCell>CLIENT</TableCell>
                  <TableCell>STATUT</TableCell>
                  <TableCell>ETAT</TableCell>
                  <TableCell>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {account.lines?.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.phoneNumber}</TableCell>
                    <TableCell>{line.clientName}</TableCell>
                    <TableCell>
                      <LineStatusChip status={line.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusChip status={line.paymentStatus} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {line.status !== 'ACTIF' && (
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => onActivateLine(line)}
                            title="Activer"
                          >
                            <PlayArrowIcon fontSize="small" />
                          </IconButton>
                        )}
                        {line.status !== 'BLOQUÉ' && line.status !== 'RÉSILIÉ' && (
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => onBlockLine(line)}
                            title="Bloquer"
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        )}
                        {line.status !== 'PAUSE' && line.status !== 'RÉSILIÉ' && (
                          <IconButton 
                            size="small" 
                            color="warning"
                            onClick={() => onPauseLine(line)}
                            title="Mettre en pause"
                          >
                            <PauseIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton 
                          size="small" 
                          color="default"
                          onClick={() => onDeleteLine(line)}
                          title="Supprimer la ligne"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {!account.lines?.length && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary" py={2}>
                        Aucune ligne rattachée à ce compte
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AccountDetails;