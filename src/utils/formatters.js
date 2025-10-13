/**
 * Utilitaires de formatage pour l'affichage
 */

/**
 * Formate un montant en euros
 * @param {number} amount - Montant à formater
 * @returns {string} Montant formaté avec le symbole €
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0,00 €';
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formate une date pour l'affichage
 * @param {string|Date} date - Date à formater
 * @returns {string} Date formatée
 */
export const formatDate = (date) => {
  if (!date) return '';

  try {
    const dateObj = new Date(date);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj);
  } catch (error) {
    console.error('Erreur formatage date:', error);
    return '';
  }
};

/**
 * Formate une date avec heure pour l'affichage
 * @param {string|Date} date - Date à formater
 * @returns {string} Date formatée avec heure
 */
export const formatDateTime = (date) => {
  if (!date) return '';

  try {
    const dateObj = new Date(date);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch (error) {
    console.error('Erreur formatage datetime:', error);
    return '';
  }
};

/**
 * Formate un numéro de téléphone
 * @param {string} phone - Numéro à formater
 * @returns {string} Numéro formaté
 */
export const formatPhone = (phone) => {
  if (!phone) return '';

  // Supprimer tous les espaces et caractères spéciaux
  const cleaned = phone.replace(/\D/g, '');

  // Format français : XX XX XX XX XX
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }

  return phone; // Retourner tel quel si format non standard
};

/**
 * Formate un pourcentage
 * @param {number} value - Valeur à formater (0.15 = 15%)
 * @returns {string} Pourcentage formaté
 */
export const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formate un nombre
 * @param {number} number - Nombre à formater
 * @returns {string} Nombre formaté
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }

  return new Intl.NumberFormat('fr-FR').format(number);
};