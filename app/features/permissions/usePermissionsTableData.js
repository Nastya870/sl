import { useState, useEffect, useCallback } from 'react';
import * as permissionsAPI from 'shared/lib/api/permissions';
import { getSortedPermissions, getResourceActions } from 'app/entities/permission';

export const usePermissionsTableData = (roleId, onPermissionsChange) => {
  const [loading, setLoading] = useState(true);
  const [allPermissions, setAllPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [hiddenPermissions, setHiddenPermissions] = useState(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPermissions();
  }, [roleId]);

  const loadPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allPermsRes, rolePermsRes] = await Promise.all([
        permissionsAPI.getAllPermissions(),
        permissionsAPI.getRolePermissions(roleId)
      ]);

      if (allPermsRes.success && rolePermsRes.success) {
        setAllPermissions(allPermsRes.data || []);
        setRolePermissions(rolePermsRes.data.permissionIds || []);
        setHiddenPermissions(new Set(rolePermsRes.data.hiddenPermissionIds || []));
      } else {
        setError('Ошибка загрузки разрешений');
      }
    } catch (err) {
      console.error('Error loading permissions:', err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = useCallback((permissionId, shouldCheck) => {
    setRolePermissions(prev => {
      const newPermissions = shouldCheck
        ? [...prev, permissionId]
        : prev.filter(id => id !== permissionId);

      setHasChanges(true);
      return newPermissions;
    });
  }, []);

  useEffect(() => {
    if (hasChanges && onPermissionsChange) {
        onPermissionsChange(rolePermissions, hiddenPermissions);
    }
  }, [rolePermissions, hiddenPermissions, hasChanges, onPermissionsChange]);

  const handleActionToggle = (action) => {
    if (!action) return;
    // We need current state of rolePermissions to check if it's already there
    // But rolePermissions is in scope.
    const isChecked = rolePermissions.includes(action.id);
    togglePermission(action.id, !isChecked);
  };

  const toggleAllForResource = (resourceGroup) => {
    const actions = getResourceActions(resourceGroup);
    const allActions = Object.values(actions).filter(a => a !== null);
    const allChecked = allActions.every(a => rolePermissions.includes(a.id));

    setRolePermissions(prev => {
        let newPermissions = [...prev];
        if (allChecked) {
             // Remove all
             const idsToRemove = allActions.map(a => a.id);
             newPermissions = prev.filter(id => !idsToRemove.includes(id));
        } else {
            // Add missing
            const idsToAdd = allActions.map(a => a.id).filter(id => !prev.includes(id));
            newPermissions = [...prev, ...idsToAdd];
        }
        setHasChanges(true);
        return newPermissions;
    });
  };

  const sortedPermissions = getSortedPermissions(allPermissions);

  return {
    permissions: sortedPermissions,
    rolePermissions,
    hiddenPermissions,
    loading,
    error,
    hasChanges,
    togglePermission,
    handleActionToggle,
    toggleAllForResource
  };
};
