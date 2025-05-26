
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';

interface UserOrgAssociation {
  id: string;
  userId: string;
  organizationId: string;
  roleId: string;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  organizationId: string;
  createdAt: string;
}

interface Permission {
  id: string;
  action: string;
  resource: string;
  createdAt: string;
}

interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: string;
}

interface UserUnitAccess {
  id: string;
  userId: string;
  unitId: string;
  createdAt: string;
}

interface Unit {
  id: string;
  name: string;
  organizationId: string;
  address: string;
  phone: string;
  createdAt: string;
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [userOrgAssociations, setUserOrgAssociations] = useState<UserOrgAssociation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [userUnitAccess, setUserUnitAccess] = useState<UserUnitAccess[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do localStorage
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('Carregando dados de permissões do localStorage...');
      
      const userOrgData = JSON.parse(localStorage.getItem('pitstop_user_org_associations') || '[]');
      const rolesData = JSON.parse(localStorage.getItem('pitstop_roles') || '[]');
      const permissionsData = JSON.parse(localStorage.getItem('pitstop_permissions') || '[]');
      const rolePermissionsData = JSON.parse(localStorage.getItem('pitstop_role_permissions') || '[]');
      const userUnitAccessData = JSON.parse(localStorage.getItem('pitstop_user_unit_access') || '[]');
      const unitsData = JSON.parse(localStorage.getItem('pitstop_units') || '[]');

      setUserOrgAssociations(userOrgData);
      setRoles(rolesData);
      setPermissions(permissionsData);
      setRolePermissions(rolePermissionsData);
      setUserUnitAccess(userUnitAccessData);
      setUnits(unitsData);

      console.log('Dados de permissões carregados:', {
        userOrgAssociations: userOrgData.length,
        roles: rolesData.length,
        permissions: permissionsData.length,
        rolePermissions: rolePermissionsData.length,
        userUnitAccess: userUnitAccessData.length,
        units: unitsData.length
      });
    } catch (error) {
      console.error('Erro ao carregar dados de permissões:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Obter associação do usuário atual
  const userAssociation = useMemo(() => {
    if (!user) return null;
    return userOrgAssociations.find(assoc => assoc.userId === user.id) || null;
  }, [user, userOrgAssociations]);

  // Obter papel do usuário atual
  const userRole = useMemo(() => {
    if (!userAssociation) return null;
    return roles.find(role => role.id === userAssociation.roleId) || null;
  }, [userAssociation, roles]);

  // Função hasPermission
  const hasPermission = useCallback((action: string, resource: string): boolean => {
    console.log(`Verificando permissão: ${action} em ${resource}`);
    
    if (!user || !userAssociation || !userRole) {
      console.log('Usuário não autenticado ou sem associação/papel');
      return false;
    }

    // Se for Proprietário, tem todas as permissões
    if (userRole.name === 'Proprietário') {
      console.log('Usuário é Proprietário - permissão concedida');
      return true;
    }

    // Buscar a permissão específica
    const permission = permissions.find(p => p.action === action && p.resource === resource);
    if (!permission) {
      console.log(`Permissão não encontrada: ${action} em ${resource}`);
      return false;
    }

    // Verificar se o papel tem essa permissão
    const hasRolePermission = rolePermissions.some(rp => 
      rp.roleId === userRole.id && rp.permissionId === permission.id
    );

    console.log(`Resultado da verificação de permissão: ${hasRolePermission}`);
    return hasRolePermission;
  }, [user, userAssociation, userRole, permissions, rolePermissions]);

  // Função getAccessibleUnits
  const getAccessibleUnits = useCallback((): string[] => {
    console.log('Obtendo unidades acessíveis...');
    
    if (!user || !userAssociation || !userRole) {
      console.log('Usuário não autenticado ou sem associação/papel');
      return [];
    }

    const organizationId = userAssociation.organizationId;

    // Se for Proprietário ou Admin, retorna todas as unidades da organização
    if (userRole.name === 'Proprietário' || userRole.name === 'Admin') {
      const orgUnits = units
        .filter(unit => unit.organizationId === organizationId)
        .map(unit => unit.id);
      
      console.log(`${userRole.name} - Unidades acessíveis (todas da org):`, orgUnits);
      return orgUnits;
    }

    // Para outros papéis, verificar acesso específico por unidade
    const accessibleUnits = userUnitAccess
      .filter(access => access.userId === user.id)
      .map(access => access.unitId);

    console.log('Unidades acessíveis (específicas):', accessibleUnits);
    return accessibleUnits;
  }, [user, userAssociation, userRole, units, userUnitAccess]);

  // Dados adicionais que podem ser úteis
  const getCurrentUserRole = useCallback(() => userRole, [userRole]);
  const getCurrentOrganizationId = useCallback(() => userAssociation?.organizationId || null, [userAssociation]);

  return {
    // Estados de carregamento
    isLoading,
    
    // Funções principais
    hasPermission,
    getAccessibleUnits,
    
    // Funções auxiliares
    getCurrentUserRole,
    getCurrentOrganizationId,
    
    // Dados brutos (se necessário para debugging)
    rawData: {
      userOrgAssociations,
      roles,
      permissions,
      rolePermissions,
      userUnitAccess,
      units,
      userAssociation,
      userRole
    }
  };
};
