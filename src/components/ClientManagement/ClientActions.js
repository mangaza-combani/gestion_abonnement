import React, { useState } from 'react';
import {
        Paper,
        Stack,
        Typography,
        Button,
        Menu,
        MenuItem,
        ListItemIcon,
        ListItemText,
        Dialog,
        DialogTitle,
        DialogContent,
        DialogActions,
        Alert,
        Snackbar,
        Box,
        Checkbox,
        FormControlLabel,
        Divider
} from '@mui/material';
import {
        EuroSymbol as EuroIcon,
        PlayArrow as PlayArrowIcon,
        Stop as StopIcon,
        Pause as PauseIcon,
        PhoneDisabled as PhoneLostIcon,
        ExpandMore as ExpandMoreIcon,
        CheckCircle as ConfirmIcon,
        Cancel as CancelIcon
} from '@mui/icons-material';

import {
        useBlockPhoneMutation,
        useUnblockPhoneMutation,
        useRequestBlockPhoneMutation,
        useConfirmBlockRequestMutation,
        useRequestActivationMutation
} from "../../store/slices/linesSlice";
import { useWhoIAmQuery } from "../../store/slices/authSlice";

import RealInvoiceGenerator from '../Billing/RealInvoiceGenerator';
import SimLostModal from './SimLostModal';
import OrderSimButton from './OrderSimButton';
import SimReplacementReceivedButton from './SimReplacementReceivedButton';
import { PHONE_STATUS, TAB_TYPES } from './constant';

const ClientActions = ({client, currentTab}) => {
        // Vérifier le rôle utilisateur
        const { data: connectedUser } = useWhoIAmQuery();
        const isAgencyUser = connectedUser?.role === 'AGENCY';
        const isSupervisor = connectedUser?.role === 'SUPERVISOR' || connectedUser?.role === 'ADMIN' || connectedUser?.role === 'SUPER_ADMIN';

        const [blockPhone] = useBlockPhoneMutation();
        const [unblockPhone] = useUnblockPhoneMutation();
        const [requestBlockPhone] = useRequestBlockPhoneMutation();
        const [confirmBlockRequest] = useConfirmBlockRequestMutation();
        const [requestActivation] = useRequestActivationMutation();
        const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
        const [suspendMenuAnchor, setSuspendMenuAnchor] = useState(null);
        const [simLostModalOpen, setSimLostModalOpen] = useState(false);
        
        // États pour actions superviseur
        const [confirmationOpen, setConfirmationOpen] = useState(false);
        const [actionType, setActionType] = useState(null);
        const [isProcessing, setIsProcessing] = useState(false);

        // États pour les demandes SIM perdue/volée (comme dans SupervisorActions)
        const [linePaused, setLinePaused] = useState(false);
        const [simOrdered, setSimOrdered] = useState(false);
        
        // États pour Snackbar
        const [snackbar, setSnackbar] = useState({
                open: false,
                message: '',
                severity: 'success' // 'success', 'error', 'warning', 'info'
        });
        
        // DEBUGGING: Voir quel objet client est passé (UPDATED)
        console.log('🚪 CLIENT ACTIONS - CLIENT REÇU:', {
                client,
                clientId: client?.id,
                phoneId: client?.id, // C'est en fait un phone ID
                realClientId: client?.userId || client?.user?.id,
                realClient: client?.user,
                clientFirstName: client?.user?.firstName,
                clientLastName: client?.user?.lastName,
                allClientProperties: Object.keys(client || {})
        });
        
        // Le vrai client est dans client.user
        const realClient = client?.user || {};
        
        // Récupérer l'utilisateur connecté pour les actions superviseur
        const currentUser = (() => {
                try {
                        const userData = localStorage.getItem('user');
                        return userData ? JSON.parse(userData) : null;
                } catch (error) {
                        console.warn('Erreur lors de la récupération des données utilisateur:', error);
                        return null;
                }
        })();
        const realClientId = client?.userId || client?.user?.id;

        // Fonction pour afficher les snackbars
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

        const invoiceClient = async (clientId) => {
                try {
                        setInvoiceModalOpen(true);
                } catch (error) {
                        console.error('Erreur lors de l\'ouverture du modal de facturation:', error);
                }
        }

        const handleBlock = async (id) => {
                try {
                        await blockPhone(id).unwrap();
                        console.log('Téléphone bloqué avec succès');
                } catch (error) {
                        console.error('Erreur lors du blocage du téléphone:', error);
                }
        };

        const handleActivationRequest = async (id) => {
                try {
                        // Déterminer la raison de la demande d'activation selon le statut
                        const phoneStatus = client?.phoneStatus;
                        let reason;
                        
                        if (phoneStatus === 'PAUSED') {
                                reason = 'AFTER_PAUSE';
                        } else if (phoneStatus === 'BLOCKED' && client?.paymentStatus === 'À JOUR') {
                                reason = 'AFTER_DEBT_PAYMENT';
                        } else {
                                reason = 'MANUAL_REQUEST';
                        }
                        
                        // Faire la demande d'activation via une nouvelle mutation
                        const response = await requestActivation({
                                phoneId: id,
                                reason: reason
                        }).unwrap();

                        // Vérifier le type de réponse
                        if (response.requiresNewSim) {
                                showSnackbar('📦 Demande de nouvelle SIM créée ! Vérifiez l\'onglet "À COMMANDER".', 'info');
                        } else if (response.requiresSupervisorValidation) {
                                showSnackbar('🔧 Ligne mise en attente d\'activation superviseur (SIM perdue/résiliation)', 'info');
                        } else {
                                showSnackbar('📋 Demande d\'activation créée ! La ligne apparaîtra dans "À ACTIVER".', 'success');
                        }
                        console.log('Demande d\'activation créée avec succès:', response);
                } catch (error) {
                        console.error('Erreur lors de la demande d\'activation:', error);
                        
                        // 🆕 Gestion spéciale pour la facturation
                        if (error?.data?.requiresManualPayment) {
                                const details = error.data.details;
                                showSnackbar(
                                        `💰 Facture impayée de ${details.amountDue}€ détectée. Ouverture du modal d'encaissement...`, 
                                        'warning'
                                );
                                console.log('📋 Déclenche modal encaissement pour facture:', error.data.invoiceDetails);
                                // TODO: Déclencher le modal d'encaissement ici
                                // setInvoiceModalOpen(true); avec les détails de la facture
                        } else if (error?.data?.insufficientBalance) {
                                const details = error.data.details;
                                showSnackbar(
                                        `💰 Solde insuffisant ! Requis: ${details.required}€ - Disponible: ${details.totalAvailable}€ (Ligne: ${details.lineBalance}€ + Client: ${details.clientBalance}€)`, 
                                        'error'
                                );
                                console.log('💳 Solde insuffisant:', details);
                        } else if (error?.data?.error) {
                                showSnackbar(error.data.error, 'error');
                        } else {
                                showSnackbar('❌ Erreur lors de la demande d\'activation', 'error');
                        }
                }
        }

        const handleUnblock = async (id) => {
                try {
                        await unblockPhone(id).unwrap();
                        console.log('Téléphone débloqué avec succès');
                } catch (error) {
                        console.error('Erreur lors du déblocage du téléphone:', error);
                }
        }

        const handleSuspendWithReason = async (reason) => {
                try {
                        if (reason === 'lost_sim') {
                                // Ouvrir le modal spécialisé pour SIM perdue
                                setSimLostModalOpen(true);
                                setSuspendMenuAnchor(null);
                                return;
                        }

                        // 🆕 Pour les autres raisons, CRÉER UNE DEMANDE (statut inchangé)
                        const payload = {
                                phoneId: client.id,
                                reason: reason,
                                notes: reason === 'pause' ? 'Pause temporaire demandée' : 
                                       reason === 'termination' ? 'Demande de résiliation client' : ''
                        };

                        const result = await requestBlockPhone(payload).unwrap();
                        console.log('📋 Demande créée avec succès:', result);
                        
                        // Notification à l'utilisateur
                        const actionLabel = reason === 'pause' ? 'pause' : 'résiliation';
                        showSnackbar(`📋 Demande de ${actionLabel} créée ! En attente validation superviseur.`, 'info');
                        
                        setSuspendMenuAnchor(null);
                } catch (error) {
                        console.error('Erreur lors de la création de la demande:', error);
                }
        };

        const handleSimLostConfirm = async ({ action, notes, reason, billing }) => {
                try {
                        if (action === 'order_new_sim') {
                                // 🆕 CRÉER UNE DEMANDE de blocage (statut inchangé) + facturer immédiatement
                                const payload = {
                                        phoneId: client.id,
                                        reason: reason,
                                        notes: `${notes} - Nouvelle SIM commandée`,
                                        billing: billing // Informations de facturation
                                };
                                const result = await requestBlockPhone(payload).unwrap();
                                
                                // Afficher confirmation
                                if (result.billing && result.billing.invoiceNumber) {
                                        console.log('✅ Demande création - Nouvelle SIM commandée et facturée:', {
                                                status: result.status,
                                                invoice: result.billing.invoiceNumber,
                                                amount: result.billing.amount,
                                                paymentMethod: result.billing.paymentMethod
                                        });
                                        
                                        showSnackbar(`✅ Demande créée et SIM facturée ! Facture: ${result.billing.invoiceNumber}`, 'success');
                                } else {
                                        showSnackbar(`📋 Demande créée ! En attente validation superviseur.`, 'info');
                                }
                        } else if (action === 'pause_line') {
                                // 🆕 CRÉER UNE DEMANDE de pause (statut inchangé)
                                const payload = {
                                        phoneId: client.id,
                                        reason: 'pause',
                                        notes: `${notes} - Mise en pause suite à SIM perdue`
                                };
                                const result = await requestBlockPhone(payload).unwrap();
                                console.log('📋 Demande de pause créée:', result);
                                showSnackbar(`📋 Demande de pause créée ! En attente validation superviseur.`, 'info');
                        }
                } catch (error) {
                        console.error('Erreur lors de la création de la demande:', error);
                        throw error; // Re-throw pour que le modal puisse gérer l'erreur
                }
        };

        const handleSupervisorAction = (action) => {
                setActionType(action);
                setConfirmationOpen(true);
                // Reset checkbox states
                setLinePaused(false);
                setSimOrdered(false);
        };

        // Vérifier si c'est une demande SIM perdue/volée (logique de SupervisorActions)
        const isSimLostRequest = client?.blockReason === 'PENDING_SIM_LOST' ||
                                 client?.blockReason === 'SIM_LOST' ||
                                 client?.blockedReason === 'lost_sim' ||
                                 client?.pendingBlockReason === 'lost_sim' ||
                                 // Vérifier aussi si le label contient ces mots-clés
                                 (client?.blockReasonLabel &&
                                  (client.blockReasonLabel.toLowerCase().includes('sim perdue') ||
                                   client.blockReasonLabel.toLowerCase().includes('sim volée') ||
                                   client.blockReasonLabel.toLowerCase().includes('sim lost')));

        // Debug pour identifier les vraies propriétés en cas de problème
        if (client && isSimLostRequest) {
          console.log('🔍 DEBUG ClientActions - SIM LOST DETECTED:', {
            blockReason: client?.blockReason,
            blockedReason: client?.blockedReason,
            pendingBlockReason: client?.pendingBlockReason,
            blockReasonLabel: client?.blockReasonLabel,
            phoneStatus: client?.phoneStatus,
            isSimLostRequest,
            clientId: client?.id,
            phoneNumber: client?.phoneNumber
          });
        }

        // Debug avant confirmation pour voir l'état
        if (actionType && confirmationOpen) {
          console.log('🔍 DEBUG AVANT CONFIRMATION:', {
            actionType,
            isSimLostRequest,
            linePaused,
            simOrdered,
            currentPhoneStatus: client?.phoneStatus
          });
        }

        const handleConfirmAction = async () => {
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
                        console.log('📋 PAYLOAD ENVOYÉ:', payload);
                        console.log('📋 RÉSULTAT REÇU:', JSON.stringify(result, null, 2));
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

                        showSnackbar(successMessage, 'success');

                } catch (error) {
                        console.error('❌ Erreur lors de l\'action superviseur:', error);
                        showSnackbar('❌ Erreur lors du traitement de la demande', 'error');
                } finally {
                        setIsProcessing(false);
                }
        };

        const getActionMessage = () => {
                const reasonLabel = client?.blockReasonLabel || 'blocage';
                if (actionType === 'confirm') {
                        return `Confirmer que les modifications ont été effectuées sur le compte RED pour cette demande de ${reasonLabel.toLowerCase()} ?`;
                } else {
                        return `Annuler cette demande de ${reasonLabel.toLowerCase()} ?`;
                }
        };

        // Logique intelligente pour afficher les boutons
        const phoneStatus = client?.phoneStatus;
        const paymentStatus = client?.paymentStatus;
        const isLineActive = phoneStatus === PHONE_STATUS.ACTIVE;
        const isLineSuspended = phoneStatus === PHONE_STATUS.SUSPENDED ||
                               phoneStatus === PHONE_STATUS.BLOCKED ||
                               phoneStatus === PHONE_STATUS.PAUSED;

        // 🆕 Détecter ligne avec SIM inactive/perdue due à perte/vol SANS commande de remplacement
        // IMPORTANT: Vérifier que replacementSimOrdered est FAUX ET que replacementSimReceived est FAUX
        const isLostSimNoReplacement = !client?.replacementSimOrdered && !client?.replacementSimReceived && (
                                       // CAS 1: blockedReason indique "pas de commande de remplacement"
                                       client?.blockedReason === 'lost_sim_no_replacement' ||
                                       // CAS 2: pendingBlockReason indique "pas encore de commande"
                                       client?.pendingBlockReason === 'lost_sim_no_replacement' ||
                                       // CAS 3: Ligne BLOCKED/PAUSED avec blockedReason = lost_sim MAIS pas de commande
                                       ((phoneStatus === PHONE_STATUS.BLOCKED || phoneStatus === PHONE_STATUS.PAUSED) &&
                                        client?.blockedReason === 'lost_sim' &&
                                        !client?.replacementSimOrdered &&
                                        !client?.replacementSimReceived) ||
                                       // CAS 4: SIM carte marquée LOST_STOLEN/INACTIVE par superviseur MAIS pas de commande
                                       ((client?.simCard?.status === 'LOST_STOLEN' || client?.simCard?.status === 'INACTIVE') &&
                                        client?.simCard?.reportReason === 'SUPERVISOR_CONFIRMED_BLOCKING' &&
                                        !client?.replacementSimOrdered &&
                                        !client?.replacementSimReceived)
                                      );

        // Nouvelles logiques d'activation
        const isBlockedForNonPayment = phoneStatus === PHONE_STATUS.BLOCKED &&
                                       ['BLOCKED_NONPAYMENT', 'PAST_DUE'].includes(paymentStatus);
        const isPausedLine = phoneStatus === PHONE_STATUS.PAUSED;
        const canRequestActivation = (isPausedLine && paymentStatus === 'À JOUR') ||
                                    (isBlockedForNonPayment && paymentStatus === 'À JOUR');

        // Masquer le bouton si problème de paiement : bloqué pour impayé OU en retard OU en dette
        const hasPaymentIssues = ['EN RETARD', 'DETTE'].includes(paymentStatus);
        const hideActivateButton = (isBlockedForNonPayment && paymentStatus !== 'À JOUR') || hasPaymentIssues;

        // 🆕 Exclure les lignes en attente de SIM de remplacement (pas encore reçue)
        const isWaitingForReplacementSim = client?.replacementSimOrdered === true &&
                                          client?.replacementSimReceived === false;

        const needsActivation = phoneStatus === PHONE_STATUS.INACTIVE ||
                               (isLineSuspended && !hideActivateButton);

        // 🆕 Détecter si c'est une ligne avec perte/vol de SIM (tous cas confondus)
        const isLostSimLine = client?.blockedReason === 'lost_sim' ||
                             client?.blockedReason === 'lost_sim_no_replacement' ||
                             client?.pendingBlockReason === 'lost_sim' ||
                             client?.pendingBlockReason === 'lost_sim_no_replacement' ||
                             client?.replacementSimOrdered === 1 ||
                             client?.replacementSimOrdered === true;

        // 🆕 Priorité au bouton "Commander SIM" si SIM perdue sans remplacement
        const shouldShowOrderSimButton = isLostSimNoReplacement && !hideActivateButton;

        // ❌ JAMAIS afficher "Activer" pour les lignes avec perte/vol de SIM
        const shouldShowActivateButton = needsActivation &&
                                        !hideActivateButton &&
                                        !shouldShowOrderSimButton &&
                                        !isWaitingForReplacementSim &&
                                        !isLostSimLine; // ✅ EXCLURE TOUTES les lignes avec perte/vol

        // 🔍 DEBUG: Logger la logique d'affichage des boutons
        if (client?.id) {
                console.log(`🔍 DEBUG ClientActions - Ligne ${client.id}:`, {
                        phoneStatus,
                        blockedReason: client?.blockedReason,
                        pendingBlockReason: client?.pendingBlockReason,
                        replacementSimOrdered: client?.replacementSimOrdered,
                        replacementSimReceived: client?.replacementSimReceived,
                        isLostSimLine,
                        isLostSimNoReplacement,
                        isWaitingForReplacementSim,
                        needsActivation,
                        shouldShowOrderSimButton,
                        shouldShowActivateButton,
                        hideActivateButton
                });
        }

        // Logique pour masquer les actions selon le rôle et l'onglet
        const shouldShowActions = () => {
                // Agences peuvent agir seulement dans "Liste des lignes" (currentTab === 'LIST' ou null)
                if (isAgencyUser) {
                        return currentTab === TAB_TYPES.LIST || !currentTab;
                }
                // Superviseurs peuvent agir partout
                return isSupervisor;
        };

        const showActions = shouldShowActions();

        return (
            <Paper sx={{width: '100%', maxWidth: '220px', p: 2}}>
                    <Stack spacing={2}>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                {currentTab === 'TO_BLOCK' ? 'ACTIONS SUPERVISEUR' : 'ACTIONS'}
                            </Typography>

                            {/* Afficher le message si l'agence n'a pas d'actions disponibles */}
                            {!showActions && (
                                <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                                    Actions disponibles uniquement dans "Liste des lignes"
                                </Alert>
                            )}

                            {/* Actions normales - Masquées pour l'onglet À BLOQUER ET selon le rôle */}
                            {showActions && currentTab !== 'TO_BLOCK' && (
                                <>
                                    {/* Bouton Facturer - Toujours visible */}
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<EuroIcon/>}
                                        onClick={() => invoiceClient(realClientId)}
                                    >
                                            Facturer
                                    </Button>
                                    
                                    {/* 🆕 Bouton Commander SIM - Priorité pour lignes avec SIM perdue sans remplacement */}
                                    {shouldShowOrderSimButton && (
                                        <OrderSimButton client={client} />
                                    )}

                                    {/* 🆕 Bouton Déclarer réception SIM - Pour remplacements SIM en attente */}
                                    <SimReplacementReceivedButton client={client} size="medium" />

                                    {/* Bouton Activer - Seulement si pas de SIM perdue sans remplacement */}
                                    {shouldShowActivateButton && (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="success"
                                            onClick={() => canRequestActivation ? handleActivationRequest(client.id) : handleUnblock(client.id)}
                                            startIcon={<PlayArrowIcon/>}
                                        >
                                                {canRequestActivation ? 'Demander Activation' : 'Activer'}
                                        </Button>
                                    )}
                                    
                                    {/* Bouton Suspendre avec menu contextuel - Seulement si la ligne est active */}
                                    {isLineActive && (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="error"
                                            onClick={(event) => setSuspendMenuAnchor(event.currentTarget)}
                                            startIcon={<StopIcon/>}
                                            endIcon={<ExpandMoreIcon/>}
                                        >
                                                Suspendre
                                        </Button>
                                    )}
                                </>
                            )}

                    </Stack>

                    {/* Menu contextuel pour les raisons de suspension - Masqué pour À BLOQUER */}
                    {currentTab !== 'TO_BLOCK' && (
                        <Menu
                            anchorEl={suspendMenuAnchor}
                            open={Boolean(suspendMenuAnchor)}
                            onClose={() => setSuspendMenuAnchor(null)}
                            PaperProps={{
                                sx: { minWidth: 200 }
                            }}
                        >
                        <MenuItem onClick={() => handleSuspendWithReason('pause')}>
                            <ListItemIcon>
                                <PauseIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Pause temporaire" />
                        </MenuItem>
                        <MenuItem onClick={() => handleSuspendWithReason('lost_sim')}>
                            <ListItemIcon>
                                <PhoneLostIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="SIM perdue/volée/endommagée" />
                        </MenuItem>
                        <MenuItem onClick={() => handleSuspendWithReason('termination')}>
                            <ListItemIcon>
                                <CancelIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Demande de résiliation" />
                        </MenuItem>
                        </Menu>
                    )}

            {/* Actions superviseur pour les demandes en attente - Seulement pour les superviseurs */}
            {isSupervisor && currentTab === 'TO_BLOCK' && (
                <>
                    <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        startIcon={<ConfirmIcon />}
                        onClick={() => handleSupervisorAction('confirm')}
                    >
                        Confirmer
                    </Button>
                    
                    <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => handleSupervisorAction('cancel')}
                    >
                        Annuler
                    </Button>
                </>
            )}
            
            {invoiceModalOpen && (
                <RealInvoiceGenerator 
                    open={invoiceModalOpen}
                    onClose={() => setInvoiceModalOpen(false)}
                    client={realClient}
                    selectedLine={client}
                />
            )}

            {simLostModalOpen && (
                <SimLostModal
                    open={simLostModalOpen}
                    onClose={() => setSimLostModalOpen(false)}
                    client={client}
                    onConfirm={handleSimLostConfirm}
                />
            )}

            {/* Dialog de confirmation pour actions superviseur */}
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
                        onClick={handleConfirmAction}
                        variant="contained"
                        color={actionType === 'confirm' ? 'success' : 'error'}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Traitement...' : (actionType === 'confirm' ? 'Confirmer' : 'Annuler')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar pour notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
            </Paper>
        );
};

export default ClientActions;