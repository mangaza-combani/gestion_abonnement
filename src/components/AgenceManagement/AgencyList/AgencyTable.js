// src/components/agencies/AgencyList/AgencyTable.jsx
import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Payment as PaymentIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  PhoneIcon,
  WarningIcon
} from '@mui/icons-material';

const AgencyTable = ({ 
  agencies, 
  sortConfig, 
  onSort, 
  onToggleStatus, 
  onOpenDetails, 
  onOpenSettings, 
  onOpenPayment 
}) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="tableau des agences">
        <TableHead>
          <TableRow>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => onSort('name')}>
                Nom 
                {sortConfig.key === 'name' && (
                  sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                )}
              </Box>
            </TableCell>
            <TableCell>Contact</TableCell>
            <TableCell align="center">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => onSort('activeLines')}>
                Lignes Actives
                {sortConfig.key === 'activeLines' && (
                  sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                )}
              </Box>
            </TableCell>
            <TableCell align="center">Lignes en Dette</TableCell>
            <TableCell align="right">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', cursor: 'pointer' }} onClick={() => onSort('revenueTotal')}>
                CA Total
                {sortConfig.key === 'revenueTotal' && (
                  sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                )}
              </Box>
            </TableCell>
            <TableCell align="right">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', cursor: 'pointer' }} onClick={() => onSort('balance')}>
                Solde
                {sortConfig.key === 'balance' && (
                  sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                )}
              </Box>
            </TableCell>
            <TableCell align="center">Statut</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {agencies.map((agency) => (
            <TableRow key={agency.id} hover>
              <TableCell component="th" scope="row">
                <Typography variant="subtitle2">{agency.name}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{agency.email}</Typography>
                <Typography variant="body2" color="text.secondary">{agency.phone}</Typography>
              </TableCell>
              <TableCell align="center">
                <Chip 
                  icon={<PhoneIcon />} 
                  label={agency.activeLines} 
                  color="primary" 
                  variant="outlined" 
                  size="small" 
                />
              </TableCell>
              <TableCell align="center">
                <Chip 
                  icon={<WarningIcon />} 
                  label={`${agency.debtLines} (${agency.debtAmount}€)`} 
                  color={agency.debtLines > 0 ? "error" : "success"} 
                  variant="outlined" 
                  size="small" 
                />
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight="bold">
                  {agency.revenueTotal.toLocaleString('fr-FR')}€
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {agency.balance.toLocaleString('fr-FR')}€
                  </Typography>
                  {agency.pendingPayment > 0 && (
                    <Chip 
                      label={`${agency.pendingPayment.toLocaleString('fr-FR')}€ à verser`} 
                      color="warning" 
                      size="small" 
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </TableCell>
              <TableCell align="center">
                <Chip 
                  label={agency.status === 'active' ? 'Actif' : 'Inactif'} 
                  color={agency.status === 'active' ? "success" : "default"} 
                  size="small" 
                />
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <Tooltip title="Détails de l'agence">
                    <IconButton size="small" onClick={() => onOpenDetails(agency)}>
                      <PersonIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Paramètres d'abonnement">
                    <IconButton size="small" onClick={() => onOpenSettings(agency)}>
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {agency.pendingPayment > 0 && (
                    <Tooltip title="Valider paiement">
                      <IconButton size="small" color="primary" onClick={() => onOpenPayment(agency)}>
                        <PaymentIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title={agency.status === 'active' ? 'Désactiver' : 'Activer'}>
                    <IconButton 
                      size="small" 
                      color={agency.status === 'active' ? "error" : "success"}
                      onClick={() => onToggleStatus(agency.id)}
                    >
                      {agency.status === 'active' ? <CloseIcon fontSize="small" /> : <RefreshIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AgencyTable;