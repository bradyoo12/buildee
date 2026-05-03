
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/library.js')


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

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

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




  const path = require('path')

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
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "E:\\Github\\bradyoo12\\buildee\\packages\\db\\src\\generated\\app-client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "E:\\Github\\bradyoo12\\buildee\\packages\\db\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null
  },
  "relativePath": "../../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL_APP_MAIN",
        "value": null
      }
    }
  },
  "inlineSchema": "// ============================================================\n// Buildee — app_main DB schema\n// 시스템 운영 데이터 (User, Project, Spec, Ticket, DecisionLog, ...)\n// 옵션 E: 단일 Postgres 서버 + Project별 분리 DB. 이건 운영 DB.\n// ============================================================\n\ngenerator client {\n  provider = \"prisma-client-js\"\n  output   = \"../src/generated/app-client\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL_APP_MAIN\")\n}\n\n// =================================================================\n// Enums\n// =================================================================\n\nenum PlanTier {\n  FREE\n  STARTER\n  PRO\n  ENTERPRISE\n}\n\nenum Tier3Provider {\n  OPENAI\n  GEMINI\n}\n\nenum Platform {\n  WEB\n  PWA\n  MOBILE_IOS\n  MOBILE_ANDROID\n  MOBILE_UNIVERSAL\n  WEB_AND_MOBILE\n}\n\nenum ProjectType {\n  LANDING\n  CONTENT\n  FORM\n  OTHER\n}\n\nenum ProjectStatus {\n  ACTIVE\n  PENDING_DELETION\n  DELETED\n}\n\nenum DesignSystemOrigin {\n  TEMPLATE\n  GENERATED\n}\n\nenum TemplateStatus {\n  ACTIVE\n  DEPRECATED\n}\n\nenum DeploymentEnvironment {\n  PREVIEW\n  PRODUCTION\n}\n\nenum DeploymentStatus {\n  PENDING\n  BUILDING\n  LIVE\n  FAILED\n}\n\nenum TicketType {\n  DESIGN\n  CODE\n  DEPLOY\n  MAINTENANCE\n  FORM\n}\n\nenum TicketStatus {\n  PENDING\n  IN_PROGRESS\n  COMPLETED\n  FAILED\n  GUARDRAIL_FAILED\n}\n\nenum Provider {\n  CLAUDE_CODE_PC\n  ANTHROPIC_API\n  OPENAI_API\n  GEMINI_API\n}\n\nenum TicketResultStatus {\n  SUCCESS\n  FAILED\n  NEEDS_REVIEW\n}\n\nenum ChangeCategory {\n  CONTENT\n  CONFIG\n  COMPOSITION\n  DESIGN_SYSTEM\n  CODE\n  FULL_STACK\n  FORM\n}\n\nenum ChangeRequestStatus {\n  PROPOSED\n  USER_REVIEWING\n  APPROVED\n  REJECTED\n  APPLIED\n}\n\nenum FormDefinitionStatus {\n  DRAFT\n  ACTIVE\n  ARCHIVED\n}\n\nenum AssetStatus {\n  PREVIEW\n  LIVE\n}\n\nenum WorkerType {\n  PC\n  API\n}\n\nenum WorkerStatus {\n  ACTIVE\n  INACTIVE\n}\n\n// =================================================================\n// User\n// =================================================================\n\nmodel User {\n  id       String   @id @default(uuid()) @db.Uuid\n  email    String   @unique\n  name     String?\n  planTier PlanTier @default(FREE) @map(\"plan_tier\")\n\n  // Tier 3 (외부 프로바이더) 사전 옵트인\n  tier3OptIn          Boolean         @default(false) @map(\"tier3_opt_in\")\n  tier3OptInProviders Tier3Provider[] @default([]) @map(\"tier3_opt_in_providers\")\n  tier3OptInDate      DateTime?       @map(\"tier3_opt_in_date\")\n\n  createdAt DateTime @default(now()) @map(\"created_at\")\n  updatedAt DateTime @updatedAt @map(\"updated_at\")\n\n  // Relations\n  projects       Project[]\n  changeRequests ChangeRequest[]\n  uploadedAssets Asset[]\n\n  @@map(\"users\")\n}\n\n// =================================================================\n// Project\n// =================================================================\n\nmodel Project {\n  id     String @id @default(uuid()) @db.Uuid\n  userId String @map(\"user_id\") @db.Uuid\n  name   String\n\n  platform Platform    @default(WEB)\n  type     ProjectType @default(LANDING)\n\n  // GitHub repo\n  repoUrl String? @map(\"repo_url\")\n\n  // Project DB (옵션 E)\n  dataDbName    String? @unique @map(\"data_db_name\") // 예: \"proj_a3xk7m2\"\n  schemaVersion Int     @default(0) @map(\"schema_version\")\n\n  // 생애주기\n  status            ProjectStatus @default(ACTIVE)\n  pendingDeletionAt DateTime?     @map(\"pending_deletion_at\")\n\n  // 라이브 상태 포인터 (current_*) — 모두 nullable, 점진 채워짐\n  currentSpecVersionId     String? @map(\"current_spec_version_id\") @db.Uuid\n  currentDesignSystemId    String? @map(\"current_design_system_id\") @db.Uuid\n  currentCompositionId     String? @map(\"current_composition_id\") @db.Uuid\n  currentCodebaseVersionId String? @map(\"current_codebase_version_id\") @db.Uuid\n  currentDeploymentId      String? @map(\"current_deployment_id\") @db.Uuid\n\n  // Project별 가드레일 설정 (활성 레이어, 강도 등)\n  guardrailConfig Json? @map(\"guardrail_config\")\n\n  createdAt DateTime  @default(now()) @map(\"created_at\")\n  updatedAt DateTime  @updatedAt @map(\"updated_at\")\n  deletedAt DateTime? @map(\"deleted_at\")\n\n  // Relations\n  user             User              @relation(fields: [userId], references: [id], onDelete: Cascade)\n  specVersions     SpecVersion[]\n  designSystems    DesignSystem[]\n  compositions     PageComposition[]\n  codebaseVersions CodebaseVersion[]\n  deployments      Deployment[]\n  tickets          Ticket[]\n  changeRequests   ChangeRequest[]\n  decisionLogs     DecisionLog[]\n  formDefinitions  FormDefinition[]\n  assets           Asset[]\n\n  @@index([userId, status])\n  @@map(\"projects\")\n}\n\n// =================================================================\n// SpecVersion (불변 버전 패턴)\n// =================================================================\n\nmodel SpecVersion {\n  id              String  @id @default(uuid()) @db.Uuid\n  projectId       String  @map(\"project_id\") @db.Uuid\n  parentVersionId String? @map(\"parent_version_id\") @db.Uuid\n\n  naturalLanguage          String  @map(\"natural_language\")\n  structured               Json\n  interpretationConfidence Float?  @map(\"interpretation_confidence\")\n  userConfirmed            Boolean @default(false) @map(\"user_confirmed\")\n\n  createdAt DateTime @default(now()) @map(\"created_at\")\n  createdBy String?  @map(\"created_by\") // user uuid 또는 'ai'\n\n  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)\n\n  @@index([projectId, createdAt])\n  @@map(\"spec_versions\")\n}\n\n// =================================================================\n// DesignSystem (Project별 인스턴스, 불변 버전 패턴)\n// =================================================================\n\nmodel DesignSystem {\n  id        String             @id @default(uuid()) @db.Uuid\n  projectId String             @map(\"project_id\") @db.Uuid\n  origin    DesignSystemOrigin\n\n  templateId    String? @map(\"template_id\") @db.Uuid\n  divergenceLog Json?   @map(\"divergence_log\")\n\n  tokens             Json\n  componentsManifest Json @map(\"components_manifest\")\n\n  createdAt DateTime @default(now()) @map(\"created_at\")\n\n  project  Project               @relation(fields: [projectId], references: [id], onDelete: Cascade)\n  template DesignSystemTemplate? @relation(fields: [templateId], references: [id])\n\n  @@index([projectId, createdAt])\n  @@map(\"design_systems\")\n}\n\n// =================================================================\n// DesignSystemTemplate (시스템 운영자 관리)\n// =================================================================\n\nmodel DesignSystemTemplate {\n  id               String         @id @default(uuid()) @db.Uuid\n  name             String\n  category         String\n  suitableFor      String[]       @default([]) @map(\"suitable_for\")\n  tone             String\n  includedFeatures String[]       @default([]) @map(\"included_features\")\n  previewImageUrl  String?        @map(\"preview_image_url\")\n  snapshotData     Json           @map(\"snapshot_data\")\n  version          Int            @default(1)\n  status           TemplateStatus @default(ACTIVE)\n\n  createdAt DateTime @default(now()) @map(\"created_at\")\n\n  designSystems DesignSystem[]\n\n  @@index([status, category])\n  @@map(\"design_system_templates\")\n}\n\n// =================================================================\n// PageComposition (DesignSystem 안에서 페이지 구성, 불변 버전 패턴)\n// =================================================================\n\nmodel PageComposition {\n  id              String  @id @default(uuid()) @db.Uuid\n  projectId       String  @map(\"project_id\") @db.Uuid\n  designSystemId  String  @map(\"design_system_id\") @db.Uuid\n  parentVersionId String? @map(\"parent_version_id\") @db.Uuid\n\n  pages Json // 각 페이지의 컴포넌트 트리\n\n  createdAt DateTime @default(now()) @map(\"created_at\")\n\n  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)\n\n  @@index([projectId, createdAt])\n  @@map(\"page_compositions\")\n}\n\n// =================================================================\n// CodebaseVersion (Git commit 기반)\n// =================================================================\n\nmodel CodebaseVersion {\n  id                    String  @id @default(uuid()) @db.Uuid\n  projectId             String  @map(\"project_id\") @db.Uuid\n  parentVersionId       String? @map(\"parent_version_id\") @db.Uuid\n  sourceDesignVersionId String? @map(\"source_design_version_id\") @db.Uuid\n  sourceCompositionId   String? @map(\"source_composition_id\") @db.Uuid\n\n  commitSha String @map(\"commit_sha\")\n  branch    String\n  prNumber  Int?   @map(\"pr_number\")\n\n  createdAt DateTime @default(now()) @map(\"created_at\")\n\n  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)\n  deployments Deployment[]\n\n  @@index([projectId, createdAt])\n  @@map(\"codebase_versions\")\n}\n\n// =================================================================\n// Deployment\n// =================================================================\n\nmodel Deployment {\n  id                String                @id @default(uuid()) @db.Uuid\n  projectId         String                @map(\"project_id\") @db.Uuid\n  codebaseVersionId String                @map(\"codebase_version_id\") @db.Uuid\n  environment       DeploymentEnvironment\n  url               String\n  status            DeploymentStatus      @default(PENDING)\n\n  createdAt  DateTime  @default(now()) @map(\"created_at\")\n  deployedAt DateTime? @map(\"deployed_at\")\n\n  project         Project         @relation(fields: [projectId], references: [id], onDelete: Cascade)\n  codebaseVersion CodebaseVersion @relation(fields: [codebaseVersionId], references: [id])\n\n  @@index([projectId, environment, status])\n  @@map(\"deployments\")\n}\n\n// =================================================================\n// Ticket (큐 + 작업 추적, 옵션 E의 SKIP LOCKED 큐 패턴)\n// =================================================================\n\nmodel Ticket {\n  id        String       @id @default(uuid()) @db.Uuid\n  projectId String       @map(\"project_id\") @db.Uuid\n  type      TicketType\n  spec      Json // 구조화된 작업 명세\n  status    TicketStatus @default(PENDING)\n\n  // 워커 라우팅 + Provider 추상화\n  preferredProvider Provider? @map(\"preferred_provider\")\n  actualProvider    Provider? @map(\"actual_provider\")\n  providerHistory   Json      @default(\"[]\") @map(\"provider_history\")\n\n  // 큐 락 (visibility timeout)\n  lockedBy     String?   @map(\"locked_by\")\n  lockedUntil  DateTime? @map(\"locked_until\")\n  attemptCount Int       @default(0) @map(\"attempt_count\")\n\n  // 의존성 그래프\n  parentTicketIds String[] @default([]) @map(\"parent_ticket_ids\") @db.Uuid\n\n  // GitHub 연동\n  githubIssueNumber Int? @map(\"github_issue_number\")\n\n  createdAt   DateTime  @default(now()) @map(\"created_at\")\n  startedAt   DateTime? @map(\"started_at\")\n  completedAt DateTime? @map(\"completed_at\")\n\n  project      Project        @relation(fields: [projectId], references: [id], onDelete: Cascade)\n  results      TicketResult[]\n  decisionLogs DecisionLog[]\n\n  // 큐 픽업 핵심 인덱스\n  @@index([status, lockedUntil, createdAt])\n  @@index([projectId, status])\n  @@map(\"tickets\")\n}\n\n// =================================================================\n// TicketResult\n// =================================================================\n\nmodel TicketResult {\n  id       String @id @default(uuid()) @db.Uuid\n  ticketId String @map(\"ticket_id\") @db.Uuid\n\n  prNumber     Int?     @map(\"pr_number\")\n  commits      String[] @default([])\n  filesChanged String[] @default([]) @map(\"files_changed\")\n\n  // 가드레일 8 layer 결과\n  guardrailResults Json @map(\"guardrail_results\")\n\n  decisionLogSummary String?  @map(\"decision_log_summary\")\n  durationMs         Int?     @map(\"duration_ms\")\n  costEstimate       Decimal? @map(\"cost_estimate\") @db.Decimal(10, 4)\n\n  status TicketResultStatus\n\n  createdAt DateTime @default(now()) @map(\"created_at\")\n\n  ticket Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)\n\n  @@index([ticketId, createdAt])\n  @@map(\"ticket_results\")\n}\n\n// =================================================================\n// ChangeRequest (사용자 요청 → 처리 흐름)\n// =================================================================\n\nmodel ChangeRequest {\n  id        String @id @default(uuid()) @db.Uuid\n  projectId String @map(\"project_id\") @db.Uuid\n  userId    String @map(\"user_id\") @db.Uuid\n\n  userMessage     String         @map(\"user_message\")\n  proposedChanges Json           @map(\"proposed_changes\")\n  changeCategory  ChangeCategory @map(\"change_category\")\n  affectedLayers  String[]       @default([]) @map(\"affected_layers\")\n  confidence      Float?\n  alternatives    Json           @default(\"[]\")\n\n  status            ChangeRequestStatus @default(PROPOSED)\n  resultingVersions Json?               @map(\"resulting_versions\")\n\n  createdAt  DateTime  @default(now()) @map(\"created_at\")\n  resolvedAt DateTime? @map(\"resolved_at\")\n\n  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)\n  user    User    @relation(fields: [userId], references: [id])\n\n  @@index([projectId, status, createdAt])\n  @@map(\"change_requests\")\n}\n\n// =================================================================\n// DecisionLog (AI 결정 추적, 유지보수 핵심 자산)\n// =================================================================\n\nmodel DecisionLog {\n  id         String  @id @default(uuid()) @db.Uuid\n  projectId  String  @map(\"project_id\") @db.Uuid\n  entityType String  @map(\"entity_type\") // 'spec_version' | 'design_system' | ...\n  entityId   String  @map(\"entity_id\") @db.Uuid\n  ticketId   String? @map(\"ticket_id\") @db.Uuid\n\n  input         Json\n  reasoning     String\n  outputSummary String? @map(\"output_summary\")\n  provider      String?\n  model         String?\n\n  createdAt DateTime @default(now()) @map(\"created_at\")\n\n  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)\n  ticket  Ticket? @relation(fields: [ticketId], references: [id])\n\n  @@index([projectId, entityId, createdAt])\n  @@index([ticketId])\n  @@map(\"decision_logs\")\n}\n\n// =================================================================\n// FormDefinition (양식 정의는 운영 DB. 응답은 Project DB.)\n// =================================================================\n\nmodel FormDefinition {\n  id              String  @id @default(uuid()) @db.Uuid\n  projectId       String  @map(\"project_id\") @db.Uuid\n  parentVersionId String? @map(\"parent_version_id\") @db.Uuid\n\n  name               String\n  fields             Json // FormField[]\n  submitButtonText   String? @map(\"submit_button_text\")\n  successMessage     String? @map(\"success_message\")\n  notificationConfig Json?   @map(\"notification_config\")\n\n  status FormDefinitionStatus @default(DRAFT)\n\n  createdAt DateTime @default(now()) @map(\"created_at\")\n\n  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)\n\n  @@index([projectId, status])\n  @@map(\"form_definitions\")\n}\n\n// =================================================================\n// Asset (Azure Blob 미디어)\n// =================================================================\n\nmodel Asset {\n  id         String      @id @default(uuid()) @db.Uuid\n  projectId  String      @map(\"project_id\") @db.Uuid\n  blobUrl    String      @map(\"blob_url\")\n  mimeType   String      @map(\"mime_type\")\n  sizeBytes  Int         @map(\"size_bytes\")\n  dimensions Json?\n  status     AssetStatus @default(PREVIEW)\n\n  uploadedById String   @map(\"uploaded_by_id\") @db.Uuid\n  uploadedAt   DateTime @default(now()) @map(\"uploaded_at\")\n\n  project    Project @relation(fields: [projectId], references: [id], onDelete: Cascade)\n  uploadedBy User    @relation(fields: [uploadedById], references: [id])\n\n  @@index([projectId, status])\n  @@map(\"assets\")\n}\n\n// =================================================================\n// ProviderHealth (워커 라우팅 결정용)\n// =================================================================\n\nmodel ProviderHealth {\n  provider          Provider  @id\n  lastSuccessAt     DateTime? @map(\"last_success_at\")\n  lastFailureAt     DateTime? @map(\"last_failure_at\")\n  recentFailureRate Float     @default(0) @map(\"recent_failure_rate\")\n  avgResponseMs     Int       @default(0) @map(\"avg_response_ms\")\n\n  updatedAt DateTime @updatedAt @map(\"updated_at\")\n\n  @@map(\"provider_health\")\n}\n\n// =================================================================\n// WorkerHeartbeat (PC/API 워커 상태)\n// =================================================================\n\nmodel WorkerHeartbeat {\n  workerId        String       @id @map(\"worker_id\")\n  workerType      WorkerType   @map(\"worker_type\")\n  status          WorkerStatus @default(ACTIVE)\n  lastHeartbeatAt DateTime     @map(\"last_heartbeat_at\")\n  currentTicketId String?      @map(\"current_ticket_id\") @db.Uuid\n\n  @@index([status, lastHeartbeatAt])\n  @@map(\"worker_heartbeats\")\n}\n",
  "inlineSchemaHash": "38e1a6029774ba66064aaaca8ea04085f124cd22d34de64031a0f53d03df09ff",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "src/generated/app-client",
    "generated/app-client",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"dbName\":\"users\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"planTier\",\"dbName\":\"plan_tier\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"PlanTier\",\"default\":\"FREE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tier3OptIn\",\"dbName\":\"tier3_opt_in\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tier3OptInProviders\",\"dbName\":\"tier3_opt_in_providers\",\"kind\":\"enum\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Tier3Provider\",\"default\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tier3OptInDate\",\"dbName\":\"tier3_opt_in_date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"projects\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Project\",\"relationName\":\"ProjectToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"changeRequests\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ChangeRequest\",\"relationName\":\"ChangeRequestToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"uploadedAssets\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Asset\",\"relationName\":\"AssetToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Project\":{\"dbName\":\"projects\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"platform\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Platform\",\"default\":\"WEB\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ProjectType\",\"default\":\"LANDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"repoUrl\",\"dbName\":\"repo_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dataDbName\",\"dbName\":\"data_db_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"schemaVersion\",\"dbName\":\"schema_version\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ProjectStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pendingDeletionAt\",\"dbName\":\"pending_deletion_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentSpecVersionId\",\"dbName\":\"current_spec_version_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentDesignSystemId\",\"dbName\":\"current_design_system_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentCompositionId\",\"dbName\":\"current_composition_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentCodebaseVersionId\",\"dbName\":\"current_codebase_version_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentDeploymentId\",\"dbName\":\"current_deployment_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"guardrailConfig\",\"dbName\":\"guardrail_config\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"deletedAt\",\"dbName\":\"deleted_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"ProjectToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"specVersions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"SpecVersion\",\"relationName\":\"ProjectToSpecVersion\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"designSystems\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DesignSystem\",\"relationName\":\"DesignSystemToProject\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"compositions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PageComposition\",\"relationName\":\"PageCompositionToProject\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codebaseVersions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CodebaseVersion\",\"relationName\":\"CodebaseVersionToProject\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deployments\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Deployment\",\"relationName\":\"DeploymentToProject\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tickets\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Ticket\",\"relationName\":\"ProjectToTicket\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"changeRequests\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ChangeRequest\",\"relationName\":\"ChangeRequestToProject\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"decisionLogs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DecisionLog\",\"relationName\":\"DecisionLogToProject\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"formDefinitions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FormDefinition\",\"relationName\":\"FormDefinitionToProject\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"assets\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Asset\",\"relationName\":\"AssetToProject\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"SpecVersion\":{\"dbName\":\"spec_versions\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projectId\",\"dbName\":\"project_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"parentVersionId\",\"dbName\":\"parent_version_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"naturalLanguage\",\"dbName\":\"natural_language\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"structured\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"interpretationConfidence\",\"dbName\":\"interpretation_confidence\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userConfirmed\",\"dbName\":\"user_confirmed\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdBy\",\"dbName\":\"created_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Project\",\"relationName\":\"ProjectToSpecVersion\",\"relationFromFields\":[\"projectId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"DesignSystem\":{\"dbName\":\"design_systems\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projectId\",\"dbName\":\"project_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"origin\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DesignSystemOrigin\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"templateId\",\"dbName\":\"template_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"divergenceLog\",\"dbName\":\"divergence_log\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tokens\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"componentsManifest\",\"dbName\":\"components_manifest\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Project\",\"relationName\":\"DesignSystemToProject\",\"relationFromFields\":[\"projectId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"template\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DesignSystemTemplate\",\"relationName\":\"DesignSystemToDesignSystemTemplate\",\"relationFromFields\":[\"templateId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"DesignSystemTemplate\":{\"dbName\":\"design_system_templates\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"category\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"suitableFor\",\"dbName\":\"suitable_for\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"includedFeatures\",\"dbName\":\"included_features\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"previewImageUrl\",\"dbName\":\"preview_image_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"snapshotData\",\"dbName\":\"snapshot_data\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"version\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"TemplateStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"designSystems\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DesignSystem\",\"relationName\":\"DesignSystemToDesignSystemTemplate\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"PageComposition\":{\"dbName\":\"page_compositions\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projectId\",\"dbName\":\"project_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"designSystemId\",\"dbName\":\"design_system_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"parentVersionId\",\"dbName\":\"parent_version_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pages\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Project\",\"relationName\":\"PageCompositionToProject\",\"relationFromFields\":[\"projectId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"CodebaseVersion\":{\"dbName\":\"codebase_versions\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projectId\",\"dbName\":\"project_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"parentVersionId\",\"dbName\":\"parent_version_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sourceDesignVersionId\",\"dbName\":\"source_design_version_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sourceCompositionId\",\"dbName\":\"source_composition_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"commitSha\",\"dbName\":\"commit_sha\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"branch\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"prNumber\",\"dbName\":\"pr_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Project\",\"relationName\":\"CodebaseVersionToProject\",\"relationFromFields\":[\"projectId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deployments\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Deployment\",\"relationName\":\"CodebaseVersionToDeployment\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Deployment\":{\"dbName\":\"deployments\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projectId\",\"dbName\":\"project_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codebaseVersionId\",\"dbName\":\"codebase_version_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"environment\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DeploymentEnvironment\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DeploymentStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deployedAt\",\"dbName\":\"deployed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Project\",\"relationName\":\"DeploymentToProject\",\"relationFromFields\":[\"projectId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"codebaseVersion\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"CodebaseVersion\",\"relationName\":\"CodebaseVersionToDeployment\",\"relationFromFields\":[\"codebaseVersionId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Ticket\":{\"dbName\":\"tickets\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projectId\",\"dbName\":\"project_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TicketType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"spec\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"TicketStatus\",\"default\":\"PENDING\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"preferredProvider\",\"dbName\":\"preferred_provider\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Provider\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actualProvider\",\"dbName\":\"actual_provider\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Provider\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"providerHistory\",\"dbName\":\"provider_history\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"[]\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lockedBy\",\"dbName\":\"locked_by\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lockedUntil\",\"dbName\":\"locked_until\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"attemptCount\",\"dbName\":\"attempt_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"parentTicketIds\",\"dbName\":\"parent_ticket_ids\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"githubIssueNumber\",\"dbName\":\"github_issue_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startedAt\",\"dbName\":\"started_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"completedAt\",\"dbName\":\"completed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Project\",\"relationName\":\"ProjectToTicket\",\"relationFromFields\":[\"projectId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"results\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TicketResult\",\"relationName\":\"TicketToTicketResult\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"decisionLogs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DecisionLog\",\"relationName\":\"DecisionLogToTicket\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"TicketResult\":{\"dbName\":\"ticket_results\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ticketId\",\"dbName\":\"ticket_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"prNumber\",\"dbName\":\"pr_number\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"commits\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"filesChanged\",\"dbName\":\"files_changed\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"guardrailResults\",\"dbName\":\"guardrail_results\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"decisionLogSummary\",\"dbName\":\"decision_log_summary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"durationMs\",\"dbName\":\"duration_ms\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"costEstimate\",\"dbName\":\"cost_estimate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Decimal\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"TicketResultStatus\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ticket\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Ticket\",\"relationName\":\"TicketToTicketResult\",\"relationFromFields\":[\"ticketId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ChangeRequest\":{\"dbName\":\"change_requests\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projectId\",\"dbName\":\"project_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"dbName\":\"user_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userMessage\",\"dbName\":\"user_message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"proposedChanges\",\"dbName\":\"proposed_changes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"changeCategory\",\"dbName\":\"change_category\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ChangeCategory\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"affectedLayers\",\"dbName\":\"affected_layers\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"confidence\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"alternatives\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Json\",\"default\":\"[]\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ChangeRequestStatus\",\"default\":\"PROPOSED\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resultingVersions\",\"dbName\":\"resulting_versions\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resolvedAt\",\"dbName\":\"resolved_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Project\",\"relationName\":\"ChangeRequestToProject\",\"relationFromFields\":[\"projectId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"ChangeRequestToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"DecisionLog\":{\"dbName\":\"decision_logs\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projectId\",\"dbName\":\"project_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entityType\",\"dbName\":\"entity_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entityId\",\"dbName\":\"entity_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ticketId\",\"dbName\":\"ticket_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"input\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reasoning\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"outputSummary\",\"dbName\":\"output_summary\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"provider\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"model\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Project\",\"relationName\":\"DecisionLogToProject\",\"relationFromFields\":[\"projectId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ticket\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Ticket\",\"relationName\":\"DecisionLogToTicket\",\"relationFromFields\":[\"ticketId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"FormDefinition\":{\"dbName\":\"form_definitions\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projectId\",\"dbName\":\"project_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"parentVersionId\",\"dbName\":\"parent_version_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fields\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"submitButtonText\",\"dbName\":\"submit_button_text\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"successMessage\",\"dbName\":\"success_message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notificationConfig\",\"dbName\":\"notification_config\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"FormDefinitionStatus\",\"default\":\"DRAFT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Project\",\"relationName\":\"FormDefinitionToProject\",\"relationFromFields\":[\"projectId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Asset\":{\"dbName\":\"assets\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"projectId\",\"dbName\":\"project_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"blobUrl\",\"dbName\":\"blob_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mimeType\",\"dbName\":\"mime_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sizeBytes\",\"dbName\":\"size_bytes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dimensions\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"AssetStatus\",\"default\":\"PREVIEW\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"uploadedById\",\"dbName\":\"uploaded_by_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"uploadedAt\",\"dbName\":\"uploaded_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"project\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Project\",\"relationName\":\"AssetToProject\",\"relationFromFields\":[\"projectId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"uploadedBy\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"AssetToUser\",\"relationFromFields\":[\"uploadedById\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ProviderHealth\":{\"dbName\":\"provider_health\",\"fields\":[{\"name\":\"provider\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Provider\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastSuccessAt\",\"dbName\":\"last_success_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastFailureAt\",\"dbName\":\"last_failure_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"recentFailureRate\",\"dbName\":\"recent_failure_rate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Float\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"avgResponseMs\",\"dbName\":\"avg_response_ms\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"WorkerHeartbeat\":{\"dbName\":\"worker_heartbeats\",\"fields\":[{\"name\":\"workerId\",\"dbName\":\"worker_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"workerType\",\"dbName\":\"worker_type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"WorkerType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"WorkerStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastHeartbeatAt\",\"dbName\":\"last_heartbeat_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentTicketId\",\"dbName\":\"current_ticket_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"PlanTier\":{\"values\":[{\"name\":\"FREE\",\"dbName\":null},{\"name\":\"STARTER\",\"dbName\":null},{\"name\":\"PRO\",\"dbName\":null},{\"name\":\"ENTERPRISE\",\"dbName\":null}],\"dbName\":null},\"Tier3Provider\":{\"values\":[{\"name\":\"OPENAI\",\"dbName\":null},{\"name\":\"GEMINI\",\"dbName\":null}],\"dbName\":null},\"Platform\":{\"values\":[{\"name\":\"WEB\",\"dbName\":null},{\"name\":\"PWA\",\"dbName\":null},{\"name\":\"MOBILE_IOS\",\"dbName\":null},{\"name\":\"MOBILE_ANDROID\",\"dbName\":null},{\"name\":\"MOBILE_UNIVERSAL\",\"dbName\":null},{\"name\":\"WEB_AND_MOBILE\",\"dbName\":null}],\"dbName\":null},\"ProjectType\":{\"values\":[{\"name\":\"LANDING\",\"dbName\":null},{\"name\":\"CONTENT\",\"dbName\":null},{\"name\":\"FORM\",\"dbName\":null},{\"name\":\"OTHER\",\"dbName\":null}],\"dbName\":null},\"ProjectStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"PENDING_DELETION\",\"dbName\":null},{\"name\":\"DELETED\",\"dbName\":null}],\"dbName\":null},\"DesignSystemOrigin\":{\"values\":[{\"name\":\"TEMPLATE\",\"dbName\":null},{\"name\":\"GENERATED\",\"dbName\":null}],\"dbName\":null},\"TemplateStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"DEPRECATED\",\"dbName\":null}],\"dbName\":null},\"DeploymentEnvironment\":{\"values\":[{\"name\":\"PREVIEW\",\"dbName\":null},{\"name\":\"PRODUCTION\",\"dbName\":null}],\"dbName\":null},\"DeploymentStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"BUILDING\",\"dbName\":null},{\"name\":\"LIVE\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null}],\"dbName\":null},\"TicketType\":{\"values\":[{\"name\":\"DESIGN\",\"dbName\":null},{\"name\":\"CODE\",\"dbName\":null},{\"name\":\"DEPLOY\",\"dbName\":null},{\"name\":\"MAINTENANCE\",\"dbName\":null},{\"name\":\"FORM\",\"dbName\":null}],\"dbName\":null},\"TicketStatus\":{\"values\":[{\"name\":\"PENDING\",\"dbName\":null},{\"name\":\"IN_PROGRESS\",\"dbName\":null},{\"name\":\"COMPLETED\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null},{\"name\":\"GUARDRAIL_FAILED\",\"dbName\":null}],\"dbName\":null},\"Provider\":{\"values\":[{\"name\":\"CLAUDE_CODE_PC\",\"dbName\":null},{\"name\":\"ANTHROPIC_API\",\"dbName\":null},{\"name\":\"OPENAI_API\",\"dbName\":null},{\"name\":\"GEMINI_API\",\"dbName\":null}],\"dbName\":null},\"TicketResultStatus\":{\"values\":[{\"name\":\"SUCCESS\",\"dbName\":null},{\"name\":\"FAILED\",\"dbName\":null},{\"name\":\"NEEDS_REVIEW\",\"dbName\":null}],\"dbName\":null},\"ChangeCategory\":{\"values\":[{\"name\":\"CONTENT\",\"dbName\":null},{\"name\":\"CONFIG\",\"dbName\":null},{\"name\":\"COMPOSITION\",\"dbName\":null},{\"name\":\"DESIGN_SYSTEM\",\"dbName\":null},{\"name\":\"CODE\",\"dbName\":null},{\"name\":\"FULL_STACK\",\"dbName\":null},{\"name\":\"FORM\",\"dbName\":null}],\"dbName\":null},\"ChangeRequestStatus\":{\"values\":[{\"name\":\"PROPOSED\",\"dbName\":null},{\"name\":\"USER_REVIEWING\",\"dbName\":null},{\"name\":\"APPROVED\",\"dbName\":null},{\"name\":\"REJECTED\",\"dbName\":null},{\"name\":\"APPLIED\",\"dbName\":null}],\"dbName\":null},\"FormDefinitionStatus\":{\"values\":[{\"name\":\"DRAFT\",\"dbName\":null},{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"ARCHIVED\",\"dbName\":null}],\"dbName\":null},\"AssetStatus\":{\"values\":[{\"name\":\"PREVIEW\",\"dbName\":null},{\"name\":\"LIVE\",\"dbName\":null}],\"dbName\":null},\"WorkerType\":{\"values\":[{\"name\":\"PC\",\"dbName\":null},{\"name\":\"API\",\"dbName\":null}],\"dbName\":null},\"WorkerStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"INACTIVE\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "query_engine-windows.dll.node");
path.join(process.cwd(), "src/generated/app-client/query_engine-windows.dll.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "src/generated/app-client/schema.prisma")
