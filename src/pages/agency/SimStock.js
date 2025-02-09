import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const mockSimCards = [
  { 
    id: 1, 
    iccid: '8933150319xxxx',
    status: 'available',
    receivedDate: '10/01/2024',
  },
  { 
    id: 2, 
    iccid: '8933150319yyyy',
    status: 'assigned',
    receivedDate: '05/01/2024',
    assignedTo: 'John Doe',
  },
];

const SimStock = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestion du Stock SIM</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2 }}
        >
          Déclarer Réception
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 2, bgcolor: 'success.lighter', borderRadius: 2 }}>
              <AssignmentIcon color="success" />
            </Box>
            <Box>
              <Typography color="textSecondary" variant="subtitle2">
                Stock Disponible
              </Typography>
              <Typography variant="h4">23</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 2, bgcolor: 'warning.lighter', borderRadius: 2 }}>
              <WarningIcon color="warning" />
            </Box>
            <Box>
              <Typography color="textSecondary" variant="subtitle2">
                Seuil d'Alerte
              </Typography>
              <Typography variant="h4">10</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ICCID</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date de Réception</TableCell>
              <TableCell>Assigné à</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockSimCards.map((sim) => (
              <TableRow key={sim.id}>
                <TableCell>{sim.iccid}</TableCell>
                <TableCell>
                  <Chip
                    label={sim.status === 'available' ? 'Disponible' : 'Assignée'}
                    color={sim.status === 'available' ? 'success' : 'primary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{sim.receivedDate}</TableCell>
                <TableCell>{sim.assignedTo || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SimStock;
