import React, { useState } from 'react';
import {
    Card,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Stack,
    Box,
    Badge,
    IconButton,
    Divider
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    AccountCircle as AccountIcon,
    Phone as PhoneIcon,
    Warning as WarningIcon,
    Schedule as ScheduleIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    ContentCopy as CopyIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const GroupedBlockList = ({ clients, selectedClient, onClientSelect }) => {
    const [expandedAccordion, setExpandedAccordion] = useState(null);
    const [visiblePasswords, setVisiblePasswords] = useState({});

    // Grouper les lignes par compte RED
    const groupByRedAccount = (clients) => {
        const groups = {};
        
        clients.forEach(client => {
            // Clé de regroupement : compte RED ou "Sans compte" si pas de compte
            const redAccountKey = client.redAccount?.accountName || 
                                 client.redAccountName || 
                                 `Compte ${client.redAccountId || 'N/A'}`;
            
            if (!groups[redAccountKey]) {
                groups[redAccountKey] = {
                    accountName: redAccountKey,
                    redAccountId: client.redAccountId,
                    agency: client.agency,
                    lines: []
                };
            }
            
            groups[redAccountKey].lines.push(client);
        });
        
        return Object.values(groups);
    };

    // Compter les lignes par type de raison
    const getReasonCounts = (lines) => {
        const counts = {};
        lines.forEach(line => {
            const reason = line.blockReason || 'UNKNOWN';
            counts[reason] = (counts[reason] || 0) + 1;
        });
        return counts;
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

    const handleAccordionChange = (accountName) => (event, isExpanded) => {
        setExpandedAccordion(isExpanded ? accountName : null);
    };

    const handleLineClick = (line) => {
        onClientSelect(line);
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
        <Stack spacing={2}>
            {groupedData.map((group) => {
                const reasonCounts = getReasonCounts(group.lines);
                const totalLines = group.lines.length;

                return (
                    <Accordion
                        key={group.accountName}
                        expanded={expandedAccordion === group.accountName}
                        onChange={handleAccordionChange(group.accountName)}
                        elevation={2}
                    >
                        <AccordionSummary 
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ 
                                bgcolor: 'background.default',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                                <AccountIcon color="primary" />
                                
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        {group.accountName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {group.agency?.name || 'Agence non spécifiée'}
                                    </Typography>
                                    
                                    {/* Identifiants du compte RED */}
                                    {group.lines[0]?.redAccount && (
                                        <Box sx={{ 
                                            mt: 2, 
                                            p: 1.5, 
                                            backgroundColor: 'rgba(25, 118, 210, 0.08)', 
                                            borderRadius: 1,
                                            border: '1px solid rgba(25, 118, 210, 0.2)',
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            gap: 1 
                                        }}>
                                            {/* Login */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', minWidth: '80px' }}>
                                                    Login:
                                                </Typography>
                                                <Typography variant="body2" sx={{ 
                                                    fontFamily: 'monospace', 
                                                    backgroundColor: 'rgba(0,0,0,0.04)',
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 0.5,
                                                    letterSpacing: '0.5px',
                                                    fontWeight: 500
                                                }}>
                                                    {group.lines[0].redAccount.redAccountId}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyToClipboard(group.lines[0].redAccount.redAccountId);
                                                    }}
                                                    sx={{ 
                                                        p: 0.5,
                                                        backgroundColor: 'primary.main',
                                                        color: 'white',
                                                        '&:hover': { backgroundColor: 'primary.dark' }
                                                    }}
                                                    title="Copier le login"
                                                >
                                                    <CopyIcon sx={{ fontSize: 14 }} />
                                                </IconButton>
                                            </Box>
                                            
                                            {/* Mot de passe */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', minWidth: '80px' }}>
                                                    Password:
                                                </Typography>
                                                <Typography variant="body2" sx={{ 
                                                    fontFamily: 'monospace', 
                                                    backgroundColor: 'rgba(0,0,0,0.04)',
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 0.5,
                                                    letterSpacing: '0.5px',
                                                    fontWeight: 500,
                                                    minWidth: '100px'
                                                }}>
                                                    {visiblePasswords[group.accountName] 
                                                        ? group.lines[0].redAccount.redPassword 
                                                        : '••••••••••'
                                                    }
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        togglePasswordVisibility(group.accountName);
                                                    }}
                                                    sx={{ 
                                                        p: 0.5,
                                                        backgroundColor: 'secondary.main',
                                                        color: 'white',
                                                        '&:hover': { backgroundColor: 'secondary.dark' }
                                                    }}
                                                    title={visiblePasswords[group.accountName] ? "Masquer" : "Afficher"}
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
                                                        copyToClipboard(group.lines[0].redAccount.redPassword);
                                                    }}
                                                    sx={{ 
                                                        p: 0.5,
                                                        backgroundColor: 'primary.main',
                                                        color: 'white',
                                                        '&:hover': { backgroundColor: 'primary.dark' }
                                                    }}
                                                    title="Copier le mot de passe"
                                                >
                                                    <CopyIcon sx={{ fontSize: 14 }} />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Badge badgeContent={totalLines} color="primary">
                                        <PhoneIcon />
                                    </Badge>
                                    
                                    {/* Chips de résumé des raisons */}
                                    <Stack direction="row" spacing={0.5}>
                                        {Object.entries(reasonCounts).map(([reason, count]) => (
                                            <Chip
                                                key={reason}
                                                label={count}
                                                size="small"
                                                color={getReasonColor(reason)}
                                                variant="outlined"
                                                sx={{ minWidth: 30, fontSize: '0.7rem' }}
                                            />
                                        ))}
                                    </Stack>
                                </Box>
                            </Box>
                        </AccordionSummary>

                        <AccordionDetails sx={{ pt: 0 }}>
                            <Stack spacing={1} divider={<Divider />}>
                                {group.lines.map((line, index) => (
                                    <Box
                                        key={line.id}
                                        onClick={() => handleLineClick(line)}
                                        sx={{
                                            p: 2,
                                            borderRadius: 1,
                                            cursor: 'pointer',
                                            bgcolor: selectedClient?.id === line.id ? 'action.selected' : 'transparent',
                                            '&:hover': { 
                                                bgcolor: selectedClient?.id === line.id ? 'action.selected' : 'action.hover' 
                                            },
                                            border: selectedClient?.id === line.id ? 2 : 1,
                                            borderColor: selectedClient?.id === line.id ? 'primary.main' : 'divider',
                                        }}
                                    >
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <PhoneIcon color="action" />
                                            
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {line.phoneNumber || 'Numéro en cours'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {line.user?.firstname} {line.user?.lastname}
                                                </Typography>
                                            </Box>

                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {line.isPendingRequest && (
                                                    <Chip
                                                        icon={<ScheduleIcon />}
                                                        label="En attente"
                                                        size="small"
                                                        color="warning"
                                                        variant="outlined"
                                                    />
                                                )}
                                                
                                                <Chip
                                                    label={line.blockReasonLabel}
                                                    size="small"
                                                    color={getReasonColor(line.blockReason)}
                                                    variant="filled"
                                                    sx={{ fontSize: '0.7rem' }}
                                                />
                                            </Stack>
                                        </Stack>

                                        {/* Afficher les notes si présentes */}
                                        {(line.pendingBlockNotes || line.blockedNotes) && (
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    display: 'block', 
                                                    mt: 1, 
                                                    ml: 4,
                                                    fontStyle: 'italic',
                                                    color: 'text.secondary' 
                                                }}
                                            >
                                                {line.pendingBlockNotes || line.blockedNotes}
                                            </Typography>
                                        )}

                                    </Box>
                                ))}
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </Stack>
    );
};

export default GroupedBlockList;