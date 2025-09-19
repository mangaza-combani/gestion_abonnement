import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    Stack,
    Alert,
    Box,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment
} from '@mui/material';
import {
    PhoneDisabled as SimLostIcon,
    ShoppingCart as OrderIcon,
    PauseCircle as PauseIcon,
    Euro as EuroIcon
} from '@mui/icons-material';
import { useProcessSimReplacementRequestMutation } from '../../store/slices/simReplacementSlice';

const SimLostModal = ({
    open,
    onClose,
    client,
    onConfirm
}) => {
    const [selectedOption, setSelectedOption] = useState('');
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [customAmount, setCustomAmount] = useState('10.00');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Utiliser la nouvelle mutation
    const [processSimReplacement] = useProcessSimReplacementRequestMutation();

    // Coût fixe pour une nouvelle SIM
    const SIM_COST = 10.00;

    const handleConfirm = async () => {
        if (!selectedOption) return;

        // Validation pour la commande de nouvelle SIM
        if (selectedOption === 'order_new_sim' && !paymentMethod) {
            alert('Veuillez sélectionner un moyen de paiement pour la nouvelle SIM');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                phoneId: client.id,
                action: selectedOption,
                notes: notes.trim() || 'SIM perdue/volée/endommagée',
                reason: 'lost_sim'
            };

            // Ajouter les informations de paiement si on commande une nouvelle SIM
            if (selectedOption === 'order_new_sim') {
                payload.billing = {
                    amount: parseFloat(customAmount),
                    paymentMethod: paymentMethod,
                    description: 'Commande nouvelle SIM suite à perte/vol/dommage'
                };
            }

            // Utiliser la nouvelle mutation RTK Query
            const result = await processSimReplacement(payload).unwrap();

            console.log('✅ Demande de remplacement SIM envoyée:', result);

            // Appeler onConfirm si fourni (pour compatibilité)
            if (onConfirm) {
                await onConfirm(payload);
            }

            handleClose();
        } catch (error) {
            console.error('Erreur lors du traitement SIM perdue:', error);
            alert('Erreur lors de l\'envoi de la demande. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedOption('');
        setNotes('');
        setPaymentMethod('');
        setCustomAmount('10.00');
        setIsSubmitting(false);
        onClose();
    };

    const clientName = client?.user ? 
        `${client.user.firstname} ${client.user.lastname}` : 
        'Client inconnu';

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <SimLostIcon color="error" />
                    <Typography variant="h6">
                        SIM Perdue/Volée/Endommagée
                    </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3}>
                    <Alert severity="warning">
                        <Typography variant="body2">
                            <strong>Client :</strong> {clientName}<br />
                            <strong>Ligne :</strong> {client?.phoneNumber || 'N/A'}
                        </Typography>
                    </Alert>

                    <Typography variant="body1" color="text.secondary">
                        Que souhaitez-vous faire pour cette ligne ?
                    </Typography>

                    <RadioGroup
                        value={selectedOption}
                        onChange={(e) => setSelectedOption(e.target.value)}
                    >
                        <FormControlLabel
                            value="order_new_sim"
                            control={<Radio />}
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <OrderIcon fontSize="small" />
                                    <Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            Commander une nouvelle SIM
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            La ligne sera bloquée temporairement en attendant la nouvelle SIM
                                        </Typography>
                                    </Box>
                                </Stack>
                            }
                        />
                        
                        <FormControlLabel
                            value="pause_line"
                            control={<Radio />}
                            label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <PauseIcon fontSize="small" />
                                    <Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            Mettre la ligne en pause
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Suspendre temporairement la ligne sans commander de nouvelle SIM
                                        </Typography>
                                    </Box>
                                </Stack>
                            }
                        />
                    </RadioGroup>

                    {/* Section facturation pour commande nouvelle SIM */}
                    {selectedOption === 'order_new_sim' && (
                        <>
                            <Divider />
                            <Alert severity="info">
                                <Typography variant="body2">
                                    <strong>Facturation nouvelle SIM :</strong> Une facture de {SIM_COST}€ sera générée automatiquement.
                                </Typography>
                            </Alert>
                            
                            <Stack spacing={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Moyen de paiement *</InputLabel>
                                    <Select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        label="Moyen de paiement *"
                                        required
                                    >
                                        <MenuItem value="BALANCE">Solde client</MenuItem>
                                        <MenuItem value="CASH">Espèces</MenuItem>
                                        <MenuItem value="CARD">Carte bancaire</MenuItem>
                                        <MenuItem value="TRANSFER">Virement</MenuItem>
                                        <MenuItem value="CHECK">Chèque</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Montant"
                                    type="number"
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(e.target.value)}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">€</InputAdornment>,
                                        startAdornment: <InputAdornment position="start"><EuroIcon fontSize="small" /></InputAdornment>
                                    }}
                                    inputProps={{
                                        min: "0",
                                        step: "0.01"
                                    }}
                                    variant="outlined"
                                    fullWidth
                                />
                            </Stack>
                        </>
                    )}

                    <TextField
                        label="Notes additionnelles (optionnel)"
                        multiline
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Détails sur la perte, vol, ou dommage..."
                        variant="outlined"
                        fullWidth
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button 
                    onClick={handleClose}
                    disabled={isSubmitting}
                >
                    Annuler
                </Button>
                <Button 
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={!selectedOption || isSubmitting}
                    color={selectedOption === 'order_new_sim' ? 'primary' : 'warning'}
                >
                    {isSubmitting ? 'Traitement...' : 'Confirmer'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SimLostModal;