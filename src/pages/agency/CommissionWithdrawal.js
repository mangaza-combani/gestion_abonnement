import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  VisibilityOutlined as VisibilityIcon,
  ErrorOutline as ErrorIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const CommissionWithdrawal = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);

  // Mock data
  const withdrawals = [
    { 
      id: 1, 
      date: '2024-02-09', 
      amount: 1250.00, 
      status: 'pending',
      description: 'Retrait commission janvier 2024',
      paymentMethod: 'Virement bancaire',
      reference: 'WD-2024-001',
      requestedBy: 'John Doe',
      agency: 'Agence Paris'
    },
    { 
      id: 2, 
      date: '2024-01-15', 
      amount: 980.50, 
      status: 'validated',
      description: 'Retrait commission décembre 2023',
      paymentMethod: 'Virement bancaire',
      reference: 'WD-2024-002',
      requestedBy: 'Jane Smith',
      agency: 'Agence Lyon',
      validatedBy: 'Admin',
      validatedDate: '2024-01-16'
    },
    // ... autres retraits
  ];

  // Calculer les totaux
  const totalAmount = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
  const pendingAmount = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + w.amount, 0);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Nouveau retrait:', { amount, description });
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setAmount('');
    setDescription('');
  };

  const handleViewDetails = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setOpenDetails(true);
  };

  const getStatusChip = (status) => {
    switch(status) {
      case 'pending':
        return (
          <Chip
            icon={<ScheduleIcon sx={{ fontSize: '16px' }} />}
            label="En attente"
            color="warning"
            size="small"
            sx={{ minWidth: '100px' }}
          />
        );
      case 'validated':
        return (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: '16px' }} />}
            label="Validé"
            color="success"
            size="small"
            sx={{ minWidth: '100px' }}
          />
        );
      default:
        return (
          <Chip
            label="Inconnu"
            size="small"
            sx={{ minWidth: '100px' }}
          />
        );
    }
  };

  return (
    <Box>
      {/* Header avec statistiques */}
      <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" gap={2}>
            <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" gutterBottom>
                Retraits de Commission
              </Typography>
              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total des retraits
                  </Typography>
                  <Typography variant="h6">
                    {totalAmount.toFixed(2)} €
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    En attente
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {pendingAmount.toFixed(2)} €
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Nouveau Retrait
          </Button>
        </Box>
      </Paper>

      {/* Tableau */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Référence</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Montant</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {withdrawals
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((withdrawal) => (
                <TableRow 
                  key={withdrawal.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="medium">
                      {withdrawal.reference}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {withdrawal.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(withdrawal.date).toLocaleDateString('fr-FR')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      {withdrawal.amount.toFixed(2)} €
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(withdrawal.status)}</TableCell>
                
                  <TableCell align="center">
                    <Tooltip title="Voir les détails">
                      <IconButton 
                        size="small"
                        onClick={() => handleViewDetails(withdrawal)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={withdrawals.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} sur ${count}`}
        />
      </TableContainer>

      {/* Dialog de nouveau retrait */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Nouveau Retrait de Commission
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseDialog}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Stack spacing={3}>
              <TextField
                label="Montant (€)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                fullWidth
                inputProps={{ min: "0", step: "0.01" }}
              />
              <TextField
                label="Description"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button 
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
            >
              Soumettre
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de détails */}
      <Dialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Détails du Retrait
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setOpenDetails(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedWithdrawal && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Référence
                </Typography>
                <Typography variant="body1">
                  {selectedWithdrawal.reference}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">
                  {selectedWithdrawal.description}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Montant
                </Typography>
                <Typography variant="body1">
                  {selectedWithdrawal.amount.toFixed(2)} €
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Statut
                </Typography>
                {getStatusChip(selectedWithdrawal.status)}
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Demandé par
                </Typography>
                <Typography variant="body1">
                  {selectedWithdrawal.requestedBy}
                </Typography>
              </Box>
              {selectedWithdrawal.validatedBy && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Validé par
                  </Typography>
                  <Typography variant="body1">
                    {selectedWithdrawal.validatedBy} le {new Date(selectedWithdrawal.validatedDate).toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommissionWithdrawal;