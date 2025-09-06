import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

const TempInvoiceGenerator = ({ open, onClose, client }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Facturation - {client?.firstName} {client?.lastName}
      </DialogTitle>
      
      <DialogContent>
        <Typography>
          Composant de facturation temporaire en cours de développement...
        </Typography>
        <Typography>
          Client ID: {client?.id}
        </Typography>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TempInvoiceGenerator;