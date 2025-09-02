import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  ExpandMore as ExpandMoreIcon,
  AccountBalance as AccountIcon
} from '@mui/icons-material';

import { useSuggestLinesForSimMutation } from '../../store/slices/redAccountsSlice';

const SimLinesSuggestions = () => {
  const [searchData, setSearchData] = useState({
    simReceivedDate: new Date().toISOString().split('T')[0],
    marginDays: 2
  });
  
  const [expanded, setExpanded] = useState(true);
  const [suggestLines, { data, isLoading, error, isSuccess }] = useSuggestLinesForSimMutation();

  const handleSearch = async () => {
    try {
      await suggestLines(searchData).unwrap();
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({ 
      ...prev, 
      [name]: name === 'marginDays' ? parseInt(value) : value 
    }));
  };

  const getDifferenceColor = (days) => {
    if (days === 0) return 'success';
    if (days === 1) return 'warning';
    return 'error';
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" display="flex" alignItems="center" gap={1}>
          <SearchIcon color="primary" />
          Suggestion de lignes pour carte SIM reçue
        </Typography>
        <IconButton onClick={() => setExpanded(!expanded)}>
          <ExpandMoreIcon 
            sx={{ 
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }} 
          />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Date de réception carte SIM"
              name="simReceivedDate"
              value={searchData.simReceivedDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              helperText="Date à laquelle vous avez reçu la carte SIM"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Marge d'erreur (jours)"
              name="marginDays"
              value={searchData.marginDays}
              onChange={handleChange}
              inputProps={{ min: 1, max: 7 }}
              helperText="Nombre de jours d'écart acceptés"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={isLoading || !searchData.simReceivedDate}
              startIcon={isLoading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ height: 56 }}
            >
              {isLoading ? 'Recherche...' : 'Rechercher lignes'}
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <strong>Erreur de recherche</strong><br />
            {error?.data?.message || 'Une erreur est survenue lors de la recherche.'}
          </Alert>
        )}

        {isSuccess && data && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Résultats de recherche
            </Typography>
            
            {data.possibleLines?.length === 0 ? (
              <Alert severity="info">
                <strong>Aucune ligne trouvée</strong><br />
                Aucune ligne commandée ne correspond à cette date de réception 
                avec une marge de {data.marginDays} jour(s).
              </Alert>
            ) : (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {data.possibleLines?.length} ligne(s) trouvée(s) avec une marge de {data.marginDays} jour(s)
                </Typography>
                
                <Grid container spacing={2}>
                  {data.possibleLines?.map((line) => (
                    <Grid item xs={12} md={6} key={line.id}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { 
                            boxShadow: 2,
                            borderColor: 'primary.main'
                          }
                        }}
                      >
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <PhoneIcon color="primary" fontSize="small" />
                            <Typography variant="h6">
                              {line.phoneNumber}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={`${line.daysDifference} jour(s)`}
                              color={getDifferenceColor(line.daysDifference)}
                            />
                          </Box>
                          
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <ScheduleIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              Commandée le: {new Date(line.orderDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <AccountIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              Compte RED: {line.redAccountId}
                            </Typography>
                          </Box>

                          {line.trackingNotes && (
                            <Typography variant="body2" sx={{ 
                              mt: 1, 
                              p: 1, 
                              bgcolor: 'grey.50', 
                              borderRadius: 1,
                              fontStyle: 'italic'
                            }}>
                              "{line.trackingNotes}"
                            </Typography>
                          )}

                          <Button
                            variant="outlined"
                            size="small"
                            fullWidth
                            sx={{ mt: 2 }}
                            onClick={() => {
                              // Ici vous pourrez ajouter la logique d'association
                              console.log('Associer la carte SIM à la ligne:', line.id);
                            }}
                          >
                            Associer cette ligne
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};

export default SimLinesSuggestions;