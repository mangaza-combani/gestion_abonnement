import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import {
  Phone,
  SimCard,
  Person,
  CalendarToday,
  Block,
  Warning
} from '@mui/icons-material';

const ActionModal = ({ open = false, onClose = () => {}, client = null, action = '', onConfirm = () => {} }) => {
  if (!client) return null;

  const getActionColor = () => {
    switch (action) {
      case 'block': return 'error';
      case 'unblock': return 'success';
      case 'order': return 'primary';
      default: return 'primary';
    }
  };

  const getActionTitle = () => {
    switch (action) {
      case 'block': return 'Bloquer la ligne';
      case 'unblock': return 'Débloquer la ligne';
      case 'order': return 'Commander une carte SIM';
      default: return '';
    }
  };

  const getActionWarning = () => {
    switch (action) {
      case 'block':
        return "Cette action va bloquer la ligne du client. Le client ne pourra plus utiliser ses services jusqu'au déblocage.";
      case 'unblock':
        return "Cette action va débloquer la ligne du client. Assurez-vous que le client a régularisé sa situation.";
      case 'order':
        return "Cette action va initier une commande de carte SIM pour ce client. Un coût de 10€ sera facturé.";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {action === 'block' && <Block color="error" />}
          {action === 'unblock' && <Block color="success" />}
          {action === 'order' && <SimCard color="primary" />}
          <Typography variant="h6" color={getActionColor()}>
            {getActionTitle()}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Client Info */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Informations client
            </Typography>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Person color="action" />
                <Typography>
                  {client.nom} {client.prenom}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Phone color="action" />
                <Typography>{client.telephone}</Typography>
              </Box>
              {client.compte && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Person color="action" />
                  <Typography>Compte: {client.compte}</Typography>
                </Box>
              )}
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarToday color="action" />
                <Typography>
                  Dernier paiement: {client.lastPayment || 'Non disponible'}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* SIM Card Info */}
          {client.simCard && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Carte SIM
              </Typography>
              <Stack spacing={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <SimCard color="action" />
                  <Typography>ICCID: {client.simCard.iccid}</Typography>
                </Box>
                <Chip
                  label={client.simCard.status}
                  color={client.simCard.status === 'active' ? 'success' : 'error'}
                  size="small"
                />
              </Stack>
            </Box>
          )}

          {/* Warning */}
          <Alert 
            severity={action === 'unblock' ? 'warning' : 'info'}
            icon={action === 'unblock' ? <Warning /> : null}
          >
            {getActionWarning()}
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Annuler
        </Button>
        <Button
          variant="contained"
          color={getActionColor()}
          onClick={onConfirm}
          startIcon={action === 'order' ? <SimCard /> : <Block />}
        >
          Confirmer {getActionTitle()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActionModal;