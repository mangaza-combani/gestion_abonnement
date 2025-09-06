import jsPDF from 'jspdf';
import 'jspdf-autotable';

export class InvoiceService {
  constructor() {
    this.companySettings = this.getCompanySettings();
  }

  getCompanySettings() {
    const saved = localStorage.getItem('invoiceSettings');
    return saved ? JSON.parse(saved) : {
      companyName: 'UWEZO TELECOM',
      address: '123 Avenue de la République',
      city: 'Moroni',
      postalCode: '97600',
      country: 'Comores',
      phone: '+269 773 12 34',
      email: 'contact@uwezo.com',
      website: 'www.uwezo.com',
      siret: '12345678901234',
      tva: 'FR12345678901',
      logo: null
    };
  }

  generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-4);
    return `INV-${year}${month}${day}-${timestamp}`;
  }

  async calculateInvoiceData(client, period) {
    // Récupérer les vraies données depuis l'API si disponible
    const invoiceDataFromAPI = await this.fetchRealInvoiceData(client.id, period);
    
    if (invoiceDataFromAPI) {
      return this.formatAPIInvoiceData(invoiceDataFromAPI, period);
    }
    
    // Fallback sur les calculs simulés
    const baseAmount = this.getClientBaseAmount(client);
    const currentDate = new Date();
    
    // Calcul des arriérés avec prorata
    const arrearsData = this.calculateArrearsWithProrata(client, baseAmount);
    
    // Calcul des avances avec prorata
    const advancesData = this.calculateAdvancesWithProrata(client, baseAmount);
    
    // Calcul du prorata pour la période courante
    const prorataData = this.calculateCurrentPeriodProrata(client, period, baseAmount);

    // Services facturés pour la période
    const services = [
      {
        description: 'Abonnement téléphonique mobile',
        period: period || 'Décembre 2024',
        quantity: 1,
        unitPrice: baseAmount,
        total: baseAmount
      }
    ];

    // Si le client a plusieurs lignes
    if (client.additionalLines && client.additionalLines.length > 0) {
      client.additionalLines.forEach((line, index) => {
        services.push({
          description: `Ligne supplémentaire ${line.phoneNumber}`,
          period: period || 'Décembre 2024',
          quantity: 1,
          unitPrice: baseAmount * 0.8, // Réduction pour lignes supplémentaires
          total: baseAmount * 0.8
        });
      });
    }

    const subtotal = services.reduce((sum, service) => sum + service.total, 0);
    const totalWithArrears = subtotal + arrearsData.total;
    const finalTotal = totalWithArrears - advancesData.total;

    return {
      services,
      subtotal,
      arrears: arrearsData.total,
      arrearsDetails: arrearsData.details,
      advances: advancesData.total,
      advancesDetails: advancesData.details,
      totalWithArrears,
      finalTotal,
      invoiceNumber: this.generateInvoiceNumber(),
      invoiceDate: currentDate.toLocaleDateString('fr-FR'),
      dueDate: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
    };
  }

  async generateInvoicePDF(client, period) {
    const invoiceData = this.calculateInvoiceData(client, period);
    const pdf = new jsPDF();
    
    // Configuration des couleurs
    const primaryColor = [33, 150, 243]; // Bleu
    const grayColor = [128, 128, 128];
    const redColor = [244, 67, 54];
    const greenColor = [76, 175, 80];

    let currentY = 20;

    // En-tête avec logo si disponible
    if (this.companySettings.logo) {
      try {
        pdf.addImage(this.companySettings.logo, 'PNG', 20, currentY, 40, 30);
        currentY += 35;
      } catch (error) {
        console.warn('Erreur lors de l\'ajout du logo:', error);
      }
    }

    // Informations entreprise
    pdf.setFontSize(20);
    pdf.setTextColor(...primaryColor);
    pdf.text(this.companySettings.companyName, 20, currentY);
    
    pdf.setFontSize(10);
    pdf.setTextColor(...grayColor);
    currentY += 10;
    pdf.text(this.companySettings.address, 20, currentY);
    currentY += 5;
    pdf.text(`${this.companySettings.city} ${this.companySettings.postalCode}`, 20, currentY);
    currentY += 5;
    pdf.text(this.companySettings.country, 20, currentY);
    currentY += 8;
    pdf.text(`Tél: ${this.companySettings.phone}`, 20, currentY);
    currentY += 5;
    pdf.text(`Email: ${this.companySettings.email}`, 20, currentY);
    
    // Titre facture
    pdf.setFontSize(24);
    pdf.setTextColor(...primaryColor);
    pdf.text('FACTURE', 150, 30);
    
    // Numéro et dates
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`N° ${invoiceData.invoiceNumber}`, 150, 45);
    pdf.text(`Date: ${invoiceData.invoiceDate}`, 150, 55);
    pdf.text(`Échéance: ${invoiceData.dueDate}`, 150, 65);

    currentY = 80;

    // Informations client
    pdf.setFontSize(12);
    pdf.setTextColor(...primaryColor);
    pdf.text('FACTURÉ À:', 20, currentY);
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    currentY += 10;
    pdf.text(`${client.user.firstname} ${client.user.lastname}`, 20, currentY);
    currentY += 5;
    pdf.text(`${client.user.email}`, 20, currentY);
    currentY += 5;
    pdf.text(`Tél: ${client.user.phoneNumber || client.phoneNumber || 'N/A'}`, 20, currentY);
    
    if (client.user.city) {
      currentY += 5;
      pdf.text(`${client.user.city}`, 20, currentY);
    }

    currentY += 20;

    // Tableau des services
    const tableData = invoiceData.services.map(service => [
      service.description,
      service.period,
      service.quantity.toString(),
      `${service.unitPrice.toFixed(2)}€`,
      `${service.total.toFixed(2)}€`
    ]);

    pdf.autoTable({
      startY: currentY,
      head: [['Service', 'Période', 'Qté', 'Prix unitaire', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 5
      }
    });

    currentY = pdf.lastAutoTable.finalY + 20;

    // Section arriérés si applicable
    if (invoiceData.arrears > 0) {
      pdf.setFontSize(12);
      pdf.setTextColor(...redColor);
      pdf.text('ARRIÉRÉS', 20, currentY);
      
      currentY += 10;
      
      const arrearsData = invoiceData.arrearsDetails.map(arrear => [
        arrear.period,
        `${arrear.amount.toFixed(2)}€`
      ]);

      pdf.autoTable({
        startY: currentY,
        head: [['Période impayée', 'Montant']],
        body: arrearsData,
        theme: 'grid',
        headStyles: {
          fillColor: redColor,
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 5
        },
        margin: { left: 20, right: 120 }
      });

      currentY = pdf.lastAutoTable.finalY + 15;
    }

    // Section avances si applicable
    if (invoiceData.advances > 0) {
      pdf.setFontSize(12);
      pdf.setTextColor(...greenColor);
      pdf.text('AVANCES', 20, currentY);
      
      currentY += 10;
      
      const advancesData = invoiceData.advancesDetails.map(advance => [
        advance.period,
        advance.note || '',
        `-${advance.amount.toFixed(2)}€`
      ]);

      pdf.autoTable({
        startY: currentY,
        head: [['Période', 'Note', 'Montant']],
        body: advancesData,
        theme: 'grid',
        headStyles: {
          fillColor: greenColor,
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 5
        },
        margin: { left: 20, right: 120 }
      });

      currentY = pdf.lastAutoTable.finalY + 15;
    }

    // Récapitulatif des totaux
    const totalsY = Math.max(currentY, 200);
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    
    // Sous-total
    pdf.text('Sous-total services:', 120, totalsY);
    pdf.text(`${invoiceData.subtotal.toFixed(2)}€`, 180, totalsY);
    
    // Arriérés
    if (invoiceData.arrears > 0) {
      pdf.setTextColor(...redColor);
      pdf.text('+ Arriérés:', 120, totalsY + 10);
      pdf.text(`${invoiceData.arrears.toFixed(2)}€`, 180, totalsY + 10);
    }
    
    // Avances
    if (invoiceData.advances > 0) {
      pdf.setTextColor(...greenColor);
      pdf.text('- Avances:', 120, totalsY + (invoiceData.arrears > 0 ? 20 : 10));
      pdf.text(`${invoiceData.advances.toFixed(2)}€`, 180, totalsY + (invoiceData.arrears > 0 ? 20 : 10));
    }

    // Total final
    pdf.setFontSize(12);
    pdf.setTextColor(...primaryColor);
    pdf.setFont(undefined, 'bold');
    const finalY = totalsY + (invoiceData.arrears > 0 ? 30 : 20) + (invoiceData.advances > 0 ? 10 : 0);
    pdf.text('TOTAL À PAYER:', 120, finalY);
    pdf.text(`${invoiceData.finalTotal.toFixed(2)}€`, 180, finalY);

    // Pied de page
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(...grayColor);
    pdf.text(`SIRET: ${this.companySettings.siret} | TVA: ${this.companySettings.tva}`, 20, 280);
    
    // Conditions de paiement
    pdf.text('Paiement par virement bancaire ou espèces. Règlement à 30 jours.', 20, 290);

    return {
      pdf,
      invoiceData,
      filename: `facture-${client.user.lastname}-${invoiceData.invoiceNumber}.pdf`
    };
  }

  async downloadInvoice(client, period) {
    const { pdf, filename } = await this.generateInvoicePDF(client, period);
    pdf.save(filename);
  }

  async previewInvoice(client, period) {
    const { pdf } = await this.generateInvoicePDF(client, period);
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  }

  // Méthode pour envoyer la facture par email (à implémenter plus tard)
  async sendInvoiceByEmail(client, period, emailOptions = {}) {
    const { pdf, invoiceData, filename } = await this.generateInvoicePDF(client, period);
    
    // Ici on implémenterait l'envoi par email via une API
    console.log('Envoi de facture par email:', {
      client: client.user.email,
      filename,
      invoiceNumber: invoiceData.invoiceNumber,
      amount: invoiceData.finalTotal
    });
    
    // Retourner les données pour traitement ultérieur
    return {
      pdfBlob: pdf.output('blob'),
      invoiceData,
      filename
    };
  }

  // Nouvelles méthodes pour les calculs avec prorata

  async fetchRealInvoiceData(clientId, period) {
    try {
      // Tenter de récupérer les données depuis l'API
      const response = await fetch(`/api/line-payments/client/${clientId}/period/${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.warn('Impossible de récupérer les données API, utilisation des données simulées');
      return null;
    }
  }

  formatAPIInvoiceData(apiData, period) {
    return {
      services: apiData.services || [],
      subtotal: apiData.subtotal || 0,
      arrears: apiData.arrears?.total || 0,
      arrearsDetails: apiData.arrears?.details || [],
      advances: apiData.advances?.total || 0,
      advancesDetails: apiData.advances?.details || [],
      prorata: apiData.prorata || null,
      totalWithArrears: apiData.totalWithArrears || 0,
      finalTotal: apiData.finalTotal || 0,
      invoiceNumber: apiData.invoiceNumber || this.generateInvoiceNumber(),
      invoiceDate: new Date().toLocaleDateString('fr-FR'),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      isRealData: true
    };
  }

  getClientBaseAmount(client) {
    // Priorité : abonnement actuel > paramètre agence > défaut
    if (client.activeSubscription?.totalMonthlyPrice) {
      return client.activeSubscription.totalMonthlyPrice;
    }
    
    if (client.phoneSubscriptions && client.phoneSubscriptions.length > 0) {
      const subscription = client.phoneSubscriptions[0].subscription;
      return (subscription.price || 0) + (subscription.equipmentMonthlyFee || 0);
    }
    
    return client.agency?.prixAbonnement || 25.00;
  }

  calculateArrearsWithProrata(client, baseAmount) {
    let arrears = 0;
    let arrearsDetails = [];
    
    if (client.paymentStatus === 'OVERDUE') {
      // Simule des arriérés avec prorata possible
      const months = ['Octobre 2024', 'Novembre 2024'];
      months.forEach((month, index) => {
        // Premier mois peut avoir un prorata d'activation
        let monthlyAmount = baseAmount;
        let prorataNote = '';
        
        if (index === 0 && client.activationDate) {
          const activationDate = new Date(client.activationDate);
          const monthStart = new Date(2024, 9, 1); // Octobre 2024
          
          if (activationDate > monthStart) {
            const daysInMonth = 31;
            const dayOfActivation = activationDate.getDate();
            const remainingDays = daysInMonth - dayOfActivation + 1;
            
            monthlyAmount = (baseAmount * remainingDays) / daysInMonth;
            prorataNote = ` (prorata du ${dayOfActivation}/10 au 31/10)`;
          }
        }
        
        arrears += monthlyAmount;
        arrearsDetails.push({ 
          period: month, 
          amount: monthlyAmount,
          prorataNote,
          isProrata: prorataNote !== ''
        });
      });
      
    } else if (client.paymentStatus === 'PAST_DUE') {
      // 3 mois d'arriérés
      arrears = baseAmount * 3;
      arrearsDetails = [
        { period: 'Septembre 2024', amount: baseAmount },
        { period: 'Octobre 2024', amount: baseAmount },
        { period: 'Novembre 2024', amount: baseAmount }
      ];
    }

    return { total: arrears, details: arrearsDetails };
  }

  calculateAdvancesWithProrata(client, baseAmount) {
    let advances = 0;
    let advancesDetails = [];
    
    // Si le client est à jour et a payé en avance
    if (client.paymentStatus === 'UP_TO_DATE' && Math.random() > 0.7) {
      // Peut avoir payé le prochain mois en avance
      let advanceAmount = baseAmount;
      let prorataNote = '';
      
      // Si on est en fin de mois, l'avance pourrait être un prorata
      const currentDate = new Date();
      const currentDay = currentDate.getDate();
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      
      if (currentDay > 15) {
        // Prorata pour le mois suivant
        const remainingDays = daysInMonth - currentDay;
        advanceAmount = (baseAmount * remainingDays) / daysInMonth;
        prorataNote = ` (prorata anticipé ${remainingDays} jours)`;
      }
      
      advances = advanceAmount;
      advancesDetails = [
        { 
          period: 'Janvier 2025', 
          amount: advanceAmount, 
          note: `Paiement anticipé${prorataNote}`,
          isProrata: prorataNote !== ''
        }
      ];
    }

    return { total: advances, details: advancesDetails };
  }

  calculateCurrentPeriodProrata(client, period, baseAmount) {
    if (!client.activationDate) {
      return null;
    }

    const activationDate = new Date(client.activationDate);
    const periodDate = this.parsePeriodfromString(period);
    
    // Vérifier si l'activation a eu lieu dans la période facturée
    if (activationDate.getFullYear() === periodDate.year && 
        activationDate.getMonth() === periodDate.month) {
      
      const dayOfActivation = activationDate.getDate();
      const daysInMonth = new Date(periodDate.year, periodDate.month + 1, 0).getDate();
      const remainingDays = daysInMonth - dayOfActivation + 1;
      
      const prorataAmount = (baseAmount * remainingDays) / daysInMonth;
      
      return {
        isProrata: true,
        activationDay: dayOfActivation,
        totalDays: daysInMonth,
        billedDays: remainingDays,
        fullAmount: baseAmount,
        prorataAmount: prorataAmount,
        reason: `Activation le ${dayOfActivation}/${periodDate.month + 1}/${periodDate.year}`
      };
    }

    return null;
  }

  parsePeriodfromString(period) {
    // Parse "Décembre 2024" => { month: 11, year: 2024 }
    const months = {
      'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3,
      'mai': 4, 'juin': 5, 'juillet': 6, 'août': 7,
      'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
    };
    
    const [monthName, year] = period.toLowerCase().split(' ');
    return {
      month: months[monthName] || 0,
      year: parseInt(year) || new Date().getFullYear()
    };
  }
}

export default new InvoiceService();