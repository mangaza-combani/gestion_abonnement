export const CLIENT_STATUSES = {
    ALL: 'TOUS',
    UP_TO_DATE: 'A JOUR',
    OVERDUE: "EN RETARD",
    SUSPENDED: 'DETTE',
    TERMINATED: 'RÉSILIÉ',
    NEEDS_TO_BE_ACTIVATED: 'A ACTIVER',
    NEEDS_TO_BE_DEACTIVATED: 'A DESACTIVER',
    NEEDS_TO_BE_REPLACED: 'A REMPLACER',
    NEEDS_TO_BE_ORDERED: 'A COMMANDER',
    TEMPORARILY_ASSIGNED: 'ATTRIBUÉ TEMPORAIREMENT',
    ACTIVE: 'ACTIF',
    INACTIVE: 'INACTIF',
    CANCELLED: 'ANNULÉ',
    UNATTRIBUTED: 'NON ATTRIBUÉ',
    REIMBURSED: 'REMBOURSÉ',
    REFUNDED: 'REMBOURSEMENT',
    DISPUTED: 'CONTESTÉ',
    CHARGEBACK: 'CHARGEBACK',
    FRAUDULENT: 'FRAUDULEUX',
  };
  
  export const TAB_TYPES = {
    LIST: 'ALL_LINES', // Liste de toutes les lignes
    TO_BLOCK: 'TO_BLOCK', // Lignes en dette (> 1 mois impayé)
    OVERDUE: 'OVERDUE', // Lignes en retard de paiement (< 1 mois)
    TO_ORDER: 'NEEDS_TO_BE_ORDERED',
    TO_ACTIVATE: 'NEEDS_TO_BE_ACTIVATED'
  };

  export const PAYMENT_STATUS = {
        "PAID" : "PAID", // À jour dans les paiements
        "OVERDUE" : "OVERDUE", // En retard mais toléré (avant le 28)
        "TO_BLOCK" : "TO_BLOCK", // En dette, doit être bloqué le 28
        "BLOCKED_NONPAYMENT" : "BLOCKED_NONPAYMENT", // Bloqué pour impayé
        "PENDING_PAYMENT" : "PENDING_PAYMENT", // En attente de paiement (activation)
        "UNATTRIBUTED" : "UNATTRIBUTED",
        "CANCELLED": "CANCELLED",
        "REIMBURSED" : "REIMBURSED",
        "REFUNDED" : "REFUNDED",
        "DISPUTED" : "DISPUTED",
        "CHARGEBACK" : "CHARGEBACK",
        "FRAUDULENT": "FRAUDULENT",
  }

  export const PHONE_STATUS = {
          "NEEDS_TO_BE_ACTIVATED": "NEEDS_TO_BE_ACTIVATED",
          "NEEDS_TO_BE_DEACTIVATED": "NEEDS_TO_BE_DEACTIVATED",
          "NEEDS_TO_BE_REPLACED": "NEEDS_TO_BE_REPLACED",
          "NEEDS_TO_BE_ORDERED": "NEEDS_TO_BE_ORDERED",
          "NEEDS_TO_BE_BLOCKED": "NEEDS_TO_BE_BLOCKED", // ✅ NOUVEAU: En attente de blocage superviseur
          "RESERVED_EXISTING_LINE": "RESERVED_EXISTING_LINE",
          "RESERVED_NEW_LINE": "RESERVED_NEW_LINE",
          "TEMPORARILY_ASSIGNED": "TEMPORARILY_ASSIGNED",
          "NEEDS_NEW_ACCOUNT": "NEEDS_NEW_ACCOUNT",
          "ACTIVE": "ACTIVE",
          "INACTIVE": "INACTIVE",
          "SUSPENDED": "SUSPENDED",
          "BLOCKED": "BLOCKED", // Bloqué (impayé, demande client, etc.)
          "PAUSED": "PAUSED", // En pause (demande client)
          "TERMINATED": "TERMINATED", // Résilié
  }
  
  export const ORDER_FILTERS = {
    NEW_CLIENT: 'NOUVEAU CLIENT',
    SIM_ORDER: 'COMMANDE CARTE SIM'
  };