import React, {useEffect, useState} from 'react';
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
  Paper,
  Tabs,
  Tab,
  Collapse,
  Avatar,
  Badge,
  Grid,
  useTheme,
  alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  Info as InfoIcon,
  Phone as PhoneIcon,
  AccountCircle as AccountCircleIcon,
  NavigateNext as NavigateNextIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  VpnKey as VpnKeyIcon,
  SwapHoriz as SwapHorizIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material';

// Import des constantes
import { 
  LINE_STATUSES, 
  PAYMENT_STATUSES, 
  UNASSIGNED_LINE_DISPLAY,
  CLIENT_TYPES
} from './accountConstants';
import {useGetAgenciesQuery, useGetAgencyByIdQuery} from "../../store/slices/agencySlice";
import UpdatePaymentDialog from './UpdatePaymentDialog';

// Composant pour afficher le statut de la ligne avec la couleur appropriée
const LineStatusChip = ({ status }) => {
  let color = 'default';
  
  switch (status) {
    case LINE_STATUSES.ACTIVE:
      color = 'success';
      break;
    case LINE_STATUSES.BLOCKED:
      color = 'error';
      break;
    case LINE_STATUSES.PAUSED:
      color = 'warning';
      break;
    case LINE_STATUSES.TERMINATED:
      color = 'default';
      break;
    case LINE_STATUSES.UNASSIGNED:
      color = 'info';
      break;
    default:
      color = 'default';
  }
  
  return (
    <Chip 
      label={status} 
      color={color} 
      size="small"
      sx={{ 
        fontWeight: 'medium',
        borderRadius: '4px',
        '& .MuiChip-label': {
          px: 1.5
        }
      }} 
    />
  );
};

// Composant pour afficher l'état de paiement
const PaymentStatusChip = ({ status }) => {
  let color = 'default';
  
  switch (status) {
    case PAYMENT_STATUSES.UPTODATE:
      color = 'success';
      break;
    case PAYMENT_STATUSES.LATE:
      color = 'warning';
      break;
    case PAYMENT_STATUSES.DEBT:
      color = 'error';
      break;
    case PAYMENT_STATUSES.UNASSIGNED:
      color = 'info';
      break;
    default:
      color = 'default';
  }
  
  return (
    <Chip 
      label={status} 
      color={color} 
      size="small" 
      variant="outlined"
      sx={{ 
        borderRadius: '4px',
        '& .MuiChip-label': {
          px: 1.5
        }
      }}
    />
  );
};

// // Composant pour afficher le motif de résiliation
// const TerminationReasonChip = ({ reason }) => {
//   let color = 'default';
//   let icon = null;
  
//   switch (reason) {
//     case TERMINATION_REASONS.NONPAYMENT:
//       color = 'error';
//       icon = <WarningIcon fontSize="small" />;
//       break;
//     case TERMINATION_REASONS.CUSTOMER_REQUEST:
//       color = 'primary';
//       icon = null;
//       break;
//     case TERMINATION_REASONS.EXPIRED:
//       color = 'default';
//       icon = <HistoryIcon fontSize="small" />;
//       break;
//     default:
//       color = 'default';
//       icon = null;
//   }
  
//   return (
//     <Chip 
//       label={reason} 
//       color={color} 
//       size="small" 
//       icon={icon}
//       variant="outlined"
//       sx={{ 
//         borderRadius: '4px',
//         '& .MuiChip-label': {
//           px: 1
//         }
//       }}
//     />
//   );
// };

// Composant pour afficher le statut du client
const ClientStatusChip = ({ type }) => {
  let color = type === CLIENT_TYPES.UNASSIGNED ? 'info' : 'default';
  
  return type === CLIENT_TYPES.UNASSIGNED ? (
    <Chip 
      label={UNASSIGNED_LINE_DISPLAY.CLIENT_NAME} 
      color={color} 
      size="small"
      variant="outlined"
      sx={{ 
        fontWeight: 'medium',
        borderRadius: '4px'
      }}
    />
  ) : null;
};

// Statistiques avec animation
const StatItem = ({ icon, label, value, color = 'primary' }) => {
  const theme = useTheme();
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 1.5, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5,
        backgroundColor: alpha(theme.palette[color].main, 0.08),
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 10px ${alpha(theme.palette[color].main, 0.15)}`
        }
      }}
    >
      
      <Box>
        <Typography variant="h5" color={`${color}.main`} sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};

// Fonction pour vérifier si une ligne résiliée a expiré (plus d'un an)
const isExpiredTermination = (line) => {
  if (!line || !line.terminationDate) return false;
  
  const terminationDate = new Date(line.terminationDate);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  return terminationDate < oneYearAgo;
};

const AccountDetails = ({ account, onAddLine, onNavigateToLine, onUpdatePaymentInfo }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showExpiredLines, setShowExpiredLines] = useState(false);
  const [ca, setCurrentAgency] = useState(null);
  const [currentAgency, setCurrentAgencyWithPhones] = useState(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const agencies = useGetAgenciesQuery();

        useEffect(() => {
           if(agencies?.data?.length > 0) {
                const agency = agencies?.currentData?.find((agency) => agency.id === parseInt(account.agencyId));
                setCurrentAgency(agency);
           }
        }, []);

  if (!account) return null;

  // Fonction pour déterminer si la ligne est attribuée à un client
  const isLineAssigned = (line) => {
    return line.userId !== null && line.userId !== undefined;
  };
  
  // Fonction pour filtrer les lignes selon les critères d'affichage
  const getFilteredLines = () => {
    if (showExpiredLines) {
      return account.phones || [];
    }
    
    return (account.phones || []).filter(line => 
      !(line?.phoneStatus === 'INACTIVE' && line?.deactivationDate && isExpiredTermination({ terminationDate: line.deactivationDate }))
    );
  };
  
  const filteredLines = getFilteredLines();
  
  // Statistiques des lignes
  const stats = {
    total: filteredLines.length,
    active: filteredLines.filter(line => line.phoneStatus === 'ACTIVE').length,
    assigned: filteredLines.filter(line => line.userId !== null).length,
    unassigned: filteredLines.filter(line => line.userId === null).length,
    terminated: filteredLines.filter(line => line?.phoneStatus === 'INACTIVE').length,
    expiredTerminations: (account.phones || []).filter(line => 
      line?.phoneStatus === 'INACTIVE' && line?.deactivationDate && isExpiredTermination({ terminationDate: line.deactivationDate })
    ).length
  };
  
  // Vérifier si le compte peut avoir de nouvelles lignes
  const canAddLine = filteredLines.length < 5;

  // Function to navigate to lines management page with specific line selected
  const handleNavigateToLine = (lineId) => {
    // Navigate to /lines page with parameters for tab and selected line
    navigate(`/lines?tab=list&selectedLine=${lineId}`);
  };

  // Récupérer la première lettre du login pour l'avatar
  const getInitial = (login) => {
    return login ? login.charAt(0).toUpperCase() : '?';
  };

  return (
    <Card 
      sx={{ 
        width: '100%', 
        borderRadius: 2,
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: 6
        },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
      elevation={2}
    >
      <Box 
        sx={{ 
          p: 3, 
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          backgroundImage: `radial-gradient(${alpha(theme.palette.primary.main, 0.15)} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {account.redId  || ""}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={7}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
                <Chip 
                  icon={<BusinessIcon />}
                  label={account.agency?.name ? account.agency.name : ""} 
                  color="primary" 
                  sx={{ 
                    fontWeight: 'medium', 
                    px: 1,
                    borderRadius: '8px',
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                />
              </Box>
              
            
            </Grid>
          </Grid>
        </Box>
      </Box>
      
      <Tabs 
        value={tab} 
        onChange={(e, newValue) => setTab(newValue)}
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper',
          '& .MuiTab-root': {
            minHeight: '56px',
            transition: 'all 0.2s',
            fontWeight: 'medium',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.04)
            }
          },
          '& .Mui-selected': {
            fontWeight: 'bold'
          }
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
          label={`Lignes (${filteredLines.length})`} 
          icon={<PhoneIcon />} 
          iconPosition="start"
          sx={{ textTransform: 'none' }}
        />
      </Tabs>
  
      <CardContent sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        {/* Onglet Informations */}
        <Collapse in={tab === 0}>
          <Box sx={{ p: 3 }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                pb: 1,
                borderBottom: `1px dashed ${theme.palette.divider}`
              }}
            >
              <AccountCircleIcon color="primary" />
              Informations du compte
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    height: '100%',
                    bgcolor: alpha(theme.palette.background.default, 0.7),
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Identifiant de connexion
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccountCircleIcon color="primary" fontSize="small" />
                        <Typography variant="body1" fontSize={'small'} fontWeight="medium">{account.redAccountId ? account.redAccountId : ''}</Typography>
                      </Box>
                    </Box>
                    
                    <Divider flexItem />
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Adresse email
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon color="primary" fontSize="small" />
                        <Typography variant="body1" fontSize={'small'} fontWeight="medium">{account.redAccountId ? account.redAccountId : ""}</Typography>
                      </Box>
                    </Box>
                    
                    <Divider flexItem />
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Mot de passe
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VpnKeyIcon color="primary" fontSize="small" />
                        <Typography variant="body1" fontWeight="medium">
                          {showPassword ? (account.password || 'Aucun mot de passe') : '••••••••'}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => setShowPassword(!showPassword)}
                          color="primary"
                          sx={{ 
                            ml: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                          }}
                        >
                          {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                        </IconButton>
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    height: '100%',
                    bgcolor: alpha(theme.palette.background.default, 0.7),
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Agence rattachée
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon color="primary" fontSize="small" />
                      <Typography variant="body1" fontWeight="medium">
                              {
                                      agencies?.currentData?.map((agency) => {
                                        if (agency.id === parseInt(account.agencyId)) {
                                          return agency.name;
                                        }
                                      })
                              }
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Statistiques des lignes
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={12}>
                      <StatItem 
                        icon={<PhoneIcon />} 
                        label="Total des lignes actives" 
                        value={account?.activeLines}
                        color="success"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <StatItem 
                        icon={<SwapHorizIcon />} 
                        label="Non attribuées" 
                        value={stats.unassigned}
                        color="info"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <StatItem 
                        icon={<DeleteIcon />} 
                        label="Résiliées" 
                        value={stats.terminated} 
                        color="error"
                      />
                    </Grid>
                    {stats?.terminatedForNonpayment > 0 && (
                      <Grid item xs={12}>
                        <StatItem 
                          icon={<WarningIcon />} 
                          label="Impayés" 
                          value={stats?.terminatedForNonpayment}
                          color="warning"
                        />
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
              
              {/* Payment Information Section - Full width */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    bgcolor: alpha(theme.palette.background.default, 0.7),
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Informations de paiement
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CreditCardIcon color="primary" fontSize="small" />
                        <Typography variant="body1" fontWeight="medium">
                          Carte de crédit rattachée
                        </Typography>
                      </Box>
                    </Box>
                    <Tooltip title="Modifier les informations de paiement">
                      <IconButton 
                        size="small" 
                        onClick={() => setIsPaymentDialogOpen(true)}
                        color="primary"
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {account?.bankName || account?.cardLastFour || account?.cardExpiry ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Banque
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {account?.bankName || 'Non renseigné'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Carte
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {account?.cardLastFour ? `**** **** **** ${account.cardLastFour}` : 'Non renseigné'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Expiration
                          </Typography>
                          <Typography 
                            variant="body2" 
                            fontWeight="medium"
                            color={(() => {
                              if (!account?.cardExpiry) return 'text.primary';
                              const [month, year] = account.cardExpiry.split('/');
                              const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
                              const twoMonthsFromNow = new Date();
                              twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
                              return expiryDate <= twoMonthsFromNow ? 'warning.main' : 'text.primary';
                            })()}
                          >
                            {account?.cardExpiry || 'Non renseigné'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Aucune information de paiement renseignée
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small"
                        startIcon={<CreditCardIcon />}
                        onClick={() => setIsPaymentDialogOpen(true)}
                        sx={{ mt: 1 }}
                      >
                        Ajouter une carte
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
        
        {/* Onglet Lignes */}
        <Collapse in={tab === 1}>
          <Box sx={{ p: 3 }}>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center" 
              mb={3}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                backgroundImage: `linear-gradient(to right, ${alpha(theme.palette.info.main, 0.08)}, ${alpha(theme.palette.primary.main, 0.08)})`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <PhoneIcon color="primary" />
                  Lignes téléphoniques
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                          {account.activeLines} ligne(s) sur {account.maxLines} maximum
                  </Typography>
                  
                  {stats.expiredTerminations > 0 && (
                    <Tooltip title="Cliquer pour afficher/masquer les lignes expirées depuis plus d'un an">
                      <Chip
                        size="small"
                        label={`${stats.expiredTerminations} expirée(s)`}
                        color="default"
                        variant="outlined"
                        onClick={() => setShowExpiredLines(!showExpiredLines)}
                        sx={{ 
                          cursor: 'pointer',
                          borderRadius: '4px',
                          backgroundColor: showExpiredLines ? alpha(theme.palette.grey[500], 0.1) : 'transparent'
                        }}
                        icon={<HistoryIcon fontSize="small" />}
                      />
                    </Tooltip>
                  )}
                </Box>
              </Box>
              <Tooltip title={!canAddLine ? "Nombre maximum de lignes actives atteint (5)" : "Ajouter une ligne"}>
                <span>
                  <Button 
                    startIcon={<AddIcon />} 
                    size="medium" 
                    variant="contained"
                    onClick={onAddLine}
                    disabled={!canAddLine}
                    sx={{ 
                      whiteSpace: 'nowrap',
                      borderRadius: '8px',
                      px: 2,
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4
                      }
                    }}
                  >
                    Nouvelle ligne
                  </Button>
                </span>
              </Tooltip>
            </Box>
            
            {filteredLines.length > 0 ? (
              <TableContainer 
                component={Paper} 
                elevation={0}
                sx={{ 
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <Table>
                  <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>NUMERO</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>CLIENT</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>STATUT</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>ETAT</TableCell>
                    
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredLines.map((line) => {
                      const isTerminated = line?.phoneStatus === 'INACTIVE';
                      const isExpired = line?.deactivationDate && isExpiredTermination({ terminationDate: line.deactivationDate });
                      const isAssigned = line.userId !== null;
                      
                      return (
                        <TableRow 
                          key={line.id} 
                          sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) },
                            cursor: isAssigned && !isTerminated ? 'pointer' : 'default',
                            transition: 'background-color 0.2s',
                            opacity: isExpired ? 0.7 : 1,
                            backgroundColor: isExpired ? alpha(theme.palette.grey[500], 0.05) : 'inherit'
                          }}
                          onClick={() => isAssigned && !isTerminated && handleNavigateToLine(line.id)}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  bgcolor: isTerminated ? 
                                    alpha(theme.palette.grey[500], 0.1) : 
                                    alpha(theme.palette.primary.main, 0.1),
                                  color: isTerminated ? 
                                    theme.palette.grey[500] : 
                                    theme.palette.primary.main
                                }}
                              >
                                <PhoneIcon fontSize="small" />
                              </Avatar>
                              <Typography 
                                variant="body2" 
                                fontWeight="medium"
                                sx={{ 
                                  textDecoration: isTerminated ? 'line-through' : 'none',
                                  color: isTerminated ? 'text.disabled' : 'text.primary'
                                }}
                              >
                                {line.phoneNumber}
                              </Typography>
                              {isExpired && (
                                <Tooltip title="Ligne expirée (résiliée depuis plus d'un an)">
                                  <HistoryIcon fontSize="small" color="disabled" />
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {isAssigned ? (
                                <>
                                  <Typography 
                                    variant="body2"
                                    sx={{ 
                                      textDecoration: isTerminated ? 'line-through' : 'none',
                                      color: isTerminated ? 'text.disabled' : 'text.primary'
                                    }}
                                  >
                                    {line.user ? `${line.user.firstname} ${line.user.lastname}` : 'Client inconnu'}
                                  </Typography>
                                  {!isTerminated && (
                                    <Tooltip title="Voir les détails de la ligne">
                                      <IconButton 
                                        size="small" 
                                        color="primary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleNavigateToLine(line.id);
                                        }}
                                        sx={{ 
                                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                          '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.15)
                                          }
                                        }}
                                      >
                                        <NavigateNextIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </>
                              ) : (
                                <ClientStatusChip type={CLIENT_TYPES.UNASSIGNED} />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={line?.phoneStatus || 'UNKNOWN'} 
                              color={
                                line?.phoneStatus === 'ACTIVE' ? 'success' :
                                line?.phoneStatus === 'INACTIVE' ? 'default' :
                                line?.phoneStatus === 'SUSPENDED' ? 'error' :
                                'info'
                              }
                              size="small"
                              sx={{ fontWeight: 'medium', borderRadius: '4px' }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={line?.paymentStatus || 'UNKNOWN'} 
                              color={
                                line?.paymentStatus === 'UP_TO_DATE' ? 'success' :
                                line?.paymentStatus === 'OVERDUE' ? 'warning' :
                                line?.paymentStatus === 'PAST_DUE' ? 'error' :
                                line?.paymentStatus === 'UNATTRIBUTED' ? 'info' :
                                'default'
                              }
                              variant="outlined"
                              size="small"
                              sx={{ borderRadius: '4px' }}
                            />
                          </TableCell>
                         
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  borderStyle: 'dashed',
                  borderWidth: 1,
                  borderColor: 'divider',
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  borderRadius: 2
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    margin: '0 auto 16px'
                  }}
                >
                  <PhoneIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  Aucune ligne téléphonique
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ce compte n'a pas encore de lignes téléphoniques rattachées.
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={onAddLine}
                  sx={{ 
                    mt: 3,
                    borderRadius: '8px',
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4
                    }
                  }}
                >
                  Ajouter une ligne
                </Button>
              </Paper>
            )}
          </Box>
        </Collapse>
      </CardContent>
      
      {/* Payment Information Update Dialog */}
      <UpdatePaymentDialog
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        onSubmit={onUpdatePaymentInfo}
        account={account}
      />
    </Card>
  );
};

export default AccountDetails;
                           