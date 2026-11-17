-- AlterTable: user module flags for ITMS (parallel to IT Support)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "manage_itms" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "access_itms" BOOLEAN NOT NULL DEFAULT false;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ItmsTicketType" AS ENUM ('incident', 'service_request');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ItmsTicketStatus" AS ENUM ('new', 'assigned', 'in_progress', 'pending', 'resolved', 'closed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ItmsPriority" AS ENUM ('p1', 'p2', 'p3', 'p4');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ItmsImpact" AS ENUM ('high', 'medium', 'low');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ItmsUrgency" AS ENUM ('high', 'medium', 'low');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "itms_category" (
    "id_category" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "parent_id" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itms_category_pkey" PRIMARY KEY ("id_category")
);

CREATE TABLE IF NOT EXISTS "itms_sla_policy" (
    "id_policy" SERIAL NOT NULL,
    "priority" "ItmsPriority" NOT NULL,
    "response_minutes" INTEGER NOT NULL,
    "resolution_minutes" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itms_sla_policy_pkey" PRIMARY KEY ("id_policy")
);

CREATE TABLE IF NOT EXISTS "itms_ticket" (
    "id_ticket" SERIAL NOT NULL,
    "number" VARCHAR(32) NOT NULL,
    "type" "ItmsTicketType" NOT NULL DEFAULT 'incident',
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "id_category" INTEGER NOT NULL,
    "impact" "ItmsImpact" NOT NULL DEFAULT 'low',
    "urgency" "ItmsUrgency" NOT NULL DEFAULT 'low',
    "priority" "ItmsPriority" NOT NULL DEFAULT 'p4',
    "status" "ItmsTicketStatus" NOT NULL DEFAULT 'new',
    "id_requester" INTEGER NOT NULL,
    "id_assignee" INTEGER,
    "id_sla_policy" INTEGER,
    "due_response_at" TIMESTAMP(3),
    "due_resolution_at" TIMESTAMP(3),
    "first_responded_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "pending_started_at" TIMESTAMP(3),
    "sla_paused_minutes" INTEGER NOT NULL DEFAULT 0,
    "csat_score" INTEGER,
    "csat_comment" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itms_ticket_pkey" PRIMARY KEY ("id_ticket")
);

CREATE TABLE IF NOT EXISTS "itms_ticket_comment" (
    "id_comment" SERIAL NOT NULL,
    "id_ticket" INTEGER NOT NULL,
    "id_author" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itms_ticket_comment_pkey" PRIMARY KEY ("id_comment")
);

CREATE TABLE IF NOT EXISTS "itms_ticket_event" (
    "id_event" SERIAL NOT NULL,
    "id_ticket" INTEGER NOT NULL,
    "id_actor" INTEGER,
    "type" VARCHAR(50) NOT NULL,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itms_ticket_event_pkey" PRIMARY KEY ("id_event")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "itms_sla_policy_priority_key" ON "itms_sla_policy"("priority");
CREATE UNIQUE INDEX IF NOT EXISTS "itms_ticket_number_key" ON "itms_ticket"("number");
CREATE INDEX IF NOT EXISTS "itms_category_parent_id_idx" ON "itms_category"("parent_id");
CREATE INDEX IF NOT EXISTS "itms_category_active_idx" ON "itms_category"("active");
CREATE INDEX IF NOT EXISTS "itms_ticket_id_requester_idx" ON "itms_ticket"("id_requester");
CREATE INDEX IF NOT EXISTS "itms_ticket_id_assignee_idx" ON "itms_ticket"("id_assignee");
CREATE INDEX IF NOT EXISTS "itms_ticket_status_idx" ON "itms_ticket"("status");
CREATE INDEX IF NOT EXISTS "itms_ticket_priority_idx" ON "itms_ticket"("priority");
CREATE INDEX IF NOT EXISTS "itms_ticket_id_category_idx" ON "itms_ticket"("id_category");
CREATE INDEX IF NOT EXISTS "itms_ticket_created_at_idx" ON "itms_ticket"("created_at");
CREATE INDEX IF NOT EXISTS "itms_ticket_due_resolution_at_idx" ON "itms_ticket"("due_resolution_at");
CREATE INDEX IF NOT EXISTS "itms_ticket_comment_id_ticket_idx" ON "itms_ticket_comment"("id_ticket");
CREATE INDEX IF NOT EXISTS "itms_ticket_comment_id_author_idx" ON "itms_ticket_comment"("id_author");
CREATE INDEX IF NOT EXISTS "itms_ticket_event_id_ticket_idx" ON "itms_ticket_event"("id_ticket");
CREATE INDEX IF NOT EXISTS "itms_ticket_event_created_at_idx" ON "itms_ticket_event"("created_at");

-- Foreign keys
DO $$ BEGIN
  ALTER TABLE "itms_category" ADD CONSTRAINT "itms_category_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "itms_category"("id_category") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_ticket" ADD CONSTRAINT "itms_ticket_id_category_fkey"
    FOREIGN KEY ("id_category") REFERENCES "itms_category"("id_category") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_ticket" ADD CONSTRAINT "itms_ticket_id_requester_fkey"
    FOREIGN KEY ("id_requester") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_ticket" ADD CONSTRAINT "itms_ticket_id_assignee_fkey"
    FOREIGN KEY ("id_assignee") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_ticket" ADD CONSTRAINT "itms_ticket_id_sla_policy_fkey"
    FOREIGN KEY ("id_sla_policy") REFERENCES "itms_sla_policy"("id_policy") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_ticket_comment" ADD CONSTRAINT "itms_ticket_comment_id_ticket_fkey"
    FOREIGN KEY ("id_ticket") REFERENCES "itms_ticket"("id_ticket") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_ticket_comment" ADD CONSTRAINT "itms_ticket_comment_id_author_fkey"
    FOREIGN KEY ("id_author") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_ticket_event" ADD CONSTRAINT "itms_ticket_event_id_ticket_fkey"
    FOREIGN KEY ("id_ticket") REFERENCES "itms_ticket"("id_ticket") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_ticket_event" ADD CONSTRAINT "itms_ticket_event_id_actor_fkey"
    FOREIGN KEY ("id_actor") REFERENCES "user"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
