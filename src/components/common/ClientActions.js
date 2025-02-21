import React from 'react';
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

const ClientActions = ({ client }) => {
  return (
    <Paper sx={{ width: '200px', p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">ACTIONS</Typography>
        <Button
          fullWidth
          variant="contained"
          startIcon={<EuroIcon />}
        >
          Facturer
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="success"
          startIcon={<PlayArrowIcon />}
        >
          A débloquer
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="error"
          startIcon={<StopIcon />}
        >
          A bloquer
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="info"
          startIcon={<SimCardIcon />}
        >
          Commander SIM
        </Button>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
        >
          Nouveau Client
        </Button>
      </Stack>
    </Paper>
  );
};

export default ClientActions;