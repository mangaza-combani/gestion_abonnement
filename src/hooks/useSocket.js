import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import socketService from '../services/socketService';
import { sim_cardsApiSlice } from '../store/slices/simCardsSlice';
import { lineReservationsApiSlice } from '../store/slices/lineReservationsSlice';

// Hook personnalisé pour gérer les WebSockets
export const useSocket = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!user || !token || hasInitialized.current) {
      return;
    }

    console.log('🔌 Initialisation WebSocket pour:', user.role, user.agencyId);

    // Connexion WebSocket
    socketService.connect(token, user.role, user.agencyId);
    hasInitialized.current = true;

    // Écouteurs d'événements
    const setupEventListeners = () => {
      // Connexion établie
      socketService.on('connected', () => {
        console.log('✅ WebSocket connecté - Hook');
      });

      // Connexion fermée
      socketService.on('disconnected', () => {
        console.log('❌ WebSocket déconnecté - Hook');
      });

      // Mises à jour des lignes
      socketService.on('line_update', (data) => {
        console.log('📱 Mise à jour ligne:', data);

        // Invalider le cache des réservations de lignes
        dispatch(lineReservationsApiSlice.util.invalidateTags(['LineReservation']));

        // Notification visuelle
        if (data.type === 'ACTIVATED') {
          showNotification(`Ligne activée: ${data.phoneNumber}`, 'success');
        } else if (data.type === 'RESERVED') {
          showNotification(`Ligne réservée`, 'info');
        }
      });

      // Mises à jour des cartes SIM
      socketService.on('sim_update', (data) => {
        console.log('💳 Mise à jour SIM:', data);

        // Invalider le cache des cartes SIM
        dispatch(sim_cardsApiSlice.util.invalidateTags(['SimCard']));

        if (data.type === 'ADDED') {
          showNotification(`Nouvelle carte SIM ajoutée`, 'success');
        }
      });

      // Mises à jour des clients
      socketService.on('client_update', (data) => {
        console.log('👤 Mise à jour client:', data);

        if (data.type === 'CREATED') {
          showNotification(`Nouveau client créé`, 'info');
        } else if (data.type === 'LINE_REQUESTED') {
          showNotification(`Demande de ligne client`, 'warning');
        }

        // Actualiser les données relatives aux clients
        dispatch(lineReservationsApiSlice.util.invalidateTags(['LineReservation']));
      });

      // Événements spécifiques par type
      socketService.on('LINE_RESERVED', (data) => {
        console.log('🔒 Ligne réservée:', data);
        // Logique spécifique pour les réservations
      });

      socketService.on('LINE_ACTIVATED', (data) => {
        console.log('✅ Ligne activée:', data);
        // Logique spécifique pour les activations
      });

      socketService.on('LINE_BLOCKED', (data) => {
        console.log('🚫 Ligne bloquée:', data);
        showNotification(`Ligne bloquée: ${data.phoneNumber}`, 'error');
      });
    };

    setupEventListeners();

    // Nettoyage à la déconnexion
    return () => {
      socketService.disconnect();
      hasInitialized.current = false;
    };
  }, [user, token, dispatch]);

  return socketService.getConnectionStatus();
};

// Fonction helper pour les notifications (à adapter selon votre système)
const showNotification = (message, type = 'info') => {
  // Implémentation selon votre système de notifications
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
  }
};

export default useSocket;