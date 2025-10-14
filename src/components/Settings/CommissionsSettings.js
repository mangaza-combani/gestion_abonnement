import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Chip
} from '@mui/material';
import {
  Percent as PercentIcon
} from '@mui/icons-material';
import {
  useGetAllCommissionsQuery,
  useGetCommissionsByAgencyQuery,
  useUpsertCommissionMutation
} from '../../store/slices/commissionsSlice';

const CommissionsSettings = () => {
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Récupérer toutes les données initiales
  const { data: allData, isLoading: isLoadingAll, error: errorAll } = useGetAllCommissionsQuery();

  // Récupérer les commissions de l'agence sélectionnée
  const { data: agencyData, isLoading: isLoadingAgency } = useGetCommissionsByAgencyQuery(
    selectedAgency?.id,
    { skip: !selectedAgency }
  );

  // Mutation pour mettre à jour une commission
  const [upsertCommission, { isLoading: isUpdating }] = useUpsertCommissionMutation();

  // Sélectionner automatiquement la première agence
  useEffect(() => {
    if (allData?.agencies?.length > 0 && !selectedAgency) {
      setSelectedAgency(allData.agencies[0]);
    }
  }, [allData, selectedAgency]);

  const handleAgencySelect = (agency) => {
    setSelectedAgency(agency);
  };

  const handleCommissionChange = async (subscriptionId, newValue) => {
    // Valider la valeur
    const value = parseFloat(newValue);
    if (isNaN(value) || value < 0) {
      setSnackbar({
        open: true,
        message: 'Le montant de commission doit être positif',
        severity: 'error'
      });
      return;
    }

    try {
      await upsertCommission({
        agencyId: selectedAgency.id,
        subscriptionId,
        commissionAmount: value
      }).unwrap();

      setSnackbar({
        open: true,
        message: 'Commission mise à jour avec succès',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erreur lors de la mise à jour de la commission',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoadingAll) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorAll) {
    return (
      <Alert severity="error">
        Erreur lors du chargement des données. Veuillez réessayer.
      </Alert>
    );
  }

  const agencies = allData?.agencies || [];
  const subscriptions = agencyData?.subscriptions || [];

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <PercentIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Gestion des Commissions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Définissez les montants de commission par agence et par abonnement
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ height: '70vh', display: 'flex', overflow: 'hidden' }}>
        {/* Colonne 1: Liste des agences */}
        <Box
          sx={{
            width: '30%',
            borderRight: 1,
            borderColor: 'divider',
            overflow: 'auto'
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Agences ({agencies.length})
            </Typography>
          </Box>
          <List sx={{ p: 0 }}>
            {agencies.map((agency) => (
              <ListItemButton
                key={agency.id}
                selected={selectedAgency?.id === agency.id}
                onClick={() => handleAgencySelect(agency)}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    '&:hover': {
                      bgcolor: 'primary.light'
                    }
                  }
                }}
              >
                <ListItemText
                  primary={agency.name}
                  secondary={`ID: ${agency.id}`}
                  primaryTypographyProps={{
                    fontWeight: selectedAgency?.id === agency.id ? 'bold' : 'normal'
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>

        {/* Colonne 2 & 3: Tableau des abonnements et commissions */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedAgency ? (
            <>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {selectedAgency.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Commissions par abonnement
                </Typography>
              </Box>

              {isLoadingAgency ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                          Abonnement
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                          Prix
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.100', width: 200 }}>
                          Montant de Commission (€)
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subscriptions.map((subscription) => (
                        <CommissionRow
                          key={subscription.id}
                          subscription={subscription}
                          onCommissionChange={handleCommissionChange}
                          isUpdating={isUpdating}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'text.secondary'
              }}
            >
              <PercentIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6">
                Sélectionnez une agence
              </Typography>
              <Typography variant="body2">
                Choisissez une agence dans la liste pour voir ses commissions
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Snackbar de confirmation */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Composant pour une ligne de commission
const CommissionRow = ({ subscription, onCommissionChange, isUpdating }) => {
  const [value, setValue] = useState(subscription.commissionAmount ?? 3);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setValue(subscription.commissionAmount ?? 3);
  }, [subscription.commissionAmount]);

  const handleBlur = () => {
    setIsFocused(false);
    if (parseFloat(value) !== subscription.commissionAmount) {
      onCommissionChange(subscription.id, value);
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    // Autoriser les valeurs vides pendant la saisie
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      setValue(newValue);
    }
  };

  return (
    <TableRow hover>
      <TableCell>
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {subscription.name}
          </Typography>
          {subscription.description && (
            <Typography variant="caption" color="text.secondary">
              {subscription.description}
            </Typography>
          )}
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {subscription.price} {subscription.currency}
        </Typography>
      </TableCell>
      <TableCell>
        <TextField
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          disabled={isUpdating}
          size="small"
          type="text"
          inputProps={{
            style: { textAlign: 'right' }
          }}
          InputProps={{
            endAdornment: <Typography variant="body2" sx={{ ml: 1 }}>€</Typography>
          }}
          sx={{
            width: '120px',
            '& .MuiOutlinedInput-root': {
              bgcolor: isFocused ? 'primary.light' : 'transparent',
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }
          }}
        />
      </TableCell>
    </TableRow>
  );
};

export default CommissionsSettings;
