import React, { useState } from 'react';
import {
        Paper,
        Stack,
        Typography,
        Button,
        Menu,
        MenuItem,
        ListItemIcon,
        ListItemText
} from '@mui/material';
import {
        EuroSymbol as EuroIcon,
        PlayArrow as PlayArrowIcon,
        Stop as StopIcon,
        Pause as PauseIcon,
        PhoneDisabled as PhoneLostIcon,
        Cancel as CancelIcon,
        ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

import {
        useBlockPhoneMutation,
        useUnblockPhoneMutation
} from "../../store/slices/linesSlice";

import RealInvoiceGenerator from '../Billing/RealInvoiceGenerator';
import { PHONE_STATUS } from './constant';

const ClientActions = ({client, currentTab}) => {
        const [blockPhone] = useBlockPhoneMutation();
        const [unblockPhone] = useUnblockPhoneMutation();
        const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
        const [suspendMenuAnchor, setSuspendMenuAnchor] = useState(null);
        
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
        const realClientId = client?.userId || client?.user?.id;

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
                        await blockPhone({ id: client.id, reason }).unwrap();
                        console.log('Téléphone suspendu avec succès. Raison:', reason);
                        setSuspendMenuAnchor(null);
                } catch (error) {
                        console.error('Erreur lors de la suspension du téléphone:', error);
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
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>ACTIONS</Typography>
                            
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

                    </Stack>

                    {/* Menu contextuel pour les raisons de suspension */}
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
            
            {invoiceModalOpen && (
                <RealInvoiceGenerator 
                    open={invoiceModalOpen}
                    onClose={() => setInvoiceModalOpen(false)}
                    client={realClient}
                    selectedLine={client}
                />
            )}
            </Paper>
        );
};

export default ClientActions;