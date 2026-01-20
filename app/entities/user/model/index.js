
export const getRoleNames = (roles) => {
    if (!roles || roles.length === 0) return 'Нет ролей';

    const roleMap = {
      super_admin: 'Супер Админ',
      admin: 'Админ',
      manager: 'Менеджер',
      estimator: 'Сметчик',
      supplier: 'Снабженец'
    };

    return roles.map((role) => roleMap[role.name] || role.name).join(', ');
};

export const getRoleBadgeStyle = (roles) => {
    return { bgcolor: '#F3E8FF', color: '#6D28D9' };
};
