import React from 'react';
import { useSocket } from '../../hooks/useSocket';

// Composant pour initialiser les WebSockets
const SocketProvider = ({ children }) => {
  const connectionStatus = useSocket();

  return (
    <>
      {children}
      {/* Optionnel: Indicateur de statut de connexion */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          padding: '8px',
          backgroundColor: connectionStatus.isConnected ? '#4caf50' : '#f44336',
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          WebSocket: {connectionStatus.isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
          {connectionStatus.reconnectAttempts > 0 && (
            <div>Tentatives: {connectionStatus.reconnectAttempts}</div>
          )}
        </div>
      )}
    </>
  );
};

export default SocketProvider;