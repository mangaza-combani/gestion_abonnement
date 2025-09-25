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
    Box,
    IconButton
} from '@mui/material';
import {
    LocalShipping as DeliveryIcon,
    SimCard as SimIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useDeclareSimReplacementReceivedMutation } from '../../store/slices/simReplacementSlice';

const SimReplacementReceivedButton = ({ client, disabled = false, size = "small" }) => {
    const [open, setOpen] = useState(false);
    const [iccidParts, setIccidParts] = useState(['8933', '', '', '', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [declareSimReceived] = useDeclareSimReplacementReceivedMutation();

    const handleICCIDPartChange = (index, value) => {
        // Only allow digits and limit to 4 characters
        const numericValue = value.replace(/[^\d]/g, '').slice(0, 4);

        const newParts = [...iccidParts];
        newParts[index] = numericValue;
        setIccidParts(newParts);

        // Auto-focus next field if current field is complete and not the last field
        if (numericValue.length === 4 && index < 4) {
            const nextField = document.getElementById(`iccid-part-${index + 1}`);
            if (nextField) {
                nextField.focus();
            }
        }
    };

    const getFullICCID = () => {
        return iccidParts.join('');
    };

    const handleDeclareReceived = async () => {
        const fullICCID = getFullICCID();
        if (fullICCID.length < 20) {
            alert('Veuillez saisir l\'ICCID complet de la nouvelle SIM (20 chiffres)');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await declareSimReceived({
                phoneId: client.id,
                iccid: fullICCID
            }).unwrap();

            console.log('✅ Réception SIM de remplacement déclarée:', result);
            setOpen(false);
            setIccidParts(['8933', '', '', '', '']);
        } catch (error) {
            console.error('Erreur déclaration réception SIM:', error);
            alert('Erreur lors de la déclaration de réception');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setIccidParts(['8933', '', '', '', '']);
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
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        Déclarer réception SIM de remplacement
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={handleClose}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                <strong>Client :</strong> {clientName}<br />
                                <strong>Ligne :</strong> {client.phoneNumber || 'N/A'}<br />
                                <strong>Motif :</strong> Remplacement SIM (vol/perte)
                            </Typography>
                        </Alert>

                        <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                            Veuillez saisir les 16 derniers chiffres inscrits au dos de votre carte SIM
                        </Typography>

                        {/* Affichage visuel du format ICCID */}
                        <Typography variant="subtitle2" gutterBottom>
                            ICCID de la carte SIM
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                            {iccidParts.map((part, index) => (
                                <TextField
                                    key={index}
                                    id={`iccid-part-${index}`}
                                    size="small"
                                    value={part}
                                    onChange={(e) => handleICCIDPartChange(index, e.target.value)}
                                    disabled={index === 0} // First field always disabled (8933)
                                    inputProps={{
                                        maxLength: 4,
                                        style: {
                                            fontFamily: 'monospace',
                                            letterSpacing: '1px',
                                            fontSize: '1.1rem',
                                            textAlign: 'center',
                                            width: '60px'
                                        }
                                    }}
                                    sx={{
                                        width: '80px',
                                        '& .MuiInputBase-input.Mui-disabled': {
                                            WebkitTextFillColor: '#000',
                                            backgroundColor: '#f5f5f5'
                                        }
                                    }}
                                    placeholder={index === 0 ? "" : "XXXX"}
                                    autoFocus={index === 1} // Focus on second field
                                />
                            ))}
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} disabled={isSubmitting}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleDeclareReceived}
                        variant="contained"
                        disabled={isSubmitting || getFullICCID().length < 20}
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