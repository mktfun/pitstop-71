
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PermissionsTestComponent = () => {
  const { 
    isLoading, 
    hasPermission, 
    getAccessibleUnits, 
    getCurrentUserRole, 
    getCurrentOrganizationId,
    rawData 
  } = usePermissions();

  if (isLoading) {
    return <div>Carregando permissões...</div>;
  }

  const accessibleUnits = getAccessibleUnits();
  const currentRole = getCurrentUserRole();
  const organizationId = getCurrentOrganizationId();

  // Testes de permissões
  const permissionTests = [
    { action: 'read', resource: 'leads' },
    { action: 'create', resource: 'leads' },
    { action: 'update', resource: 'leads' },
    { action: 'delete', resource: 'leads' },
    { action: 'read', resource: 'appointments' },
    { action: 'create', resource: 'appointments' },
    { action: 'read', resource: 'reports' },
    { action: 'manage', resource: 'organization' },
  ];

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Permissões - Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informações do usuário */}
          <div>
            <h3 className="font-semibold mb-2">Informações do Usuário:</h3>
            <p><strong>Papel:</strong> {currentRole?.name || 'Sem papel'}</p>
            <p><strong>Organização ID:</strong> {organizationId || 'Sem organização'}</p>
            <p><strong>Associação:</strong> {rawData.userAssociation ? 'Sim' : 'Não'}</p>
          </div>

          {/* Unidades acessíveis */}
          <div>
            <h3 className="font-semibold mb-2">Unidades Acessíveis:</h3>
            {accessibleUnits.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {accessibleUnits.map(unitId => (
                  <Badge key={unitId} variant="secondary">
                    {unitId}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma unidade acessível</p>
            )}
          </div>

          {/* Teste de permissões */}
          <div>
            <h3 className="font-semibold mb-2">Teste de Permissões:</h3>
            <div className="grid grid-cols-2 gap-2">
              {permissionTests.map(({ action, resource }) => {
                const hasAccess = hasPermission(action, resource);
                return (
                  <div key={`${action}-${resource}`} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{action} {resource}</span>
                    <Badge variant={hasAccess ? "default" : "destructive"}>
                      {hasAccess ? "✓" : "✗"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dados brutos para debug */}
          <details className="mt-4">
            <summary className="font-semibold cursor-pointer">Dados Brutos (Debug)</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-48">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsTestComponent;
