import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Analytics as StatsIcon,
  Phone as PhoneIcon,
  DataUsage as DataIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Build as EquipmentIcon
} from '@mui/icons-material';
import { useGetSubscriptionsQuery, useCreateSubscriptionMutation, useUpdateSubscriptionMutation, useDeleteSubscriptionMutation, useGetSubscriptionStatsQuery } from '../../store/slices/subscriptionsSlice';

const SubscriptionsManagement = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'EUR',
    durationDays: 30,
    dataAllowanceMb: 1024,
    callMinutes: 100,
    smsCount: 100,
    subscriptionType: 'PREPAID',
    autoRenewEnabled: false,
    priorityOrder: 0,
    includesEquipment: false,
    equipmentType: '',
    equipmentDescription: '',
    equipmentDeposit: 0,
    equipmentMonthlyFee: 0,
    equipmentQuantity: 1,
    equipmentSpecifications: {},
    features: {}
  });

  // RTK Query hooks
  const { data: subscriptions, isLoading, error } = useGetSubscriptionsQuery();
  const { data: stats } = useGetSubscriptionStatsQuery();
  const [createSubscription] = useCreateSubscriptionMutation();
  const [updateSubscription] = useUpdateSubscriptionMutation();
  const [deleteSubscription] = useDeleteSubscriptionMutation();

  const handleOpenDialog = (subscription = null) => {
    if (subscription) {
      setEditingSubscription(subscription);
      setFormData({
        name: subscription.name || '',
        description: subscription.description || '',
        price: subscription.price || '',
        currency: subscription.currency || 'EUR',
        durationDays: subscription.durationDays || 30,
        dataAllowanceMb: subscription.dataAllowanceMb || 0,
        callMinutes: subscription.callMinutes || 0,
        smsCount: subscription.smsCount || 0,
        subscriptionType: subscription.subscriptionType || 'PREPAID',
        autoRenewEnabled: subscription.autoRenewEnabled || false,
        priorityOrder: subscription.priorityOrder || 0,
        includesEquipment: subscription.includesEquipment || false,
        equipmentType: subscription.equipmentType || '',
        equipmentDescription: subscription.equipmentDescription || '',
        equipmentDeposit: subscription.equipmentDeposit || 0,
        equipmentMonthlyFee: subscription.equipmentMonthlyFee || 0,
        equipmentQuantity: subscription.equipmentQuantity || 1,
        equipmentSpecifications: subscription.equipmentSpecifications || {},
        features: subscription.features || {}
      });
    } else {
      setEditingSubscription(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        currency: 'EUR',
        durationDays: 30,
        dataAllowanceMb: 1024,
        callMinutes: 100,
        smsCount: 100,
        subscriptionType: 'PREPAID',
        autoRenewEnabled: false,
        priorityOrder: 0,
        includesEquipment: false,
        equipmentType: '',
        equipmentDescription: '',
        equipmentDeposit: 0,
        equipmentMonthlyFee: 0,
        equipmentQuantity: 1,
        equipmentSpecifications: {},
        features: {}
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSubscription(null);
  };

  const handleSubmit = async () => {
    try {
      const subscriptionData = {
        ...formData,
        price: parseFloat(formData.price),
        durationDays: parseInt(formData.durationDays),
        dataAllowanceMb: parseInt(formData.dataAllowanceMb),
        callMinutes: parseInt(formData.callMinutes),
        smsCount: parseInt(formData.smsCount),
        priorityOrder: parseInt(formData.priorityOrder || 0),
        equipmentDeposit: parseFloat(formData.equipmentDeposit || 0),
        equipmentMonthlyFee: parseFloat(formData.equipmentMonthlyFee || 0),
        equipmentQuantity: parseInt(formData.equipmentQuantity || 1)
      };

      if (editingSubscription) {
        await updateSubscription({ 
          id: editingSubscription.id, 
          ...subscriptionData 
        }).unwrap();
      } else {
        await createSubscription(subscriptionData).unwrap();
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (subscriptionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir désactiver cet abonnement ?')) {
      try {
        await deleteSubscription(subscriptionId).unwrap();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const formatDataSize = (mb) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  const formatDuration = (days) => {
    if (days >= 365) {
      return `${Math.floor(days / 365)} an${days >= 730 ? 's' : ''}`;
    } else if (days >= 30) {
      return `${Math.floor(days / 30)} mois`;
    }
    return `${days} jour${days > 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Erreur lors du chargement des abonnements: {error.message}
      </Alert>
    );
  }

  return (
    <Box p={3}>
      {/* En-tête */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Gestion des Abonnements
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<StatsIcon />}
            onClick={() => setShowStats(!showStats)}
            sx={{ mr: 2 }}
          >
            Statistiques
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nouvel Abonnement
          </Button>
        </Box>
      </Box>

      {/* Statistiques */}
      {showStats && stats && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Statistiques des Abonnements
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary">
                    {stats.data?.totalActivePlans || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Plans Actifs
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {stats.data?.activeSubscriptions || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Abonnements Actifs
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="info.main">
                    {stats.data?.plansByType?.PREPAID || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Plans Prépayés
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="warning.main">
                    {stats.data?.plansByType?.POSTPAID || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Plans Postpayés
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Liste des abonnements */}
      <Grid container spacing={3}>
        {subscriptions?.data?.map((subscription) => (
          <Grid item xs={12} md={6} lg={4} key={subscription.id}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              <CardContent>
                {/* En-tête de la carte */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h3">
                    {subscription.name}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(subscription)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(subscription.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Prix et durée */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center">
                    <MoneyIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h5" color="primary">
                      {subscription.formattedPrice}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<ScheduleIcon />}
                    label={formatDuration(subscription.durationDays)}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {/* Type d'abonnement */}
                <Chip
                  label={subscription.subscriptionType}
                  color={subscription.subscriptionType === 'PREPAID' ? 'primary' : 'secondary'}
                  size="small"
                  sx={{ mb: 2 }}
                />

                {/* Description */}
                {subscription.description && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {subscription.description}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Détails des services */}
                <Box>
                  {subscription.dataAllowanceMb > 0 && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <DataIcon color="action" sx={{ mr: 1, fontSize: 18 }} />
                      <Typography variant="body2">
                        {formatDataSize(subscription.dataAllowanceMb)} données
                      </Typography>
                    </Box>
                  )}
                  
                  {subscription.callMinutes > 0 && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <PhoneIcon color="action" sx={{ mr: 1, fontSize: 18 }} />
                      <Typography variant="body2">
                        {subscription.callMinutes} min d'appels
                      </Typography>
                    </Box>
                  )}
                  
                  {subscription.smsCount > 0 && (
                    <Box display="flex" alignItems="center" mb={1}>
                      <Typography variant="body2" sx={{ ml: 3 }}>
                        {subscription.smsCount} SMS
                      </Typography>
                    </Box>
                  )}
                  
                  {subscription.isUnlimited && (
                    <Chip 
                      label="Illimité" 
                      color="success" 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>

                {/* Matériel inclus */}
                {subscription.hasEquipment && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 1 }} />
                    <Box display="flex" alignItems="center" mb={1}>
                      <EquipmentIcon color="secondary" sx={{ mr: 1, fontSize: 18 }} />
                      <Typography variant="body2" color="secondary" fontWeight="bold">
                        Matériel inclus
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 3 }}>
                      {subscription.equipmentInfo}
                    </Typography>
                    {subscription.totalMonthlyPrice > subscription.price && (
                      <Typography variant="body2" color="primary" fontWeight="bold" sx={{ ml: 3 }}>
                        Prix total: {subscription.formattedTotalPrice}
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Renouvellement automatique */}
                {subscription.autoRenewEnabled && (
                  <Chip
                    label="Renouvellement auto"
                    color="info"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog de création/édition */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSubscription ? 'Modifier l\'abonnement' : 'Nouvel abonnement'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Informations de base */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de l'abonnement"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type d'abonnement</InputLabel>
                <Select
                  value={formData.subscriptionType}
                  onChange={(e) => setFormData({ ...formData, subscriptionType: e.target.value })}
                  label="Type d'abonnement"
                >
                  <MenuItem value="PREPAID">Prépayé</MenuItem>
                  <MenuItem value="POSTPAID">Postpayé</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>

            {/* Prix et durée */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Prix"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Devise</InputLabel>
                <Select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  label="Devise"
                >
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="CDF">CDF</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Durée (jours)"
                type="number"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                required
              />
            </Grid>

            {/* Services inclus */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Données (MB)"
                type="number"
                value={formData.dataAllowanceMb}
                onChange={(e) => setFormData({ ...formData, dataAllowanceMb: e.target.value })}
                helperText="0 = aucune donnée, -1 = illimité"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Minutes d'appel"
                type="number"
                value={formData.callMinutes}
                onChange={(e) => setFormData({ ...formData, callMinutes: e.target.value })}
                helperText="0 = aucun appel, -1 = illimité"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Nombre de SMS"
                type="number"
                value={formData.smsCount}
                onChange={(e) => setFormData({ ...formData, smsCount: e.target.value })}
                helperText="0 = aucun SMS, -1 = illimité"
              />
            </Grid>

            {/* Options */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ordre de priorité"
                type="number"
                value={formData.priorityOrder}
                onChange={(e) => setFormData({ ...formData, priorityOrder: e.target.value })}
                helperText="0 = priorité la plus élevée"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoRenewEnabled}
                    onChange={(e) => setFormData({ ...formData, autoRenewEnabled: e.target.checked })}
                  />
                }
                label="Renouvellement automatique activé"
              />
            </Grid>

            {/* Section Matériel */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Matériel mis à disposition
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.includesEquipment}
                    onChange={(e) => setFormData({ ...formData, includesEquipment: e.target.checked })}
                  />
                }
                label="Inclut du matériel"
              />
            </Grid>

            {formData.includesEquipment && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Type de matériel"
                    value={formData.equipmentType}
                    onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
                    placeholder="ex: Routeur WiFi, Box Internet..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description du matériel"
                    value={formData.equipmentDescription}
                    onChange={(e) => setFormData({ ...formData, equipmentDescription: e.target.value })}
                    multiline
                    rows={2}
                    placeholder="Description détaillée du matériel fourni..."
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Caution matériel (€)"
                    type="number"
                    value={formData.equipmentDeposit}
                    onChange={(e) => setFormData({ ...formData, equipmentDeposit: e.target.value })}
                    helperText="Montant de la caution remboursable"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Frais mensuel matériel (€)"
                    type="number"
                    value={formData.equipmentMonthlyFee}
                    onChange={(e) => setFormData({ ...formData, equipmentMonthlyFee: e.target.value })}
                    helperText="Frais mensuels ajoutés au forfait"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Quantité"
                    type="number"
                    value={formData.equipmentQuantity}
                    onChange={(e) => setFormData({ ...formData, equipmentQuantity: e.target.value })}
                    inputProps={{ min: 1 }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingSubscription ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionsManagement;