-- ============================================================
-- Buildee proj_template — V001 init
-- 새 Project DB 생성 시 가장 먼저 적용되는 마이그레이션.
-- ============================================================

CREATE TYPE submission_status AS ENUM ('NEW', 'READ', 'ARCHIVED');

CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- app_main의 form_definitions.id 참조 (cross-DB이므로 FK 안 만듦)
  form_definition_id UUID NOT NULL,
  form_version_id UUID NOT NULL,

  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitter_ip TEXT,

  submitted_data JSONB NOT NULL,

  status submission_status NOT NULL DEFAULT 'NEW'
);

CREATE INDEX idx_form_submissions_definition_submitted
  ON form_submissions (form_definition_id, submitted_at DESC);

CREATE INDEX idx_form_submissions_status_submitted
  ON form_submissions (status, submitted_at DESC);
