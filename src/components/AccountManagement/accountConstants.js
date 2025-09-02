// Constants pour la gestion des comptes rattachés

export const ACCOUNT_STATUSES = {
  ALL: 'TOUS',
  ACTIVE: 'ACTIF',
  INACTIVE: 'INACTIF',
  BLOCKED: 'BLOQUÉ'
};

export const LINE_STATUSES = {
  NEEDS_TO_BE_ACTIVATED: "NEEDS_TO_BE_ACTIVATED",
  NEEDS_TO_BE_DEACTIVATE: "NEEDS_TO_BE_DEACTIVATED",
  NEEDS_TO_BE_REPLACED: "NEEDS_TO_BE_REPLACED",
  NEEDS_TO_BE_ORDERED: "NEEDS_TO_BE_ORDERED",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED"
};

export const PAYMENT_STATUSES = {
  UPTODATE: 'A JOUR',
  LATE: 'EN RETARD',
  DEBT: 'DETTE',
  TERMINATED: 'RÉSILIÉ',
  UNASSIGNED: 'NON ATTRIBUÉ'  // Statut de paiement pour les lignes non attribuées
};

export const CLIENT_TYPES = {
  ASSIGNED: 'ATTRIBUÉ',
  UNASSIGNED: 'NON ATTRIBUÉ'
};

// Motifs de résiliation
export const TERMINATION_REASONS = {
  NONPAYMENT: 'Impayé',
  CUSTOMER_REQUEST: 'Demande client',
  EXPIRED: 'Expiré'
};

// Format d'affichage pour les lignes non attribuées
export const UNASSIGNED_LINE_DISPLAY = {
  CLIENT_NAME: 'Non attribué',
  PAYMENT_STATUS: PAYMENT_STATUSES.UNASSIGNED
};

