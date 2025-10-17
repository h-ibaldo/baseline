/*
  Warnings:

  - Added the required column `version` to the `PageRevision` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PageRevision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT,
    "designEvents" TEXT NOT NULL,
    "metadata" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PageRevision_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PageRevision_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PageRevision" ("createdAt", "createdBy", "designEvents", "id", "pageId") SELECT "createdAt", "createdBy", "designEvents", "id", "pageId" FROM "PageRevision";
DROP TABLE "PageRevision";
ALTER TABLE "new_PageRevision" RENAME TO "PageRevision";
CREATE INDEX "PageRevision_pageId_idx" ON "PageRevision"("pageId");
CREATE INDEX "PageRevision_createdBy_idx" ON "PageRevision"("createdBy");
CREATE INDEX "PageRevision_version_idx" ON "PageRevision"("version");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
