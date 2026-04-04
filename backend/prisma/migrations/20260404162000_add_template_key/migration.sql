-- Add key column with a temporary default
ALTER TABLE "Template" ADD COLUMN IF NOT EXISTS "key" TEXT NOT NULL DEFAULT '';

-- Assign unique placeholder keys to any existing rows before creating the index
UPDATE "Template" SET "key" = 'legacy-' || id WHERE "key" = '';

-- Remove the default
ALTER TABLE "Template" ALTER COLUMN "key" DROP DEFAULT;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS "Template_key_key" ON "Template"("key");
