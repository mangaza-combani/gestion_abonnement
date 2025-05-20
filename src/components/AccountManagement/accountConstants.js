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

// Exemple de données de test mis à jour avec des motifs de résiliation et des dates
export const mockAccounts = [
  {
    id: 1,
    login: 'abdouceline',
    email: 'abdou.celine@email.com',
    password: 'PassABDOU123!',
    agency: 'Agence Principale',
    agencyId: 1,
    linesCount: 4,
    lines: [
      {
        id: 101,
        phoneNumber: '06 35 10 51 53',
        clientName: 'ABDOU Celine',
        status: LINE_STATUSES.ACTIVE,
        paymentStatus: PAYMENT_STATUSES.UPTODATE
      },
      {
        id: 102,
        phoneNumber: '06 35 10 51 54',
        clientName: 'ABDOU Celine 2',
        status: LINE_STATUSES.BLOCKED,
        paymentStatus: PAYMENT_STATUSES.DEBT
      },
      {
        id: 103,
        phoneNumber: '06 35 10 51 77',
        clientName: null,  // Ligne non attribuée
        status: LINE_STATUSES.UNASSIGNED,
        paymentStatus: PAYMENT_STATUSES.UNASSIGNED
      },
      {
        id: 104,
        phoneNumber: '06 35 10 51 78',
        clientName: 'ABDOU Omar',
        status: LINE_STATUSES.TERMINATED,
        paymentStatus: PAYMENT_STATUSES.TERMINATED,
        terminationReason: TERMINATION_REASONS.NONPAYMENT,
        terminationDate: '2024-01-15' // Moins d'un an
      }
    ]
  },
  {
    id: 2,
    login: 's.marie',
    email: 'marie@yahoo.fr',
    password: 'PassMARIE456!',
    agency: 'Agence Secondaire',
    agencyId: 2,
    linesCount: 6,
    lines: [
      {
        id: 201,
        phoneNumber: '06 35 10 51 55',
        clientName: 'MARIE Céline',
        status: LINE_STATUSES.ACTIVE,
        paymentStatus: PAYMENT_STATUSES.UPTODATE
      },
      {
        id: 202,
        phoneNumber: '06 35 10 51 56',
        clientName: 'TANTE Céline',
        status: LINE_STATUSES.ACTIVE,
        paymentStatus: PAYMENT_STATUSES.UPTODATE
      },
      {
        id: 203,
        phoneNumber: '06 35 10 51 57',
        clientName: 'FILLE Céline',
        status: LINE_STATUSES.ACTIVE,
        paymentStatus: PAYMENT_STATUSES.UPTODATE
      },
      {
        id: 204,
        phoneNumber: '06 35 10 51 58',
        clientName: null,  // Ligne non attribuée
        status: LINE_STATUSES.UNASSIGNED,
        paymentStatus: PAYMENT_STATUSES.UNASSIGNED
      },
      {
        id: 205,
        phoneNumber: '06 35 10 51 59',
        clientName: 'AMIS Céline',
        status: LINE_STATUSES.TERMINATED,
        paymentStatus: PAYMENT_STATUSES.TERMINATED,
        terminationReason: TERMINATION_REASONS.CUSTOMER_REQUEST,
        terminationDate: '2024-02-01' // Moins d'un an
      },
      {
        id: 206,
        phoneNumber: '06 35 10 51 60',
        clientName: 'COUSIN Céline',
        status: LINE_STATUSES.TERMINATED,
        paymentStatus: PAYMENT_STATUSES.TERMINATED,
        terminationReason: TERMINATION_REASONS.EXPIRED,
        terminationDate: '2022-01-15' // Plus d'un an
      }
    ]
  },
  {
    id: 3,
    login: 'david99',
    email: 'david99@gmail.com',
    password: 'PassDAVID789!',
    agency: 'Agence Principale',
    agencyId: 1,
    linesCount: 3,
    lines: [
      {
        id: 301,
        phoneNumber: '06 35 10 51 61',
        clientName: 'DAVID Youssouf',
        status: LINE_STATUSES.PAUSED,
        paymentStatus: PAYMENT_STATUSES.LATE
      },
      {
        id: 302,
        phoneNumber: '06 35 10 51 80',
        clientName: '',  // Ligne non attribuée (chaîne vide)
        status: LINE_STATUSES.UNASSIGNED,
        paymentStatus: PAYMENT_STATUSES.UNASSIGNED
      },
      {
        id: 303,
        phoneNumber: '06 35 10 51 62',
        clientName: 'DAVID Marie',
        status: LINE_STATUSES.TERMINATED,
        paymentStatus: PAYMENT_STATUSES.TERMINATED,
        terminationReason: TERMINATION_REASONS.NONPAYMENT,
        terminationDate: '2022-05-10' // Plus d'un an
      }
    ]
  },
  {
    id: 4,
    login: 'soumaila',
    email: 'soumaila@yahoo.fr',
    password: 'PassSOUM321!',
    agency: 'Agence Combani',
    agencyId: 3,
    linesCount: 5,
    lines: [
      {
        id: 401,
        phoneNumber: '06 35 10 51 63',
        clientName: 'SOUMAILA Ahmed',
        status: LINE_STATUSES.BLOCKED,
        paymentStatus: PAYMENT_STATUSES.DEBT
      },
      {
        id: 402,
        phoneNumber: '06 35 10 51 64',
        clientName: 'SOUMAILA Fatima',
        status: LINE_STATUSES.BLOCKED,
        paymentStatus: PAYMENT_STATUSES.DEBT
      },
      {
        id: 403,
        phoneNumber: '06 35 10 51 81',
        clientName: UNASSIGNED_LINE_DISPLAY.CLIENT_NAME,  // Ligne non attribuée (utilisant la constante)
        status: LINE_STATUSES.UNASSIGNED,
        paymentStatus: PAYMENT_STATUSES.UNASSIGNED
      },
      {
        id: 404,
        phoneNumber: '06 35 10 51 65',
        clientName: 'SOUMAILA Karim',
        status: LINE_STATUSES.TERMINATED,
        paymentStatus: PAYMENT_STATUSES.TERMINATED,
        terminationReason: TERMINATION_REASONS.NONPAYMENT,
        terminationDate: '2023-10-20' // Moins d'un an
      },
      {
        id: 405,
        phoneNumber: '06 35 10 51 66',
        clientName: 'SOUMAILA Sarah',
        status: LINE_STATUSES.TERMINATED,
        paymentStatus: PAYMENT_STATUSES.TERMINATED,
        terminationReason: TERMINATION_REASONS.NONPAYMENT,
        terminationDate: '2022-06-15' // Plus d'un an
      }
    ]
  },
  {
    id: 5,
    login: 'kass.soil',
    email: 'soilih@gmail.com',
    password: 'PassSOIL987!',
    agency: 'Agence Secondaire',
    agencyId: 2,
    linesCount: 2,
    lines: [
      {
        id: 501,
        phoneNumber: '06 35 10 51 85',
        clientName: null,  // Ligne non attribuée
        status: LINE_STATUSES.UNASSIGNED,
        paymentStatus: PAYMENT_STATUSES.UNASSIGNED
      },
      {
        id: 502,
        phoneNumber: '06 35 10 51 86',
        clientName: null,  // Ligne non attribuée
        status: LINE_STATUSES.UNASSIGNED,
        paymentStatus: PAYMENT_STATUSES.UNASSIGNED
      }
    ]
  }
];
  
// Autres constantes inchangées
export const mockAgencies = [
  { id: 1, name: 'Agence Principale' },
  { id: 2, name: 'Agence Secondaire' },
  { id: 3, name: 'Agence Combani' }
];
  
export const mockClients = [
  { id: 1, nom: 'ABDOU', prenom: 'Celine', telephone: '0639666363' },
  { id: 2, nom: 'ABDOU', prenom: 'Omar', telephone: '0634466363' },
  { id: 3, nom: 'SAID', prenom: 'Marie', telephone: '0634466364' },
  { id: 4, nom: 'YASSINE', prenom: 'David', telephone: '0634466778' },
  { id: 5, nom: 'MARTIN', prenom: 'Sophie', telephone: '0634466999' },
  { id: 6, nom: 'SOUMAILA', prenom: 'Ahmed', telephone: '0634466123' },
  { id: 7, nom: 'SOUMAILA', prenom: 'Fatima', telephone: '0634466124' },
  { id: 8, nom: 'MARIE', prenom: 'Céline', telephone: '0634466125' },
  { id: 9, nom: 'TANTE', prenom: 'Céline', telephone: '0634466126' },
  { id: 10, nom: 'FILLE', prenom: 'Céline', telephone: '0634466127' },
  { id: 11, nom: 'GARCON', prenom: 'Céline', telephone: '0634466128' },
  { id: 12, nom: 'AMIS', prenom: 'Céline', telephone: '0634466129' }
];