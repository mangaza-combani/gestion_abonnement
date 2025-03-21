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

const ClientActions = ({ client,currentTab }) => {

  console.log(currentTab)
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
        {currentTab == "block" ?null: (
        <Button
        fullWidth
        variant="contained"
        color="success"
        startIcon={<PlayArrowIcon />}
      >
        débloquer
      </Button>
      )
    }
         {currentTab == "unblock" ?null: (
        <Button
          fullWidth
          variant="contained"
          color="error"
          startIcon={<StopIcon />}
        >
           bloquer
        </Button>
           )
          }
        <Button
          fullWidth
          variant="contained"
          color="info"
          startIcon={<SimCardIcon />}
        >
          Commander SIM
        </Button>
        
      </Stack>
    </Paper>
  );
};

export default ClientActions;