import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardHeader,
    CardContent,
    Typography,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    AccountBox as AccountIcon,
    Phone as PhoneIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    Warning as WarningIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useGetRedAccountsQuery } from '../../store/slices/redAccountsSlice';

const AccountSuggestionTool = ({ selectedClient, onAccountSelect, agencyId }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { data: redAccountsData, isLoading, refetch } = useGetRedAccountsQuery();

    useEffect(() => {
        if (selectedClient && redAccountsData) {
            console.log('Red accounts data structure:', redAccountsData);
            analyzePossibleAccounts();
        }
    }, [selectedClient, redAccountsData]);

    const analyzePossibleAccounts = () => {
        if (!selectedClient || !redAccountsData) return;

        setIsAnalyzing(true);

        try {
            const clientPhoneNumber = selectedClient.phoneNumber;
            const clientOrderDate = selectedClient.orderDate ? new Date(selectedClient.orderDate) : null;
            const simIccid = selectedClient.simCard?.iccid;

            // Gérer différentes structures de données possibles
            let accounts = [];
            if (Array.isArray(redAccountsData)) {
                accounts = redAccountsData;
            } else if (redAccountsData.redAccounts && Array.isArray(redAccountsData.redAccounts)) {
                accounts = redAccountsData.redAccounts;
            } else if (redAccountsData.data && Array.isArray(redAccountsData.data)) {
                accounts = redAccountsData.data;
            }

            console.log('Processing accounts:', accounts);

            const analysisResults = accounts
                .filter(account => account.agencyId === agencyId) // Filtrer par agence
                .map(account => {
                    let score = 0;
                    let reasons = [];

                    // Vérifier s'il y a des emplacements disponibles
                    const availableSlots = account.maxLines - account.activeLines;
                    if (availableSlots > 0) {
                        score += 30;
                        reasons.push(`${availableSlots} emplacement(s) disponible(s)`);
                    }

                    // Vérifier les lignes récemment commandées dans ce compte
                    const recentOrderedLines = account.lines?.filter(line => {
                        if (!line.orderDate) return false;
                        const lineOrderDate = new Date(line.orderDate);
                        const daysDiff = clientOrderDate ? 
                            Math.abs((clientOrderDate - lineOrderDate) / (1000 * 60 * 60 * 24)) : 999;
                        return daysDiff <= 3 && line.phoneStatus === 'NEEDS_TO_BE_ACTIVATED';
                    }) || [];

                    if (recentOrderedLines.length > 0) {
                        score += 50;
                        reasons.push(`${recentOrderedLines.length} ligne(s) commandée(s) récemment`);
                    }

                    // Vérifier la correspondance des numéros partiels si disponible
                    if (clientPhoneNumber) {
                        const matchingNumbers = account.lines?.filter(line => {
                            if (!line.phoneNumber) return false;
                            const clientLast4 = clientPhoneNumber.slice(-4);
                            const lineLast4 = line.phoneNumber.slice(-4);
                            return clientLast4 === lineLast4 && 
                                   line.phoneStatus === 'NEEDS_TO_BE_ACTIVATED';
                        }) || [];

                        if (matchingNumbers.length > 0) {
                            score += 80;
                            reasons.push(`Correspondance partielle du numéro (*${clientPhoneNumber.slice(-4)})`);
                        }
                    }

                    // Vérifier l'historique d'activation récent
                    const recentActivations = account.lines?.filter(line => {
                        if (!line.activatedAt) return false;
                        const activatedDate = new Date(line.activatedAt);
                        const daysSinceActivation = (new Date() - activatedDate) / (1000 * 60 * 60 * 24);
                        return daysSinceActivation <= 7;
                    }) || [];

                    if (recentActivations.length > 0) {
                        score += 20;
                        reasons.push(`${recentActivations.length} activation(s) récente(s)`);
                    }

                    // Vérifier la capacité restante du compte
                    const utilizationRate = (account.activeLines / account.maxLines) * 100;
                    if (utilizationRate < 80) {
                        score += 10;
                        reasons.push(`Taux d'utilisation: ${utilizationRate.toFixed(0)}%`);
                    }

                    return {
                        account,
                        score,
                        reasons,
                        confidence: score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low',
                        availableSlots,
                        recentOrderedLines,
                        utilizationRate
                    };
                })
                .filter(result => result.score > 0)
                .sort((a, b) => b.score - a.score);

            setSuggestions(analysisResults);
        } catch (error) {
            console.error('Erreur lors de l\'analyse des comptes:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getConfidenceColor = (confidence) => {
        switch (confidence) {
            case 'high': return 'success';
            case 'medium': return 'warning';
            case 'low': return 'error';
            default: return 'default';
        }
    };

    const getConfidenceIcon = (confidence) => {
        switch (confidence) {
            case 'high': return <CheckCircleIcon />;
            case 'medium': return <ScheduleIcon />;
            case 'low': return <WarningIcon />;
            default: return null;
        }
    };

    if (!selectedClient) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                Sélectionnez un client pour voir les suggestions de compte
            </Alert>
        );
    }

    return (
        <Card sx={{ mt: 2 }}>
            <CardHeader
                avatar={<AccountIcon />}
                title="Suggestions de Compte RED"
                subheader={`Analyse pour ${selectedClient.user?.firstname} ${selectedClient.user?.lastname}`}
                action={
                    <Tooltip title="Actualiser l'analyse">
                        <IconButton onClick={() => { refetch(); analyzePossibleAccounts(); }}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                }
            />
            <CardContent>
                {isLoading || isAnalyzing ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={3}>
                        <CircularProgress size={24} sx={{ mr: 2 }} />
                        <Typography>Analyse en cours...</Typography>
                    </Box>
                ) : suggestions.length === 0 ? (
                    <Alert severity="warning">
                        Aucun compte compatible trouvé pour cette activation
                    </Alert>
                ) : (
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {suggestions.length} compte(s) analysé(s) • Trié par pertinence
                        </Typography>
                        
                        {suggestions.map((suggestion, index) => (
                            <Accordion key={suggestion.account.id} defaultExpanded={index === 0}>
                                <AccordionSummary 
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{ 
                                        bgcolor: suggestion.confidence === 'high' ? 'success.50' : 
                                               suggestion.confidence === 'medium' ? 'warning.50' : 'grey.50'
                                    }}
                                >
                                    <Box display="flex" alignItems="center" width="100%">
                                        <Box display="flex" alignItems="center" flex={1}>
                                            {getConfidenceIcon(suggestion.confidence)}
                                            <Typography variant="h6" sx={{ ml: 1, mr: 2 }}>
                                                {suggestion.account.accountName || `Compte #${suggestion.account.id}`}
                                            </Typography>
                                            <Chip
                                                label={`${suggestion.score} pts`}
                                                color={getConfidenceColor(suggestion.confidence)}
                                                size="small"
                                                sx={{ mr: 1 }}
                                            />
                                            <Chip
                                                label={`${suggestion.availableSlots}/${suggestion.account.maxLines} places`}
                                                variant="outlined"
                                                size="small"
                                                icon={<PhoneIcon />}
                                            />
                                        </Box>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Raisons de suggestion:
                                        </Typography>
                                        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                            {suggestion.reasons.map((reason, i) => (
                                                <Chip
                                                    key={i}
                                                    label={reason}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Box>
                                        
                                        <Divider sx={{ my: 2 }} />
                                        
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Lignes actives: {suggestion.account.activeLines}/{suggestion.account.maxLines} 
                                                    ({suggestion.utilizationRate.toFixed(0)}%)
                                                </Typography>
                                                {suggestion.recentOrderedLines.length > 0 && (
                                                    <Typography variant="caption" display="block" color="primary">
                                                        {suggestion.recentOrderedLines.length} ligne(s) en attente d'activation
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Button
                                                variant={suggestion.confidence === 'high' ? 'contained' : 'outlined'}
                                                color="primary"
                                                onClick={() => onAccountSelect(suggestion.account)}
                                                size="small"
                                            >
                                                Sélectionner ce compte
                                            </Button>
                                        </Box>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default AccountSuggestionTool;