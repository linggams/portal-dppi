-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ItmsKbKind" AS ENUM ('sop', 'article');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ItmsKbStatus" AS ENUM ('draft', 'in_review', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ItmsKbVisibility" AS ENUM ('internal_all', 'it_only');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ItmsAssetStatus" AS ENUM ('in_stock', 'assigned', 'in_repair', 'retired', 'disposed', 'lost');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- KB tables (versions first without current FK cycle)
CREATE TABLE IF NOT EXISTS "itms_kb_document" (
    "id_document" SERIAL NOT NULL,
    "kind" "ItmsKbKind" NOT NULL,
    "number" VARCHAR(40),
    "title" VARCHAR(200) NOT NULL,
    "id_owner" INTEGER NOT NULL,
    "status" "ItmsKbStatus" NOT NULL DEFAULT 'draft',
    "visibility" "ItmsKbVisibility" NOT NULL DEFAULT 'internal_all',
    "id_current_version" INTEGER,
    "effective_date" DATE,
    "next_review_at" DATE,
    "tags" VARCHAR(255) NOT NULL DEFAULT '',
    "helpful_yes" INTEGER NOT NULL DEFAULT 0,
    "helpful_no" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itms_kb_document_pkey" PRIMARY KEY ("id_document")
);

CREATE TABLE IF NOT EXISTS "itms_kb_version" (
    "id_version" SERIAL NOT NULL,
    "id_document" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "change_note" VARCHAR(255) NOT NULL DEFAULT '',
    "id_author" INTEGER NOT NULL,
    "id_approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itms_kb_version_pkey" PRIMARY KEY ("id_version")
);

CREATE TABLE IF NOT EXISTS "itms_kb_acknowledgment" (
    "id_ack" SERIAL NOT NULL,
    "id_version" INTEGER NOT NULL,
    "id_document" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "acknowledged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itms_kb_acknowledgment_pkey" PRIMARY KEY ("id_ack")
);

CREATE TABLE IF NOT EXISTS "itms_asset" (
    "id_asset" SERIAL NOT NULL,
    "tag" VARCHAR(40) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "serial_number" VARCHAR(100),
    "brand" VARCHAR(80) NOT NULL DEFAULT '',
    "model" VARCHAR(80) NOT NULL DEFAULT '',
    "specs" TEXT NOT NULL DEFAULT '',
    "purchase_date" DATE,
    "purchase_price" DECIMAL(14,2),
    "vendor" VARCHAR(100) NOT NULL DEFAULT '',
    "warranty_until" DATE,
    "location" VARCHAR(100) NOT NULL DEFAULT '',
    "status" "ItmsAssetStatus" NOT NULL DEFAULT 'in_stock',
    "id_holder" INTEGER,
    "notes" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itms_asset_pkey" PRIMARY KEY ("id_asset")
);

CREATE TABLE IF NOT EXISTS "itms_asset_assignment" (
    "id_assignment" SERIAL NOT NULL,
    "id_asset" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returned_at" TIMESTAMP(3),
    "condition_note" VARCHAR(255) NOT NULL DEFAULT '',

    CONSTRAINT "itms_asset_assignment_pkey" PRIMARY KEY ("id_assignment")
);

CREATE UNIQUE INDEX IF NOT EXISTS "itms_kb_document_id_current_version_key" ON "itms_kb_document"("id_current_version");
CREATE INDEX IF NOT EXISTS "itms_kb_document_kind_idx" ON "itms_kb_document"("kind");
CREATE INDEX IF NOT EXISTS "itms_kb_document_status_idx" ON "itms_kb_document"("status");
CREATE INDEX IF NOT EXISTS "itms_kb_document_id_owner_idx" ON "itms_kb_document"("id_owner");
CREATE INDEX IF NOT EXISTS "itms_kb_document_title_idx" ON "itms_kb_document"("title");

CREATE UNIQUE INDEX IF NOT EXISTS "itms_kb_version_id_document_version_key" ON "itms_kb_version"("id_document", "version");
CREATE INDEX IF NOT EXISTS "itms_kb_version_id_document_idx" ON "itms_kb_version"("id_document");
CREATE INDEX IF NOT EXISTS "itms_kb_version_id_author_idx" ON "itms_kb_version"("id_author");

CREATE UNIQUE INDEX IF NOT EXISTS "itms_kb_acknowledgment_id_version_id_user_key" ON "itms_kb_acknowledgment"("id_version", "id_user");
CREATE INDEX IF NOT EXISTS "itms_kb_acknowledgment_id_document_idx" ON "itms_kb_acknowledgment"("id_document");
CREATE INDEX IF NOT EXISTS "itms_kb_acknowledgment_id_user_idx" ON "itms_kb_acknowledgment"("id_user");

CREATE UNIQUE INDEX IF NOT EXISTS "itms_asset_tag_key" ON "itms_asset"("tag");
CREATE INDEX IF NOT EXISTS "itms_asset_type_idx" ON "itms_asset"("type");
CREATE INDEX IF NOT EXISTS "itms_asset_status_idx" ON "itms_asset"("status");
CREATE INDEX IF NOT EXISTS "itms_asset_id_holder_idx" ON "itms_asset"("id_holder");
CREATE INDEX IF NOT EXISTS "itms_asset_warranty_until_idx" ON "itms_asset"("warranty_until");

CREATE INDEX IF NOT EXISTS "itms_asset_assignment_id_asset_idx" ON "itms_asset_assignment"("id_asset");
CREATE INDEX IF NOT EXISTS "itms_asset_assignment_id_user_idx" ON "itms_asset_assignment"("id_user");
CREATE INDEX IF NOT EXISTS "itms_asset_assignment_returned_at_idx" ON "itms_asset_assignment"("returned_at");

DO $$ BEGIN
  ALTER TABLE "itms_kb_document" ADD CONSTRAINT "itms_kb_document_id_owner_fkey"
    FOREIGN KEY ("id_owner") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_kb_version" ADD CONSTRAINT "itms_kb_version_id_document_fkey"
    FOREIGN KEY ("id_document") REFERENCES "itms_kb_document"("id_document") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_kb_version" ADD CONSTRAINT "itms_kb_version_id_author_fkey"
    FOREIGN KEY ("id_author") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_kb_version" ADD CONSTRAINT "itms_kb_version_id_approved_by_fkey"
    FOREIGN KEY ("id_approved_by") REFERENCES "user"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_kb_document" ADD CONSTRAINT "itms_kb_document_id_current_version_fkey"
    FOREIGN KEY ("id_current_version") REFERENCES "itms_kb_version"("id_version") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_kb_acknowledgment" ADD CONSTRAINT "itms_kb_acknowledgment_id_version_fkey"
    FOREIGN KEY ("id_version") REFERENCES "itms_kb_version"("id_version") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_kb_acknowledgment" ADD CONSTRAINT "itms_kb_acknowledgment_id_document_fkey"
    FOREIGN KEY ("id_document") REFERENCES "itms_kb_document"("id_document") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_kb_acknowledgment" ADD CONSTRAINT "itms_kb_acknowledgment_id_user_fkey"
    FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_asset" ADD CONSTRAINT "itms_asset_id_holder_fkey"
    FOREIGN KEY ("id_holder") REFERENCES "user"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_asset_assignment" ADD CONSTRAINT "itms_asset_assignment_id_asset_fkey"
    FOREIGN KEY ("id_asset") REFERENCES "itms_asset"("id_asset") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_asset_assignment" ADD CONSTRAINT "itms_asset_assignment_id_user_fkey"
    FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
