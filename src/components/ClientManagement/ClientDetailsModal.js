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
  alpha
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
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import InvoiceGenerator from '../Billing/InvoiceGenerator';

const ClientDetailsModal = ({ open, onClose, client }) => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  if (!client) return null;

  const handleOpenInvoice = () => {
    setIsInvoiceModalOpen(true);
  };

  const handleCloseInvoice = () => {
    setIsInvoiceModalOpen(false);
  };

  // Générer un historique de paiement simulé pour les 12 derniers mois
  const generatePaymentHistory = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      
      // Simulation de l'état des paiements
      let status = 'paid';
      if (client.paymentStatus === 'OVERDUE' && i < 2) {
        status = 'unpaid';
      } else if (client.paymentStatus === 'PAST_DUE' && i < 3) {
        status = 'unpaid';
      } else if (Math.random() > 0.8) { // 20% de chance d'impayé aléatoire
        status = 'unpaid';
      }

      months.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        fullDate: date,
        status: status,
        amount: status === 'paid' ? '25.00€' : '25.00€'
      });
    }
    return months;
  };

  const paymentHistory = generatePaymentHistory();

  // Composant pour l'historique de paiement visuel
  const PaymentHistoryVisual = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <PaymentIcon color="primary" />
        Historique des paiements (12 derniers mois)
      </Typography>
      
      <Grid container spacing={1}>
        {paymentHistory.map((month, index) => (
          <Grid item xs={2} key={index}>
            <Card
              sx={{
                minHeight: 60,
                backgroundColor: month.status === 'paid' 
                  ? alpha(theme.palette.success.main, 0.1)
                  : alpha(theme.palette.error.main, 0.1),
                border: `2px solid ${month.status === 'paid' 
                  ? theme.palette.success.main
                  : theme.palette.error.main}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent sx={{ p: 1, textAlign: 'center', '&:last-child': { pb: 1 } }}>
                <Typography variant="caption" fontWeight="bold">
                  {month.month}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  {month.year}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {month.status === 'paid' ? (
                    <CheckCircleIcon fontSize="small" color="success" />
                  ) : (
                    <CancelIcon fontSize="small" color="error" />
                  )}
                </Box>
                <Typography variant="caption" display="block" fontWeight="medium">
                  {month.amount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon fontSize="small" color="success" />
          <Typography variant="body2">Payé</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CancelIcon fontSize="small" color="error" />
          <Typography variant="body2">Impayé</Typography>
        </Box>
      </Box>
    </Box>
  );

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
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              Informations personnelles
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List dense>
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
                  secondary={client.user?.birthday ? new Date(client.user.birthday).toLocaleDateString() : 'Non renseigné'}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Lignes du client
  const ClientLines = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <PhoneIcon color="primary" />
        Lignes téléphoniques
      </Typography>

      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Numéro</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Date activation</strong></TableCell>
              <TableCell><strong>Paiement</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Ligne principale */}
            <TableRow>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" />
                  {client.phoneNumber || 'En attente'}
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={client.phoneStatus || 'UNKNOWN'}
                  color={
                    client.phoneStatus === 'ACTIVE' ? 'success' :
                    client.phoneStatus === 'SUSPENDED' ? 'error' :
                    client.phoneStatus === 'NEEDS_TO_BE_ACTIVATED' ? 'warning' : 'default'
                  }
                />
              </TableCell>
              <TableCell>{client.phoneType || 'POSTPAID'}</TableCell>
              <TableCell>
                {client.activationDate 
                  ? new Date(client.activationDate).toLocaleDateString()
                  : client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'
                }
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={client.paymentStatus || 'UNKNOWN'}
                  color={
                    client.paymentStatus === 'UP_TO_DATE' ? 'success' :
                    client.paymentStatus === 'OVERDUE' ? 'warning' :
                    client.paymentStatus === 'PAST_DUE' ? 'error' : 'default'
                  }
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Informations techniques */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="primary" />
          Informations techniques
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">Carte SIM</Typography>
                <Typography variant="body1">
                  {client.activatedWithIccid || client.simCardId || 'Non assignée'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">Compte RED</Typography>
                <Typography variant="body1">
                  {client.redAccountId || 'Non assigné'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

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
          <PaymentHistoryVisual />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Button onClick={onClose} variant="outlined">
          Fermer
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<ReceiptIcon />}
          onClick={handleOpenInvoice}
          color="secondary"
        >
          Générer Facture
        </Button>
        <Button variant="contained" color="primary">
          Modifier
        </Button>
      </DialogActions>

      {/* Modal de génération de facture */}
      <InvoiceGenerator 
        open={isInvoiceModalOpen}
        onClose={handleCloseInvoice}
        client={client}
      />
    </Dialog>
  );
};

export default ClientDetailsModal;