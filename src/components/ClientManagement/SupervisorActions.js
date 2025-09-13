import React, { useState } from 'react';
import {
    Stack,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Alert,
    Box,
    Checkbox,
    FormControlLabel,
    Divider
} from '@mui/material';
import {
    CheckCircle as ConfirmIcon,
    Cancel as CancelIcon,
    Schedule as PendingIcon
} from '@mui/icons-material';
import { useConfirmBlockRequestMutation } from '../../store/slices/linesSlice';

const SupervisorActions = ({ client, currentUser }) => {
    const [confirmBlockRequest] = useConfirmBlockRequestMutation();
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [actionType, setActionType] = useState(null); // 'confirm' ou 'cancel'
    const [isProcessing, setIsProcessing] = useState(false);
    
    // États pour les demandes SIM perdue/volée
    const [linePaused, setLinePaused] = useState(false);
    const [simOrdered, setSimOrdered] = useState(false);

    // Vérifier si l'utilisateur est superviseur
    const isSupervisor = currentUser?.role === 'SUPERVISOR' || currentUser?.role === 'ADMIN';
    
    // Vérifier si la ligne a une demande en attente
    const hasPendingRequest = client?.isPendingRequest || client?.canConfirm;
    
    // Vérifier si c'est une demande SIM perdue/volée
    const isSimLostRequest = client?.blockReason === 'PENDING_SIM_LOST' || client?.blockReason === 'SIM_LOST';

    if (!isSupervisor || !hasPendingRequest) {
        return null;
    }

    const handleAction = (action) => {
        setActionType(action);
        setConfirmationOpen(true);
        // Reset checkbox states
        setLinePaused(false);
        setSimOrdered(false);
    };

    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            // Payload de base
            const payload = {
                phoneId: client.id,
                approved: actionType === 'confirm'
            };

            // Ajouter les données spécifiques aux demandes SIM perdue/volée
            if (isSimLostRequest && actionType === 'confirm') {
                payload.simLostActions = {
                    linePaused,
                    simOrdered
                };
            }

            const result = await confirmBlockRequest(payload).unwrap();

            console.log('✅ Action superviseur effectuée:', result);
            setConfirmationOpen(false);
            
            // Messages spécifiques selon le cas
            let successMessage;
            if (isSimLostRequest && actionType === 'confirm') {
                if (!simOrdered) {
                    successMessage = `✅ Actions confirmées ! La ligne ${linePaused ? 'est mise en pause et ' : ''}sera transférée vers "À COMMANDER" pour nouvelle SIM.`;
                } else {
                    successMessage = `✅ Actions confirmées ! ${linePaused ? 'Ligne mise en pause et SIM commandée.' : 'SIM commandée.'}`;
                }
            } else {
                const actionLabel = actionType === 'confirm' ? 'confirmée' : 'annulée';
                successMessage = `✅ Demande ${actionLabel} avec succès !`;
            }
            
            alert(successMessage);
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'action superviseur:', error);
            alert('❌ Erreur lors du traitement de la demande');
        } finally {
            setIsProcessing(false);
        }
    };

    const getActionMessage = () => {
        const reasonLabel = client.blockReasonLabel || 'blocage';
        if (actionType === 'confirm') {
            return `Confirmer que les modifications ont été effectuées sur le compte RED pour cette demande de ${reasonLabel.toLowerCase()} ?`;
        } else {
            return `Annuler cette demande de ${reasonLabel.toLowerCase()} ?`;
        }
    };

    return (
        <>
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PendingIcon color="warning" fontSize="small" />
                    Actions Superviseur
                </Typography>
                
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<ConfirmIcon />}
                        onClick={() => handleAction('confirm')}
                        disabled={isProcessing}
                    >
                        Confirmer
                    </Button>
                    
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => handleAction('cancel')}
                        disabled={isProcessing}
                    >
                        Annuler
                    </Button>
                </Stack>
            </Box>

            {/* Dialog de confirmation */}
            <Dialog
                open={confirmationOpen}
                onClose={() => !isProcessing && setConfirmationOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {actionType === 'confirm' ? 'Confirmer les modifications RED' : 'Annuler la demande'}
                </DialogTitle>
                
                <DialogContent>
                    <Stack spacing={2}>
                        <Alert 
                            severity={actionType === 'confirm' ? 'info' : 'error'}
                        >
                            <Typography variant="body2">
                                <strong>Client :</strong> {client?.user?.firstname} {client?.user?.lastname}<br />
                                <strong>Ligne :</strong> {client?.phoneNumber || 'Numéro en cours'}<br />
                                <strong>Raison :</strong> {client?.blockReasonLabel}
                            </Typography>
                        </Alert>

                        <Typography variant="body1">
                            {getActionMessage()}
                        </Typography>

                        {actionType === 'confirm' && isSimLostRequest && (
                            <>
                                <Divider />
                                <Alert severity="info">
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        <strong>Actions à effectuer pour vol/perte de SIM :</strong>
                                    </Typography>
                                    
                                    <Stack spacing={2}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={linePaused}
                                                    onChange={(e) => setLinePaused(e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label="J'ai mis la ligne en pause sur RED"
                                        />
                                        
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={simOrdered}
                                                    onChange={(e) => setSimOrdered(e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label="J'ai déjà commandé une nouvelle carte SIM"
                                        />
                                    </Stack>
                                    
                                    {!simOrdered && (
                                        <Alert severity="warning" sx={{ mt: 2 }}>
                                            <Typography variant="body2">
                                                Si la SIM n'est pas commandée, la ligne sera transférée vers l'onglet "À COMMANDER" avec la mention vol/perte.
                                            </Typography>
                                        </Alert>
                                    )}
                                </Alert>
                            </>
                        )}

                        {actionType === 'confirm' && !isSimLostRequest && (
                            <Alert severity="success">
                                <Typography variant="body2">
                                    Confirme que les modifications ont été effectuées sur le compte RED et que la ligne a été traitée.
                                </Typography>
                            </Alert>
                        )}

                        {actionType === 'cancel' && (
                            <Alert severity="error">
                                <Typography variant="body2">
                                    La demande sera annulée définitivement et disparaîtra de la liste.
                                </Typography>
                            </Alert>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button 
                        onClick={() => setConfirmationOpen(false)}
                        disabled={isProcessing}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        variant="contained"
                        color={actionType === 'confirm' ? 'success' : 'error'}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Traitement...' : (actionType === 'confirm' ? 'Confirmer' : 'Annuler')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SupervisorActions;