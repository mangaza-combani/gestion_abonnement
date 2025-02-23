# Gestion d'Abonnements Téléphoniques SFR

Une plateforme web de gestion complète pour la revente d'abonnements Red by SFR, développée avec React et Material-UI.

## 📱 Présentation

Cette application permet la gestion complète du cycle de vie des abonnements téléphoniques, de la commande de cartes SIM à la facturation client, en passant par le suivi des commissions. Elle est structurée en trois niveaux d'accès :
- Superviseur
- Agences
- Clients finaux

## 💰 Modèle économique

- Achat : Forfaits Red by SFR à 9.99€/mois
- Revente : 19€/mois aux clients finaux (paramétrable)
- Répartition : 16€ superviseur / 3€ agence (paramétrable)
- Volume : ~300 clients (maximum 5 numéros par compte Red by SFR)

## 🚀 Fonctionnalités principales

### Gestion des Clients
- Création et gestion des profils clients
- Attribution des cartes SIM
- Suivi des paiements
- Gestion des lignes multiples par client
- Filtrage et recherche avancée

### Gestion des Cartes SIM
- Suivi du stock en temps réel
- Traçabilité complète des cartes
- Gestion des commandes et réceptions
- Statuts multiples (stock, active, perdue/volée)
- Tableau de bord avec statistiques

### Gestion des Commissions
- Calcul automatique des commissions
- Système de demande de retrait
- Historique des transactions
- Validation des paiements
- Rapports détaillés

## 🛠 Technologies utilisées

- React
- Material-UI (MUI)
- Tailwind CSS
- Lucide React (icônes)
- Shadcn/ui (composants)

## 💻 Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/gestion-abonnements-sfr.git

# Installer les dépendances
cd gestion-abonnements-sfr
npm install

# Lancer l'application en mode développement
npm run dev
```

## 📋 Structure du projet

```
src/
├── components/
│   ├── clients/
│   │   ├── NewClientDialog.tsx
│   │   └── ModernClientsManagement.tsx
│   ├── sim/
│   │   └── SimManagement.tsx
│   └── commission/
│       └── CommissionWithdrawal.tsx
├── utils/
├── hooks/
└── pages/
```

## 🔐 Rôles et responsabilités

### Superviseur
- Création et configuration des agences
- Gestion des comptes Red by SFR
- Activation/blocage/désactivation des lignes
- Commande et suivi des cartes SIM
- Validation des commissions
- Attribution des réductions exceptionnelles

### Agences
- Création de nouveaux clients
- Gestion du stock de cartes SIM
- Facturation clients
- Encaissement
- Suivi des paiements
- Déclaration des commissions reçues

## 💳 Processus de facturation

### Nouvelle activation (exemple le 10 du mois)
- Base : 20 jours d'utilisation
- Client paie : 12.67€ (prorata) + 10€ (carte) = 22.67€
- Agence reçoit : 2€ (prorata) + 10€ (carte) = 12€
- Superviseur reçoit : 10.67€
- Coût SFR : 6.67€

### Mois normal
- Client paie : 19€
- Agence reçoit : 3€
- Superviseur reçoit : 16€
- Coût SFR : 9.99€

## 🔒 Points critiques de sécurité

- Suivi temps réel des paiements
- Gestion automatique des blocages de ligne
- Traçabilité des cartes SIM
- Protection des données sensibles
- Association sécurisée numéros/comptes SFR

## 📝 Licence

Ce projet est sous licence privée. Tous droits réservés.

## 🤝 Contact

Pour toute question ou support, veuillez contacter l'équipe de développement.
