import { useState, useEffect, useCallback } from 'react';
import supervisorDashboardService from '../services/supervisorDashboardService';

/**
 * Hook personnalisé pour gérer les données du dashboard superviseur
 * @param {Object} options - Options de configuration
 * @param {number} options.refreshInterval - Intervalle de refresh en millisecondes (défaut: 5min)
 * @param {boolean} options.autoRefresh - Activer le refresh automatique (défaut: true)
 * @param {boolean} options.includeAlerts - Inclure les alertes (défaut: true)
 * @returns {Object} État et fonctions pour le dashboard
 */
const useSupervisorDashboard = (options = {}) => {
  const {
    refreshInterval = 5 * 60 * 1000, // 5 minutes par défaut
    autoRefresh = true,
    includeAlerts = true
  } = options;

  // État local
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Charger les données du dashboard
   */
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Chargement dashboard superviseur...');

      const data = await supervisorDashboardService.getDashboardWithAlerts(includeAlerts);

      setDashboardData(data.dashboard);
      setAlerts(data.alerts);
      setLastUpdated(data.lastUpdated);

      if (data.error) {
        setError(data.error);
      }

      console.log('✅ Dashboard chargé avec succès');
    } catch (err) {
      console.error('❌ Erreur chargement dashboard:', err);
      setError(err.message || 'Erreur de chargement');

      // Utiliser les données par défaut
      const defaultData = supervisorDashboardService.getDefaultDashboardData();
      setDashboardData(defaultData);
    } finally {
      setLoading(false);
    }
  }, [includeAlerts]);

  /**
   * Rafraîchir uniquement les alertes
   */
  const refreshAlerts = useCallback(async () => {
    try {
      console.log('🚨 Rafraîchissement alertes...');
      const alertsData = await supervisorDashboardService.getAlerts();
      setAlerts(alertsData);
      console.log('✅ Alertes rafraîchies');
    } catch (err) {
      console.error('❌ Erreur rafraîchissement alertes:', err);
    }
  }, []);

  /**
   * Forcer un refresh complet
   */
  const forceRefresh = useCallback(() => {
    console.log('🔄 Refresh forcé du dashboard');
    loadDashboard();
  }, [loadDashboard]);

  // Chargement initial
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    console.log(`⏰ Auto-refresh activé: ${refreshInterval / 1000}s`);

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh dashboard...');
      loadDashboard();
    }, refreshInterval);

    return () => {
      clearInterval(interval);
      console.log('⏰ Auto-refresh désactivé');
    };
  }, [autoRefresh, refreshInterval, loadDashboard]);

  // Calculer des métriques dérivées
  const metrics = dashboardData ? {
    // Pourcentage de lignes actives
    activePercentage: dashboardData.overview.totalLines > 0
      ? Math.round((dashboardData.lines.active / dashboardData.overview.totalLines) * 100)
      : 0,

    // Pourcentage de lignes nécessitant une action
    actionNeededPercentage: dashboardData.overview.totalLines > 0
      ? Math.round(((dashboardData.lines.toActivate + dashboardData.lines.blocked + dashboardData.lines.pendingPayment) / dashboardData.overview.totalLines) * 100)
      : 0,

    // Taux de recouvrement estimé
    recoveryRate: dashboardData.finances.monthlyRevenue > 0 && dashboardData.finances.totalOverdueAmount > 0
      ? Math.round((dashboardData.finances.monthlyRevenue / (dashboardData.finances.monthlyRevenue + dashboardData.finances.totalOverdueAmount)) * 100)
      : 100,

    // Alertes critiques
    criticalAlertsCount: alerts?.alerts?.filter(alert => alert.priority === 'HIGH')?.length || 0,

    // Santé générale du système (0-100)
    systemHealth: dashboardData.overview.totalLines > 0
      ? Math.round((
          (dashboardData.lines.active / dashboardData.overview.totalLines) * 40 +
          (dashboardData.operations.simStock > 10 ? 30 : dashboardData.operations.simStock * 3) +
          (dashboardData.finances.totalOverdueAmount < 1000 ? 30 : Math.max(0, 30 - dashboardData.finances.totalOverdueAmount / 100))
        ))
      : 0
  } : null;

  return {
    // Données
    dashboardData,
    alerts,
    metrics,

    // État
    loading,
    error,
    lastUpdated,

    // Actions
    refresh: forceRefresh,
    refreshAlerts,

    // Informations utiles
    isStale: lastUpdated ? (Date.now() - new Date(lastUpdated).getTime()) > refreshInterval : false
  };
};

export default useSupervisorDashboard;