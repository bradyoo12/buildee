// ============================================================
// Buildee 인프라 (Azure Bicep)
//
// 한 번 실행으로 다음 리소스 생성:
// - PostgreSQL Flexible Server
// - App Service Plan + App Service
// - Key Vault
// - Storage Account (Blob 컨테이너)
// - Application Insights
// - Log Analytics Workspace
//
// 배포: az deployment group create --resource-group buildee-rg --template-file main.bicep
// ============================================================

@description('환경 이름 (dev, staging, prod)')
param env string = 'dev'

@description('Azure 리전')
param location string = resourceGroup().location

@description('PostgreSQL admin 사용자 이름')
param pgAdminUser string

@description('PostgreSQL admin 비밀번호')
@secure()
param pgAdminPassword string

@description('App Service에 접근 가능한 IP (admin)')
param adminIp string

var prefix = 'buildee'

// ============================================================
// PostgreSQL Flexible Server
// ============================================================

resource postgres 'Microsoft.DBforPostgreSQL/flexibleServers@2024-08-01' = {
  name: '${prefix}-pg-${env}'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    administratorLogin: pgAdminUser
    administratorLoginPassword: pgAdminPassword
    storage: {
      storageSizeGB: 32
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

resource pgFirewallAzure 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2024-08-01' = {
  parent: postgres
  name: 'allow-azure-services'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0' // 0.0.0.0/0 → Azure 내부 서비스만
  }
}

resource pgFirewallAdmin 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2024-08-01' = {
  parent: postgres
  name: 'allow-admin'
  properties: {
    startIpAddress: adminIp
    endIpAddress: adminIp
  }
}

resource pgAppMain 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2024-08-01' = {
  parent: postgres
  name: 'app_main'
}

// ============================================================
// App Service
// ============================================================

resource plan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: '${prefix}-plan-${env}'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true // Linux
  }
}

resource appService 'Microsoft.Web/sites@2024-04-01' = {
  name: '${prefix}-server-${env}'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      alwaysOn: true
      appSettings: [
        { name: 'NODE_ENV', value: 'production' }
        { name: 'PORT', value: '8080' }
        { name: 'WEBSITES_PORT', value: '8080' }
        { name: 'PG_HOST', value: postgres.properties.fullyQualifiedDomainName }
        { name: 'PG_PORT', value: '5432' }
        { name: 'PG_ADMIN_USER', value: pgAdminUser }
        { name: 'PG_SSL', value: 'true' }
        { name: 'AZURE_KEY_VAULT_URL', value: keyVault.properties.vaultUri }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
      ]
    }
  }
}

// ============================================================
// Key Vault
// ============================================================

resource keyVault 'Microsoft.KeyVault/vaults@2024-04-01-preview' = {
  name: '${prefix}-kv-${env}-${uniqueString(resourceGroup().id)}'
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: { family: 'A', name: 'standard' }
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
  }
}

// App Service Managed Identity에 Key Vault Secrets User 권한
resource kvRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  scope: keyVault
  name: guid(keyVault.id, appService.id, 'Key Vault Secrets User')
  properties: {
    principalId: appService.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId(
      'Microsoft.Authorization/roleDefinitions',
      '4633458b-17de-408a-b874-0445c86b69e6' // Key Vault Secrets User
    )
  }
}

// ============================================================
// Storage Account (Blob)
// ============================================================

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: '${prefix}st${env}${take(uniqueString(resourceGroup().id), 6)}'
  location: location
  kind: 'StorageV2'
  sku: { name: 'Standard_LRS' }
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storage
  name: 'default'
}

resource assetsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = {
  parent: blobService
  name: 'project-assets'
  properties: {
    publicAccess: 'None'
  }
}

// ============================================================
// Application Insights
// ============================================================

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: '${prefix}-logs-${env}'
  location: location
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${prefix}-insights-${env}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

// ============================================================
// Outputs
// ============================================================

output serverUrl string = 'https://${appService.properties.defaultHostName}'
output postgresHost string = postgres.properties.fullyQualifiedDomainName
output keyVaultUrl string = keyVault.properties.vaultUri
output blobAccountName string = storage.name
output appInsightsConnectionString string = appInsights.properties.ConnectionString
