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
        Snackbar
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
        useConfirmBlockRequestMutation
} from "../../store/slices/linesSlice";

import RealInvoiceGenerator from '../Billing/RealInvoiceGenerator';
import SimLostModal from './SimLostModal';
import { PHONE_STATUS } from './constant';

const ClientActions = ({client, currentTab}) => {
        const [blockPhone] = useBlockPhoneMutation();
        const [unblockPhone] = useUnblockPhoneMutation();
        const [requestBlockPhone] = useRequestBlockPhoneMutation();
        const [confirmBlockRequest] = useConfirmBlockRequestMutation();
        const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
        const [suspendMenuAnchor, setSuspendMenuAnchor] = useState(null);
        const [simLostModalOpen, setSimLostModalOpen] = useState(false);
        
        // États pour actions superviseur
        const [confirmationOpen, setConfirmationOpen] = useState(false);
        const [actionType, setActionType] = useState(null);
        const [isProcessing, setIsProcessing] = useState(false);
        
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
        };

        const handleConfirmAction = async () => {
                setIsProcessing(true);
                try {
                        const result = await confirmBlockRequest({
                                phoneId: client.id,
                                approved: actionType === 'confirm'
                        }).unwrap();

                        console.log('✅ Action superviseur effectuée:', result);
                        setConfirmationOpen(false);
                        
                        // Notification de succès avec Snackbar
                        const actionLabel = actionType === 'confirm' ? 'confirmée' : 'annulée';
                        showSnackbar(`✅ Demande ${actionLabel} avec succès !`, 'success');
                        
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
        const isLineActive = phoneStatus === PHONE_STATUS.ACTIVE;
        const isLineSuspended = phoneStatus === PHONE_STATUS.SUSPENDED || 
                               phoneStatus === PHONE_STATUS.BLOCKED || 
                               phoneStatus === PHONE_STATUS.PAUSED;
        const needsActivation = phoneStatus === PHONE_STATUS.NEEDS_TO_BE_ACTIVATED || 
                               phoneStatus === PHONE_STATUS.INACTIVE || 
                               isLineSuspended;

        return (
            <Paper sx={{width: '100%', maxWidth: '220px', p: 2}}>
                    <Stack spacing={2}>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                                {currentTab === 'TO_BLOCK' ? 'ACTIONS SUPERVISEUR' : 'ACTIONS'}
                            </Typography>
                            
                            {/* Actions normales - Masquées pour l'onglet À BLOQUER */}
                            {currentTab !== 'TO_BLOCK' && (
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
                                    
                                    {/* Bouton Activer - Seulement si la ligne n'est pas active */}
                                    {needsActivation && (
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="success"
                                            onClick={() => handleUnblock(client.id)}
                                            startIcon={<PlayArrowIcon/>}
                                        >
                                                Activer
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

            {/* Actions superviseur pour les demandes en attente */}
            {currentTab === 'TO_BLOCK' && (
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

                        {actionType === 'confirm' && (
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