-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "installationId" INTEGER NOT NULL,
    "repoFullName" TEXT NOT NULL,
    "prNumber" INTEGER NOT NULL,
    "prTitle" TEXT NOT NULL,
    "headSha" TEXT NOT NULL,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "changedFiles" INTEGER NOT NULL DEFAULT 0,
    "commitsChecked" INTEGER NOT NULL DEFAULT 0,
    "commitsSkipped" INTEGER NOT NULL DEFAULT 0,
    "rulesChecked" INTEGER NOT NULL DEFAULT 0,
    "findingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_finding" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "repoFullName" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "ruleId" TEXT,
    "ruleText" TEXT,
    "commitSha" TEXT,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "file" TEXT,
    "line" INTEGER,

    CONSTRAINT "review_finding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "review_installationId_createdAt_idx" ON "review"("installationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "review_installationId_repoFullName_prNumber_headSha_key" ON "review"("installationId", "repoFullName", "prNumber", "headSha");

-- CreateIndex
CREATE INDEX "review_finding_reviewId_idx" ON "review_finding"("reviewId");

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "installation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_finding" ADD CONSTRAINT "review_finding_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
