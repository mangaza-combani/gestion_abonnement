import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Stack,
  Collapse,
  IconButton,
  Tooltip,
  Link,
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  CreditCard as CardIcon,
  Warning as WarningIcon,
  Euro as EuroIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetAllBankAccountsWithPaymentInfoQuery } from '../../store/slices/bankManagementSlice';
import { selectAccount } from '../../store/slices/redAccountsSlice';
import CreateBankAccountModal from '../../components/BankManagement/CreateBankAccountModal';
import AddBankCardModal from '../../components/BankManagement/AddBankCardModal';
import UpdateBankCardModal from '../../components/BankManagement/UpdateBankCardModal';

const BankManagement = () => {
  const { data, isLoading, error } = useGetAllBankAccountsWithPaymentInfoQuery();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [expandedAccounts, setExpandedAccounts] = useState({});
  const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false);
  const [addCardModalOpen, setAddCardModalOpen] = useState(false);
  const [updateCardModalOpen, setUpdateCardModalOpen] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const handleExpandClick = (accountId) => {
    setExpandedAccounts((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  const handleAddCard = (bankAccount) => {
    setSelectedBankAccount(bankAccount);
    setAddCardModalOpen(true);
  };

  const handleUpdateCard = (bankAccount, card) => {
    setSelectedBankAccount(bankAccount);
    setSelectedCard(card);
    setUpdateCardModalOpen(true);
  };

  const handleRedAccountClick = (redAccount) => {
    // Sélectionner le compte dans Redux
    dispatch(selectAccount({
      id: redAccount.id,
      redAccountId: redAccount.redAccountId,
      agencyId: redAccount.agencyId,
      agencyName: redAccount.agencyName,
      activeLines: redAccount.activeLines,
      maxLines: redAccount.maxLines
    }));
    // Naviguer vers la page de gestion des comptes
    navigate('/accountresign');
  };

  // Check if there's a bank account to expand from localStorage
  useEffect(() => {
    const expandedBankAccountId = localStorage.getItem('expandedBankAccountId');
    if (expandedBankAccountId) {
      // Expand the bank account
      setExpandedAccounts(prev => ({
        ...prev,
        [parseInt(expandedBankAccountId)]: true
      }));
      // Clear the localStorage
      localStorage.removeItem('expandedBankAccountId');

      // Scroll to the bank account after a short delay to ensure rendering
      setTimeout(() => {
        const element = document.getElementById(`bank-account-${expandedBankAccountId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Erreur lors du chargement des données bancaires. Veuillez réessayer.
        </Alert>
      </Box>
    );
  }

  const bankAccounts = data?.data || [];
  const totalToDeposit = bankAccounts.reduce((sum, acc) => sum + parseFloat(acc.monthlyAmount), 0);
  const totalExpiringCards = bankAccounts.reduce((sum, acc) => sum + acc.expiringCardsCount, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Gestion Bancaire
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Chip
              icon={<EuroIcon />}
              label={`Total à déposer: ${totalToDeposit.toFixed(2)} €`}
              color="primary"
              sx={{ fontWeight: 'bold', fontSize: '0.95rem', py: 2.5 }}
            />
            <Chip
              label={`${bankAccounts.reduce((sum, acc) => sum + acc.totalActiveLines, 0)} lignes actives`}
              variant="outlined"
              color="primary"
            />
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateAccountModalOpen(true)}
        >
          Nouveau Compte Bancaire
        </Button>
      </Box>

      {/* Liste des comptes bancaires */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          Liste des Comptes Bancaires
        </Typography>

        {bankAccounts.length === 0 ? (
          <Alert severity="info">
            Aucun compte bancaire enregistré. Créez-en un pour commencer.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {bankAccounts.map((bankAccount) => (
              <Paper
                key={bankAccount.id}
                id={`bank-account-${bankAccount.id}`}
                variant="outlined"
                sx={{
                  p: 1.5,
                  transition: 'all 0.3s',
                  '&:hover': { boxShadow: 2 },
                }}
              >
                {/* En-tête du compte */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={1.5} flex={1}>
                    <BankIcon color="primary" sx={{ fontSize: 28 }} />
                    <Typography variant="body1">
                      <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>Banque:</Box>{' '}
                      <Box component="span" sx={{ fontWeight: 'medium' }}>{bankAccount.accountHolder}</Box>
                      <Box component="span" sx={{ color: 'text.secondary', mx: 1 }}>|</Box>
                      {bankAccount.accountName}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={`${bankAccount.totalActiveLines} lignes`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={`${bankAccount.monthlyAmount} €`}
                      color="success"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                    <Chip
                      label={`${bankAccount.cardsCount} carte(s)`}
                      icon={<CardIcon />}
                      color="info"
                      variant="outlined"
                      size="small"
                    />
                    {bankAccount.expiringCardsCount > 0 && (
                      <Chip
                        label={`${bankAccount.expiringCardsCount} expire`}
                        icon={<WarningIcon />}
                        color="warning"
                        size="small"
                      />
                    )}
                    <IconButton onClick={() => handleExpandClick(bankAccount.id)} size="small">
                      {expandedAccounts[bankAccount.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Stack>
                </Stack>

                {/* Détails du compte (collapsible) */}
                <Collapse in={expandedAccounts[bankAccount.id]} timeout="auto" unmountOnExit>
                  <Box sx={{ mt: 3 }}>
                    {/* Cartes bancaires */}
                    <Box sx={{ mb: 3 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 2 }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold">
                          Cartes Bancaires
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddCard(bankAccount)}
                        >
                          Ajouter une carte
                        </Button>
                      </Stack>

                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Nom de la carte</TableCell>
                              <TableCell>Banque</TableCell>
                              <TableCell>4 derniers chiffres</TableCell>
                              <TableCell>Expiration</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Statut</TableCell>
                              <TableCell align="center">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {bankAccount.bankCards.map((card) => (
                              <TableRow key={card.id}>
                                <TableCell>
                                  <Typography fontWeight="bold">{card.cardName}</Typography>
                                </TableCell>
                                <TableCell>{card.bankName || 'N/A'}</TableCell>
                                <TableCell>**** {card.cardLastFour}</TableCell>
                                <TableCell>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <span>{card.cardExpiry}</span>
                                    {card.isExpiringSoon && (
                                      <Chip
                                        label="Expire bientôt"
                                        size="small"
                                        color="warning"
                                        icon={<WarningIcon />}
                                      />
                                    )}
                                  </Stack>
                                </TableCell>
                                <TableCell>
                                  {card.isPrimary ? (
                                    <Chip label="Principale" size="small" color="primary" />
                                  ) : (
                                    <Chip label="Secondaire" size="small" variant="outlined" />
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={card.isActive ? 'Active' : 'Inactive'}
                                    size="small"
                                    color={card.isActive ? 'success' : 'default'}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Tooltip title="Modifier">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleUpdateCard(bankAccount, card)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>

                    {/* Comptes RED associés */}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                        Comptes RED Associés ({bankAccount.redAccountsCount})
                      </Typography>

                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Compte RED</TableCell>
                              <TableCell>Agence</TableCell>
                              <TableCell>Lignes actives</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {bankAccount.redAccounts.map((redAccount) => (
                              <TableRow
                                key={redAccount.id}
                                sx={{
                                  cursor: 'pointer',
                                  '&:hover': {
                                    bgcolor: 'action.hover'
                                  }
                                }}
                              >
                                <TableCell>
                                  <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => handleRedAccountClick(redAccount)}
                                    sx={{
                                      textDecoration: 'none',
                                      color: 'primary.main',
                                      fontWeight: 'medium',
                                      '&:hover': {
                                        textDecoration: 'underline'
                                      }
                                    }}
                                  >
                                    RED {redAccount.redAccountId}
                                  </Link>
                                </TableCell>
                                <TableCell>{redAccount.agencyName}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={redAccount.activeLines}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>

                    {bankAccount.notes && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <strong>Notes :</strong> {bankAccount.notes}
                      </Alert>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Modals */}
      <CreateBankAccountModal open={createAccountModalOpen} onClose={() => setCreateAccountModalOpen(false)} />
      <AddBankCardModal
        open={addCardModalOpen}
        onClose={() => {
          setAddCardModalOpen(false);
          setSelectedBankAccount(null);
        }}
        bankAccount={selectedBankAccount}
      />
      <UpdateBankCardModal
        open={updateCardModalOpen}
        onClose={() => {
          setUpdateCardModalOpen(false);
          setSelectedBankAccount(null);
          setSelectedCard(null);
        }}
        bankAccount={selectedBankAccount}
        card={selectedCard}
      />
    </Box>
  );
};

export default BankManagement;
