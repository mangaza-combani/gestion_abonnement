// Service WebSocket pour les mises à jour temps réel
class SocketService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 1 seconde
    this.isConnected = false;
  }

  // Connexion WebSocket avec authentification
  connect(token, userRole, agencyId) {
    try {
      // Utiliser directement l'URL sans /api car on va l'ajouter
      const baseServerUrl = process.env.REACT_APP_API_URL?.replace('/api/', '') || 'http://localhost:3333';
      const channels = this.getChannelsForUser(userRole, agencyId);

      // Construire l'URL avec les canaux appropriés
      const channelParam = channels.join(',');
      const tokenString = typeof token === 'string' ? token : token.token || '';
      const url = `${baseServerUrl}/api/transmit?channels=${encodeURIComponent(channelParam)}&token=${encodeURIComponent(tokenString)}`;

      console.log(`🔌 Connexion WebSocket vers:`, url);

      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('✅ WebSocket connecté');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Événement WebSocket reçu:', data);

          // Ignorer les pings
          if (data.type === 'ping') {
            return;
          }

          // Message de connexion confirmé
          if (data.type === 'connected') {
            console.log('🎯 Connexion WebSocket confirmée sur les canaux:', data.channels);
            return;
          }

          this.handleEvent(data);
        } catch (error) {
          console.error('❌ Erreur parsing WebSocket:', error, 'Data:', event.data);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ Erreur WebSocket:', error);
        console.log('ReadyState:', this.eventSource.readyState);

        // Si la connexion était établie avant l'erreur
        if (this.isConnected) {
          this.isConnected = false;
          this.emit('disconnected');
        }

        // EventSource se reconnecte automatiquement, mais on peut forcer si nécessaire
        if (this.eventSource.readyState === EventSource.CLOSED) {
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
              console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
              this.connect(token, userRole, agencyId);
            }, this.reconnectDelay * this.reconnectAttempts);
          }
        }
      };

    } catch (error) {
      console.error('❌ Erreur connexion WebSocket:', error);
    }
  }

  // Déterminer les canaux selon le rôle utilisateur
  getChannelsForUser(userRole, agencyId) {
    const channels = ['global/updates'];

    if (userRole === 'SUPERVISOR') {
      channels.push('supervisor/lines');
    }

    if (agencyId) {
      channels.push(`agency/${agencyId}/updates`);
    }

    return channels;
  }

  // Gérer les événements reçus
  handleEvent(data) {
    const { type, ...payload } = data;

    // Émettre l'événement aux listeners
    this.emit(type, payload);

    // Événements spécifiques
    switch (type) {
      case 'LINE_RESERVED':
        this.emit('line_update', { type: 'RESERVED', ...payload });
        break;
      case 'LINE_ACTIVATED':
        this.emit('line_update', { type: 'ACTIVATED', ...payload });
        break;
      case 'LINE_AVAILABLE':
        this.emit('line_update', { type: 'AVAILABLE', ...payload });
        break;
      case 'LINE_BLOCKED':
        this.emit('line_update', { type: 'BLOCKED', ...payload });
        break;
      case 'SIM_ADDED':
        this.emit('sim_update', { type: 'ADDED', ...payload });
        break;
      case 'CLIENT_CREATED':
        this.emit('client_update', { type: 'CREATED', ...payload });
        break;
      case 'CLIENT_LINE_REQUESTED':
        this.emit('client_update', { type: 'LINE_REQUESTED', ...payload });
        break;
      default:
        console.log('📨 Événement non géré:', type);
    }
  }

  // Système d'événements
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Erreur callback ${event}:`, error);
        }
      });
    }
  }

  // Déconnexion
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      console.log('🔌 WebSocket déconnecté');
    }
  }

  // Statut de connexion
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Instance singleton
const socketService = new SocketService();
export default socketService;