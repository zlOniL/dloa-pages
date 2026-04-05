-- AlterTable
ALTER TABLE "Site" ADD COLUMN "customHtml" TEXT;
ALTER TABLE "Site" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'template';
