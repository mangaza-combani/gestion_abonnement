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
    Box
} from '@mui/material';
import {
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Schedule as PendingIcon
} from '@mui/icons-material';
import { useConfirmBlockRequestMutation } from '../../store/slices/linesSlice';

const SupervisorActions = ({ client, currentUser }) => {
    const [confirmBlockRequest] = useConfirmBlockRequestMutation();
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [actionType, setActionType] = useState(null); // 'approve' ou 'reject'
    const [isProcessing, setIsProcessing] = useState(false);

    // Vérifier si l'utilisateur est superviseur
    const isSupervisor = currentUser?.role === 'SUPERVISOR' || currentUser?.role === 'ADMIN';
    
    // Vérifier si la ligne a une demande en attente
    const hasPendingRequest = client?.isPendingRequest || client?.canConfirm;

    if (!isSupervisor || !hasPendingRequest) {
        return null;
    }

    const handleAction = (action) => {
        setActionType(action);
        setConfirmationOpen(true);
    };

    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            const result = await confirmBlockRequest({
                phoneId: client.id,
                approved: actionType === 'approve'
            }).unwrap();

            console.log('✅ Action superviseur effectuée:', result);
            setConfirmationOpen(false);
            
            // Notification de succès
            const actionLabel = actionType === 'approve' ? 'approuvée' : 'rejetée';
            alert(`✅ Demande ${actionLabel} avec succès !`);
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'action superviseur:', error);
            alert('❌ Erreur lors du traitement de la demande');
        } finally {
            setIsProcessing(false);
        }
    };

    const getActionMessage = () => {
        const reasonLabel = client.blockReasonLabel || 'blocage';
        if (actionType === 'approve') {
            return `Approuver cette demande de ${reasonLabel.toLowerCase()} ?`;
        } else {
            return `Rejeter cette demande de ${reasonLabel.toLowerCase()} ?`;
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
                        startIcon={<ApproveIcon />}
                        onClick={() => handleAction('approve')}
                        disabled={isProcessing}
                    >
                        Approuver
                    </Button>
                    
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<RejectIcon />}
                        onClick={() => handleAction('reject')}
                        disabled={isProcessing}
                    >
                        Rejeter
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
                    Confirmation Action Superviseur
                </DialogTitle>
                
                <DialogContent>
                    <Stack spacing={2}>
                        <Alert 
                            severity={actionType === 'approve' ? 'info' : 'warning'}
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

                        {actionType === 'approve' && (
                            <Alert severity="success">
                                <Typography variant="body2">
                                    La ligne sera bloquée/mise en pause selon la demande.
                                </Typography>
                            </Alert>
                        )}

                        {actionType === 'reject' && (
                            <Alert severity="warning">
                                <Typography variant="body2">
                                    La demande sera annulée et la ligne restera dans son état actuel.
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
                        color={actionType === 'approve' ? 'success' : 'error'}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Traitement...' : 'Confirmer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SupervisorActions;