import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  IconButton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  alpha,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  DateRange as DateRangeIcon,
  AccountCircle as AccountCircleIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CancelEditIcon
} from '@mui/icons-material';
import { useGetClientLinesQuery, useGetClientPaymentsQuery, useUpdateClientMutation } from '../../store/slices/lineReservationsSlice';
import API_CONFIG from '../../config/api.js';
import ClientEditForm from './ClientEditForm';

const ClientDetailsModal = ({ open, onClose, client }) => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);

  // États pour l'édition
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState({});

  // État pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Récupérer toutes les lignes du client
  // Dans le contexte du modal, client peut être soit un objet user soit un objet phone
  // Si c'est un objet phone, userId contient l'ID du client
  // Si c'est un objet user, id contient l'ID du client
  const clientId = client?.userId || client?.user?.id || client?.id;

  console.log('🔍 DEBUG ClientDetailsModal:', {
    client,
    clientId,
    clientUserId: client?.user?.id,
    clientDirectId: client?.id,
    clientUserIdField: client?.userId
  });

  const {
    data: clientLinesData,
    isLoading: linesLoading,
    error: linesError
  } = useGetClientLinesQuery(clientId, {
    skip: !clientId
  });

  // Récupérer tous les paiements du client
  const {
    data: clientPaymentsData,
    isLoading: paymentsLoading,
    error: paymentsError
  } = useGetClientPaymentsQuery(clientId, {
    skip: !clientId
  });

  // Hook pour la mise à jour du client
  const [updateClient, { isLoading: isUpdating }] = useUpdateClientMutation();

  // 🚨 DEBUG: Initialiser editedClient au montage du composant
  React.useEffect(() => {
    if (client) {
      const userInfo = client?.user || client || {};
      console.log('🔍 Initializing editedClient with:', { client, userInfo });
      setEditedClient({
        firstname: userInfo.firstname || '',
        lastname: userInfo.lastname || '',
        email: userInfo.email || '',
        phoneNumber: userInfo.phoneNumber || '',
        city: userInfo.city || '',
        birthday: userInfo.birthday || ''
      });
    }
  }, [client]);

  // Définir tous les hooks avant toute condition de sortie anticipée
  const handleCloseSnackbar = React.useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Handler pour recevoir les données du formulaire d'édition
  const handleEditDataChange = React.useCallback((data) => {
    console.log('📝 Modal received form data:', data);
    setEditedClient(data);
  }, []);

  // Gestion de l'édition
  const handleStartEdit = React.useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = React.useCallback(() => {
    setIsEditing(false);
    setEditedClient({});
  }, []);

  const handleSaveEdit = React.useCallback(async () => {
    try {
      await updateClient({
        clientId: clientId,
        updateData: editedClient
      }).unwrap();

      setSnackbar({
        open: true,
        message: 'Informations client mises à jour avec succès',
        severity: 'success'
      });
      setIsEditing(false);
      console.log('Données sauvegardées avec succès:', editedClient);

    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setSnackbar({
        open: true,
        message: error?.data?.message || 'Erreur lors de la mise à jour des informations',
        severity: 'error'
      });
    }
  }, [updateClient, clientId, editedClient]);

  console.log('🔍 DEBUG RTK Query:', {
    clientId,
    skip: !clientId,
    isLoading: linesLoading,
    error: linesError,
    data: clientLinesData
  });

  if (!client) return null;


  // Composant pour l'historique de paiement avec filtres
  const PaymentsTable = React.memo(() => {
    const [selectedLineFilter, setSelectedLineFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all'); // all, paid, unpaid

    if (paymentsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <Typography>Chargement des paiements...</Typography>
        </Box>
      );
    }

    if (paymentsError) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography color="error">Erreur lors du chargement des paiements</Typography>
        </Box>
      );
    }

    const payments = clientPaymentsData?.payments || [];
    const summary = clientPaymentsData?.summary || {};
    const lines = clientPaymentsData?.lines || [];

    // Filtrer les paiements
    const filteredPayments = payments.filter(payment => {
      const lineMatch = selectedLineFilter === 'all' || payment.phoneId.toString() === selectedLineFilter;
      const statusMatch = statusFilter === 'all' ||
        (statusFilter === 'paid' && payment.isPaid) ||
        (statusFilter === 'unpaid' && payment.isUnpaid);
      return lineMatch && statusMatch;
    });

    const handleDownloadInvoice = async (payment) => {
      try {
        const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!authToken) {
          setSnackbar({
            open: true,
            message: 'Token d\'authentification manquant',
            severity: 'error'
          });
          return;
        }

        setSnackbar({
          open: true,
          message: 'Téléchargement en cours...',
          severity: 'info'
        });

        const response = await fetch(`${API_CONFIG.BASE_URL}invoices/${payment.id}/pdf`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Facture_${payment.invoiceNumber || payment.id}_${payment.monthYear || 'paiement'}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        setSnackbar({
          open: true,
          message: 'Facture téléchargée avec succès',
          severity: 'success'
        });

      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        setSnackbar({
          open: true,
          message: 'Erreur lors du téléchargement de la facture',
          severity: 'error'
        });
      }
    };

    const handleViewInvoice = async (payment) => {
      try {
        const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!authToken) {
          setSnackbar({
            open: true,
            message: 'Token d\'authentification manquant',
            severity: 'error'
          });
          return;
        }

        setSnackbar({
          open: true,
          message: 'Ouverture de la facture...',
          severity: 'info'
        });

        // Récupérer le PDF avec l'authentification Bearer
        const response = await fetch(`${API_CONFIG.BASE_URL}invoices/${payment.id}/pdf`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        // Convertir en blob et ouvrir dans un nouvel onglet
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');

        setSnackbar({
          open: true,
          message: 'Facture ouverte avec succès',
          severity: 'success'
        });

      } catch (error) {
        console.error('Erreur lors de la visualisation:', error);
        setSnackbar({
          open: true,
          message: 'Erreur lors de la visualisation de la facture',
          severity: 'error'
        });
      }
    };

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <PaymentIcon color="primary" />
          Historique des paiements ({filteredPayments.length})
        </Typography>

        {/* Résumé */}
        {summary.total > 0 && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip size="small" label={`${summary.total} Total`} variant="outlined" />
            <Chip size="small" label={`${summary.paid} Payés`} color="success" variant="outlined" />
            <Chip size="small" label={`${summary.unpaid} Impayés`} color="error" variant="outlined" />
            {summary.pending > 0 && (
              <Chip size="small" label={`${summary.pending} En attente`} color="warning" variant="outlined" />
            )}
          </Box>
        )}

        {/* Filtres compacts */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filtrer par ligne</InputLabel>
            <Select
              value={selectedLineFilter}
              onChange={(e) => setSelectedLineFilter(e.target.value)}
              label="Filtrer par ligne"
            >
              <MenuItem value="all">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  📱 Toutes les lignes
                </Box>
              </MenuItem>
              {lines.map((line) => (
                <MenuItem key={line.id} value={line.id.toString()}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    📞 {line.phoneNumber}
                    <Chip
                      size="small"
                      label={`${line.paymentsCount}`}
                      color="primary"
                      variant="outlined"
                      sx={{ ml: 'auto', fontSize: '0.7rem' }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Statut paiement</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Statut paiement"
            >
              <MenuItem value="all">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  📋 Tous
                </Box>
              </MenuItem>
              <MenuItem value="paid">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  ✅ Payés
                </Box>
              </MenuItem>
              <MenuItem value="unpaid">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  ❌ Impayés
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* Résultats du filtrage */}
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {filteredPayments.length} résultat{filteredPayments.length > 1 ? 's' : ''}
              {filteredPayments.length !== payments.length && ` sur ${payments.length}`}
            </Typography>
          </Box>
        </Box>

        {/* Tableau des paiements */}
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Facture</strong></TableCell>
                <TableCell><strong>Ligne</strong></TableCell>
                <TableCell><strong>Montant</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell><strong>Date paiement</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary">
                      Aucun paiement trouvé avec ces filtres
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {payment.invoiceNumber || `#${payment.id}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {payment.description || 'Abonnement mensuel'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.phoneNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {payment.amount}€
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          payment.status === 'PAID' ? 'Payé' :
                          payment.status === 'PENDING' ? 'En attente' :
                          payment.status === 'OVERDUE' ? 'En retard' : payment.status
                        }
                        color={
                          payment.isPaid ? 'success' :
                          payment.status === 'PENDING' ? 'warning' :
                          payment.status === 'OVERDUE' ? 'error' : 'default'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {payment.paidDate
                        ? new Date(payment.paidDate).toLocaleDateString('fr-FR')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewInvoice(payment)}
                          title="Visualiser la facture PDF"
                          color="primary"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadInvoice(payment)}
                          title="Télécharger la facture PDF"
                          color="secondary"
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  });

  // Informations générales du client
  const ClientInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card elevation={2}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: theme.palette.primary.main,
                fontSize: '2rem',
                mx: 'auto',
                mb: 2
              }}
            >
              {client.user?.firstname?.[0]}{client.user?.lastname?.[0]}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {client.user?.firstname} {client.user?.lastname}
            </Typography>
            <Chip
              label={client.phoneStatus}
              color={
                client.phoneStatus === 'ACTIVE' ? 'success' :
                client.phoneStatus === 'SUSPENDED' ? 'error' :
                client.phoneStatus === 'OVERDUE' ? 'warning' : 'default'
              }
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              Client depuis: {new Date(client.createdAt || Date.now()).toLocaleDateString()}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card elevation={2}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                Informations personnelles
              </Typography>

              {!isEditing ? (
                <IconButton
                  size="small"
                  onClick={handleStartEdit}
                  color="primary"
                  title="Modifier les informations"
                >
                  <EditIcon />
                </IconButton>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={handleSaveEdit}
                    color="success"
                    title="Sauvegarder"
                    disabled={isUpdating}
                  >
                    <SaveIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleCancelEdit}
                    color="error"
                    title="Annuler"
                  >
                    <CancelEditIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {!isEditing ? (
              <List dense>
                <ListItem>
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText
                    primary="Nom complet"
                    secondary={`${client.user?.firstname || ''} ${client.user?.lastname || ''}`.trim() || 'Non renseigné'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><EmailIcon /></ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={client.user?.email || 'Non renseigné'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><PhoneIcon /></ListItemIcon>
                  <ListItemText
                    primary="Téléphone"
                    secondary={client.user?.phoneNumber || client.phoneNumber || 'Non renseigné'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><LocationOnIcon /></ListItemIcon>
                  <ListItemText
                    primary="Ville"
                    secondary={client.user?.city || 'Non renseigné'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><DateRangeIcon /></ListItemIcon>
                  <ListItemText
                    primary="Date de naissance"
                    secondary={client.user?.birthday || 'Non renseigné'}
                  />
                </ListItem>
              </List>
            ) : (
              <ClientEditForm
                client={client}
                onDataChange={handleEditDataChange}
              />
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Lignes du client
  const ClientLines = () => {
    if (linesLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <Typography>Chargement des lignes...</Typography>
        </Box>
      );
    }

    if (linesError) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography color="error">Erreur lors du chargement des lignes</Typography>
        </Box>
      );
    }

    const lines = clientLinesData?.lines || [];
    const summary = clientLinesData?.summary || {};

    console.log('🔍 DEBUG ClientLines:', {
      clientLinesData,
      lines,
      summary,
      linesLength: lines.length,
      clientId
    });

    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <PhoneIcon color="primary" />
          Lignes téléphoniques ({lines.length})
        </Typography>

        {/* Résumé */}
        {summary.total > 0 && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip size="small" label={`${summary.total} Total`} variant="outlined" />
            <Chip size="small" label={`${summary.active} Actives`} color="success" variant="outlined" />
            <Chip size="small" label={`${summary.upToDate} À jour`} color="success" variant="outlined" />
            {summary.overdue > 0 && (
              <Chip size="small" label={`${summary.overdue} En retard`} color="warning" variant="outlined" />
            )}
            {summary.debt > 0 && (
              <Chip size="small" label={`${summary.debt} Dette`} color="error" variant="outlined" />
            )}
          </Box>
        )}

        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Numéro</strong></TableCell>
                <TableCell><strong>Statut Ligne</strong></TableCell>
                <TableCell><strong>Statut Paiement</strong></TableCell>
                <TableCell><strong>Compte RED</strong></TableCell>
                <TableCell><strong>Date activation</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary">
                      Aucune ligne trouvée pour ce client
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" />
                        {line.phoneNumber || 'En attente'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={line.statusDisplay?.phone || line.phoneStatus}
                        color={
                          line.phoneStatus === 'ACTIVE' ? 'success' :
                          line.phoneStatus === 'SUSPENDED' ? 'error' :
                          line.phoneStatus === 'BLOCKED' ? 'error' :
                          line.phoneStatus === 'PAUSED' ? 'warning' :
                          line.phoneStatus === 'NEEDS_TO_BE_ACTIVATED' ? 'info' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={line.statusDisplay?.payment || line.calculatedPaymentStatus}
                        color={
                          line.calculatedPaymentStatus === 'À JOUR' ? 'success' :
                          line.calculatedPaymentStatus === 'EN RETARD' ? 'warning' :
                          line.calculatedPaymentStatus === 'DETTE' ? 'error' : 'default'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="primary.main">
                        {line.redAccountName || line.redAccountId || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {line.activationDate
                        ? new Date(line.activationDate).toLocaleDateString('fr-FR')
                        : line.createdAt ? new Date(line.createdAt).toLocaleDateString('fr-FR') : 'N/A'
                      }
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          bgcolor: theme.palette.primary.main, 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AccountCircleIcon />
          <Box>
            <Typography variant="h6">
              Fiche Client - {client.user?.firstname} {client.user?.lastname}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              ID: {client.id} • {client.user?.email}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab 
            label="Informations" 
            icon={<PersonIcon />} 
            iconPosition="start"
            sx={{ textTransform: 'none' }}
          />
          <Tab 
            label="Lignes" 
            icon={<PhoneIcon />} 
            iconPosition="start"
            sx={{ textTransform: 'none' }}
          />
          <Tab 
            label="Paiements" 
            icon={<PaymentIcon />} 
            iconPosition="start"
            sx={{ textTransform: 'none' }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {currentTab === 0 && (
          <Box sx={{ p: 3 }}>
            <ClientInfo />
          </Box>
        )}
        {currentTab === 1 && (
          <Box sx={{ p: 3 }}>
            <ClientLines />
          </Box>
        )}
        {currentTab === 2 && (
          <PaymentsTable />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Button onClick={onClose} variant="outlined">
          Fermer
        </Button>
        {!isEditing ? (
          <Button
            onClick={handleStartEdit}
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
          >
            Mode Test Édition
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              color="success"
              disabled={isUpdating}
              startIcon={<SaveIcon />}
            >
              Sauvegarder
            </Button>
            <Button
              onClick={handleCancelEdit}
              variant="outlined"
              color="error"
              startIcon={<CancelEditIcon />}
            >
              Annuler
            </Button>
          </Box>
        )}
      </DialogActions>


      {/* Snackbar pour notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ClientDetailsModal;