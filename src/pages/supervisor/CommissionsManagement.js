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
  Button,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as PendingIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
// Import de la configuration API
import API_CONFIG from '../../config/api.js';
import { formatCurrency, formatDate } from '../../utils/formatters';

const CommissionsManagement = () => {
  const [statements, setStatements] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [selectedAgencyFilter, setSelectedAgencyFilter] = useState(''); // Filtre d'affichage
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(''); // Pour la génération

  // Fonction API locale
  const apiCall = async (endpoint, method = 'GET', data = null) => {
    try {
      const url = `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;
      const token = localStorage.getItem('token');

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { authorization: `Bearer ${token}` }),
        },
        ...(data && { body: JSON.stringify(data) }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // États des relevés avec couleurs
  const statementStatus = {
    'PENDING': { label: 'En attente', color: 'warning' },
    'CONFIRMED': { label: 'Confirmé reçu', color: 'success' },
    'PAID': { label: 'Payé', color: 'info' },
    'OVERDUE': { label: 'En retard', color: 'error' },
    'REALTIME': { label: 'Temps réel', color: 'primary' }
  };

  useEffect(() => {
    fetchStatements();
    fetchAgencies();
  }, [selectedPeriod, selectedAgencyFilter]);

  const fetchStatements = async () => {
    setLoading(true);
    try {
      // Construire la query avec les filtres
      const params = new URLSearchParams();
      params.append('period', selectedPeriod);
      if (selectedAgencyFilter) {
        params.append('agencyId', selectedAgencyFilter);
      }

      const currentMonth = new Date().toISOString().slice(0, 7);
      let allStatements = [];

      // Récupérer les relevés officiels
      const statementsResponse = await apiCall(`/supervisor/commissions/statements?${params.toString()}`, 'GET');
      if (statementsResponse.success) {
        allStatements = statementsResponse.data || [];
      }

      // Si on regarde le mois courant, ajouter les commissions temps réel
      if (selectedPeriod === currentMonth) {
        try {
          const realtimeParams = new URLSearchParams();
          if (selectedAgencyFilter) {
            realtimeParams.append('agencyId', selectedAgencyFilter);
          }

          const realtimeResponse = await apiCall(`/supervisor/commissions/current-month?${realtimeParams.toString()}`, 'GET');
          if (realtimeResponse.success) {
            // Ajouter les commissions temps réel au début de la liste
            allStatements = [...(realtimeResponse.data || []), ...allStatements];
          }
        } catch (realtimeError) {
          console.warn('Erreur récupération commissions temps réel:', realtimeError);
          // On continue avec les relevés officiels même si le temps réel échoue
        }
      }

      setStatements(allStatements);
    } catch (error) {
      console.error('Erreur relevés:', error);
    }
    setLoading(false);
  };

  const fetchAgencies = async () => {
    try {
      const response = await apiCall('/agencies', 'GET');
      if (response.success) {
        setAgencies(response.data || []);
      }
    } catch (error) {
      console.error('Erreur agences:', error);
    }
  };

  const generateStatements = async () => {
    try {
      setLoading(true);
      const endpoint = selectedAgency
        ? `/supervisor/commission-generation/agencies/${selectedAgency}/generate`
        : '/supervisor/commission-generation/generate';

      const response = await apiCall(endpoint, 'POST', {
        period: selectedPeriod
      });

      if (response.success) {
        alert('Relevés générés avec succès !');
        fetchStatements();
        setGenerateDialogOpen(false);
        setSelectedAgency('');
      }
    } catch (error) {
      alert('Erreur génération: ' + error.message);
    }
    setLoading(false);
  };

  const confirmPayment = async (statementId) => {
    try {
      const response = await apiCall(`/supervisor/commissions/statements/${statementId}/confirm`, 'POST');
      if (response.success) {
        alert('Paiement confirmé !');
        fetchStatements();
      }
    } catch (error) {
      alert('Erreur confirmation: ' + error.message);
    }
  };

  const downloadStatement = async (statementId) => {
    try {
      // Simuler téléchargement PDF
      alert('Téléchargement du relevé en cours...');
    } catch (error) {
      alert('Erreur téléchargement: ' + error.message);
    }
  };

  // Calculer totaux
  const totals = statements.reduce((acc, stmt) => {
    acc.totalAmount += stmt.totalAmount || 0;
    acc.totalPending += stmt.status === 'PENDING' ? (stmt.totalAmount || 0) : 0;
    acc.totalConfirmed += stmt.status === 'CONFIRMED' ? (stmt.totalAmount || 0) : 0;
    return acc;
  }, { totalAmount: 0, totalPending: 0, totalConfirmed: 0 });

  // Nom de l'agence filtrée pour l'affichage
  const filteredAgencyName = selectedAgencyFilter
    ? agencies.find(a => a.id == selectedAgencyFilter)?.name
    : null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          💰 Gestion des Commissions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setGenerateDialogOpen(true)}
            disabled={loading}
          >
            Générer Relevés
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchStatements}
            disabled={loading}
          >
            Actualiser
          </Button>
        </Box>
      </Box>

      {/* Filtres */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          🔍 Filtres
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Période"
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Agence"
              value={selectedAgencyFilter}
              onChange={(e) => setSelectedAgencyFilter(e.target.value)}
            >
              <MenuItem value="">Toutes les agences</MenuItem>
              {agencies.map((agency) => (
                <MenuItem key={agency.id} value={agency.id}>
                  {agency.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={() => {
                setSelectedAgencyFilter('');
                setSelectedPeriod(new Date().toISOString().slice(0, 7));
              }}
              sx={{ height: '56px' }}
            >
              Effacer
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Résumé */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total à Percevoir - {selectedPeriod}
                {filteredAgencyName && (
                  <Typography component="span" color="primary" sx={{ ml: 1 }}>
                    ({filteredAgencyName})
                  </Typography>
                )}
              </Typography>
              <Typography variant="h5" color="primary">
                {formatCurrency(totals.totalAmount)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {statements.length} relevé{statements.length > 1 ? 's' : ''} {filteredAgencyName ? 'pour cette agence' : 'générés'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                En Attente de Paiement
              </Typography>
              <Typography variant="h5" color="warning.main">
                {formatCurrency(totals.totalPending)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                à recevoir avant le 15
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Confirmés Reçus
              </Typography>
              <Typography variant="h5" color="success.main">
                {formatCurrency(totals.totalConfirmed)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                paiements confirmés
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerte pour commissions temps réel */}
      {selectedPeriod === new Date().toISOString().slice(0, 7) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            📊 <strong>Commissions temps réel</strong> - Les entrées marquées "TEMPS RÉEL" montrent les commissions accumulées ce mois-ci qui ne sont pas encore consolidées dans un relevé officiel.
          </Typography>
        </Alert>
      )}

      {/* Table des relevés */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Agence</TableCell>
                <TableCell>Période</TableCell>
                <TableCell>Montant Dû</TableCell>
                <TableCell>Échéance</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statements.map((statement) => (
                <TableRow key={statement.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {statement.agencyName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {statement.clientsCount || 0} clients
                        </Typography>
                      </Box>
                      {statement.status === 'REALTIME' && (
                        <Chip
                          label="TEMPS RÉEL"
                          color="primary"
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            height: '20px',
                            animation: 'pulse 2s infinite'
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{statement.period}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {formatCurrency(statement.totalAmount)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {statement.distributionsCount || 0} paiements
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {statement.status === 'REALTIME' ? (
                      <Typography variant="body2" color="primary" fontStyle="italic">
                        En cours...
                      </Typography>
                    ) : (
                      <Typography variant="body2">
                        15/{statement.period.split('-')[1]}/{statement.period.split('-')[0]}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statementStatus[statement.status]?.label || statement.status}
                      color={statementStatus[statement.status]?.color || 'default'}
                      size="small"
                      icon={
                        statement.status === 'CONFIRMED' ? <CheckCircleIcon /> :
                        statement.status === 'PENDING' ? <PendingIcon /> : undefined
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {statement.status === 'PENDING' && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => confirmPayment(statement.id)}
                          title="Confirmer réception"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => downloadStatement(statement.id)}
                        title="Télécharger relevé"
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Voir détail"
                      >
                        <ReceiptIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {statements.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="textSecondary">
              Aucun relevé trouvé pour {selectedPeriod}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setGenerateDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Générer les relevés du mois
            </Button>
          </Box>
        )}

        {loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </Paper>

      {/* Dialog génération */}
      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)}>
        <DialogTitle>Générer Relevés de Commission</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Période"
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              select
              label="Agence"
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              helperText="Laisser vide pour générer tous les relevés"
            >
              <MenuItem value="">Toutes les agences</MenuItem>
              {agencies.map((agency) => (
                <MenuItem key={agency.id} value={agency.id}>
                  {agency.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={generateStatements}
            disabled={loading}
          >
            Générer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommissionsManagement;