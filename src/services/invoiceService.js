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

  calculateInvoiceData(client, period) {
    const baseAmount = client.agency?.prixAbonnement || 25.00;
    const currentDate = new Date();
    
    // Calcul des arriérés (simulation basée sur le statut du client)
    let arrears = 0;
    let arrearsDetails = [];
    
    if (client.paymentStatus === 'OVERDUE') {
      // Simule 2 mois d'arriérés
      arrears = baseAmount * 2;
      arrearsDetails = [
        { period: 'Octobre 2024', amount: baseAmount },
        { period: 'Novembre 2024', amount: baseAmount }
      ];
    } else if (client.paymentStatus === 'PAST_DUE') {
      // Simule 3 mois d'arriérés
      arrears = baseAmount * 3;
      arrearsDetails = [
        { period: 'Septembre 2024', amount: baseAmount },
        { period: 'Octobre 2024', amount: baseAmount },
        { period: 'Novembre 2024', amount: baseAmount }
      ];
    }

    // Calcul des avances (simulation)
    let advances = 0;
    let advancesDetails = [];
    
    // Si le client est à jour, il peut avoir payé en avance
    if (client.paymentStatus === 'UP_TO_DATE' && Math.random() > 0.7) {
      advances = baseAmount;
      advancesDetails = [
        { period: 'Janvier 2025', amount: baseAmount, note: 'Paiement anticipé' }
      ];
    }

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
    const totalWithArrears = subtotal + arrears;
    const finalTotal = totalWithArrears - advances;

    return {
      services,
      subtotal,
      arrears,
      arrearsDetails,
      advances,
      advancesDetails,
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
}

export default new InvoiceService();