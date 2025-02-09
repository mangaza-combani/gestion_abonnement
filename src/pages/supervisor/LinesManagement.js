import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  InputAdornment,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

const mockLines = [
  { 
    id: 1, 
    number: '06 12 34 56 78', 
    status: 'active', 
    client: 'John Doe', 
    agency: 'Agence Paris',
    activationDate: '15/01/2024',
    lastPayment: '01/02/2024'
  },
  { 
    id: 2, 
    number: '06 98 76 54 32', 
    status: 'blocked', 
    client: 'Jane Smith', 
    agency: 'Agence Lyon',
    activationDate: '10/12/2023',
    lastPayment: '01/01/2024'
  },
];

const LinesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFilterOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestion des Lignes
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher une ligne..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
        <IconButton onClick={handleFilterOpen}>
          <FilterIcon />
        </IconButton>
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem>Toutes les lignes</MenuItem>
          <MenuItem>Lignes actives</MenuItem>
          <MenuItem>Lignes bloquées</MenuItem>
        </Menu>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Numéro</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Agence</TableCell>
              <TableCell>Date d'activation</TableCell>
              <TableCell>Dernier paiement</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockLines.map((line) => (
              <TableRow key={line.id}>
                <TableCell>{line.number}</TableCell>
                <TableCell>
                  <Chip
                    label={line.status === 'active' ? 'Active' : 'Bloquée'}
                    color={line.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{line.client}</TableCell>
                <TableCell>{line.agency}</TableCell>
                <TableCell>{line.activationDate}</TableCell>
                <TableCell>{line.lastPayment}</TableCell>
                <TableCell align="center">
                  <IconButton
                    color={line.status === 'active' ? 'error' : 'success'}
                    size="small"
                  >
                    {line.status === 'active' ? <BlockIcon /> : <CheckCircleIcon />}
                  </IconButton>
                  <IconButton size="small" onClick={handleMenuOpen}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Voir les détails</MenuItem>
        <MenuItem onClick={handleMenuClose}>Historique des paiements</MenuItem>
        <MenuItem onClick={handleMenuClose}>Envoyer un message</MenuItem>
      </Menu>
    </Box>
  );
};

export default LinesManagement;