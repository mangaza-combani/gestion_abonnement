/**
 * Configuration API centralisée
 * 
 * POINT UNIQUE DE CONFIGURATION :
 * Pour changer l'URL de l'API, modifiez uniquement le fichier .env :
 * REACT_APP_API_URL=http://localhost:VOTRE_PORT/api/
 */

const API_CONFIG = {
  // URL complète de l'API (avec /api/)
  BASE_URL: process.env.REACT_APP_API_URL,
  
  // URL du serveur sans /api/ (pour certains endpoints)
  SERVER_URL: process.env.REACT_APP_API_URL?.replace('/api/', ''),
  
  // Timeout par défaut
  TIMEOUT: 10000,
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Validation que la variable d'environnement est définie
if (!API_CONFIG.BASE_URL) {
  console.error('❌ ERREUR : Variable REACT_APP_API_URL non définie dans .env');
  console.log('📝 Ajoutez cette ligne dans votre fichier .env :');
  console.log('REACT_APP_API_URL=http://localhost:VOTRE_PORT/api/');
}

export default API_CONFIG;