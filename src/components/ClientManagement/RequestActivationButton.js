import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Box,
  TextField,
  Snackbar
} from '@mui/material';
import {
  PlayArrow as ActivateIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useProcessSimReplacementRequestMutation } from '../../store/slices/simReplacementSlice';
import { useCheckPaymentBeforeActivationMutation } from '../../store/slices/lineReservationsSlice';

const RequestActivationButton = ({ client, size = "medium" }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentCheckResult, setPaymentCheckResult] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const [processSimReplacementRequest] = useProcessSimReplacementRequestMutation();
  const [checkPaymentBeforeActivation] = useCheckPaymentBeforeActivationMutation();

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Vérifier si c'est éligible pour demande d'activation
  const canRequestActivation = client?.canRequestActivation === true;

  // Déterminer le type de cas
  const isPausedLine = client?.phoneStatus === 'PAUSED' && client?.pendingBlockReason === 'pause';
  const isTerminatedLine = client?.phoneStatus === 'TERMINATED';

  const handleRequestActivation = async () => {
    setIsSubmitting(true);
    setAttemptCount(prev => prev + 1);

    try {
      // 🔄 ÉTAPE 1: Vérifier le paiement avant activation
      console.log('🔍 Vérification paiement avant activation...');
      const paymentCheck = await checkPaymentBeforeActivation({
        phoneId: client.id,
        clientId: client.userId || client.user?.id
      }).unwrap();

      console.log('💰 Résultat vérification paiement:', paymentCheck);
      setPaymentCheckResult(paymentCheck);

      // 🎯 CAS 1: Paiement OK → Procéder à l'activation
      if (paymentCheck.canActivate) {
        showSnackbar('✅ Paiement vérifié - Envoi de la demande d\'activation', 'success');

        const result = await processSimReplacementRequest({
          phoneId: client.id,
          action: 'order_new_sim',
          reason: isPausedLine ? 'reactivation_after_pause' : 'reactivation_after_termination',
          notes: notes || `Demande réactivation - ${isPausedLine ? 'Après pause' : 'Après résiliation'}`,
          billing: null
        }).unwrap();

        console.log('✅ Demande d\'activation créée:', result);
        setShowDialog(false);
        setNotes('');
        showSnackbar('📋 Demande d\'activation envoyée avec succès !', 'success');

      } else {
        // 🚨 CAS 2 & 3: Problème de paiement → Notifications persistantes
        if (paymentCheck.currentMonthStatus === 'INVOICE_EXISTS') {
          // Facture existe mais pas payée - Notification persistante à chaque tentative
          const message = attemptCount === 1
            ? `⚠️ Facture impayée de ${paymentCheck.currentMonthInvoice?.amount}€. Prorata ajusté.`
            : `🚫 Facture ${paymentCheck.currentMonthInvoice?.invoiceNumber} toujours impayée ! Veuillez facturer le client de ${paymentCheck.currentMonthInvoice?.amount}€ (tentative ${attemptCount})`;

          showSnackbar(message, 'error');
        } else if (paymentCheck.currentMonthStatus === 'INVOICE_GENERATED') {
          // Facture générée - Notification persistante à chaque tentative
          const message = attemptCount === 1
            ? `💰 Facture créée: ${paymentCheck.currentMonthInvoice?.amount}€ (prorata du ${new Date().getDate()}/${new Date().getMonth() + 1})`
            : `📋 RAPPEL : Facturez le client de ${paymentCheck.currentMonthInvoice?.amount}€ (facture ${paymentCheck.currentMonthInvoice?.invoiceNumber}) avant la prochaine tentative ! (tentative ${attemptCount})`;

          showSnackbar(message, 'warning');
        }
        // Le modal reste ouvert pour afficher les détails de paiement
      }

    } catch (error) {
      console.error('❌ Erreur lors de la vérification:', error);
      showSnackbar('❌ Erreur lors de la vérification de paiement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canRequestActivation) {
    return null; // Ne pas afficher le bouton si pas éligible
  }

  return (
    <>
      {/* Bouton principal */}
      <Button
        variant="contained"
        color="primary"
        size={size}
        startIcon={<ActivateIcon />}
        onClick={() => setShowDialog(true)}
        sx={{
          minWidth: 'auto',
          whiteSpace: 'nowrap',
          fontSize: size === 'small' ? '0.75rem' : '0.875rem'
        }}
      >
        Demande activation
      </Button>

      {/* Modal de demande */}
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ActivateIcon color="primary" />
            Demander la réactivation de la ligne
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Informations client */}
            <Alert severity="info">
              <Typography variant="body2" gutterBottom>
                <strong>Client :</strong> {client?.user?.firstname} {client?.user?.lastname}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Numéro :</strong> {client?.phoneNumber}
              </Typography>
              <Typography variant="body2">
                <strong>Statut actuel :</strong> {
                  isPausedLine ? 'En pause' :
                  isTerminatedLine ? 'Résilié' :
                  client?.phoneStatus
                }
              </Typography>
            </Alert>

            {/* Type de demande */}
            <Alert severity={isPausedLine ? "success" : "warning"}>
              <Typography variant="h6" gutterBottom>
                {isPausedLine ? '▶️ Réactivation après pause' : '🔄 Réactivation après résiliation'}
              </Typography>
              <Typography variant="body2">
                {isPausedLine ?
                  'Cette ligne est actuellement en pause et peut être réactivée.' :
                  'Cette ligne a été résiliée il y a moins d\'un an et peut être réactivée.'
                }
              </Typography>
            </Alert>

            {/* 💰 Informations de paiement (si vérification effectuée) */}
            {paymentCheckResult && !paymentCheckResult.canActivate && (
              <Alert severity="warning">
                <Typography variant="h6" gutterBottom>
                  💰 Paiement requis avant activation
                </Typography>

                {paymentCheckResult.currentMonthStatus === 'INVOICE_EXISTS' && (
                  <>
                    <Typography variant="body2" gutterBottom>
                      <strong>Facture impayée :</strong> {paymentCheckResult.currentMonthInvoice?.invoiceNumber}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Montant ajusté (prorata) :</strong> {paymentCheckResult.currentMonthInvoice?.amount}€
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Veuillez demander le paiement au client avant de relancer la demande.
                    </Typography>
                  </>
                )}

                {paymentCheckResult.currentMonthStatus === 'INVOICE_GENERATED' && (
                  <>
                    <Typography variant="body2" gutterBottom>
                      <strong>Nouvelle facture créée :</strong> {paymentCheckResult.currentMonthInvoice?.invoiceNumber}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Montant (prorata) :</strong> {paymentCheckResult.currentMonthInvoice?.amount}€
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Facturez le client puis relancez la demande d'activation.
                    </Typography>
                  </>
                )}
              </Alert>
            )}

            {/* Notes */}
            <TextField
              label="Motif de la demande (optionnel)"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              placeholder={
                isPausedLine ?
                "Ex: Client souhaite reprendre l'utilisation de sa ligne..." :
                "Ex: Client souhaite récupérer son ancien numéro..."
              }
            />

            {/* Information sur le processus */}
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Processus :</strong><br />
                1. Demande transmise au superviseur<br />
                2. Validation des conditions de réactivation<br />
                3. Si approuvé → Ligne passe dans "À ACTIVER"<br />
                4. Attribution d'une nouvelle SIM si nécessaire
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => {
            setShowDialog(false);
            setPaymentCheckResult(null);
            setAttemptCount(0);
          }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRequestActivation}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <PhoneIcon />}
          >
            {isSubmitting ? 'Vérification...' :
             paymentCheckResult && !paymentCheckResult.canActivate ? 'Relancer la demande' :
             'Envoyer la demande'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MUI Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RequestActivationButton;