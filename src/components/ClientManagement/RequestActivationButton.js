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
  TextField
} from '@mui/material';
import {
  PlayArrow as ActivateIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useProcessSimReplacementRequestMutation } from '../../store/slices/simReplacementSlice';

const RequestActivationButton = ({ client, size = "medium" }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [processSimReplacementRequest] = useProcessSimReplacementRequestMutation();

  // Vérifier si c'est éligible pour demande d'activation
  const canRequestActivation = client?.canRequestActivation === true;

  // Déterminer le type de cas
  const isPausedLine = client?.phoneStatus === 'PAUSED' && client?.pendingBlockReason === 'pause';
  const isTerminatedLine = client?.phoneStatus === 'TERMINATED';

  const handleRequestActivation = async () => {
    setIsSubmitting(true);
    try {
      // Utiliser l'action 'order_new_sim' pour déclencher une demande d'activation
      const result = await processSimReplacementRequest({
        phoneId: client.id,
        action: 'order_new_sim', // Même action mais contexte différent
        reason: isPausedLine ? 'reactivation_after_pause' : 'reactivation_after_termination',
        notes: notes || `Demande réactivation - ${isPausedLine ? 'Après pause' : 'Après résiliation'}`,
        billing: null // Pas de facturation pour la demande
      }).unwrap();

      console.log('✅ Demande d\'activation créée:', result);

      // Fermer le modal
      setShowDialog(false);

      // Réinitialiser le formulaire
      setNotes('');

    } catch (error) {
      console.error('❌ Erreur lors de la demande d\'activation:', error);
      alert('Erreur lors de la demande. Veuillez réessayer.');
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
          <Button onClick={() => setShowDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRequestActivation}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <PhoneIcon />}
          >
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RequestActivationButton;