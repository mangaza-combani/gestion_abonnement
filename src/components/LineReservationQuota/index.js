import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Alert,
  Button,
  Stack,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PriorityHigh as PriorityIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useGetRedAccountsQuery } from '../../store/slices/redAccountsSlice';
import { 
  useCreateLineReservationQuotaMutation,
  useGetRedAccountReservationsQuery,
  useCancelLineReservationQuotaMutation
} from '../../store/api/lineReservationQuotaSlice';

const LineReservationQuota = ({ client }) => {
  const [selectedRedAccount, setSelectedRedAccount] = useState('');
  const [notes, setNotes] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // États pour les messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Obtenir l'utilisateur connecté
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Invalid user data in localStorage:', error);
      return null;
    }
  };
  
  const currentUser = getCurrentUser();
  const isSupervisor = currentUser?.role === 'SUPERVISOR';
  
  // Déterminer l'agence à utiliser
  const getTargetAgencyId = () => {
    if (client?.agency?.id) {
      return client.agency.id;
    }
    return currentUser?.agencyId || 1;
  };
  
  const targetAgencyId = getTargetAgencyId();

  // API hooks
  const { data: redAccountsData } = useGetRedAccountsQuery();
  const allRedAccounts = redAccountsData?.redAccounts || [];
  
  // Filtrer les comptes RED par agence
  const redAccounts = allRedAccounts.filter(account => account.agencyId === targetAgencyId);
  
  // Récupérer les réservations pour le compte RED sélectionné
  const { data: reservationsData, refetch: refetchReservations } = useGetRedAccountReservationsQuery(
    selectedRedAccount, 
    { skip: !selectedRedAccount }
  );
  const reservations = reservationsData?.data || [];
  
  // Mutations
  const [createReservation, { isLoading: isCreating }] = useCreateLineReservationQuotaMutation();
  const [cancelReservation, { isLoading: isCancelling }] = useCancelLineReservationQuotaMutation();

  const handleCreateReservation = async () => {
    if (!selectedRedAccount || !client?.id) {
      setErrorMessage('Veuillez sélectionner un compte RED et un client');
      return;
    }

    try {
      const result = await createReservation({
        clientId: client.id,
        redAccountId: parseInt(selectedRedAccount),
        notes: notes || undefined
      });

      if (result.error) {
        setErrorMessage(result.error.data?.message || 'Erreur lors de la création de la réservation');
      } else {
        setSuccessMessage('Quota de réservation créé avec succès');
        setShowCreateDialog(false);
        setNotes('');
        refetchReservations();
      }
    } catch (error) {
      setErrorMessage('Erreur lors de la création de la réservation');
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      const result = await cancelReservation(reservationId);
      
      if (result.error) {
        setErrorMessage(result.error.data?.message || 'Erreur lors de l\'annulation');
      } else {
        setSuccessMessage('Réservation annulée avec succès');
        refetchReservations();
      }
    } catch (error) {
      setErrorMessage('Erreur lors de l\'annulation de la réservation');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'FULFILLED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'FULFILLED':
        return 'Attribuée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  };

  return (
    <Box>
      {/* Messages de succès/erreur */}
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage('')} sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Sélection du compte RED */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Gestion des quotas de réservation
          </Typography>
          
          {client && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Client sélectionné: <strong>{client.firstName} {client.lastName}</strong>
              </Typography>
            </Box>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Compte RED</InputLabel>
            <Select
              value={selectedRedAccount}
              label="Compte RED"
              onChange={(e) => setSelectedRedAccount(e.target.value)}
            >
              {redAccounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name} - {account.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
            disabled={!selectedRedAccount || !client}
          >
            Créer une réservation de quota
          </Button>
        </CardContent>
      </Card>

      {/* Liste des réservations */}
      {selectedRedAccount && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Réservations en cours
            </Typography>
            
            {reservations.length === 0 ? (
              <Typography color="text.secondary">
                Aucune réservation en cours pour ce compte RED.
              </Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Priorité</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Date de création</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PriorityIcon color="primary" fontSize="small" />
                          <Typography variant="body2" fontWeight="bold">
                            #{reservation.priority}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PersonIcon fontSize="small" />
                          <Typography variant="body2">
                            {reservation.client?.firstName} {reservation.client?.lastName}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusText(reservation.status)}
                          color={getStatusColor(reservation.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(reservation.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {reservation.notes || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {reservation.status === 'PENDING' && (
                          <IconButton
                            color="error"
                            onClick={() => handleCancelReservation(reservation.id)}
                            disabled={isCancelling}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog de création de réservation */}
      <Dialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Créer une réservation de quota</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              Une réservation de quota permet de réserver une place dans la file d'attente 
              pour l'attribution automatique d'une ligne lors de l'activation d'une carte SIM.
            </Alert>
            
            {client && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Client: <strong>{client.firstName} {client.lastName}</strong>
                </Typography>
              </Box>
            )}
            
            <TextField
              fullWidth
              label="Notes (optionnel)"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajouter des notes sur cette réservation..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleCreateReservation}
            variant="contained"
            disabled={isCreating}
          >
            {isCreating ? 'Création...' : 'Créer la réservation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LineReservationQuota;