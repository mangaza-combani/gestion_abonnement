import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton,
  Badge
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  ExpandMore,
  ExpandLess,
  Inventory,
  Euro,
  Assignment
} from '@mui/icons-material';

const AlertIcon = ({ type, priority }) => {
  if (priority === 'HIGH') {
    return <Error color="error" />;
  }

  switch (type) {
    case 'critical':
      return <Error color="error" />;
    case 'warning':
      return <Warning color="warning" />;
    case 'info':
      return <Info color="info" />;
    default:
      return <Info color="info" />;
  }
};

const CategoryIcon = ({ category }) => {
  switch (category) {
    case 'stock':
      return <Inventory />;
    case 'finance':
      return <Euro />;
    case 'operations':
      return <Assignment />;
    default:
      return <Info />;
  }
};

const AlertItem = ({ alert, expanded, onToggle }) => {
  const hasDetails = alert.details && alert.details.length > 0;

  return (
    <Paper
      elevation={1}
      sx={{
        mb: 1,
        border: alert.priority === 'HIGH' ? '2px solid' : '1px solid',
        borderColor: alert.priority === 'HIGH' ? 'error.main' : 'grey.300'
      }}
    >
      <ListItem
        sx={{
          cursor: hasDetails ? 'pointer' : 'default',
          '&:hover': hasDetails ? { bgcolor: 'action.hover' } : {}
        }}
        onClick={hasDetails ? onToggle : undefined}
      >
        <ListItemIcon>
          <CategoryIcon category={alert.category} />
        </ListItemIcon>

        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ flex: 1 }}>
                {alert.message}
              </Typography>
              <Chip
                size="small"
                label={alert.priority}
                color={alert.priority === 'HIGH' ? 'error' : alert.priority === 'MEDIUM' ? 'warning' : 'default'}
                variant="outlined"
              />
            </Box>
          }
          secondary={alert.action && (
            <Typography variant="caption" color="primary">
              Action suggérée: {alert.action}
            </Typography>
          )}
        />

        {hasDetails && (
          <IconButton size="small">
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )}
      </ListItem>

      {hasDetails && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ px: 3, pb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Détails:
            </Typography>
            {alert.details.map((detail, index) => (
              <Box key={index} sx={{ ml: 2, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  • {detail.client ? `${detail.client}: ` : ''}
                  {detail.phoneNumber && `${detail.phoneNumber} - `}
                  {detail.amount && `${detail.amount}€ - `}
                  {detail.reason || detail.daysOverdue && `${Math.floor(detail.daysOverdue)} jours de retard`}
                </Typography>
              </Box>
            ))}
          </Box>
        </Collapse>
      )}
    </Paper>
  );
};

const AlertsPanel = ({ alerts, loading = false }) => {
  const [expandedAlerts, setExpandedAlerts] = React.useState(new Set());

  const toggleAlert = (index) => {
    const newExpanded = new Set(expandedAlerts);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedAlerts(newExpanded);
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">Chargement des alertes...</Typography>
      </Paper>
    );
  }

  if (!alerts || !alerts.alerts || alerts.alerts.length === 0) {
    return (
      <Paper sx={{ p: 3, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box textAlign="center">
          <Info color="success" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" color="success.main">
            Aucune alerte
          </Typography>
          <Typography color="text.secondary">
            Tous les systèmes fonctionnent normalement
          </Typography>
        </Box>
      </Paper>
    );
  }

  const { alerts: alertsList, counts } = alerts;
  const sortedAlerts = [...alertsList].sort((a, b) => {
    // Trier par priorité: HIGH > MEDIUM > LOW
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
  });

  return (
    <Paper sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Alertes & Notifications
        </Typography>

        {/* Badges de comptage */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {counts.critical > 0 && (
            <Badge badgeContent={counts.critical} color="error">
              <Chip size="small" label="Critique" color="error" variant="outlined" />
            </Badge>
          )}
          {counts.warning > 0 && (
            <Badge badgeContent={counts.warning} color="warning">
              <Chip size="small" label="Attention" color="warning" variant="outlined" />
            </Badge>
          )}
          {counts.info > 0 && (
            <Badge badgeContent={counts.info} color="info">
              <Chip size="small" label="Info" color="info" variant="outlined" />
            </Badge>
          )}
        </Box>
      </Box>

      {/* Liste des alertes */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {sortedAlerts.map((alert, index) => (
          <AlertItem
            key={index}
            alert={alert}
            expanded={expandedAlerts.has(index)}
            onToggle={() => toggleAlert(index)}
          />
        ))}
      </Box>

      {/* Pied de page avec résumé */}
      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          Total: {alertsList.length} alerte{alertsList.length > 1 ? 's' : ''}
          {counts.critical > 0 && ` • ${counts.critical} critique${counts.critical > 1 ? 's' : ''}`}
        </Typography>
      </Box>
    </Paper>
  );
};

export default AlertsPanel;