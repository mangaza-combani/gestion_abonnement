import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Stack,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  MarkEmailRead as MarkEmailReadIcon,
  MarkEmailUnread as MarkEmailUnreadIcon,
  DoneAll as DoneAllIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import {
  useGetNotificationsQuery,
  useGetNotificationCountsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation
} from '../../store/slices/notificationSlice';

// Animation pour les notifications non lues
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const bellRing = keyframes`
  0%, 100% { transform: rotate(0deg); }
  10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
  20%, 40%, 60%, 80% { transform: rotate(10deg); }
`;

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Requêtes RTK Query
  const { data: notifications, isLoading: notificationsLoading, refetch } = useGetNotificationsQuery();
  const { data: counts, isLoading: countsLoading } = useGetNotificationCountsQuery();

  // Mutations
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    refetch(); // Rafraîchir les données à l'ouverture
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
    handleMenuClose();
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = async (notificationId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'READ' ? 'unread' : 'read';
      await markAsRead({ id: notificationId, status: newStatus }).unwrap();
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (error) {
      console.error('Erreur lors du marquage en lot:', error);
    }
  };

  const getNotificationIcon = (type, status) => {
    const isRead = status === 'READ';
    
    switch (type) {
      case 'IN_APP':
        return isRead ? <InfoIcon color="action" /> : <InfoIcon color="primary" />;
      case 'PUSH':
        return isRead ? <WarningIcon color="action" /> : <WarningIcon color="warning" />;
      default:
        return isRead ? <CheckCircleIcon color="action" /> : <CheckCircleIcon color="success" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = counts?.data?.unread || 0;
  const totalCount = counts?.data?.total || 0;
  const userNotifications = notifications?.userNotification || [];

  return (
    <>
      {/* Icône de notification avec badge */}
      <IconButton
        color="inherit"
        onClick={handleMenuOpen}
        sx={{
          color: unreadCount > 0 ? '#FF5722' : 'inherit'
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              animation: unreadCount > 0 ? `${pulse} 2s infinite` : 'none',
              backgroundColor: '#FF5722'
            }
          }}
        >
          <NotificationsIcon sx={{
            color: unreadCount > 0 ? '#FF5722' : 'inherit',
            animation: unreadCount > 0 ? `${bellRing} 1s ease-in-out infinite` : 'none'
          }} />
        </Badge>
      </IconButton>

      {/* Menu déroulant des notifications */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            maxWidth: 400,
            maxHeight: 500,
            overflow: 'auto',
            mt: 1.5
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* En-tête du menu */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsActiveIcon color="primary" size="small" />
              <Typography variant="subtitle1" fontWeight="bold">
                Notifications
              </Typography>
              {!countsLoading && (
                <Chip 
                  size="small" 
                  label={unreadCount}
                  color={unreadCount > 0 ? 'error' : 'default'}
                />
              )}
            </Box>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                size="small"
                variant="text"
                color="primary"
                startIcon={<DoneAllIcon />}
                sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
              >
                Tout lire
              </Button>
            )}
          </Box>
        </Box>

        {/* Liste des notifications (limitée à 5) */}
        {notificationsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : userNotifications.length === 0 ? (
          <MenuItem>
            <ListItemIcon>
              <NotificationsIcon color="action" />
            </ListItemIcon>
            <ListItemText 
              primary="Aucune notification"
              secondary="Vous êtes à jour !"
            />
          </MenuItem>
        ) : (
          [
            ...userNotifications.slice(0, 5).map((notification, index) => (
              <MenuItem
                key={notification.id}
                onClick={() => setSelectedNotification(notification)}
                sx={{
                  bgcolor: notification.notificationStatus === 'read' 
                    ? 'transparent' 
                    : 'action.hover',
                  opacity: notification.notificationStatus === 'read' ? 0.7 : 1,
                  borderLeft: notification.notificationStatus === 'read' 
                    ? 'none' 
                    : '3px solid #FF5722',
                  '&:hover': {
                    bgcolor: 'action.selected'
                  }
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(
                    notification.notificationType, 
                    notification.notificationStatus
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: notification.notificationStatus === 'read' ? 'normal' : 'bold',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {notification.notificationMessage}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(notification.createdAt)}
                    </Typography>
                  }
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notification.id, notification.notificationStatus);
                  }}
                  title={notification.notificationStatus === 'read' ? 'Marquer comme non lu' : 'Marquer comme lu'}
                >
                  {notification.notificationStatus === 'read' ? 
                    <MarkEmailUnreadIcon fontSize="small" /> : 
                    <MarkEmailReadIcon fontSize="small" />
                  }
                </IconButton>
              </MenuItem>
            )),
            
            ...(userNotifications.length > 5 ? [
              <Divider key="divider" />,
              <MenuItem key="see-more" onClick={handleModalOpen}>
                <ListItemIcon>
                  <ExpandMoreIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography color="primary" fontWeight="bold">
                      Voir toutes les notifications ({totalCount})
                    </Typography>
                  }
                />
              </MenuItem>
            ] : [])
          ]
        )}
      </Menu>

      {/* Modal des notifications */}
      <Dialog
        open={isModalOpen}
        onClose={handleModalClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '70vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsActiveIcon color="primary" />
              <Typography variant="h6">
                Centre de notifications
              </Typography>
              {!countsLoading && (
                <Chip 
                  size="small" 
                  label={`${unreadCount}/${totalCount}`}
                  color={unreadCount > 0 ? 'error' : 'default'}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {unreadCount > 0 && (
                <Button
                  startIcon={<DoneAllIcon />}
                  onClick={handleMarkAllAsRead}
                  size="small"
                  variant="outlined"
                  color="success"
                >
                  Tout marquer comme lu
                </Button>
              )}
              <IconButton onClick={handleModalClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {notificationsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : userNotifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucune notification
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vous recevrez ici les notifications importantes du système
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {userNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.notificationStatus === 'read' 
                        ? 'transparent' 
                        : 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.selected'
                      },
                      cursor: 'pointer',
                      opacity: notification.notificationStatus === 'read' ? 0.7 : 1
                    }}
                    onClick={() => setSelectedNotification(notification)}
                  >
                    <ListItemIcon>
                      {getNotificationIcon(
                        notification.notificationType, 
                        notification.notificationStatus
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: notification.notificationStatus === 'read' ? 'normal' : 'bold',
                              flex: 1
                            }}
                          >
                            {notification.notificationMessage}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Chip 
                              size="small" 
                              label={notification.notificationType}
                              variant="outlined"
                              color={notification.notificationStatus === 'read' ? 'default' : 'primary'}
                            />
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id, notification.notificationStatus);
                              }}
                              title={notification.notificationStatus === 'read' ? 'Marquer comme non lu' : 'Marquer comme lu'}
                            >
                              {notification.notificationStatus === 'read' ? 
                                <MarkEmailUnreadIcon fontSize="small" /> : 
                                <MarkEmailReadIcon fontSize="small" />
                              }
                            </IconButton>
                          </Stack>
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(notification.createdAt)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < userNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            {totalCount === 0 ? 'Aucune notification' : 
             `${totalCount} notification${totalCount > 1 ? 's' : ''} au total`}
          </Typography>
          <Button onClick={handleModalClose} variant="outlined">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de détail d'une notification */}
      {selectedNotification && (
        <Dialog
          open={Boolean(selectedNotification)}
          onClose={() => setSelectedNotification(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getNotificationIcon(
                selectedNotification.notificationType,
                selectedNotification.notificationStatus
              )}
              <Typography variant="h6">
                Détail de la notification
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <Alert 
                severity={selectedNotification.notificationStatus === 'read' ? 'info' : 'warning'}
                sx={{ mb: 2 }}
              >
                <Typography variant="body1">
                  {selectedNotification.notificationMessage}
                </Typography>
              </Alert>
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Informations:
                </Typography>
                <Typography variant="body2">
                  • Type: {selectedNotification.notificationType}
                </Typography>
                <Typography variant="body2">
                  • Statut: {selectedNotification.notificationStatus === 'read' ? 'Lu' : 'Non lu'}
                </Typography>
                <Typography variant="body2">
                  • Date: {formatDate(selectedNotification.createdAt)}
                </Typography>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              startIcon={selectedNotification.notificationStatus === 'read' ? 
                <MarkEmailUnreadIcon /> : <MarkEmailReadIcon />}
              onClick={() => {
                handleMarkAsRead(selectedNotification.id, selectedNotification.notificationStatus);
                setSelectedNotification(null);
              }}
            >
              {selectedNotification.notificationStatus === 'read' ? 
                'Marquer comme non lu' : 'Marquer comme lu'}
            </Button>
            <Button onClick={() => setSelectedNotification(null)} variant="outlined">
              Fermer
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default NotificationCenter;