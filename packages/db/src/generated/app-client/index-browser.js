
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  name: 'name',
  planTier: 'planTier',
  tier3OptIn: 'tier3OptIn',
  tier3OptInProviders: 'tier3OptInProviders',
  tier3OptInDate: 'tier3OptInDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProjectScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  platform: 'platform',
  type: 'type',
  repoUrl: 'repoUrl',
  dataDbName: 'dataDbName',
  schemaVersion: 'schemaVersion',
  status: 'status',
  pendingDeletionAt: 'pendingDeletionAt',
  currentSpecVersionId: 'currentSpecVersionId',
  currentDesignSystemId: 'currentDesignSystemId',
  currentCompositionId: 'currentCompositionId',
  currentCodebaseVersionId: 'currentCodebaseVersionId',
  currentDeploymentId: 'currentDeploymentId',
  guardrailConfig: 'guardrailConfig',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.SpecVersionScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  parentVersionId: 'parentVersionId',
  naturalLanguage: 'naturalLanguage',
  structured: 'structured',
  interpretationConfidence: 'interpretationConfidence',
  userConfirmed: 'userConfirmed',
  createdAt: 'createdAt',
  createdBy: 'createdBy'
};

exports.Prisma.DesignSystemScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  origin: 'origin',
  templateId: 'templateId',
  divergenceLog: 'divergenceLog',
  tokens: 'tokens',
  componentsManifest: 'componentsManifest',
  createdAt: 'createdAt'
};

exports.Prisma.DesignSystemTemplateScalarFieldEnum = {
  id: 'id',
  name: 'name',
  category: 'category',
  suitableFor: 'suitableFor',
  tone: 'tone',
  includedFeatures: 'includedFeatures',
  previewImageUrl: 'previewImageUrl',
  snapshotData: 'snapshotData',
  version: 'version',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.PageCompositionScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  designSystemId: 'designSystemId',
  parentVersionId: 'parentVersionId',
  pages: 'pages',
  createdAt: 'createdAt'
};

exports.Prisma.CodebaseVersionScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  parentVersionId: 'parentVersionId',
  sourceDesignVersionId: 'sourceDesignVersionId',
  sourceCompositionId: 'sourceCompositionId',
  commitSha: 'commitSha',
  branch: 'branch',
  prNumber: 'prNumber',
  createdAt: 'createdAt'
};

exports.Prisma.DeploymentScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  codebaseVersionId: 'codebaseVersionId',
  environment: 'environment',
  url: 'url',
  status: 'status',
  createdAt: 'createdAt',
  deployedAt: 'deployedAt'
};

exports.Prisma.TicketScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  type: 'type',
  spec: 'spec',
  status: 'status',
  preferredProvider: 'preferredProvider',
  actualProvider: 'actualProvider',
  providerHistory: 'providerHistory',
  lockedBy: 'lockedBy',
  lockedUntil: 'lockedUntil',
  attemptCount: 'attemptCount',
  parentTicketIds: 'parentTicketIds',
  githubIssueNumber: 'githubIssueNumber',
  createdAt: 'createdAt',
  startedAt: 'startedAt',
  completedAt: 'completedAt'
};

exports.Prisma.TicketResultScalarFieldEnum = {
  id: 'id',
  ticketId: 'ticketId',
  prNumber: 'prNumber',
  commits: 'commits',
  filesChanged: 'filesChanged',
  guardrailResults: 'guardrailResults',
  decisionLogSummary: 'decisionLogSummary',
  durationMs: 'durationMs',
  costEstimate: 'costEstimate',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.ChangeRequestScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  userId: 'userId',
  userMessage: 'userMessage',
  proposedChanges: 'proposedChanges',
  changeCategory: 'changeCategory',
  affectedLayers: 'affectedLayers',
  confidence: 'confidence',
  alternatives: 'alternatives',
  status: 'status',
  resultingVersions: 'resultingVersions',
  createdAt: 'createdAt',
  resolvedAt: 'resolvedAt'
};

exports.Prisma.DecisionLogScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  entityType: 'entityType',
  entityId: 'entityId',
  ticketId: 'ticketId',
  input: 'input',
  reasoning: 'reasoning',
  outputSummary: 'outputSummary',
  provider: 'provider',
  model: 'model',
  createdAt: 'createdAt'
};

exports.Prisma.FormDefinitionScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  parentVersionId: 'parentVersionId',
  name: 'name',
  fields: 'fields',
  submitButtonText: 'submitButtonText',
  successMessage: 'successMessage',
  notificationConfig: 'notificationConfig',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.AssetScalarFieldEnum = {
  id: 'id',
  projectId: 'projectId',
  blobUrl: 'blobUrl',
  mimeType: 'mimeType',
  sizeBytes: 'sizeBytes',
  dimensions: 'dimensions',
  status: 'status',
  uploadedById: 'uploadedById',
  uploadedAt: 'uploadedAt'
};

exports.Prisma.ProviderHealthScalarFieldEnum = {
  provider: 'provider',
  lastSuccessAt: 'lastSuccessAt',
  lastFailureAt: 'lastFailureAt',
  recentFailureRate: 'recentFailureRate',
  avgResponseMs: 'avgResponseMs',
  updatedAt: 'updatedAt'
};

exports.Prisma.WorkerHeartbeatScalarFieldEnum = {
  workerId: 'workerId',
  workerType: 'workerType',
  status: 'status',
  lastHeartbeatAt: 'lastHeartbeatAt',
  currentTicketId: 'currentTicketId'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.PlanTier = exports.$Enums.PlanTier = {
  FREE: 'FREE',
  STARTER: 'STARTER',
  PRO: 'PRO',
  ENTERPRISE: 'ENTERPRISE'
};

exports.Tier3Provider = exports.$Enums.Tier3Provider = {
  OPENAI: 'OPENAI',
  GEMINI: 'GEMINI'
};

exports.Platform = exports.$Enums.Platform = {
  WEB: 'WEB',
  PWA: 'PWA',
  MOBILE_IOS: 'MOBILE_IOS',
  MOBILE_ANDROID: 'MOBILE_ANDROID',
  MOBILE_UNIVERSAL: 'MOBILE_UNIVERSAL',
  WEB_AND_MOBILE: 'WEB_AND_MOBILE'
};

exports.ProjectType = exports.$Enums.ProjectType = {
  LANDING: 'LANDING',
  CONTENT: 'CONTENT',
  FORM: 'FORM',
  OTHER: 'OTHER'
};

exports.ProjectStatus = exports.$Enums.ProjectStatus = {
  ACTIVE: 'ACTIVE',
  PENDING_DELETION: 'PENDING_DELETION',
  DELETED: 'DELETED'
};

exports.DesignSystemOrigin = exports.$Enums.DesignSystemOrigin = {
  TEMPLATE: 'TEMPLATE',
  GENERATED: 'GENERATED'
};

exports.TemplateStatus = exports.$Enums.TemplateStatus = {
  ACTIVE: 'ACTIVE',
  DEPRECATED: 'DEPRECATED'
};

exports.DeploymentEnvironment = exports.$Enums.DeploymentEnvironment = {
  PREVIEW: 'PREVIEW',
  PRODUCTION: 'PRODUCTION'
};

exports.DeploymentStatus = exports.$Enums.DeploymentStatus = {
  PENDING: 'PENDING',
  BUILDING: 'BUILDING',
  LIVE: 'LIVE',
  FAILED: 'FAILED'
};

exports.TicketType = exports.$Enums.TicketType = {
  DESIGN: 'DESIGN',
  CODE: 'CODE',
  DEPLOY: 'DEPLOY',
  MAINTENANCE: 'MAINTENANCE',
  FORM: 'FORM'
};

exports.TicketStatus = exports.$Enums.TicketStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  GUARDRAIL_FAILED: 'GUARDRAIL_FAILED'
};

exports.Provider = exports.$Enums.Provider = {
  CLAUDE_CODE_PC: 'CLAUDE_CODE_PC',
  ANTHROPIC_API: 'ANTHROPIC_API',
  OPENAI_API: 'OPENAI_API',
  GEMINI_API: 'GEMINI_API'
};

exports.TicketResultStatus = exports.$Enums.TicketResultStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  NEEDS_REVIEW: 'NEEDS_REVIEW'
};

exports.ChangeCategory = exports.$Enums.ChangeCategory = {
  CONTENT: 'CONTENT',
  CONFIG: 'CONFIG',
  COMPOSITION: 'COMPOSITION',
  DESIGN_SYSTEM: 'DESIGN_SYSTEM',
  CODE: 'CODE',
  FULL_STACK: 'FULL_STACK',
  FORM: 'FORM'
};

exports.ChangeRequestStatus = exports.$Enums.ChangeRequestStatus = {
  PROPOSED: 'PROPOSED',
  USER_REVIEWING: 'USER_REVIEWING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  APPLIED: 'APPLIED'
};

exports.FormDefinitionStatus = exports.$Enums.FormDefinitionStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED'
};

exports.AssetStatus = exports.$Enums.AssetStatus = {
  PREVIEW: 'PREVIEW',
  LIVE: 'LIVE'
};

exports.WorkerType = exports.$Enums.WorkerType = {
  PC: 'PC',
  API: 'API'
};

exports.WorkerStatus = exports.$Enums.WorkerStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

exports.Prisma.ModelName = {
  User: 'User',
  Project: 'Project',
  SpecVersion: 'SpecVersion',
  DesignSystem: 'DesignSystem',
  DesignSystemTemplate: 'DesignSystemTemplate',
  PageComposition: 'PageComposition',
  CodebaseVersion: 'CodebaseVersion',
  Deployment: 'Deployment',
  Ticket: 'Ticket',
  TicketResult: 'TicketResult',
  ChangeRequest: 'ChangeRequest',
  DecisionLog: 'DecisionLog',
  FormDefinition: 'FormDefinition',
  Asset: 'Asset',
  ProviderHealth: 'ProviderHealth',
  WorkerHeartbeat: 'WorkerHeartbeat'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
