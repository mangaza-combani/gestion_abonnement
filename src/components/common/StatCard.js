import React from 'react';
import { Paper, Box, Typography, Tooltip, IconButton } from '@mui/material';

const StatCard = ({ title, value, icon, color, subtitle, onAction }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      bgcolor: 'background.paper',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      <Box
        sx={{
          borderRadius: 2,
          bgcolor: `${color}.lighter`,
        }}
      >
        {onAction ? (
          <Tooltip title="Soumettre un paiement" arrow>
            <IconButton
              onClick={onAction}
              sx={{
                color: `${color}.main`,
                p: 2,
                '&:hover': {
                  bgcolor: `${color}.lighter`,
                }
              }}
            >
              {icon}
            </IconButton>
          </Tooltip>
        ) : (
          <Box
            sx={{
              p: 2,
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography color="textSecondary" variant="subtitle2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ mb: subtitle ? 1 : 0 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  </Paper>
);

export default StatCard;