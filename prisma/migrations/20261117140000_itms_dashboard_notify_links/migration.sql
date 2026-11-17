-- Optional user email for ITMS notifications
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "email" VARCHAR(120);

-- Ticket links to asset / KB
ALTER TABLE "itms_ticket" ADD COLUMN IF NOT EXISTS "id_asset" INTEGER;
ALTER TABLE "itms_ticket" ADD COLUMN IF NOT EXISTS "id_kb_document" INTEGER;

CREATE INDEX IF NOT EXISTS "itms_ticket_id_asset_idx" ON "itms_ticket"("id_asset");
CREATE INDEX IF NOT EXISTS "itms_ticket_id_kb_document_idx" ON "itms_ticket"("id_kb_document");

DO $$ BEGIN
  ALTER TABLE "itms_ticket" ADD CONSTRAINT "itms_ticket_id_asset_fkey"
    FOREIGN KEY ("id_asset") REFERENCES "itms_asset"("id_asset") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "itms_ticket" ADD CONSTRAINT "itms_ticket_id_kb_document_fkey"
    FOREIGN KEY ("id_kb_document") REFERENCES "itms_kb_document"("id_document") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- In-app notifications
CREATE TABLE IF NOT EXISTS "itms_notification" (
    "id_notification" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" VARCHAR(500) NOT NULL,
    "href" VARCHAR(255),
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itms_notification_pkey" PRIMARY KEY ("id_notification")
);

CREATE INDEX IF NOT EXISTS "itms_notification_id_user_read_at_idx" ON "itms_notification"("id_user", "read_at");
CREATE INDEX IF NOT EXISTS "itms_notification_created_at_idx" ON "itms_notification"("created_at");

DO $$ BEGIN
  ALTER TABLE "itms_notification" ADD CONSTRAINT "itms_notification_id_user_fkey"
    FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
