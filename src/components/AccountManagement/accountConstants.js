// Constants pour la gestion des comptes rattachés

export const ACCOUNT_STATUSES = {
    ALL: 'TOUS',
    ACTIVE: 'ACTIF',
    INACTIVE: 'INACTIF',
    BLOCKED: 'BLOQUÉ'
  };
  
  export const LINE_STATUSES = {
    ACTIVE: 'ACTIF',
    BLOCKED: 'BLOQUÉ',
    PAUSED: 'PAUSE',
    TERMINATED: 'RÉSILIÉ',
    UNASSIGNED: 'NON ATTRIBUÉ'
  };
  
  export const PAYMENT_STATUSES = {
    UPTODATE: 'A JOUR',
    LATE: 'EN RETARD',
    DEBT: 'DETTE',
    TERMINATED: 'RÉSILIÉ'
  };
  
  // Données de test pour les comptes rattachés
  export const mockAccounts = [
    {
      id: 1,
      name: 'ABDOU.CELINE',
      login: 'abdouceline',
      email: 'abdou.celine@email.com',
      agency: 'Agence Principale',
      agencyId: 1,
      status: 'ACTIF',
      cardLastFour: '5564',
      cardExpiry: '05/26',
      linesCount: 2,
      lines: [
        {
          id: 101,
          phoneNumber: '06 35 10 51 53',
          clientName: 'ABDOU Celine',
          status: 'ACTIF',
          paymentStatus: 'A JOUR'
        },
        {
          id: 102,
          phoneNumber: '06 35 10 51 54',
          clientName: 'ABDOU Celine 2',
          status: 'BLOQUÉ',
          paymentStatus: 'DETTE'
        }
      ]
    },
    {
      id: 2,
      name: 'TSINGONI3',
      login: 's.marie',
      email: 'marie@yahoo.fr',
      agency: 'Agence Secondaire',
      agencyId: 2,
      status: 'ACTIF',
      cardLastFour: '1234',
      cardExpiry: '12/25',
      linesCount: 5,
      lines: [
        {
          id: 201,
          phoneNumber: '06 35 10 51 55',
          clientName: 'MARIE Céline',
          status: 'ACTIF',
          paymentStatus: 'A JOUR'
        },
        {
          id: 202,
          phoneNumber: '06 35 10 51 56',
          clientName: 'TANTE Céline',
          status: 'ACTIF',
          paymentStatus: 'A JOUR'
        },
        {
          id: 203,
          phoneNumber: '06 35 10 51 57',
          clientName: 'FILLE Céline',
          status: 'ACTIF',
          paymentStatus: 'A JOUR'
        },
        {
          id: 204,
          phoneNumber: '06 35 10 51 58',
          clientName: 'GARCON Céline',
          status: 'ACTIF',
          paymentStatus: 'A JOUR'
        },
        {
          id: 205,
          phoneNumber: '06 35 10 51 59',
          clientName: 'AMIS Céline',
          status: 'RÉSILIÉ',
          paymentStatus: 'RÉSILIÉ'
        }
      ]
    },
    {
      id: 3,
      name: 'YOUSS.DAV',
      login: 'david99',
      email: 'david99@gmail.com',
      agency: 'Agence Principale',
      agencyId: 1,
      status: 'INACTIF',
      cardLastFour: '3322',
      cardExpiry: '09/26',
      linesCount: 1,
      lines: [
        {
          id: 301,
          phoneNumber: '06 35 10 51 60',
          clientName: 'DAVID Youssouf',
          status: 'PAUSE',
          paymentStatus: 'EN RETARD'
        }
      ]
    },
    {
      id: 4,
      name: 'COMBANI01',
      login: 'soumaila',
      email: 'soumaila@yahoo.fr',
      agency: 'Agence Combani',
      agencyId: 3,
      status: 'BLOQUÉ',
      cardLastFour: '7788',
      cardExpiry: '10/24',
      linesCount: 2,
      lines: [
        {
          id: 401,
          phoneNumber: '06 35 10 51 61',
          clientName: 'SOUMAILA Ahmed',
          status: 'BLOQUÉ',
          paymentStatus: 'DETTE'
        },
        {
          id: 402,
          phoneNumber: '06 35 10 51 62',
          clientName: 'SOUMAILA Fatima',
          status: 'BLOQUÉ',
          paymentStatus: 'DETTE'
        }
      ]
    },
    {
      id: 5,
      name: 'TSINGONI5',
      login: 'kass.soil',
      email: 'soilih@gmail.com',
      agency: 'Agence Secondaire',
      agencyId: 2,
      status: 'ACTIF',
      cardLastFour: '9900',
      cardExpiry: '03/25',
      linesCount: 0,
      lines: []
    }
  ];
  
  // Données de test pour les agences
  export const mockAgencies = [
    { id: 1, name: 'Agence Principale' },
    { id: 2, name: 'Agence Secondaire' },
    { id: 3, name: 'Agence Combani' }
  ];
  
  // Données de test pour les clients
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