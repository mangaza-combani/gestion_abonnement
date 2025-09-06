import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import invoiceService from '../../services/invoiceService';

const InvoiceGenerator = ({ open, onClose, client }) => {
  const [period, setPeriod] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  React.useEffect(() => {
    if (client && open) {
      // Calculer automatiquement les données de facture
      const data = invoiceService.calculateInvoiceData(client, period || 'Décembre 2024');
      setInvoiceData(data);
    }
  }, [client, period, open]);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      await invoiceService.downloadInvoice(client, period || 'Décembre 2024');
    } catch (error) {
      console.error('Erreur génération PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreview = async () => {
    try {
      await invoiceService.previewInvoice(client, period || 'Décembre 2024');
    } catch (error) {
      console.error('Erreur aperçu:', error);
    }
  };

  const handleSendEmail = async () => {
    try {
      const result = await invoiceService.sendInvoiceByEmail(client, period || 'Décembre 2024');
      console.log('Email préparé:', result);
      // Ici on pourrait ouvrir un modal de confirmation ou de composition d'email
    } catch (error) {
      console.error('Erreur envoi email:', error);
    }
  };

  if (!client || !invoiceData) return null;

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
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ReceiptIcon />
          <Box>
            <Typography variant="h6">
              Générateur de Facture
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Client: {client.user?.firstname} {client.user?.lastname} • N° {invoiceData.invoiceNumber}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Configuration de la facture */}
          <Grid item xs={12} md={4}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Configuration
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Période de facturation</InputLabel>
                  <Select
                    value={period}
                    label="Période de facturation"
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <MenuItem value="Novembre 2024">Novembre 2024</MenuItem>
                    <MenuItem value="Décembre 2024">Décembre 2024</MenuItem>
                    <MenuItem value="Janvier 2025">Janvier 2025</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date de facture: {invoiceData.invoiceDate}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date d'échéance: {invoiceData.dueDate}
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<VisibilityIcon />}
                    onClick={handlePreview}
                    fullWidth
                  >
                    Aperçu
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleGeneratePDF}
                    disabled={isGenerating}
                    fullWidth
                  >
                    {isGenerating ? 'Génération...' : 'Télécharger PDF'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<EmailIcon />}
                    onClick={handleSendEmail}
                    fullWidth
                  >
                    Envoyer par Email
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Aperçu de la facture */}
          <Grid item xs={12} md={8}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Aperçu de la Facture
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {/* Services facturés */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Services facturés
                  </Typography>
                  <List dense>
                    {invoiceData.services?.map((service, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemText
                          primary={service.description}
                          secondary={`${service.period} • Qté: ${service.quantity} • Prix: ${service.unitPrice.toFixed(2)}€`}
                        />
                        <Typography variant="h6" color="primary">
                          {service.total.toFixed(2)}€
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle1">
                      Sous-total services:
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {invoiceData.subtotal?.toFixed(2) || '0.00'}€
                    </Typography>
                  </Box>
                </Box>

                {/* Arriérés si applicable */}
                {invoiceData?.arrears > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon color="error" />
                      Arriérés
                    </Typography>
                    <List dense>
                      {invoiceData.arrearsDetails?.map((arrear, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText
                            primary={`Impayé ${arrear.period}`}
                            secondary="Montant en retard"
                          />
                          <Chip 
                            label={`${arrear.amount.toFixed(2)}€`}
                            color="error"
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUpIcon color="error" />
                        Total arriérés:
                      </Typography>
                      <Typography variant="h6" color="error">
                        +{invoiceData.arrears?.toFixed(2) || '0.00'}€
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Avances si applicable */}
                {invoiceData?.advances > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingDownIcon color="success" />
                      Avances
                    </Typography>
                    <List dense>
                      {invoiceData.advancesDetails?.map((advance, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText
                            primary={`Avance ${advance.period}`}
                            secondary={advance.note || 'Paiement anticipé'}
                          />
                          <Chip 
                            label={`-${advance.amount.toFixed(2)}€`}
                            color="success"
                            size="small"
                          />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingDownIcon color="success" />
                        Total avances:
                      </Typography>
                      <Typography variant="h6" color="success">
                        -{invoiceData.advances?.toFixed(2) || '0.00'}€
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Total final */}
                <Box sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  p: 2, 
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="h5" fontWeight="bold">
                    TOTAL À PAYER
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {invoiceData.finalTotal?.toFixed(2) || '0.00'}€
                  </Typography>
                </Box>

                {/* Statut de paiement */}
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Chip 
                    label={
                      invoiceData?.finalTotal <= 0 ? 'Solde créditeur' :
                      invoiceData?.arrears > 0 ? 'Arriérés à régulariser' :
                      'À payer dans les délais'
                    }
                    color={
                      invoiceData?.finalTotal <= 0 ? 'success' :
                      invoiceData?.arrears > 0 ? 'error' : 'primary'
                    }
                    sx={{ fontSize: '1rem', py: 1, px: 2 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Button onClick={onClose} variant="outlined">
          Fermer
        </Button>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={handleGeneratePDF}
          disabled={isGenerating}
        >
          Générer Facture
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceGenerator;