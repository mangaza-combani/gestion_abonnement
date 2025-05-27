export const formatPaymentAndStatusToHumanReadable = (status) => {
       switch (status) {
                case 'UP_TO_DATE':
                        return 'À JOUR';
                case 'OVERDUE':
                        return 'EN RETARD';
                case 'PAST_DUE':
                        return 'DÉPASSÉ';
                case 'DISCONNECTED':
                        return "DÉCONNECTÉ";
                case 'UNATTRIBUTED':
                        return "NON ATTRIBUÉ";
                case 'CANCELLED':
                        return "ANNULÉ";
                case 'REIMBURSED':
                        return "REMBOURSÉ";
                case 'REFUNDED':
                        return "REMBOURSÉ";
                case 'DISPUTED':
                        return "CONTESTÉ";
                case 'CHARGEBACK':
                        return "RÉTROFACTURATION";
                case 'FRAUDULENT':
                        return "FRAUDULEUX";
                case 'NEEDS_TO_BE_ACTIVATED':
                        return "DOIT ÊTRE ACTIVÉ";
                case 'NEEDS_TO_BE_DEACTIVATED':
                        return "DOIT ÊTRE DÉSACTIVÉ";
                case 'NEEDS_TO_BE_REPLACED':
                        return "DOIT ÊTRE REMPLACÉ";
                case 'NEEDS_TO_BE_ORDERED':
                        return "DOIT ÊTRE COMMANDÉ";
                case 'ACTIVE':
                        return "ACTIF";
                case 'INACTIVE':
                        return "INACTIF";
                case 'SUSPENDED':
                        return "SUSPENDU";
                case 'ALL':
                        return "TOUS";
                case 'LATE':
                        return "EN RETARD";
                case 'DEBT':
                        return "DETTE";
                case 'PAUSED':
                        return "PAUSE";
                case 'TERMINATED':
                        return "RÉSILIÉ";
                case 'NEW_CLIENT':
                        return "NOUVEAU CLIENT";
        }
}

export const getKeyFromValue = (obj, value) => {
    return Object.keys(obj).find(key => obj[key] === value);
}