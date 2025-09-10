import React, { useState } from 'react';
import {
        Paper,
        Stack,
        Typography,
        Button
} from '@mui/material';
import {
        EuroSymbol as EuroIcon,
        PlayArrow as PlayArrowIcon,
        Stop as StopIcon,
        SimCard as SimCardIcon,
        Add as AddIcon
} from '@mui/icons-material';

import {
        useBlockPhoneMutation,
        useUnblockPhoneMutation
} from "../../store/slices/linesSlice";

import RealInvoiceGenerator from '../Billing/RealInvoiceGenerator';

const ClientActions = ({client, currentTab}) => {
        const [blockPhone] = useBlockPhoneMutation();
        const [unblockPhone] = useUnblockPhoneMutation();
        const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
        
        // DEBUGGING: Voir quel objet client est passé 
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

        return (
            <Paper sx={{width: '100%', maxWidth: '220px', p: 2}}>
                    <Stack spacing={2}>
                            <Typography variant="h6" sx={{ fontSize: '1rem' }}>ACTIONS</Typography>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<EuroIcon/>}
                                onClick={() => invoiceClient(realClientId)}
                            >
                                    Facturer
                            </Button>
                            {currentTab == "block" ? null : (
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleUnblock(client.id)}
                                    startIcon={<PlayArrowIcon/>}
                                >
                                        Activer
                                </Button>
                            )
                            }
                            {currentTab == "unblock" ? null : (
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleBlock(client.id)}
                                    startIcon={<StopIcon/>}
                                >
                                        Suspendre
                                </Button>
                            )
                            }
                            <Button
                                fullWidth
                                variant="contained"
                                color="info"
                                startIcon={<SimCardIcon/>}
                            >
                                    Commander SIM
                            </Button>

                    </Stack>
            
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