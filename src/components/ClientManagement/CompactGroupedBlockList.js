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
    Collapse,
    Stack
} from '@mui/material';
import {
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    AccountCircle as AccountIcon,
    Phone as PhoneIcon,
    ContentCopy as CopyIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const CompactGroupedBlockList = ({ clients, selectedClient, onClientSelect }) => {
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    const [visiblePasswords, setVisiblePasswords] = useState({});

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

    const toggleGroupExpansion = (groupKey) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupKey)) {
            newExpanded.delete(groupKey);
        } else {
            newExpanded.add(groupKey);
        }
        setExpandedGroups(newExpanded);
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
        <Card>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: '40px' }}></TableCell>
                            <TableCell sx={{ width: '25%' }}>NOM/PRÉNOM</TableCell>
                            <TableCell sx={{ width: '20%' }}>NUMÉRO</TableCell>
                            <TableCell sx={{ width: '20%' }}>RAISON</TableCell>
                            <TableCell sx={{ width: '35%' }}>NOTES</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {groupedData.map((group) => {
                            const isExpanded = expandedGroups.has(group.accountName);

                            return (
                                <React.Fragment key={group.accountName}>
                                    {/* Header de groupe */}
                                    <TableRow
                                        sx={{
                                            bgcolor: 'primary.light',
                                            '&:hover': { bgcolor: 'primary.main' },
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => toggleGroupExpansion(group.accountName)}
                                    >
                                        <TableCell>
                                            <IconButton size="small">
                                                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell colSpan={4}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <AccountIcon sx={{ color: 'white' }} />
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography
                                                        variant="subtitle1"
                                                        fontWeight="bold"
                                                        sx={{ color: 'white' }}
                                                    >
                                                        {group.accountName} ({group.lines.length} ligne{group.lines.length > 1 ? 's' : ''})
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ color: 'rgba(255,255,255,0.8)' }}
                                                    >
                                                        {group.agency?.name || 'Agence non spécifiée'}
                                                    </Typography>
                                                </Box>

                                                {/* Identifiants du compte RED condensés */}
                                                {group.redAccount && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: 'white',
                                                                fontFamily: 'monospace',
                                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                                px: 1,
                                                                py: 0.5,
                                                                borderRadius: 0.5
                                                            }}
                                                        >
                                                            {group.redAccount.redAccountId}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(group.redAccount.redAccountId);
                                                            }}
                                                            sx={{
                                                                color: 'white',
                                                                p: 0.5
                                                            }}
                                                        >
                                                            <CopyIcon sx={{ fontSize: 14 }} />
                                                        </IconButton>

                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: 'white',
                                                                fontFamily: 'monospace',
                                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                                px: 1,
                                                                py: 0.5,
                                                                borderRadius: 0.5,
                                                                minWidth: '60px'
                                                            }}
                                                        >
                                                            {visiblePasswords[group.accountName]
                                                                ? group.redAccount.redPassword
                                                                : '••••••'
                                                            }
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                togglePasswordVisibility(group.accountName);
                                                            }}
                                                            sx={{
                                                                color: 'white',
                                                                p: 0.5
                                                            }}
                                                        >
                                                            {visiblePasswords[group.accountName]
                                                                ? <VisibilityOffIcon sx={{ fontSize: 14 }} />
                                                                : <VisibilityIcon sx={{ fontSize: 14 }} />
                                                            }
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                copyToClipboard(group.redAccount.redPassword);
                                                            }}
                                                            sx={{
                                                                color: 'white',
                                                                p: 0.5
                                                            }}
                                                        >
                                                            <CopyIcon sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Box>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>

                                    {/* Lignes du groupe */}
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ p: 0, border: 'none' }}>
                                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                <Box sx={{ bgcolor: 'grey.50' }}>
                                                    {group.lines.map((line) => (
                                                        <Box
                                                            key={line.id}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                p: 1,
                                                                mx: 1,
                                                                my: 0.5,
                                                                borderRadius: 1,
                                                                cursor: 'pointer',
                                                                bgcolor: selectedClient?.id === line.id ? 'primary.light' : 'white',
                                                                border: selectedClient?.id === line.id ? 2 : 1,
                                                                borderColor: selectedClient?.id === line.id ? 'primary.main' : 'divider',
                                                                '&:hover': {
                                                                    bgcolor: selectedClient?.id === line.id ? 'primary.light' : 'action.hover'
                                                                }
                                                            }}
                                                            onClick={() => onClientSelect(line)}
                                                        >
                                                            <Box sx={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                                                                <PhoneIcon color="action" fontSize="small" />
                                                            </Box>
                                                            <Box sx={{ width: '25%', px: 1 }}>
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    {line.user?.lastname || ''} {line.user?.firstname || ''}
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ width: '20%', px: 1 }}>
                                                                <Typography variant="body2">
                                                                    {line.phoneNumber || 'En cours...'}
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ width: '20%', px: 1 }}>
                                                                <Chip
                                                                    label={line.blockReasonLabel}
                                                                    size="small"
                                                                    color={getReasonColor(line.blockReason)}
                                                                    variant="outlined"
                                                                    sx={{ fontSize: '0.7rem' }}
                                                                />
                                                            </Box>
                                                            <Box sx={{ width: '35%', px: 1 }}>
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                    sx={{
                                                                        fontStyle: 'italic',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }}
                                                                >
                                                                    {line.pendingBlockNotes || line.blockedNotes || 'Aucune note'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
};

export default CompactGroupedBlockList;