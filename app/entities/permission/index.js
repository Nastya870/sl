export const getResourceActions = (resourceGroup) => {
    const actions = {
      view_menu: null,
      read: null,
      create: null,
      update: null,
      delete: null
    };

    if (!resourceGroup || !resourceGroup.permissions) return actions;

    resourceGroup.permissions.forEach(perm => {
      if (perm.action === 'view_menu') {
        actions.view_menu = perm;
      } else if (perm.action === 'read' || perm.action === 'view') {
        actions.read = perm;
      } else if (perm.action === 'create') {
        actions.create = perm;
      } else if (perm.action === 'update') {
        actions.update = perm;
      } else if (perm.action === 'delete') {
        actions.delete = perm;
      } else if (perm.action === 'manage') {
        if (!actions.create) actions.create = perm;
        if (!actions.update) actions.update = perm;
      }
    });

    return actions;
};

export const getSortedPermissions = (permissions) => {
    const resourceOrder = {
      'admin': 1, 'users': 2, 'roles': 3, 'tenants': 4, 'settings': 5,
      'references': 10, 'materials': 11, 'works': 12, 'counterparties': 13, 'suppliers': 14,
      'projects': 20, 'estimates': 21, 'estimate_templates': 22, 'purchases': 23, 'reports': 24,
      'dashboard': 30, 'default': 100
    };

    return [...permissions].sort((a, b) => {
      const orderA = resourceOrder[a.resource] || resourceOrder.default;
      const orderB = resourceOrder[b.resource] || resourceOrder.default;
      return orderA - orderB;
    });
};

export const parentResources = ['admin', 'references', 'projects'];

export const childResourcesMap = {
    'admin': ['users', 'roles', 'tenants', 'settings'],
    'references': ['materials', 'works', 'counterparties', 'suppliers'],
    'projects': ['estimates', 'purchases', 'reports']
};
