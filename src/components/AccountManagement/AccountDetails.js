import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  Stack, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Badge,
  Paper,
  Tabs,
  Tab,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Block as BlockIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  CreditCard as CreditCardIcon,
  Phone as PhoneIcon,
  AccountCircle as AccountCircleIcon,
  WarningAmber as WarningAmberIcon
} from '@mui/icons-material';

// Composant pour afficher le statut de la ligne avec la couleur appropriée
const LineStatusChip = ({ status }) => {
  let color = 'default';
  let icon = null;
  
  switch (status) {
    case 'ACTIF':
      color = 'success';
      icon = <PlayArrowIcon fontSize="small" />;
      break;
    case 'BLOQUÉ':
      color = 'error';
      icon = <BlockIcon fontSize="small" />;
      break;
    case 'PAUSE':
      color = 'warning';
      icon = <PauseIcon fontSize="small" />;
      break;
    case 'RÉSILIÉ':
      color = 'default';
      icon = <DeleteIcon fontSize="small" />;
      break;
    case 'NON ATTRIBUÉ':
      color = 'info';
      icon = <InfoIcon fontSize="small" />;
      break;
    default:
      color = 'default';
      icon = null;
  }
  
  return (
    <Chip 
      label={status} 
      color={color} 
      size="small" 
      icon={icon}
      sx={{ 
        fontWeight: 'medium',
        '& .MuiChip-icon': {
          fontSize: '0.7rem'
        }
      }} 
    />
  );
};

// Composant pour afficher l'état de paiement
const PaymentStatusChip = ({ status }) => {
  let color = 'default';
  
  switch (status) {
    case 'A JOUR':
      color = 'success';
      break;
    case 'EN RETARD':
      color = 'warning';
      break;
    case 'DETTE':
      color = 'error';
      break;
    default:
      color = 'default';
  }
  
  return <Chip label={status} color={color} size="small" variant="outlined" />;
};

const AccountDetails = ({ account, onAddLine, onActivateLine, onBlockLine, onPauseLine, onDeleteLine }) => {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lineToDelete, setLineToDelete] = useState(null);

  if (!account) return null;

  const handleDeleteClick = (line) => {
    setLineToDelete(line);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (lineToDelete) {
      onDeleteLine(lineToDelete);
      setDeleteDialogOpen(false);
      setLineToDelete(null);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <>
      <Card 
        sx={{ 
          width: '100%', 
          borderRadius: 2,
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: 4
          },
          display: 'flex',
          flexDirection: 'column'
        }}
        elevation={2}
      >
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: account.status === 'ACTIF' 
              ? alpha(theme.palette.success.main, 0.1)
              : account.status === 'BLOQUÉ'
                ? alpha(theme.palette.error.main, 0.1)
                : alpha(theme.palette.warning.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: account.status === 'ACTIF' 
                ? theme.palette.success.main
                : account.status === 'BLOQUÉ'
                  ? theme.palette.error.main
                  : theme.palette.warning.main,
              width: 56,
              height: 56
            }}
          >
            {getInitials(account.name)}
          </Avatar>
          <Box>
            <Typography variant="h6">{account.name}</Typography>
            <Typography variant="body2" color="text.secondary">{account.email}</Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Chip 
              label={account.status} 
              color={
                account.status === 'ACTIF' 
                  ? 'success'
                  : account.status === 'BLOQUÉ'
                    ? 'error'
                    : 'warning'
              } 
              size="medium"
              sx={{ fontWeight: 'medium' }}
            />
          </Box>
        </Box>
        
        <Tabs 
          value={tab} 
          onChange={(e, newValue) => setTab(newValue)}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            label="Informations" 
            icon={<AccountCircleIcon />} 
            iconPosition="start"
            sx={{ textTransform: 'none' }}
          />
          <Tab 
            label={`Lignes (${account.lines?.length || 0})`} 
            icon={<PhoneIcon />} 
            iconPosition="start"
            sx={{ textTransform: 'none' }}
          />
        </Tabs>
    
        <CardContent sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {/* Onglet Informations */}
          <Collapse in={tab === 0}>
            <Box sx={{ p: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountCircleIcon color="primary" fontSize="small" />
                  Informations du compte
                </Typography>
                
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Compte:</Typography>
                    <Typography variant="body2" fontWeight="medium">{account.name}</Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Login:</Typography>
                    <Typography variant="body2" fontWeight="medium">{account.login}</Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Email:</Typography>
                    <Typography variant="body2" fontWeight="medium">{account.email}</Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Agence:</Typography>
                    <Chip label={account.agency} size="small" color="primary" variant="outlined" />
                  </Box>
                </Stack>
              </Paper>
              
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: alpha(theme.palette.warning.main, 0.05),
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CreditCardIcon color="warning" fontSize="small" />
                  Informations de paiement
                </Typography>
                
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Carte:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCardIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="medium">
                        **** **** **** {account.cardLastFour}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Expiration:</Typography>
                    <Typography variant="body2" fontWeight="medium">{account.cardExpiry}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          </Collapse>
          
          {/* Onglet Lignes */}
          <Collapse in={tab === 1}>
            <Box sx={{ p: 2 }}>
              <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center" 
                mb={2}
                sx={{
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  p: 2,
                  borderRadius: 2
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon color="info" fontSize="small" />
                    Lignes téléphoniques
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gérez les lignes rattachées à ce compte ({account.lines?.length || 0}/5)
                  </Typography>
                </Box>
                <Tooltip title={account.lines?.length >= 5 ? "Nombre maximum de lignes atteint" : "Ajouter une ligne"}>
                  <span>
                    <Button 
                      startIcon={<AddIcon />} 
                      size="small" 
                      variant="contained"
                      onClick={onAddLine}
                      disabled={account.lines?.length >= 5}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      Nouvelle ligne
                    </Button>
                  </span>
                </Tooltip>
              </Box>
              
              {account.lines?.length > 0 ? (
                <TableContainer 
                  component={Paper} 
                  elevation={0}
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  <Table size="small">
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableRow>
                        <TableCell>NUMERO</TableCell>
                        <TableCell>CLIENT</TableCell>
                        <TableCell align="center">STATUT</TableCell>
                        <TableCell align="center">ETAT</TableCell>
                        <TableCell align="center">ACTIONS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {account.lines?.map((line) => (
                        <TableRow 
                          key={line.id} 
                          sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon fontSize="small" color="action" />
                              <Typography variant="body2" fontWeight="medium">
                                {line.phoneNumber}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{line.clientName}</TableCell>
                          <TableCell align="center">
                            <LineStatusChip status={line.status} />
                          </TableCell>
                          <TableCell align="center">
                            <PaymentStatusChip status={line.paymentStatus} />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                              {line.status !== 'ACTIF' && (
                                <Tooltip title="Activer la ligne">
                                  <IconButton 
                                    size="small" 
                                    color="success"
                                    onClick={() => onActivateLine(line)}
                                    sx={{ 
                                      border: `1px solid ${theme.palette.success.main}`,
                                      '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.1) }
                                    }}
                                  >
                                    <PlayArrowIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {line.status !== 'BLOQUÉ' && line.status !== 'RÉSILIÉ' && (
                                <Tooltip title="Bloquer la ligne">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => onBlockLine(line)}
                                    sx={{ 
                                      border: `1px solid ${theme.palette.error.main}`,
                                      '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                                    }}
                                  >
                                    <BlockIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {line.status !== 'PAUSE' && line.status !== 'RÉSILIÉ' && (
                                <Tooltip title="Mettre en pause">
                                  <IconButton 
                                    size="small" 
                                    color="warning"
                                    onClick={() => onPauseLine(line)}
                                    sx={{ 
                                      border: `1px solid ${theme.palette.warning.main}`,
                                      '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.1) }
                                    }}
                                  >
                                    <PauseIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Supprimer la ligne">
                                <IconButton 
                                  size="small" 
                                  color="default"
                                  onClick={() => handleDeleteClick(line)}
                                  sx={{ 
                                    border: `1px solid ${theme.palette.grey[400]}`,
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.05) }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    borderStyle: 'dashed',
                    borderWidth: 1,
                    borderColor: 'divider',
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    borderRadius: 2
                  }}
                >
                  <PhoneIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body1" gutterBottom>
                    Aucune ligne téléphonique
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Ce compte n'a pas encore de lignes téléphoniques rattachées.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={onAddLine}
                    sx={{ mt: 2 }}
                  >
                    Ajouter une ligne
                  </Button>
                </Paper>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="error" />
          Confirmation de suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer la ligne <strong>{lineToDelete?.phoneNumber}</strong> ?
            <br /><br />
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountDetails;