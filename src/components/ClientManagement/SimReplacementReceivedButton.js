import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Stack,
    Alert,
    Box
} from '@mui/material';
import {
    LocalShipping as DeliveryIcon,
    SimCard as SimIcon
} from '@mui/icons-material';
import { useDeclareSimReplacementReceivedMutation } from '../../store/slices/simReplacementSlice';

const SimReplacementReceivedButton = ({ client, disabled = false, size = "small" }) => {
    const [open, setOpen] = useState(false);
    const [iccid, setIccid] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [declareSimReceived] = useDeclareSimReplacementReceivedMutation();

    const handleDeclareReceived = async () => {
        if (!iccid.trim()) {
            alert('Veuillez saisir l\'ICCID de la nouvelle SIM');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await declareSimReceived({
                phoneId: client.id,
                iccid: iccid.trim()
            }).unwrap();

            console.log('✅ Réception SIM de remplacement déclarée:', result);
            setOpen(false);
            setIccid('');
        } catch (error) {
            console.error('Erreur déclaration réception SIM:', error);
            alert('Erreur lors de la déclaration de réception');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setIccid('');
        setIsSubmitting(false);
    };

    const clientName = client?.user ?
        `${client.user.firstname} ${client.user.lastname}` :
        'Client inconnu';

    // Afficher seulement pour les remplacements SIM en attente
    const isReplacementWaitingForSim = client?.replacementSimOrdered &&
                                      !client?.replacementSimReceived &&
                                      client?.supervisorConfirmedSimOrder;

    if (!isReplacementWaitingForSim) {
        return null;
    }

    return (
        <>
            <Button
                variant="contained"
                color="success"
                size={size}
                startIcon={<DeliveryIcon />}
                onClick={() => setOpen(true)}
                disabled={disabled}
                sx={{ whiteSpace: 'nowrap' }}
            >
                Déclarer réception SIM
            </Button>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <SimIcon color="primary" />
                        <Typography variant="h6">
                            Déclarer réception SIM de remplacement
                        </Typography>
                    </Stack>
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Alert severity="info">
                            <Typography variant="body2">
                                <strong>Client :</strong> {clientName}<br />
                                <strong>Ligne :</strong> {client.phoneNumber || 'N/A'}<br />
                                <strong>Motif :</strong> Remplacement SIM (vol/perte)
                            </Typography>
                        </Alert>

                        <Alert severity="warning">
                            <Typography variant="body2">
                                Une fois la réception déclarée, cette ligne pourra suivre le processus normal d'activation
                                (vérification paiement puis activation).
                            </Typography>
                        </Alert>

                        <TextField
                            label="ICCID de la nouvelle SIM *"
                            value={iccid}
                            onChange={(e) => setIccid(e.target.value)}
                            placeholder="Saisissez l'ICCID de la SIM reçue"
                            fullWidth
                            variant="outlined"
                            required
                            inputProps={{
                                style: { fontFamily: 'monospace' }
                            }}
                        />

                        <Box sx={{
                            p: 2,
                            backgroundColor: 'grey.100',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.300'
                        }}>
                            <Typography variant="caption" color="text.secondary">
                                <strong>Information :</strong> L'ICCID est généralement un code de 19-20 chiffres
                                présent sur la carte SIM. Une fois déclaré, cette SIM sera associée à la ligne.
                            </Typography>
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} disabled={isSubmitting}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleDeclareReceived}
                        variant="contained"
                        disabled={isSubmitting || !iccid.trim()}
                        color="success"
                    >
                        {isSubmitting ? 'Déclaration...' : 'Déclarer la réception'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SimReplacementReceivedButton;