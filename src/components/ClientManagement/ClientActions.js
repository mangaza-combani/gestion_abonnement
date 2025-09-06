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
                                onClick={() => invoiceClient(client.id)}
                            >
                                    Facturer
                            </Button>
                            {currentTab == "block" ? null : (
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="success"
                                    onClick={() => unblockPhone(client.id)}
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
                                    onClick={() => blockPhone(client.id)}
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
                    client={client}
                />
            )}
            </Paper>
        );
};

export default ClientActions;