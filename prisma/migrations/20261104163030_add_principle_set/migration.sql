-- CreateTable
CREATE TABLE "principle_set" (
    "id" TEXT NOT NULL,
    "installationId" INTEGER NOT NULL,
    "repoFullName" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "principle_set_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "principle_set_installationId_idx" ON "principle_set"("installationId");

-- CreateIndex
CREATE UNIQUE INDEX "principle_set_installationId_repoFullName_key" ON "principle_set"("installationId", "repoFullName");

-- AddForeignKey
ALTER TABLE "principle_set" ADD CONSTRAINT "principle_set_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "installation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
