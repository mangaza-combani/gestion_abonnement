import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  TextField,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  PhoneAndroid as PhoneIcon,
} from '@mui/icons-material';

// Données de test
const mockClient = {
  firstName: "Jean",
  lastName: "Dupont",
  email: "jean.dupont@email.com",
  address: "123 Avenue de la République, 75011 Paris",
  phone: "0612345678",
  agency: "Agence Paris Centre",
  redAccountId: "RED123456",
  lines: [
    { 
      number: "0612345678", 
      status: "active", 
      iccid: "8933150319xxxx",
      activationDate: "2023-01-15",
      lastPayment: "2024-02-01",
      subscription: "Forfait 19€"
    },
    { 
      number: "0687654321", 
      status: "blocked", 
      iccid: "8933150319yyyy",
      activationDate: "2023-03-20",
      lastPayment: "2024-01-15",
      subscription: "Forfait 19€",
      blockReason: "Retard de paiement"
    },
    { 
      number: "0698765432", 
      status: "active", 
      iccid: "8933150319zzzz",
      activationDate: "2023-06-10",
      lastPayment: "2024-02-01",
      subscription: "Forfait 19€"
    },
    { 
      number: "0676543210", 
      status: "active", 
      iccid: "8933150319aaaa",
      activationDate: "2023-08-05",
      lastPayment: "2024-02-01",
      subscription: "Forfait 19€"
    },
    { 
      number: "0654321098", 
      status: "terminated", 
      iccid: "8933150319bbbb",
      activationDate: "2023-02-01",
      terminationDate: "2023-12-15",
      subscription: "Forfait 19€"
    }
  ],
  payments: Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    date: new Date(2024, 1 - Math.floor(i/2), 15 - (i % 2) * 14).toISOString(),
    amount: 19,
    status: i < 2 ? 'paid' : i < 3 ? 'late' : 'paid',
    invoiceRef: `FAC${String(2024 - Math.floor(i/12)).slice(-2)}${String(12 - (i % 12)).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
    period: new Date(2024, 1 - Math.floor(i/2), 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  }))
};

const ClientDetailsModal = ({ open, onClose, client = mockClient }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [paymentsPage, setPaymentsPage] = useState(0);
  const [paymentsPerPage, setPaymentsPerPage] = useState(10);

  React.useEffect(() => {
    if (client) {
      setEditedClient({
        ...client,
        firstname: client?.firstname || '',
        lastname: client?.lastname || '',
        email: client?.email || '',
        address: client?.address || '',
        phoneNumber: client?.phoneNumber || '',
      });
    }
  }, [client]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePaymentsPageChange = (event, newPage) => {
    setPaymentsPage(newPage);
  };

  const handlePaymentsPerPageChange = (event) => {
    setPaymentsPerPage(parseInt(event.target.value, 10));
    setPaymentsPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleSaveChanges = () => {
    console.log('Saving changes:', editedClient);
    setIsEditing(false);
  };

  const handleDownloadInvoice = (invoice) => {
    console.log('Downloading invoice:', invoice);
  };

  const renderClientInfo = () => (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Informations Client</Typography>
          <IconButton onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? <SaveIcon onClick={handleSaveChanges} /> : <EditIcon />}
          </IconButton>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nom"
              value={isEditing ? editedClient.lastname : (client?.lastname || '')}
              onChange={(e) => setEditedClient({ ...editedClient, lastname: e.target.value })}
              disabled={!isEditing}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Prénom"
              value={isEditing ? editedClient.firstname : (client?.firstname || '')}
              onChange={(e) => setEditedClient({ ...editedClient, firstname: e.target.value })}
              disabled={!isEditing}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Adresse"
              value={isEditing ? editedClient.address : (client?.address || '')}
              onChange={(e) => setEditedClient({ ...editedClient, address: e.target.value })}
              disabled={!isEditing}
              multiline
              rows={2}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={isEditing ? editedClient.email : (client?.email || '')}
              onChange={(e) => setEditedClient({ ...editedClient, email: e.target.value })}
              disabled={!isEditing}
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Téléphone"
              value={isEditing ? editedClient.phoneNumber : (client?.phoneNumber || '')}
              onChange={(e) => setEditedClient({ ...editedClient, phoneNumber: e.target.value })}
              disabled={!isEditing}
              margin="dense"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderRedByInfo = () => (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Informations Red by SFR</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Agence affiliée
            </Typography>
            <Typography variant="body1" gutterBottom>
              {client?.agency?.name || 'Aucune agence'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Identifiant Compte Red
            </Typography>
            <Typography variant="body1" gutterBottom>
              {client?.redAccountId || 'Non défini'}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderPhoneLines = () => (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Lignes téléphoniques</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Numéro</TableCell>
                <TableCell>ICCID</TableCell>
                <TableCell>Date d'activation</TableCell>
                <TableCell>Dernier paiement</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Détails</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {client.lines
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((line, index) => (
                  <TableRow key={index}>
                    <TableCell>{line.number}</TableCell>
                    <TableCell>{line.iccid}</TableCell>
                    <TableCell>{new Date(line.activationDate).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{new Date(line.lastPayment).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          line.status === 'active' ? 'Active' : 
                          line.status === 'blocked' ? 'Bloquée' : 
                          'Résiliée'
                        }
                        color={
                          line.status === 'active' ? 'success' : 
                          line.status === 'blocked' ? 'error' : 
                          'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {line.blockReason && (
                        <Typography variant="caption" color="error">
                          {line.blockReason}
                        </Typography>
                      )}
                      {line.terminationDate && (
                        <Typography variant="caption">
                          Résiliée le {new Date(line.terminationDate).toLocaleDateString('fr-FR')}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={client.lines.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </CardContent>
    </Card>
  );

  const renderPayments = () => (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Historique des paiements</Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Référence</TableCell>
                <TableCell>Période</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Montant</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {client.payments
                .slice(paymentsPage * paymentsPerPage, paymentsPage * paymentsPerPage + paymentsPerPage)
                .map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{payment.invoiceRef}</TableCell>
                    <TableCell>{payment.period}</TableCell>
                    <TableCell>{new Date(payment.date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>{payment.amount}€</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={payment.status === 'paid' ? 'Payé' : 'En retard'}
                        color={payment.status === 'paid' ? 'success' : 'error'}
                        icon={payment.status === 'paid' ? <CheckCircleIcon /> : <WarningIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        startIcon={<DownloadIcon />}
                        size="small"
                        onClick={() => handleDownloadInvoice(payment)}
                      >
                        Facture
                      </Button>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={client.payments.length}
          page={paymentsPage}
          onPageChange={handlePaymentsPageChange}
          rowsPerPage={paymentsPerPage}
          onRowsPerPageChange={handlePaymentsPerPageChange}
          labelRowsPerPage="Factures par page"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </CardContent>
    </Card>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Détails du client
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Informations" />
          <Tab label="Lignes & Services" />
          <Tab label="Paiements" />
        </Tabs>

        {currentTab === 0 && (
          <>
            {renderClientInfo()}
            {renderRedByInfo()}
          </>
        )}

        {currentTab === 1 && renderPhoneLines()}

        {currentTab === 2 && renderPayments()}
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsModal;