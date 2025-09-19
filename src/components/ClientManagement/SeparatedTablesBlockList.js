import React, { useState } from 'react';
import {
    Card,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    Chip,
    Box,
    IconButton,
    Stack,
    Paper,
    Button
} from '@mui/material';
import {
    AccountCircle as AccountIcon,
    Phone as PhoneIcon,
    ContentCopy as CopyIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Block as BlockIcon,
    CheckCircle as ConfirmIcon
} from '@mui/icons-material';
import BlockConfirmationModal from './BlockConfirmationModal';
import { useWhoIAmQuery } from '../../store/slices/authSlice';
import { useConfirmBlockRequestMutation } from '../../store/slices/linesSlice';

const SeparatedTablesBlockList = ({ clients }) => {
    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [blockModalOpen, setBlockModalOpen] = useState(false);
    const [clientToBlock, setClientToBlock] = useState(null);

    const [confirmBlockRequest] = useConfirmBlockRequestMutation();

    // Vérifier le rôle de l'utilisateur
    const { data: currentUser } = useWhoIAmQuery();
    const isSupervisor = currentUser?.role === 'SUPERVISOR';

    // Grouper les lignes par compte RED
    const groupByRedAccount = (clients) => {
        const groups = {};

        clients.forEach(client => {
            const redAccountKey = client.redAccount?.accountName ||
                                 client.redAccountName ||
                                 `Compte ${client.redAccountId || 'N/A'}`;

            if (!groups[redAccountKey]) {
                groups[redAccountKey] = {
                    accountName: redAccountKey,
                    redAccountId: client.redAccountId,
                    agency: client.agency,
                    redAccount: client.redAccount,
                    lines: []
                };
            }

            groups[redAccountKey].lines.push(client);
        });

        return Object.values(groups);
    };

    // Obtenir la couleur selon le type de raison
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

    const togglePasswordVisibility = (accountName) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [accountName]: !prev[accountName]
        }));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const handleBlockClick = (line) => {
        setClientToBlock(line);
        setBlockModalOpen(true);
    };

    const handleBlockConfirm = async (client) => {
        console.log('Blocage confirmé pour:', client);

        try {
            // Utiliser RTK Query pour confirmer le blocage
            const result = await confirmBlockRequest({
                phoneId: client.id,
                approved: true
            }).unwrap();

            console.log('✅ Blocage confirmé:', result);

        } catch (error) {
            console.error('❌ Erreur lors du blocage:', error);
            throw error; // Relancer l'erreur pour que le modal puisse la gérer
        }
    };

    const handleBlockCancel = () => {
        setBlockModalOpen(false);
        setClientToBlock(null);
    };

    const groupedData = groupByRedAccount(clients);

    if (groupedData.length === 0) {
        return (
            <Card sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    Aucune ligne à bloquer
                </Typography>
            </Card>
        );
    }

    return (
        <Stack spacing={3}>
            {groupedData.map((group) => (
                <Paper key={group.accountName} elevation={2} sx={{ overflow: 'hidden' }}>
                    {/* En-tête du compte RED - Simplifié */}
                    <Box sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 2,
                        py: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 3
                    }}>
                        {/* Identifiants du compte RED uniquement */}
                        {group.redAccount && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                {/* Login */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                        Login:
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontFamily: 'monospace',
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 0.5,
                                            letterSpacing: '0.5px',
                                            fontWeight: 600,
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {group.redAccount.redAccountId}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => copyToClipboard(group.redAccount.redAccountId)}
                                        sx={{ color: 'white', p: 0.5 }}
                                        title="Copier le login"
                                    >
                                        <CopyIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Box>

                                {/* Mot de passe */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                        Pass:
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontFamily: 'monospace',
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 0.5,
                                            letterSpacing: '0.5px',
                                            fontWeight: 600,
                                            minWidth: '80px',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {visiblePasswords[group.accountName]
                                            ? group.redAccount.redPassword
                                            : '••••••••'
                                        }
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => togglePasswordVisibility(group.accountName)}
                                        sx={{ color: 'white', p: 0.5 }}
                                        title={visiblePasswords[group.accountName] ? "Masquer" : "Afficher"}
                                    >
                                        {visiblePasswords[group.accountName]
                                            ? <VisibilityOffIcon sx={{ fontSize: 16 }} />
                                            : <VisibilityIcon sx={{ fontSize: 16 }} />
                                        }
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => copyToClipboard(group.redAccount.redPassword)}
                                        sx={{ color: 'white', p: 0.5 }}
                                        title="Copier le mot de passe"
                                    >
                                        <CopyIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Tableau des lignes */}
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: '25%', fontWeight: 'bold' }}>CLIENT</TableCell>
                                    <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>NUMÉRO</TableCell>
                                    <TableCell sx={{ width: '20%', fontWeight: 'bold' }}>RAISON</TableCell>
                                    <TableCell sx={{ width: '25%', fontWeight: 'bold' }}>NOTES</TableCell>
                                    <TableCell sx={{ width: '10%', fontWeight: 'bold', textAlign: 'center' }}>ACTION</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {group.lines.map((line) => (
                                    <TableRow
                                        key={line.id}
                                        hover
                                        sx={{
                                            '&:hover': {
                                                bgcolor: 'action.hover'
                                            }
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PhoneIcon color="action" fontSize="small" />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {line.user?.lastname || ''} {line.user?.firstname || ''}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {line.phoneNumber || 'En cours...'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={line.blockReasonLabel}
                                                size="small"
                                                color={getReasonColor(line.blockReason)}
                                                variant="outlined"
                                                sx={{ fontSize: '0.7rem' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    fontStyle: 'italic',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    display: 'block'
                                                }}
                                            >
                                                {line.pendingBlockNotes || line.blockedNotes || 'Aucune note'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            {isSupervisor ? (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    color="error"
                                                    startIcon={<BlockIcon />}
                                                    onClick={() => handleBlockClick(line)}
                                                    sx={{ fontSize: '0.7rem' }}
                                                >
                                                    Bloquer
                                                </Button>
                                            ) : (
                                                <Typography variant="caption" color="text.secondary">
                                                    Accès superviseur requis
                                                </Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            ))}

            {/* Modal de confirmation de blocage */}
            <BlockConfirmationModal
                open={blockModalOpen}
                onClose={handleBlockCancel}
                client={clientToBlock}
                onConfirm={handleBlockConfirm}
            />
        </Stack>
    );
};

export default SeparatedTablesBlockList;