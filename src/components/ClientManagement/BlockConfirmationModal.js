import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    CircularProgress,
    Chip,
    Divider,
    Stack,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import {
    Block as BlockIcon,
    Warning as WarningIcon,
    Phone as PhoneIcon,
    Person as PersonIcon,
    CheckCircle as CheckCircleIcon,
    PhoneDisabled as SimLostIcon,
    ShoppingCart as OrderIcon
} from '@mui/icons-material';
import { useConfirmSimReplacementActionsMutation } from '../../store/slices/simReplacementSlice';
import { useConfirmBlockRequestMutation } from '../../store/slices/linesSlice';

const BlockConfirmationModal = ({
    open,
    onClose,
    client,
    onConfirm
}) => {
    const [isBlocking, setIsBlocking] = useState(false);
    const [blockSuccess, setBlockSuccess] = useState(false);
    const [confirmedRedBlocking, setConfirmedRedBlocking] = useState(false);
    const [confirmedSimOrder, setConfirmedSimOrder] = useState(false);

    const [confirmActions] = useConfirmSimReplacementActionsMutation();
    const [confirmBlockRequest] = useConfirmBlockRequestMutation();

    // Déterminer le type de demande selon la raison
    const isPauseOnly = client?.pendingBlockReason === 'pause';
    const isSimLossCase = client?.pendingBlockReason === 'lost_sim';
    const isLostSimNoReplacement = client?.pendingBlockReason === 'lost_sim_no_replacement';
    const isDebtCase = client?.blockReasonLabel?.includes('Dette') || client?.blockReason === 'DEBT';

    // Déterminer si c'est un cas simple ou complexe
    const isSimpleBlock = isPauseOnly || isDebtCase || isLostSimNoReplacement;
    const requiresSimOrder = isSimLossCase && !client?.replacementSimOrdered;

    const handleConfirmBlock = async () => {
        if (!client) return;

        // Validation selon le type de blocage
        if (!isSimpleBlock) {
            // Cas complexe (SIM perdue avec remplacement)
            if (!confirmedRedBlocking) {
                alert('Veuillez confirmer le blocage RED');
                return;
            }
            if (requiresSimOrder && !confirmedSimOrder) {
                alert('Veuillez confirmer la commande de carte SIM');
                return;
            }
        }

        setIsBlocking(true);
        try {
            if (isSimpleBlock) {
                // Cas simple : utiliser RTK Query confirmBlockRequest
                const result = await confirmBlockRequest({
                    phoneId: client.id,
                    approved: true
                }).unwrap();

                console.log('✅ Blocage simple confirmé:', result);
            } else {
                // Cas complexe : utiliser l'API de confirmation SIM
                const result = await confirmActions({
                    phoneId: client.id,
                    approved: true,
                    simLostActions: {
                        redBlocking: confirmedRedBlocking,
                        simOrder: confirmedSimOrder
                    }
                }).unwrap();

                console.log('🎉 Confirmations SIM enregistrées:', result);
            }

            // Afficher la confirmation de succès
            setBlockSuccess(true);
            setIsBlocking(false);

            // Fermer automatiquement après 2 secondes
            setTimeout(() => {
                setBlockSuccess(false);
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Erreur lors du blocage:', error);
            setIsBlocking(false);
        }
    };

    const handleClose = () => {
        setBlockSuccess(false);
        onClose();
    };

    const getReasonColor = (reason) => {
        const colors = {
            'PENDING_PAUSE': 'warning',
            'PENDING_SIM_LOST': 'error',
            'PENDING_TERMINATION': 'secondary',
            'DEBT': 'default',
            'PAUSE': 'warning',
            'SIM_LOST': 'error',
            'TERMINATION': 'secondary'
        };
        return colors[reason] || 'default';
    };

    if (!client) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            {blockSuccess ? (
                // Vue de succès
                <>
                    <DialogTitle sx={{
                        bgcolor: 'success.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        <CheckCircleIcon />
                        <Typography variant="h6" fontWeight="bold">
                            Blocage confirmé
                        </Typography>
                    </DialogTitle>

                    <DialogContent sx={{ pt: 3, pb: 3 }}>
                        <Stack spacing={2} alignItems="center">
                            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
                            <Typography variant="h6" fontWeight="medium" gutterBottom>
                                {client.user?.lastname} {client.user?.firstname}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                {client.phoneNumber || 'En cours...'}
                            </Typography>
                            <Typography variant="body1" color="success.main" fontWeight="medium" sx={{ textAlign: 'center' }}>
                                ✅ Ligne bloquée avec succès sur le compte RED
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                {client.redAccount?.accountName || client.redAccountName || 'Compte RED'}
                            </Typography>
                        </Stack>
                    </DialogContent>
                </>
            ) : (
                // Vue de confirmation
                <>
                    <DialogTitle sx={{
                        bgcolor: 'error.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        <BlockIcon />
                        <Typography variant="h6" fontWeight="bold">
                            Confirmation de blocage
                        </Typography>
                    </DialogTitle>

                    <DialogContent sx={{ pt: 3 }}>
                        <Stack spacing={3}>
                            {/* Client et raison */}
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" fontWeight="medium" gutterBottom>
                                    {client.user?.lastname} {client.user?.firstname}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" gutterBottom>
                                    {client.phoneNumber || 'En cours...'}
                                </Typography>
                                <Chip
                                    label={client.blockReasonLabel}
                                    color={getReasonColor(client.blockReason)}
                                    variant="filled"
                                    sx={{ fontSize: '0.85rem', fontWeight: 'medium', mt: 1 }}
                                />
                            </Box>

                            {/* Checkboxes pour cas complexes */}
                            {!isSimpleBlock && (
                                <Box sx={{
                                    bgcolor: 'grey.50',
                                    p: 2,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'grey.200'
                                }}>
                                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                        Actions requises :
                                    </Typography>
                                    <Stack spacing={1}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={confirmedRedBlocking}
                                                    onChange={(e) => setConfirmedRedBlocking(e.target.checked)}
                                                    icon={<SimLostIcon />}
                                                    checkedIcon={<SimLostIcon color="error" />}
                                                />
                                            }
                                            label="J'ai bloqué la ligne sur le compte RED"
                                            sx={{
                                                '& .MuiFormControlLabel-label': {
                                                    fontSize: '0.9rem',
                                                    fontWeight: confirmedRedBlocking ? 600 : 400
                                                }
                                            }}
                                        />
                                        {requiresSimOrder && (
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={confirmedSimOrder}
                                                        onChange={(e) => setConfirmedSimOrder(e.target.checked)}
                                                        icon={<OrderIcon />}
                                                        checkedIcon={<OrderIcon color="primary" />}
                                                    />
                                                }
                                                label="J'ai commandé une nouvelle carte SIM"
                                                sx={{
                                                    '& .MuiFormControlLabel-label': {
                                                        fontSize: '0.9rem',
                                                        fontWeight: confirmedSimOrder ? 600 : 400
                                                    }
                                                }}
                                            />
                                        )}
                                    </Stack>
                                </Box>
                            )}

                            {/* Message de confirmation */}
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                                {isSimpleBlock
                                    ? 'Confirmer le blocage de cette ligne ?'
                                    : 'Confirmer que toutes les actions ont été effectuées ?'
                                }
                            </Typography>
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{ p: 3, gap: 1 }}>
                        <Button
                            onClick={handleClose}
                            variant="outlined"
                            disabled={isBlocking}
                            sx={{ minWidth: 100 }}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleConfirmBlock}
                            variant="contained"
                            color="error"
                            disabled={isBlocking}
                            startIcon={isBlocking ? <CircularProgress size={20} /> : <BlockIcon />}
                            sx={{ minWidth: 120 }}
                        >
                            {isBlocking ? 'Blocage...' : 'Confirmer blocage'}
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
};

export default BlockConfirmationModal;