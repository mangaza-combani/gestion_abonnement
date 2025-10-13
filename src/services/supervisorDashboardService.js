import axios from 'axios';
import API_CONFIG from '../config/api';

// Instance Axios configurée pour le dashboard superviseur
const apiClient = axios.create({
  baseURL: API_CONFIG.SERVER_URL || 'http://localhost:3333', // Utilise SERVER_URL car nos routes n'ont pas /api/
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Erreur API Dashboard Superviseur:', error);

    // Rediriger vers login si token expiré
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

/**
 * Service pour les APIs du dashboard superviseur
 */
const supervisorDashboardService = {
  /**
   * 📊 Récupérer toutes les données du dashboard
   * @returns {Promise} Données complètes du dashboard
   */
  async getDashboard() {
    try {
      console.log('📊 Récupération des données dashboard superviseur...');
      const response = await apiClient.get('/supervisor/dashboard');

      if (response.data.success) {
        console.log('✅ Données dashboard récupérées:', response.data.data);
        return response.data.data;
      } else {
        throw new Error('Réponse API invalide');
      }
    } catch (error) {
      console.error('❌ Erreur récupération dashboard:', error);
      throw error;
    }
  },

  /**
   * 🚨 Récupérer les alertes et notifications urgentes
   * @returns {Promise} Liste des alertes
   */
  async getAlerts() {
    try {
      console.log('🚨 Récupération des alertes superviseur...');
      const response = await apiClient.get('/supervisor/alerts');

      if (response.data.success) {
        console.log('✅ Alertes récupérées:', response.data.alerts?.length || 0, 'alertes');
        return response.data;
      } else {
        throw new Error('Réponse API invalide');
      }
    } catch (error) {
      console.error('❌ Erreur récupération alertes:', error);
      throw error;
    }
  },

  /**
   * 🔄 Récupérer les données avec gestion d'erreur intégrée
   * @param {boolean} includeAlerts - Inclure les alertes dans la réponse
   * @returns {Promise} Objet avec données dashboard et alertes
   */
  async getDashboardWithAlerts(includeAlerts = true) {
    try {
      const promises = [this.getDashboard()];

      if (includeAlerts) {
        promises.push(this.getAlerts());
      }

      const [dashboardData, alertsData] = await Promise.all(promises);

      return {
        dashboard: dashboardData,
        alerts: alertsData || null,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erreur récupération données complètes:', error);

      // Retourner des données par défaut en cas d'erreur
      return {
        dashboard: this.getDefaultDashboardData(),
        alerts: null,
        error: error.message,
        lastUpdated: new Date().toISOString()
      };
    }
  },

  /**
   * 📋 Données par défaut en cas d'erreur API
   * @returns {Object} Structure de données par défaut
   */
  getDefaultDashboardData() {
    return {
      overview: {
        totalClients: 0,
        totalLines: 0,
        totalAgencies: 0,
        monthlyRevenue: 0
      },
      lines: {
        toActivate: 0,
        active: 0,
        blocked: 0,
        pendingPayment: 0,
        replacementSims: 0,
        activationRate: 0
      },
      finances: {
        overdueInvoicesCount: 0,
        totalOverdueAmount: 0,
        monthlyRevenue: 0,
        averageRevenuePerLine: 0
      },
      operations: {
        simStock: 0,
        pendingOrders: 0,
        unreadNotifications: 0
      },
      agencies: {
        topPerformers: [],
        mostUnpaid: []
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        currentMonth: new Date().toISOString().substring(0, 7),
        refreshInterval: '5 minutes',
        error: 'Données par défaut - Erreur API'
      }
    };
  }
};

export default supervisorDashboardService;