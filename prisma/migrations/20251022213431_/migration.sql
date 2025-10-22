/*
  Warnings:

  - You are about to drop the `BlogCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlogPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlogTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Component` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ComponentInstance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StyleLibrary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Theme` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BlogCategoryToBlogPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BlogPostToBlogTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `blogTemplateType` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `isBlogTemplate` on the `Page` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "BlogCategory_slug_idx";

-- DropIndex
DROP INDEX "BlogCategory_slug_key";

-- DropIndex
DROP INDEX "BlogCategory_name_key";

-- DropIndex
DROP INDEX "BlogPost_templateId_idx";

-- DropIndex
DROP INDEX "BlogPost_authorId_idx";

-- DropIndex
DROP INDEX "BlogPost_status_idx";

-- DropIndex
DROP INDEX "BlogPost_slug_idx";

-- DropIndex
DROP INDEX "BlogPost_slug_key";

-- DropIndex
DROP INDEX "BlogTag_slug_idx";

-- DropIndex
DROP INDEX "BlogTag_slug_key";

-- DropIndex
DROP INDEX "BlogTag_name_key";

-- DropIndex
DROP INDEX "Component_styleLibraryId_idx";

-- DropIndex
DROP INDEX "Component_isPublic_idx";

-- DropIndex
DROP INDEX "Component_createdBy_idx";

-- DropIndex
DROP INDEX "Component_category_idx";

-- DropIndex
DROP INDEX "ComponentInstance_pageId_idx";

-- DropIndex
DROP INDEX "ComponentInstance_componentId_idx";

-- DropIndex
DROP INDEX "StyleLibrary_isPublic_idx";

-- DropIndex
DROP INDEX "StyleLibrary_createdBy_idx";

-- DropIndex
DROP INDEX "Theme_isPublic_idx";

-- DropIndex
DROP INDEX "Theme_createdBy_idx";

-- DropIndex
DROP INDEX "_BlogCategoryToBlogPost_B_index";

-- DropIndex
DROP INDEX "_BlogCategoryToBlogPost_AB_unique";

-- DropIndex
DROP INDEX "_BlogPostToBlogTag_B_index";

-- DropIndex
DROP INDEX "_BlogPostToBlogTag_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BlogCategory";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BlogPost";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BlogTag";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Component";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ComponentInstance";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "StyleLibrary";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Theme";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_BlogCategoryToBlogPost";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_BlogPostToBlogTag";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT DEFAULT 'general',
    "content" TEXT NOT NULL,
    "thumbnail" TEXT,
    "createdBy" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Template_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'custom',
    "content" TEXT NOT NULL,
    "properties" TEXT,
    "thumbnail" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContentBlock_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "designEvents" TEXT NOT NULL,
    "designState" TEXT,
    "publishedHtml" TEXT,
    "publishedCss" TEXT,
    "publishedJs" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "authorId" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaImage" TEXT,
    "draftContent" TEXT,
    "lastSavedAt" DATETIME,
    "hasUnsavedChanges" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME,
    CONSTRAINT "Page_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Page" ("authorId", "createdAt", "description", "designEvents", "designState", "draftContent", "hasUnsavedChanges", "id", "lastSavedAt", "metaDescription", "metaImage", "metaTitle", "publishedAt", "publishedCss", "publishedHtml", "publishedJs", "slug", "status", "title", "updatedAt") SELECT "authorId", "createdAt", "description", "designEvents", "designState", "draftContent", "hasUnsavedChanges", "id", "lastSavedAt", "metaDescription", "metaImage", "metaTitle", "publishedAt", "publishedCss", "publishedHtml", "publishedJs", "slug", "status", "title", "updatedAt" FROM "Page";
DROP TABLE "Page";
ALTER TABLE "new_Page" RENAME TO "Page";
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");
CREATE INDEX "Page_slug_idx" ON "Page"("slug");
CREATE INDEX "Page_status_idx" ON "Page"("status");
CREATE INDEX "Page_authorId_idx" ON "Page"("authorId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Template_createdBy_idx" ON "Template"("createdBy");

-- CreateIndex
CREATE INDEX "Template_category_idx" ON "Template"("category");

-- CreateIndex
CREATE INDEX "ContentBlock_createdBy_idx" ON "ContentBlock"("createdBy");

-- CreateIndex
CREATE INDEX "ContentBlock_category_idx" ON "ContentBlock"("category");

-- CreateIndex
CREATE INDEX "ContentBlock_isPublic_idx" ON "ContentBlock"("isPublic");
