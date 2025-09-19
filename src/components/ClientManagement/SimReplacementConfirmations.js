import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Stack,
    FormControlLabel,
    Checkbox,
    Button,
    Alert,
    Box,
    Chip,
    Divider
} from '@mui/material';
import {
    PhoneDisabled as SimLostIcon,
    Block as BlockIcon,
    ShoppingCart as OrderIcon,
    CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useConfirmSimReplacementActionsMutation } from '../../store/slices/simReplacementSlice';

const SimReplacementConfirmations = ({ client, onConfirmed }) => {
    const [confirmedRedBlocking, setConfirmedRedBlocking] = useState(false);
    const [confirmedSimOrder, setConfirmedSimOrder] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [confirmActions] = useConfirmSimReplacementActionsMutation();

    // 🆕 Déterminer le type de demande selon la raison
    const isPauseOnly = client?.pendingBlockReason === 'pause'; // Pause simple
    const isSimLossCase = client?.pendingBlockReason === 'lost_sim'; // Perte SIM avec possible remplacement
    const isLostSimNoReplacement = client?.pendingBlockReason === 'lost_sim_no_replacement'; // Perte SIM SANS remplacement

    console.log('🔍 Type de demande dans modal:', {
        clientId: client?.id,
        pendingBlockReason: client?.pendingBlockReason,
        isPauseOnly,
        isSimLossCase,
        replacementSimOrdered: client?.replacementSimOrdered
    });

    const handleConfirm = async () => {
        // 🆕 Validation adaptée selon l'état de la ligne
        if (client?.phoneStatus === 'NEEDS_TO_BE_BLOCKED') {
            // ÉTAPE 1: Seulement blocage RED requis
            if (!confirmedRedBlocking) {
                alert('Veuillez confirmer le blocage RED');
                return;
            }
        } else if (client?.phoneStatus === 'NEEDS_TO_BE_ORDERED') {
            // ÉTAPE 2: Seulement commande SIM requise
            if (!confirmedSimOrder) {
                alert('Veuillez confirmer la commande de la SIM');
                return;
            }
        } else if (isPauseOnly) {
            // Pause simple, seul le blocage RED est requis
            if (!confirmedRedBlocking) {
                alert('Veuillez confirmer le blocage RED pour la pause');
                return;
            }
        } else if (isLostSimNoReplacement) {
            // Perte/vol SANS remplacement, seul le blocage RED est requis
            if (!confirmedRedBlocking) {
                alert('Veuillez confirmer le blocage RED pour la perte/vol');
                return;
            }
        } else {
            // Ancien workflow: au moins une action requise
            if (!confirmedRedBlocking && !confirmedSimOrder) {
                alert('Veuillez cocher au moins une action confirmée');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const result = await confirmActions({
                phoneId: client.id,
                confirmedRedBlocking,
                confirmedSimOrder
            }).unwrap();

            console.log('✅ Confirmations superviseur enregistrées:', result);

            if (onConfirmed) {
                onConfirmed(result);
            }

        } catch (error) {
            console.error('Erreur confirmations superviseur:', error);
            alert('Erreur lors de l\'enregistrement des confirmations');
        } finally {
            setIsSubmitting(false);
        }
    };

    const clientName = client?.user ?
        `${client.user.firstname} ${client.user.lastname}` :
        'Client inconnu';

    // ✅ CORRECTION: Afficher le modal pour toutes les demandes de blocage/remplacement
    const shouldShowModal = client?.pendingBlockRequest ||
                           client?.phoneStatus === 'NEEDS_TO_BE_BLOCKED' ||
                           client?.phoneStatus === 'NEEDS_TO_BE_ORDERED';

    if (!shouldShowModal) {
        return null; // Ne pas afficher si pas de demande en cours
    }

    return (
        <Card sx={{ mb: 2, border: '2px solid', borderColor: 'warning.main' }}>
            <CardContent>
                <Stack spacing={2}>
                    {/* En-tête adaptatif selon l'état */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SimLostIcon color="warning" />
                        <Typography variant="h6" color="warning.main">
                            {client?.phoneStatus === 'NEEDS_TO_BE_BLOCKED' ? 'Demande de Blocage' :
                             client?.phoneStatus === 'NEEDS_TO_BE_ORDERED' ? 'Confirmer Commande SIM' :
                             'Demande Remplacement SIM'}
                        </Typography>
                        <Chip
                            label="Action superviseur requise"
                            color="warning"
                            size="small"
                        />
                    </Box>

                    {/* Informations client */}
                    <Alert severity="info">
                        <Typography variant="body2">
                            <strong>Client :</strong> {clientName}<br />
                            <strong>Ligne :</strong> {client.phoneNumber || 'N/A'}<br />
                            <strong>Motif :</strong> {client.pendingBlockNotes || 'SIM perdue/volée'}
                        </Typography>
                    </Alert>

                    <Divider />

                    {/* Actions à confirmer */}
                    <Typography variant="subtitle2" fontWeight="bold">
                        Actions effectuées (cochez ce qui a été fait) :
                    </Typography>

                    <Stack spacing={1} sx={{ pl: 2 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={confirmedRedBlocking}
                                    onChange={(e) => setConfirmedRedBlocking(e.target.checked)}
                                    icon={<BlockIcon />}
                                    checkedIcon={<CheckIcon />}
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="body2" fontWeight="medium">
                                        ☐ Blocage de la ligne sur RED confirmé
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        La ligne a été bloquée/suspendue sur la plateforme RED
                                    </Typography>
                                </Box>
                            }
                        />

                        {/* 🆕 Checkbox commande SIM - masquée pour pause seulement OU ligne en attente de blocage */}
                        {!isPauseOnly && client?.phoneStatus !== 'NEEDS_TO_BE_BLOCKED' && (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={confirmedSimOrder}
                                        onChange={(e) => setConfirmedSimOrder(e.target.checked)}
                                        icon={<OrderIcon />}
                                        checkedIcon={<CheckIcon />}
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            ☐ Nouvelle SIM commandée confirmée
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            La commande de remplacement SIM a été passée
                                        </Typography>
                                    </Box>
                                }
                            />
                        )}
                    </Stack>

                    {/* Informations sur les transitions adaptées selon l'état */}
                    {(confirmedRedBlocking || confirmedSimOrder) && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                <strong>Prochaine étape :</strong><br />
                                {/* ÉTAPE 1: NEEDS_TO_BE_BLOCKED → blocage confirmé → À COMMANDER */}
                                {client?.phoneStatus === 'NEEDS_TO_BE_BLOCKED' && confirmedRedBlocking &&
                                    "La ligne passera dans À COMMANDER (en attente de commande SIM)"
                                }
                                {/* ÉTAPE 2: NEEDS_TO_BE_ORDERED → commande confirmée → À ACTIVER */}
                                {client?.phoneStatus === 'NEEDS_TO_BE_ORDERED' && confirmedSimOrder &&
                                    "La ligne passera dans À ACTIVER (en attente de réception SIM)"
                                }
                                {/* CAS PAUSE SIMPLE */}
                                {isPauseOnly && confirmedRedBlocking &&
                                    "La ligne sera mise en PAUSE (client pourra commander plus tard)"
                                }
                                {/* ✅ CAS PERTE/VOL SANS REMPLACEMENT */}
                                {isLostSimNoReplacement && confirmedRedBlocking &&
                                    "La ligne sera BLOQUÉE définitivement (pas de remplacement SIM)"
                                }
                                {/* ANCIEN WORKFLOW: Tout en une fois */}
                                {!isPauseOnly && client?.phoneStatus !== 'NEEDS_TO_BE_BLOCKED' && client?.phoneStatus !== 'NEEDS_TO_BE_ORDERED' && confirmedRedBlocking && confirmedSimOrder &&
                                    "La ligne passera dans À ACTIVER (en attente de réception SIM)"
                                }
                                {!isPauseOnly && client?.phoneStatus !== 'NEEDS_TO_BE_BLOCKED' && client?.phoneStatus !== 'NEEDS_TO_BE_ORDERED' && confirmedRedBlocking && !confirmedSimOrder &&
                                    "La ligne passera dans À COMMANDER"
                                }
                            </Typography>
                        </Alert>
                    )}

                    {/* Bouton de confirmation adaptatif */}
                    <Button
                        variant="contained"
                        onClick={handleConfirm}
                        disabled={
                            isSubmitting ||
                            (client?.phoneStatus === 'NEEDS_TO_BE_BLOCKED' ? !confirmedRedBlocking :
                             client?.phoneStatus === 'NEEDS_TO_BE_ORDERED' ? !confirmedSimOrder :
                             isPauseOnly ? !confirmedRedBlocking :
                             isLostSimNoReplacement ? !confirmedRedBlocking :
                             (!confirmedRedBlocking && !confirmedSimOrder))
                        }
                        color="primary"
                        fullWidth
                    >
                        {isSubmitting ? 'Enregistrement...' :
                         client?.phoneStatus === 'NEEDS_TO_BE_BLOCKED' ? 'Confirmer le blocage' :
                         client?.phoneStatus === 'NEEDS_TO_BE_ORDERED' ? 'Confirmer la commande' :
                         isPauseOnly ? 'Confirmer la pause' :
                         isLostSimNoReplacement ? 'Confirmer le blocage définitif' :
                         'Confirmer les actions effectuées'}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default SimReplacementConfirmations;