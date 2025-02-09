import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const mockAgencies = [
  { 
    id: 1, 
    name: 'Agence Paris', 
    manager: 'Jean Dupont', 
    activeClients: 45, 
    revenue: '4,500 €',
    status: 'active' 
  },
  { 
    id: 2, 
    name: 'Agence Lyon', 
    manager: 'Marie Martin', 
    activeClients: 32, 
    revenue: '3,200 €',
    status: 'active'
  },
];

const AgenciesManagement = () => {
  const [open, setOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    manager: '',
  });

  const handleClickOpen = (agency = null) => {
    if (agency) {
      setFormData({ name: agency.name, manager: agency.manager });
      setSelectedAgency(agency);
    } else {
      setFormData({ name: '', manager: '' });
      setSelectedAgency(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAgency(null);
    setFormData({ name: '', manager: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    // Ici, vous implementerez la logique pour sauvegarder/modifier l'agence
    console.log('Form submitted:', formData);
    handleClose();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestion des Agences</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleClickOpen()}
          sx={{ borderRadius: 2 }}
        >
          Nouvelle Agence
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Responsable</TableCell>
              <TableCell align="center">Clients Actifs</TableCell>
              <TableCell align="right">Revenu Mensuel</TableCell>
              <TableCell align="center">Statut</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockAgencies.map((agency) => (
              <TableRow key={agency.id}>
                <TableCell>{agency.name}</TableCell>
                <TableCell>{agency.manager}</TableCell>
                <TableCell align="center">{agency.activeClients}</TableCell>
                <TableCell align="right">{agency.revenue}</TableCell>
                <TableCell align="center">
                  <Chip 
                    label={agency.status === 'active' ? 'Active' : 'Inactive'}
                    color={agency.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton 
                    color="primary" 
                    size="small"
                    onClick={() => handleClickOpen(agency)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedAgency ? 'Modifier l\'agence' : 'Nouvelle agence'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Nom de l'agence"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Responsable"
              name="manager"
              value={formData.manager}
              onChange={handleChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedAgency ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgenciesManagement;