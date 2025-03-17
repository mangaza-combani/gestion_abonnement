/**
 * Données factices pour les agences
 */
export const mockAgencies = [
    {
      id: 1,
      name: "Agence Paris",
      email: "contact@agenceparis.com",
      address: "123 Rue de Paris, 75001 Paris",
      phone: "01 23 45 67 89",
      status: "active",
      revenueTotal: 500000,
      commissionRate: 15.8,
      subscriptionPrice: 19,
      balance: 45000,
      pendingPayment: 3500,
      activeLines: 175,
      debtLines: 8,
      debtAmount: 133,
      collaborators: [
        { id: 1, name: "Jean Dupont", email: "jean@agenceparis.com", role: "Manager" },
        { id: 2, name: "Marie Durand", email: "marie@agenceparis.com", role: "Assistant" }
      ],
      clients: [
        { id: 101, name: "TSINGONI", phone: "0253114152", debt: 0 },
        { id: 102, name: "MANGAZA COMBANI", phone: "1862136542", debt: 133 }
      ]
    },
    {
      id: 2,
      name: "Agence Lyon",
      email: "contact@agencelyon.com",
      address: "456 Rue de Lyon, 69001 Lyon",
      phone: "04 56 78 90 12",
      status: "active",
      revenueTotal: 320000,
      commissionRate: 15.8,
      subscriptionPrice: 19,
      balance: 28000,
      pendingPayment: 0,
      activeLines: 95,
      debtLines: 3,
      debtAmount: 57,
      collaborators: [
        { id: 3, name: "Pierre Martin", email: "pierre@agencelyon.com", role: "Manager" }
      ],
      clients: [
        { id: 103, name: "Client Lyon 1", phone: "0456789012", debt: 19 },
        { id: 104, name: "Client Lyon 2", phone: "0456789013", debt: 38 }
      ]
    },
    {
      id: 3,
      name: "Agence Marseille",
      email: "contact@agencemarseille.com",
      address: "789 Rue de Marseille, 13001 Marseille",
      phone: "04 91 23 45 67",
      status: "inactive",
      revenueTotal: 150000,
      commissionRate: 15.8,
      subscriptionPrice: 19,
      balance: 15000,
      pendingPayment: 0,
      activeLines: 42,
      debtLines: 12,
      debtAmount: 228,
      collaborators: [
        { id: 4, name: "Sophie Blanc", email: "sophie@agencemarseille.com", role: "Manager" },
        { id: 5, name: "Lucas Noir", email: "lucas@agencemarseille.com", role: "Assistant" }
      ],
      clients: [
        { id: 105, name: "Client Marseille 1", phone: "0491234567", debt: 57 },
        { id: 106, name: "Client Marseille 2", phone: "0491234568", debt: 171 }
      ]
    }
  ];
  
  /**
   * Fonctions utilitaires pour manipuler les données mockées
   */
  export const mockAgencyUtils = {
    /**
     * Ajouter une agence
     * @param {Object} newAgency - Nouvelle agence à ajouter
     * @returns {Object} - Agence ajoutée avec ID généré
     */
    addAgency: (newAgency) => {
      const newId = Math.max(...mockAgencies.map(a => a.id)) + 1;
      const agencyWithDefaults = {
        ...newAgency,
        id: newId,
        status: 'active',
        revenueTotal: 0,
        balance: 0,
        pendingPayment: 0,
        activeLines: 0,
        debtLines: 0,
        debtAmount: 0,
        collaborators: [],
        clients: []
      };
      mockAgencies.push(agencyWithDefaults);
      return agencyWithDefaults;
    },
  
    /**
     * Mettre à jour une agence
     * @param {number} id - ID de l'agence à mettre à jour
     * @param {Object} updatedData - Données à mettre à jour
     * @returns {Object|null} - Agence mise à jour ou null si non trouvée
     */
    updateAgency: (id, updatedData) => {
      const index = mockAgencies.findIndex(a => a.id === id);
      if (index === -1) return null;
      
      const updatedAgency = { ...mockAgencies[index], ...updatedData };
      mockAgencies[index] = updatedAgency;
      return updatedAgency;
    },
  
    /**
     * Changer le statut d'une agence
     * @param {number} id - ID de l'agence
     * @returns {Object|null} - Agence mise à jour ou null si non trouvée
     */
    toggleAgencyStatus: (id) => {
      const index = mockAgencies.findIndex(a => a.id === id);
      if (index === -1) return null;
      
      const newStatus = mockAgencies[index].status === 'active' ? 'inactive' : 'active';
      mockAgencies[index] = { ...mockAgencies[index], status: newStatus };
      return mockAgencies[index];
    },
  
    /**
     * Traiter un paiement pour une agence
     * @param {number} id - ID de l'agence
     * @param {Object} paymentData - Données du paiement
     * @returns {Object|null} - Agence mise à jour ou null si non trouvée
     */
    processPayment: (id, paymentData) => {
      const index = mockAgencies.findIndex(a => a.id === id);
      if (index === -1) return null;
      
      const paymentAmount = parseFloat(paymentData.amount);
      const updatedAgency = {
        ...mockAgencies[index],
        balance: mockAgencies[index].balance - paymentAmount,
        pendingPayment: Math.max(0, mockAgencies[index].pendingPayment - paymentAmount)
      };
      
      mockAgencies[index] = updatedAgency;
      return updatedAgency;
    }
  };