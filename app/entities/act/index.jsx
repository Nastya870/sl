import React from 'react';
import {
  IconFileCheck,
  IconUser,
  IconBuilding,
  IconPencil,
  IconRefresh,
  IconCurrencyRubel
} from '@tabler/icons-react';

const colors = {
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  primaryDark: '#3730A3',
  green: '#10B981',
  greenLight: '#D1FAE5',
  greenDark: '#059669',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  purple: '#8B5CF6',
  purpleLight: '#EDE9FE',
};

export const getActTypeLabel = (actType) => {
  return actType === 'client' ? 'Заказчик' : 'Специалист';
};

export const getActTypeIcon = (actType) => {
  return actType === 'client' ? <IconBuilding size={14} /> : <IconUser size={14} />;
};

export const getActTypeStyles = (actType) => {
  if (actType === 'client') {
    return {
      bgcolor: colors.primaryLight,
      color: colors.primary,
      borderColor: colors.primary
    };
  }
  return {
    bgcolor: colors.purpleLight,
    color: colors.purple,
    borderColor: colors.purple
  };
};

export const getStatusLabel = (status) => {
  const statusLabels = {
    draft: 'Черновик',
    pending: 'На согласовании',
    approved: 'Согласован',
    paid: 'Оплачен'
  };
  return statusLabels[status] || status;
};

export const getStatusStyles = (status) => {
  const styles = {
    draft: { bgcolor: '#F3F4F6', color: '#6B7280', icon: <IconPencil size={14} /> },
    pending: { bgcolor: colors.warningLight, color: '#92400E', icon: <IconRefresh size={14} /> },
    approved: { bgcolor: colors.greenLight, color: colors.greenDark, icon: <IconFileCheck size={14} /> },
    paid: { bgcolor: colors.primaryLight, color: colors.primary, icon: <IconCurrencyRubel size={14} /> }
  };
  return styles[status] || styles.draft;
};
